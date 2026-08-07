const NOTION_VERSION = "2026-03-11";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedOrigin = env.ALLOWED_ORIGIN || "https://aquafia.github.io";
    const requestOrigin = request.headers.get("Origin");
    const cors = {
      "Access-Control-Allow-Origin": requestOrigin === allowedOrigin ? allowedOrigin : allowedOrigin,
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
      return json({ count: pages.length, characters: pages.map(normalizePage) }, 200, { ...cors, "Cache-Control": "public, max-age=60" });
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
    const response = await fetch(`https://api.notion.com/v1/data_sources/${sourceId}/query`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Notion-Version": NOTION_VERSION, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || `Notion returned ${response.status}.`);
    results.push(...payload.results);
    cursor = payload.has_more ? payload.next_cursor : undefined;
  } while (cursor);
  return results;
}

function normalizePage(page) {
  const properties = Object.fromEntries(Object.entries(page.properties || {}).map(([name, value]) => [name, normalizeProperty(value)]));
  return { id: page.id, url: page.url, name: properties.Name || "Unnamed Character", createdTime: page.created_time, lastEditedTime: page.last_edited_time, properties };
}

function normalizeProperty(property) {
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
    case "relation": return (property.relation || []).map(item => item.id);
    case "formula": return property.formula?.[property.formula.type] ?? null;
    case "rollup": return property.rollup?.[property.rollup.type] ?? null;
    case "files": return (property.files || []).map(file => ({ name: file.name, url: file.type === "external" ? file.external?.url : file.file?.url }));
    default: return null;
  }
}

function text(items = []) { return items.map(item => item.plain_text || "").join(""); }
function json(data, status, headers = {}) { return new Response(JSON.stringify(data, null, 2), { status, headers: { "Content-Type": "application/json; charset=utf-8", ...headers } }); }
