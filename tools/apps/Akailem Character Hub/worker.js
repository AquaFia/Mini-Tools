const NOTION_VERSION = "2026-03-11";

// The main character list is intentionally tiny. These fields are enough for
// dashboard basics (birthdays/recent updates) without resolving any relations.
const LIST_FIELDS = new Set([
  "Name", "Birthdate", "Gender", "Pronouns", "MBTI", "Moral Alignment",
  "Temperament", "Zodiac Sign", "Hogwarts House", "Aura Colour",
  "Handedness", "Animal", "Plant", "Season", "Scent"
]);

// Only these relations are resolved when a single profile is opened.
const PROFILE_RELATION_FIELDS = new Set([
  "Race",
  "Birth Place",
  "Residence",
  "Nature",
  "Domain",
  "Groups",
  "Group/Organization",
  "Relationship Map",
  "Chapter Appearances",
  "Chapter Mentions",
  "Events",
  "Spells & Items",
  "Gallery"
]);

const LIST_CACHE_SECONDS = 300;          // 5 minutes
const PROFILE_CACHE_SECONDS = 300;       // 5 minutes
const RELATION_CACHE_SECONDS = 86400;    // 24 hours
const RELATION_CONCURRENCY = 2;
const MAX_RETRIES = 7;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://aquafia.github.io";
    const cors = corsHeaders(allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, cors);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        name: "Akailem API",
        status: "online",
        endpoints: {
          characters: "/api/characters",
          character: "/api/characters/:id"
        }
      }, 200, cors);
    }

    try {
      requireEnv(env);

      if (url.pathname === "/api/characters") {
        return await listCharacters(url, env, ctx, cors);
      }

      const match = url.pathname.match(/^\/api\/characters\/([0-9a-fA-F-]{32,36})$/);
      if (match) {
        return await getCharacterProfile(match[1], url, env, ctx, cors);
      }

      return json({ error: "Not found" }, 404, cors);
    } catch (error) {
      console.error("Akailem API error:", error);
      return json({
        error: "Unable to load Notion data.",
        details: error.message
      }, 500, cors);
    }
  }
};

function requireEnv(env) {
  if (!env.NOTION_TOKEN) throw new Error("NOTION_TOKEN is missing.");
  if (!env.NOTION_CHARACTERS_SOURCE_ID) {
    throw new Error("NOTION_CHARACTERS_SOURCE_ID is missing.");
  }
}

async function listCharacters(url, env, ctx, cors) {
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/api/characters`);

  if (!forceRefresh) {
    const cached = await cache.match(cacheKey);
    if (cached) return withCors(cached, cors);
  }

  const pages = await queryAll(env.NOTION_CHARACTERS_SOURCE_ID, env.NOTION_TOKEN);
  const characters = pages.map(normalizeListPage);

  const response = json({
    count: characters.length,
    characters,
    meta: { mode: "lightweight", cachedForSeconds: LIST_CACHE_SECONDS }
  }, 200, {
    ...cors,
    "Cache-Control": `public, max-age=${LIST_CACHE_SECONDS}`
  });

  ctx.waitUntil(cache.put(cacheKey, cacheNeutralCopy(response, LIST_CACHE_SECONDS)));
  return response;
}

async function getCharacterProfile(id, url, env, ctx, cors) {
  const forceRefresh = url.searchParams.get("refresh") === "1";
  const cleanId = normalizeId(id);
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/api/characters/${cleanId}`);

  if (!forceRefresh) {
    const cached = await cache.match(cacheKey);
    if (cached) return withCors(cached, cors);
  }

  // Retrieve only the clicked character instead of resolving every character.
  const page = await notionFetch(
    `https://api.notion.com/v1/pages/${cleanId}`,
    env.NOTION_TOKEN
  );

  await hydrateLargeRelations(page, env.NOTION_TOKEN);
  const relationNames = await resolveRelationsForPage(page, env.NOTION_TOKEN, ctx);
  const character = normalizeFullPage(page, relationNames);

  const response = json({ character }, 200, {
    ...cors,
    "Cache-Control": `public, max-age=${PROFILE_CACHE_SECONDS}`
  });

  ctx.waitUntil(cache.put(cacheKey, cacheNeutralCopy(response, PROFILE_CACHE_SECONDS)));
  return response;
}

async function queryAll(sourceId, token) {
  const results = [];
  let cursor;

  do {
    const body = {
      page_size: 100,
      sorts: [{ property: "Name", direction: "ascending" }]
    };
    if (cursor) body.start_cursor = cursor;

    const response = await notionFetch(
      `https://api.notion.com/v1/data_sources/${sourceId}/query`,
      token,
      { method: "POST", body: JSON.stringify(body) }
    );

    results.push(...(response.results || []));
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return results;
}

function normalizeListPage(page) {
  const properties = {};
  for (const [name, value] of Object.entries(page.properties || {})) {
    if (LIST_FIELDS.has(name)) properties[name] = normalizeProperty(value, new Map());
  }

  return {
    id: page.id,
    url: page.url,
    name: properties.Name || "Unnamed Character",
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    properties
  };
}

function normalizeFullPage(page, relationNames) {
  const properties = Object.fromEntries(
    Object.entries(page.properties || {}).map(([name, value]) => [
      name,
      normalizeProperty(value, relationNames)
    ])
  );

  return {
    id: page.id,
    url: page.url,
    name: properties.Name || "Unnamed Character",
    createdTime: page.created_time,
    lastEditedTime: page.last_edited_time,
    properties
  };
}


async function hydrateLargeRelations(page, token) {
  const jobs = [];

  for (const [name, property] of Object.entries(page.properties || {})) {
    if (property?.type !== "relation" || !PROFILE_RELATION_FIELDS.has(name)) continue;
    if (!property.has_more) continue;
    jobs.push(loadCompleteRelation(page.id, property.id, token).then(ids => {
      property.relation = ids.map(id => ({ id }));
      property.has_more = false;
    }));
  }

  // A character usually has no oversized relations. If it does, fetch only
  // those properties and keep the concurrency low.
  for (let i = 0; i < jobs.length; i += RELATION_CONCURRENCY) {
    await Promise.all(jobs.slice(i, i + RELATION_CONCURRENCY));
  }
}

async function loadCompleteRelation(pageId, propertyId, token) {
  const ids = [];
  let cursor;

  do {
    const endpoint = new URL(`https://api.notion.com/v1/pages/${normalizeId(pageId)}/properties/${encodeURIComponent(propertyId)}`);
    endpoint.searchParams.set("page_size", "100");
    if (cursor) endpoint.searchParams.set("start_cursor", cursor);

    const payload = await notionFetch(endpoint.toString(), token);
    for (const item of payload.results || []) {
      const id = item?.relation?.id;
      if (id) ids.push(normalizeId(id));
    }
    cursor = payload.has_more ? payload.next_cursor : undefined;
  } while (cursor);

  return [...new Set(ids)];
}

async function resolveRelationsForPage(page, token, ctx) {
  const ids = new Set();

  for (const [name, property] of Object.entries(page.properties || {})) {
    if (property?.type !== "relation" || !PROFILE_RELATION_FIELDS.has(name)) continue;
    for (const item of property.relation || []) {
      if (item?.id) ids.add(normalizeId(item.id));
    }
  }

  const uniqueIds = [...ids];
  const map = new Map();
  let cursor = 0;

  async function worker() {
    while (cursor < uniqueIds.length) {
      const id = uniqueIds[cursor++];
      try {
        map.set(id, await getRelationTitle(id, token, ctx));
      } catch (error) {
        // Preserve the relation ID but do not manufacture a fake visible title.
        // The frontend hides unresolved relations rather than displaying noise.
        console.error(`Relation lookup failed for ${id}:`, error);
        map.set(id, { id, name: null, unavailable: true });
      }
    }
  }

  const count = Math.min(RELATION_CONCURRENCY, uniqueIds.length);
  await Promise.all(Array.from({ length: count }, worker));
  return map;
}

async function getRelationTitle(id, token, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(`https://akailem-cache.local/relation/${normalizeId(id)}`);
  const cached = await cache.match(cacheKey);
  if (cached) return cached.json();

  const page = await notionFetch(
    `https://api.notion.com/v1/pages/${normalizeId(id)}`,
    token
  );

  const result = {
    id: normalizeId(id),
    name: pageTitle(page) || null,
    url: page.url || null
  };

  // Cache only successful, titled lookups. Failures are not cached, so a
  // temporary Notion error can recover naturally on the next profile open.
  if (result.name) {
    const cachedResponse = new Response(JSON.stringify(result), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": `public, max-age=${RELATION_CACHE_SECONDS}`
      }
    });
    ctx.waitUntil(cache.put(cacheKey, cachedResponse));
  }

  return result;
}

function pageTitle(page) {
  for (const property of Object.values(page.properties || {})) {
    if (property?.type === "title") {
      const value = text(property.title).trim();
      if (value) return value;
    }
  }
  return null;
}

function normalizeProperty(property, relationNames) {
  if (!property) return null;

  switch (property.type) {
    case "title": return text(property.title);
    case "rich_text": return text(property.rich_text);
    case "number": return property.number;
    case "checkbox": return property.checkbox;
    case "url": return property.url;
    case "email": return property.email;
    case "phone_number": return property.phone_number;
    case "select": return property.select?.name ?? null;
    case "status": return property.status?.name ?? null;
    case "multi_select": return (property.multi_select || []).map(item => item.name);
    case "date":
      return property.date ? {
        start: property.date.start,
        end: property.date.end,
        timeZone: property.date.time_zone
      } : null;
    case "people":
      return (property.people || []).map(person => ({ id: person.id, name: person.name || null }));
    case "relation":
      return (property.relation || []).map(item => {
        const id = normalizeId(item.id);
        return relationNames.get(id) || { id, name: null, unavailable: true };
      });
    case "formula": return normalizeFormula(property.formula);
    case "rollup": return normalizeRollup(property.rollup, relationNames);
    case "files":
      return (property.files || []).map(file => ({
        name: file.name,
        url: file.type === "external" ? file.external?.url : file.file?.url
      }));
    default: return null;
  }
}

function normalizeFormula(formula) {
  if (!formula) return null;
  if (formula.type === "date") return formula.date;
  return formula[formula.type] ?? null;
}

function normalizeRollup(rollup, relationNames) {
  if (!rollup) return null;
  if (rollup.type === "array") {
    return (rollup.array || []).map(item => normalizeProperty(item, relationNames));
  }
  return rollup[rollup.type] ?? null;
}

async function notionFetch(url, token, init = {}, retriesRemaining = MAX_RETRIES) {
  let response;

  try {
    response = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
        ...(init.headers || {})
      }
    });
  } catch (error) {
    if (retriesRemaining <= 0) throw error;
    await sleep(backoffMs(MAX_RETRIES - retriesRemaining));
    return notionFetch(url, token, init, retriesRemaining - 1);
  }

  let payload = null;
  try { payload = await response.json(); } catch {}
  if (response.ok) return payload;

  const retryable = response.status === 408 || response.status === 409 || response.status === 429 || response.status >= 500;
  if (retryable && retriesRemaining > 0) {
    const retryAfter = Number(response.headers.get("Retry-After"));
    const delay = Number.isFinite(retryAfter) && retryAfter > 0
      ? Math.max(500, retryAfter * 1000)
      : backoffMs(MAX_RETRIES - retriesRemaining);
    await sleep(delay);
    return notionFetch(url, token, init, retriesRemaining - 1);
  }

  throw new Error(`${payload?.message || `Notion returned HTTP ${response.status}.`} (${response.status})`);
}

function backoffMs(attempt) {
  const base = Math.min(12000, 600 * (2 ** attempt));
  return base + Math.floor(Math.random() * 350);
}

function normalizeId(id) {
  return String(id || "").replace(/-/g, "").toLowerCase();
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function text(items = []) { return items.map(item => item.plain_text || "").join(""); }

function corsHeaders(allowedOrigin) {
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function withCors(response, cors) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(cors)) headers.set(key, value);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

function cacheNeutralCopy(response, seconds) {
  return new Response(response.clone().body, {
    status: response.status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${seconds}`
    }
  });
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...headers }
  });
}
