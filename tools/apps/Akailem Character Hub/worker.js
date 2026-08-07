const NOTION_VERSION = "2026-03-11";

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://aquafia.github.io";
    const cors = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin"
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "GET") return json({ error: "Method not allowed" }, 405, cors);
    if (url.pathname === "/" || url.pathname === "/health") return json({ name: "Akailem API", status: "online", endpoint: "/api/characters" }, 200, cors);
    if (url.pathname !== "/api/characters") return json({ error: "Not found" }, 404, cors);

    try {
      if (!env.NOTION_TOKEN) throw new Error("NOTION_TOKEN is missing.");
      if (!env.NOTION_CHARACTERS_SOURCE_ID) throw new Error("NOTION_CHARACTERS_SOURCE_ID is missing.");

      const pages = await queryAll(env.NOTION_CHARACTERS_SOURCE_ID, env.NOTION_TOKEN);
      const relationNames = await resolveRelationNames(pages, env.NOTION_TOKEN);
      const characters = pages.map(page => normalizePage(page, relationNames));

      return json({ count: characters.length, characters }, 200, {
        ...cors,
        "Cache-Control": "public, max-age=60"
      });
    } catch (error) {
      return json({ error: "Unable to load characters.", details: error.message }, 500, cors);
    }
  }
};

async function queryAll(sourceId, token) {
  const results = [];
  let cursor;
  do {
    const body = { page_size: 100, sorts: [{ property: "Name", direction: "ascending" }] };
    if (cursor) body.start_cursor = cursor;
    const response = await notionFetch(`https://api.notion.com/v1/data_sources/${sourceId}/query`, token, {
      method: "POST",
      body: JSON.stringify(body)
    });
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return results;
}

async function resolveRelationNames(pages, token) {
  const ids = new Set();
  for (const page of pages) {
    for (const [name, property] of Object.entries(page.properties || {})) {
      if (property?.type !== "relation" || !RELATION_FIELDS.has(name)) continue;
      for (const item of property.relation || []) ids.add(item.id);
    }
  }

  const map = new Map();
  const queue = [...ids];
  const concurrency = 5;

  async function worker() {
    while (queue.length) {
      const id = queue.shift();
      try {
        const page = await notionFetch(`https://api.notion.com/v1/pages/${id}`, token);
        map.set(id, { id, name: pageTitle(page) || "Untitled" });
      } catch {
        map.set(id, { id, name: "Related page" });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length || 1) }, worker));
  return map;
}

function pageTitle(page) {
  for (const property of Object.values(page.properties || {})) {
    if (property?.type === "title") return text(property.title) || null;
  }
  return null;
}

function normalizePage(page, relationNames) {
  const properties = Object.fromEntries(
    Object.entries(page.properties || {}).map(([name, value]) => [name, normalizeProperty(value, relationNames)])
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
    case "date": return property.date ? { start: property.date.start, end: property.date.end, timeZone: property.date.time_zone } : null;
    case "people": return (property.people || []).map(person => ({ id: person.id, name: person.name || null }));
    case "relation": return (property.relation || []).map(item => relationNames.get(item.id) || { id: item.id, name: "Related page" });
    case "formula": return normalizeFormula(property.formula);
    case "rollup": return normalizeRollup(property.rollup, relationNames);
    case "files": return (property.files || []).map(file => ({ name: file.name, url: file.type === "external" ? file.external?.url : file.file?.url }));
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
  if (rollup.type === "array") return (rollup.array || []).map(item => normalizeProperty(item, relationNames));
  return rollup[rollup.type] ?? null;
}

async function notionFetch(url, token, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.message || `Notion returned ${response.status}.`);
  return payload;
}

function text(items = []) { return items.map(item => item.plain_text || "").join(""); }
function json(data, status, headers = {}) { return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } }); }
