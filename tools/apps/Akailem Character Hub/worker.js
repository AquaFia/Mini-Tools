const NOTION_VERSION = "2026-03-11";

// Only relations the frontend actually displays need title resolution.
const RELATION_FIELDS = new Set([
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

// Keep the full character response fairly fresh while preventing every page load
// from re-querying Notion. Relation titles can live longer because page names
// generally change much less often than character records.
const CHARACTER_CACHE_SECONDS = 300; // 5 minutes
const RELATION_TITLE_CACHE_SECONDS = 21600; // 6 hours
const RELATION_CONCURRENCY = 3;
const MAX_RETRIES = 5;

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
        endpoint: "/api/characters"
      }, 200, cors);
    }

    if (url.pathname !== "/api/characters") {
      return json({ error: "Not found" }, 404, cors);
    }

    try {
      if (!env.NOTION_TOKEN) throw new Error("NOTION_TOKEN is missing.");
      if (!env.NOTION_CHARACTERS_SOURCE_ID) {
        throw new Error("NOTION_CHARACTERS_SOURCE_ID is missing.");
      }

      // ?refresh=1 is useful after editing Notion and wanting an immediate refresh.
      const forceRefresh = url.searchParams.get("refresh") === "1";
      const responseCache = caches.default;
      const responseCacheKey = new Request(`${url.origin}/api/characters`, { method: "GET" });

      if (!forceRefresh) {
        const cached = await responseCache.match(responseCacheKey);
        if (cached) return withCors(cached, cors);
      }

      const pages = await queryAll(
        env.NOTION_CHARACTERS_SOURCE_ID,
        env.NOTION_TOKEN
      );

      const relationNames = await resolveRelationNames(
        pages,
        env.NOTION_TOKEN,
        ctx
      );

      const characters = pages.map(page => normalizePage(page, relationNames));

      const response = json({
        count: characters.length,
        characters,
        meta: {
          cachedForSeconds: CHARACTER_CACHE_SECONDS,
          relationTitlesCachedForSeconds: RELATION_TITLE_CACHE_SECONDS
        }
      }, 200, {
        ...cors,
        "Cache-Control": `public, max-age=${CHARACTER_CACHE_SECONDS}`
      });

      // Store a CORS-neutral copy and add CORS when serving it.
      const cacheCopy = new Response(response.clone().body, {
        status: response.status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": `public, max-age=${CHARACTER_CACHE_SECONDS}`
        }
      });

      ctx.waitUntil(responseCache.put(responseCacheKey, cacheCopy));
      return response;
    } catch (error) {
      console.error("Akailem character API error:", error);
      return json({
        error: "Unable to load characters.",
        details: error.message
      }, 500, cors);
    }
  }
};

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
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
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
      {
        method: "POST",
        body: JSON.stringify(body)
      }
    );

    results.push(...(response.results || []));
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);

  return results;
}

async function resolveRelationNames(pages, token, ctx) {
  // A Set means a related page shared by many characters is resolved once per run.
  const ids = new Set();

  for (const page of pages) {
    for (const [name, property] of Object.entries(page.properties || {})) {
      if (property?.type !== "relation" || !RELATION_FIELDS.has(name)) continue;
      for (const item of property.relation || []) {
        if (item?.id) ids.add(item.id);
      }
    }
  }

  const uniqueIds = [...ids];
  const map = new Map();
  let nextIndex = 0;

  async function resolverWorker() {
    while (true) {
      const index = nextIndex++;
      if (index >= uniqueIds.length) return;

      const id = uniqueIds[index];

      try {
        const resolved = await getRelationTitle(id, token, ctx);
        map.set(id, resolved);
      } catch (error) {
        // Don't disguise an API failure as if "Related Page" were the real title.
        console.error(`Could not resolve Notion relation ${id}:`, error);
        map.set(id, {
          id,
          name: "Unavailable relation",
          unavailable: true
        });
      }
    }
  }

  const workerCount = Math.min(RELATION_CONCURRENCY, uniqueIds.length);
  await Promise.all(Array.from({ length: workerCount }, () => resolverWorker()));

  return map;
}

async function getRelationTitle(id, token, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(`https://akailem-relation-cache.invalid/title/${id}`);
  const cached = await cache.match(cacheKey);

  if (cached) {
    return await cached.json();
  }

  const page = await notionFetch(
    `https://api.notion.com/v1/pages/${id}`,
    token
  );

  const result = {
    id,
    name: pageTitle(page) || "Untitled",
    url: page.url || null
  };

  const cacheResponse = new Response(JSON.stringify(result), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": `public, max-age=${RELATION_TITLE_CACHE_SECONDS}`
    }
  });

  // Avoid making the current request wait on the cache write.
  ctx.waitUntil(cache.put(cacheKey, cacheResponse));
  return result;
}

function pageTitle(page) {
  // Detect the title property by Notion type, not by property name. This works
  // whether a related database calls its title field Name, Nature, Nom, Title, etc.
  for (const property of Object.values(page.properties || {})) {
    if (property?.type === "title") {
      const value = text(property.title).trim();
      if (value) return value;
    }
  }
  return null;
}

function normalizePage(page, relationNames) {
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

function normalizeProperty(property, relationNames) {
  if (!property) return null;

  switch (property.type) {
    case "title":
      return text(property.title);
    case "rich_text":
      return text(property.rich_text);
    case "number":
      return property.number;
    case "checkbox":
      return property.checkbox;
    case "url":
      return property.url;
    case "email":
      return property.email;
    case "phone_number":
      return property.phone_number;
    case "select":
      return property.select?.name ?? null;
    case "status":
      return property.status?.name ?? null;
    case "multi_select":
      return (property.multi_select || []).map(item => item.name);
    case "date":
      return property.date
        ? {
            start: property.date.start,
            end: property.date.end,
            timeZone: property.date.time_zone
          }
        : null;
    case "people":
      return (property.people || []).map(person => ({
        id: person.id,
        name: person.name || null
      }));
    case "relation":
      return (property.relation || []).map(item =>
        relationNames.get(item.id) || {
          id: item.id,
          name: "Unavailable relation",
          unavailable: true
        }
      );
    case "formula":
      return normalizeFormula(property.formula);
    case "rollup":
      return normalizeRollup(property.rollup, relationNames);
    case "files":
      return (property.files || []).map(file => ({
        name: file.name,
        url: file.type === "external" ? file.external?.url : file.file?.url
      }));
    default:
      return null;
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
  try {
    payload = await response.json();
  } catch {
    // Keep payload null; the status-based error below will still be useful.
  }

  if (response.ok) return payload;

  // 429 = rate limited. 5xx = transient server-side errors worth retrying.
  const retryable = response.status === 429 || response.status >= 500;

  if (retryable && retriesRemaining > 0) {
    const retryAfterHeader = response.headers.get("Retry-After");
    const retryAfterSeconds = retryAfterHeader ? Number(retryAfterHeader) : NaN;
    const delay = Number.isFinite(retryAfterSeconds)
      ? Math.max(250, retryAfterSeconds * 1000)
      : backoffMs(MAX_RETRIES - retriesRemaining);

    await sleep(delay);
    return notionFetch(url, token, init, retriesRemaining - 1);
  }

  const message = payload?.message || `Notion returned HTTP ${response.status}.`;
  throw new Error(`${message} (${response.status})`);
}

function backoffMs(attempt) {
  // Exponential backoff with small jitter: ~0.5s, 1s, 2s, 4s, 8s.
  const base = Math.min(8000, 500 * (2 ** attempt));
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function text(items = []) {
  return items.map(item => item.plain_text || "").join("");
}

function json(data, status, headers = {}) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...headers
    }
  });
}
