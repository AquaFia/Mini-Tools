// Cloudflare Worker for the Memory Library.
//
// Required environment variables:
// NOTION_TOKEN              (encrypted secret)
// MEMORIES_DATABASE_ID      = 307c82745a1380168666f6183a473262
// AQUA_DATABASE_ID
// ERIDIUM_DATABASE_ID
// SKYLER_DATABASE_ID
// ALLOWED_ORIGIN            = https://aquafia.github.io

const NOTION_VERSION = "2022-06-28";
const MAX_BLOCKS = 2500;
const MAX_DEPTH = 16;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(env) });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, env);
    }

    try {
      if (url.pathname === "/api/memories") {
        return await listMemories(env);
      }

      const match = url.pathname.match(/^\/api\/memories\/([0-9a-fA-F-]{32,36})$/);
      if (match) {
        return await readMemory(match[1], env);
      }

      return json({ error: "Not found" }, 404, env);
    } catch (error) {
      console.error(error);
      return json({
        error: "Notion request failed",
        detail: String(error?.message || error)
      }, 500, env);
    }
  }
};

async function listMemories(env) {
  const characterMaps = await Promise.all([
    buildCharacterMap(env.AQUA_DATABASE_ID, env),
    buildCharacterMap(env.ERIDIUM_DATABASE_ID, env),
    buildCharacterMap(env.SKYLER_DATABASE_ID, env)
  ]);

  const characterById = Object.assign({}, ...characterMaps);
  const rows = await queryAll(env.MEMORIES_DATABASE_ID, env);

  const memories = rows.map(page => {
    const p = page.properties || {};
    const relationIds = [
      ...getRelationIds(p["Aqua's OCs"]),
      ...getRelationIds(p["Eridium's OCs"]),
      ...getRelationIds(p["Skyler's OCs"])
    ];

    return {
      id: page.id,
      title: getTitle(p["Nom"]),
      status: getStatus(p["Status"]),
      date: getDate(p["Date"]),
      lastEdited: page.last_edited_time,
      url: page.url,
      characters: [...new Set(relationIds.map(id => characterById[id]).filter(Boolean))]
    };
  });

  return json({ memories }, 200, env);
}

async function readMemory(pageId, env) {
  const normalizedId = pageId.replaceAll("-", "");
  const allowedPages = await queryAll(env.MEMORIES_DATABASE_ID, env);
  const page = allowedPages.find(item => item.id.replaceAll("-", "") === normalizedId);

  if (!page) {
    return json({ error: "Memory not found" }, 404, env);
  }

  const state = { count: 0, truncated: false };
  const blocks = await getBlockTree(page.id, env, state, 0);
  const properties = page.properties || {};

  return json({
    memory: {
      id: page.id,
      title: getTitle(properties["Nom"]) || "Untitled memory",
      status: getStatus(properties["Status"]),
      date: getDate(properties["Date"]),
      lastEdited: page.last_edited_time,
      url: page.url,
      icon: normalizeIcon(page.icon),
      cover: normalizeFile(page.cover)
    },
    blocks,
    truncated: state.truncated
  }, 200, env);
}

async function getBlockTree(blockId, env, state, depth) {
  if (depth > MAX_DEPTH || state.count >= MAX_BLOCKS) {
    state.truncated = true;
    return [];
  }

  const children = await getAllBlockChildren(blockId, env);
  const output = [];

  for (const block of children) {
    if (state.count >= MAX_BLOCKS) {
      state.truncated = true;
      break;
    }

    state.count += 1;
    const normalized = normalizeBlock(block);

    if (block.has_children && depth < MAX_DEPTH) {
      normalized.children = await getBlockTree(block.id, env, state, depth + 1);
    } else {
      normalized.children = [];
      if (block.has_children) state.truncated = true;
    }

    output.push(normalized);
  }

  return output;
}

function normalizeBlock(block) {
  const type = block.type;
  const data = block[type] || {};
  const base = {
    id: block.id,
    type,
    hasChildren: Boolean(block.has_children)
  };

  switch (type) {
    case "paragraph":
    case "heading_1":
    case "heading_2":
    case "heading_3":
    case "quote":
    case "bulleted_list_item":
    case "numbered_list_item":
    case "toggle":
      return { ...base, richText: normalizeRichText(data.rich_text), color: data.color || "default", isToggleable: Boolean(data.is_toggleable) };

    case "to_do":
      return { ...base, richText: normalizeRichText(data.rich_text), checked: Boolean(data.checked), color: data.color || "default" };

    case "callout":
      return { ...base, richText: normalizeRichText(data.rich_text), icon: normalizeIcon(data.icon), color: data.color || "default" };

    case "code":
      return { ...base, richText: normalizeRichText(data.rich_text), caption: normalizeRichText(data.caption), language: data.language || "plain text" };

    case "equation":
      return { ...base, expression: data.expression || "" };

    case "image":
    case "video":
    case "audio":
    case "file":
    case "pdf":
      return { ...base, source: normalizeFile(data), caption: normalizeRichText(data.caption), name: data.name || "" };

    case "bookmark":
    case "embed":
    case "link_preview":
      return { ...base, url: data.url || "", caption: normalizeRichText(data.caption) };

    case "table":
      return { ...base, tableWidth: data.table_width || 0, hasColumnHeader: Boolean(data.has_column_header), hasRowHeader: Boolean(data.has_row_header) };

    case "table_row":
      return { ...base, cells: (data.cells || []).map(normalizeRichText) };

    case "child_page":
    case "child_database":
      return { ...base, title: data.title || "" };

    case "breadcrumb":
    case "divider":
    case "table_of_contents":
    case "column_list":
    case "column":
    case "synced_block":
    case "unsupported":
      return base;

    default:
      return { ...base, richText: normalizeRichText(data.rich_text), rawLabel: type.replaceAll("_", " ") };
  }
}

function normalizeRichText(items = []) {
  return items.map(item => ({
    type: item.type,
    plainText: item.plain_text || "",
    href: item.href || null,
    annotations: {
      bold: Boolean(item.annotations?.bold),
      italic: Boolean(item.annotations?.italic),
      strikethrough: Boolean(item.annotations?.strikethrough),
      underline: Boolean(item.annotations?.underline),
      code: Boolean(item.annotations?.code),
      color: item.annotations?.color || "default"
    },
    equation: item.type === "equation" ? item.equation?.expression || "" : null,
    mention: item.type === "mention" ? normalizeMention(item.mention) : null
  }));
}

function normalizeMention(mention) {
  if (!mention) return null;
  if (mention.type === "date") return { type: "date", start: mention.date?.start || "", end: mention.date?.end || null };
  if (mention.type === "link_preview") return { type: "link_preview", url: mention.link_preview?.url || "" };
  return { type: mention.type || "mention" };
}

function normalizeFile(value) {
  if (!value) return null;
  if (value.type === "external") return { type: "external", url: value.external?.url || "" };
  if (value.type === "file") return { type: "file", url: value.file?.url || "", expiryTime: value.file?.expiry_time || null };
  return null;
}

function normalizeIcon(icon) {
  if (!icon) return null;
  if (icon.type === "emoji") return { type: "emoji", value: icon.emoji || "" };
  const file = normalizeFile(icon);
  return file ? { type: "image", value: file.url } : null;
}

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  };
}

function json(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(env) }
  });
}

async function notion(path, env, init = {}) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${env.NOTION_TOKEN}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Notion ${response.status}: ${text}`);
  }
  return response.json();
}

async function getAllBlockChildren(blockId, env) {
  const blocks = [];
  let cursor;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("start_cursor", cursor);
    const data = await notion(`/blocks/${blockId}/children?${params}`, env);
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return blocks;
}

async function queryAll(databaseId, env) {
  const pages = [];
  let cursor;

  do {
    const body = {
      page_size: 100,
      sorts: [{ timestamp: "created_time", direction: "descending" }]
    };
    if (cursor) body.start_cursor = cursor;

    const data = await notion(`/databases/${databaseId}/query`, env, {
      method: "POST",
      body: JSON.stringify(body)
    });

    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return pages;
}

async function buildCharacterMap(databaseId, env) {
  if (!databaseId) return {};
  const rows = await queryAll(databaseId, env);
  const map = {};

  for (const page of rows) {
    const titleProperty = Object.values(page.properties || {}).find(prop => prop?.type === "title");
    const name = getTitle(titleProperty);
    if (name) map[page.id.replaceAll("-", "")] = name;
  }

  return map;
}

function getRelationIds(prop) {
  if (!prop || prop.type !== "relation") return [];
  return (prop.relation || []).map(item => item.id.replaceAll("-", ""));
}

function getTitle(prop) {
  if (!prop || prop.type !== "title") return "";
  return (prop.title || []).map(item => item.plain_text || "").join("").trim();
}

function getStatus(prop) {
  if (!prop) return "";
  if (prop.type === "status") return prop.status?.name || "";
  if (prop.type === "select") return prop.select?.name || "";
  return "";
}

function getDate(prop) {
  if (!prop || prop.type !== "date") return null;
  return prop.date?.start || null;
}
