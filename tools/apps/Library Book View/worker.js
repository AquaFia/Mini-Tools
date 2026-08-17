// Cloudflare Worker for the Memory Library.
//
// Required environment variables:
// NOTION_TOKEN              (encrypted secret)
// MEMORIES_DATABASE_ID      = 307c82745a1380168666f6183a473262
// AQUA_DATABASE_ID
// ERIDIUM_DATABASE_ID
// SKYLER_DATABASE_ID
// ALLOWED_ORIGIN            = https://aquafia.github.io
//
// Optional multi-location book collection:
// SECOND_NOTION_TOKEN       (encrypted secret for the second Notion workspace)
// BOOK_DATABASES            JSON array, e.g.
//   [{"id":"DATABASE_ID_1","workspace":"primary","label":"Main Notion"},
//    {"id":"DATABASE_ID_2","workspace":"secondary","label":"Other Notion"}]
//
// Akailem series source (second Notion workspace, kept separate from generic book databases):
// Uses SECOND_NOTION_TOKEN. Database IDs are source-specific constants below.

const NOTION_VERSION = "2022-06-28";
const MAX_BLOCKS = 2500;
const MAX_DEPTH = 16;
const AKAILEM_BOOKS_DATABASE_ID = "1e91084020d581609604ffab84046a94";
const AKAILEM_CHAPTERS_DATABASE_ID = "1fd1084020d58045804ecbc20b63fe24";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (request.method !== "GET") {
      return json({ error: "Method not allowed" }, 405, env, request);
    }

    try {
      if (url.pathname === "/api/memories") {
        return await listMemories(env, request);
      }

      const match = url.pathname.match(/^\/api\/memories\/([0-9a-fA-F-]{32,36})$/);
      if (match) {
        return await readMemory(match[1], env, request);
      }

      if (url.pathname === "/api/books") {
        return await listBooks(env, request);
      }

      const akailemChapterMatch = url.pathname.match(/^\/api\/books\/akailem\/chapters\/([0-9a-fA-F-]{32,36})$/);
      if (akailemChapterMatch) {
        return await readAkailemChapter(akailemChapterMatch[1], env, request);
      }

      const bookMatch = url.pathname.match(/^\/api\/books\/(db\d+|akailem)\/([0-9a-fA-F-]{32,36})$/);
      if (bookMatch) {
        if (bookMatch[1] === "akailem") {
          return await listAkailemChapters(bookMatch[2], env, request);
        }
        return await readBook(bookMatch[1], bookMatch[2], env, request);
      }

      return json({ error: "Not found" }, 404, env, request);
    } catch (error) {
      console.error(error);
      return json({
        error: "Notion request failed",
        detail: String(error?.message || error)
      }, 500, env, request);
    }
  }
};

async function listMemories(env, request) {
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

  return json({ memories }, 200, env, request);
}

function parseJsonArray(value, name) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) throw new Error("must be a JSON array");
    return parsed;
  } catch (error) {
    throw new Error(`${name} is invalid: ${error.message}`);
  }
}

function getBookDatabases(env) {
  return parseJsonArray(env.BOOK_DATABASES, "BOOK_DATABASES")
    .filter(item => item && item.id)
    .map((item, index) => ({
      key: `db${index}`,
      id: String(item.id).replaceAll("-", ""),
      workspace: item.workspace === "secondary" ? "secondary" : "primary",
      label: String(item.label || (item.workspace === "secondary" ? "Notion workspace 2" : "Notion workspace 1"))
    }));
}

function getWorkspaceToken(workspace, env) {
  if (workspace === "secondary") {
    if (!env.SECOND_NOTION_TOKEN) throw new Error("SECOND_NOTION_TOKEN is not configured");
    return env.SECOND_NOTION_TOKEN;
  }
  if (!env.NOTION_TOKEN) throw new Error("NOTION_TOKEN is not configured");
  return env.NOTION_TOKEN;
}

async function listBooks(env, request) {
  const databases = getBookDatabases(env);
  const notionGroups = await Promise.all(databases.map(async database => {
    const token = getWorkspaceToken(database.workspace, env);
    const rows = await queryAll(database.id, env, token);
    return rows.map(page => {
      const titleProperty = Object.values(page.properties || {}).find(prop => prop?.type === "title");
      return {
        id: `${database.key}:${page.id}`,
        kind: "notion",
        sourceKey: database.key,
        pageId: page.id,
        title: getTitle(titleProperty) || "Untitled book",
        source: database.label,
        lastEdited: page.last_edited_time,
        url: page.url
      };
    });
  }));

  const akailemBooks = await listAkailemShelfBooks(env);
  return json({ books: [...notionGroups.flat(), ...akailemBooks] }, 200, env, request);
}

function getAkailemConfig(env) {
  if (!env.SECOND_NOTION_TOKEN) {
    throw new Error("SECOND_NOTION_TOKEN is not configured for the Akailem workspace");
  }
  return {
    token: env.SECOND_NOTION_TOKEN,
    booksDatabaseId: AKAILEM_BOOKS_DATABASE_ID,
    chaptersDatabaseId: AKAILEM_CHAPTERS_DATABASE_ID
  };
}

async function listAkailemShelfBooks(env) {
  const config = getAkailemConfig(env);
  const rows = await queryAll(config.booksDatabaseId, env, config.token);
  return rows.map(page => ({
    id: `akailem:${page.id}`,
    kind: "series",
    sourceKey: "akailem",
    pageId: page.id,
    title: getTitle(page.properties?.["Nome"]) || "Untitled Akailem book",
    source: "Akailem",
    lastEdited: page.last_edited_time,
    url: page.url
  }));
}

async function listAkailemChapters(bookId, env, request) {
  const config = getAkailemConfig(env);
  const normalizedBookId = bookId.replaceAll("-", "");
  const books = await queryAll(config.booksDatabaseId, env, config.token);
  const book = books.find(page => page.id.replaceAll("-", "") === normalizedBookId);
  if (!book) return json({ error: "Akailem book not found" }, 404, env, request);

  const rows = await queryAkailemChapters(config.chaptersDatabaseId, book.id, env, config.token);
  const chapters = rows.map(page => ({
    id: page.id,
    title: getTitle(page.properties?.["Nom"]) || "Untitled chapter",
    number: getNumber(page.properties?.["Chapter"]),
    status: getStatus(page.properties?.["État"]),
    lastEdited: page.last_edited_time,
    url: page.url
  })).sort(compareAkailemChapters);

  return json({
    book: {
      id: book.id,
      title: getTitle(book.properties?.["Nome"]) || "Untitled Akailem book",
      synopsis: getText(book.properties?.["Synopsis"]),
      source: "Akailem",
      lastEdited: book.last_edited_time,
      url: book.url,
      icon: normalizeIcon(book.icon),
      cover: normalizeFile(book.cover)
    },
    chapters
  }, 200, env, request);
}

async function readAkailemChapter(chapterId, env, request) {
  const config = getAkailemConfig(env);
  const normalizedChapterId = chapterId.replaceAll("-", "");
  const chapters = await queryAll(config.chaptersDatabaseId, env, config.token);
  const chapter = chapters.find(page => page.id.replaceAll("-", "") === normalizedChapterId);
  if (!chapter) return json({ error: "Akailem chapter not found" }, 404, env, request);

  const state = { count: 0, truncated: false };
  const blocks = await getBlockTree(chapter.id, env, state, 0, config.token);
  const properties = chapter.properties || {};

  return json({
    book: {
      id: chapter.id,
      title: getTitle(properties["Nom"]) || "Untitled chapter",
      status: getStatus(properties["État"]),
      chapterNumber: getNumber(properties["Chapter"]),
      source: "Akailem",
      lastEdited: chapter.last_edited_time,
      url: chapter.url,
      icon: normalizeIcon(chapter.icon),
      cover: normalizeFile(chapter.cover)
    },
    blocks,
    truncated: state.truncated
  }, 200, env, request);
}

async function queryAkailemChapters(databaseId, bookId, env, token) {
  const pages = [];
  let cursor;

  do {
    const body = {
      page_size: 100,
      filter: { property: "Book", relation: { contains: bookId } },
      sorts: [{ property: "Chapter", direction: "ascending" }]
    };
    if (cursor) body.start_cursor = cursor;

    const data = await notion(`/databases/${databaseId}/query`, env, {
      method: "POST",
      body: JSON.stringify(body)
    }, token);

    pages.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return pages;
}

function compareAkailemChapters(a, b) {
  const aTitle = a.title.toLowerCase();
  const bTitle = b.title.toLowerCase();
  if (aTitle.startsWith("prologue") !== bTitle.startsWith("prologue")) return aTitle.startsWith("prologue") ? -1 : 1;
  if (aTitle.startsWith("epilogue") !== bTitle.startsWith("epilogue")) return aTitle.startsWith("epilogue") ? 1 : -1;
  if (a.number != null && b.number != null && a.number !== b.number) return a.number - b.number;
  if (a.number != null && b.number == null) return -1;
  if (a.number == null && b.number != null) return 1;
  return a.title.localeCompare(b.title);
}

async function readBook(sourceKey, pageId, env, request) {
  const database = getBookDatabases(env).find(item => item.key === sourceKey);
  if (!database) return json({ error: "Book source not found" }, 404, env, request);

  const token = getWorkspaceToken(database.workspace, env);
  const normalizedId = pageId.replaceAll("-", "");
  const allowedPages = await queryAll(database.id, env, token);
  const page = allowedPages.find(item => item.id.replaceAll("-", "") === normalizedId);
  if (!page) return json({ error: "Book not found" }, 404, env, request);

  const state = { count: 0, truncated: false };
  const blocks = await getBlockTree(page.id, env, state, 0, token);
  const titleProperty = Object.values(page.properties || {}).find(prop => prop?.type === "title");

  return json({
    book: {
      id: page.id,
      title: getTitle(titleProperty) || "Untitled book",
      lastEdited: page.last_edited_time,
      url: page.url,
      source: database.label,
      icon: normalizeIcon(page.icon),
      cover: normalizeFile(page.cover)
    },
    blocks,
    truncated: state.truncated
  }, 200, env, request);
}

async function readMemory(pageId, env, request) {
  const normalizedId = pageId.replaceAll("-", "");
  const allowedPages = await queryAll(env.MEMORIES_DATABASE_ID, env);
  const page = allowedPages.find(item => item.id.replaceAll("-", "") === normalizedId);

  if (!page) {
    return json({ error: "Memory not found" }, 404, env, request);
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
  }, 200, env, request);
}

async function getBlockTree(blockId, env, state, depth, token = env.NOTION_TOKEN) {
  if (depth > MAX_DEPTH || state.count >= MAX_BLOCKS) {
    state.truncated = true;
    return [];
  }

  const children = await getAllBlockChildren(blockId, env, token);
  const output = [];

  for (const block of children) {
    if (state.count >= MAX_BLOCKS) {
      state.truncated = true;
      break;
    }

    state.count += 1;
    const normalized = normalizeBlock(block);

    if (block.has_children && depth < MAX_DEPTH) {
      normalized.children = await getBlockTree(block.id, env, state, depth + 1, token);
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

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const configuredOrigins = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  // Browsers use the literal Origin value "null" for pages opened with file://.
  // Keep the configured hosted origin(s), while also allowing direct local-file testing.
  const allowedOrigin = origin === "null"
    ? "null"
    : configuredOrigins.includes(origin)
      ? origin
      : null;

  const headers = {
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  };

  if (allowedOrigin) {
    headers["Access-Control-Allow-Origin"] = allowedOrigin;
  }

  return headers;
}

function json(data, status, env, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...corsHeaders(request, env) }
  });
}

async function notion(path, env, init = {}, token = env.NOTION_TOKEN) {
  const response = await fetch(`https://api.notion.com/v1${path}`, {
    ...init,
    headers: {
      "Authorization": `Bearer ${token}`,
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

async function getAllBlockChildren(blockId, env, token = env.NOTION_TOKEN) {
  const blocks = [];
  let cursor;

  do {
    const params = new URLSearchParams({ page_size: "100" });
    if (cursor) params.set("start_cursor", cursor);
    const data = await notion(`/blocks/${blockId}/children?${params}`, env, {}, token);
    blocks.push(...data.results);
    cursor = data.has_more ? data.next_cursor : null;
  } while (cursor);

  return blocks;
}

async function queryAll(databaseId, env, token = env.NOTION_TOKEN) {
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
    }, token);

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

function getText(prop) {
  if (!prop) return "";
  if (prop.type === "rich_text") return (prop.rich_text || []).map(item => item.plain_text || "").join("").trim();
  return "";
}

function getNumber(prop) {
  if (!prop || prop.type !== "number") return null;
  return typeof prop.number === "number" ? prop.number : null;
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
