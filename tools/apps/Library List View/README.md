# Notion Memory Library — Full Reader

This version keeps the memory list in the bookshelf drawer, but clicking a memory now opens its actual Notion page content inside the site.

## Deploy the updated Worker first

1. Open Cloudflare → **Workers & Pages** → your `memory-scenes` Worker.
2. Click **Edit code**.
3. Replace all existing Worker code with the contents of `worker.js` from this folder.
4. Click **Deploy**.
5. Keep `ALLOWED_ORIGIN` set to exactly:

   `https://aquafia.github.io`

The existing Notion secret and database variables remain the same.

## Then update GitHub Pages

Upload/replace these files in the repository:

- `index.html`
- `library.png`

Wait for GitHub Pages to redeploy, then hard-refresh the page.

## New API routes

- `GET /api/memories` returns the archive list.
- `GET /api/memories/PAGE_ID` returns that memory's page blocks and nested children.

The Worker verifies that the requested page belongs to the Memories database before returning its contents.

## Reader support

The in-site reader handles paragraphs, headings, rich text, links, lists, nested blocks, toggles, to-do items, quotes, callouts, code, equations, dividers, images, video, audio, files, PDFs, bookmarks, embeds, columns, tables, synced blocks, and nested-page labels.

Notion-hosted image/file URLs expire, but the site fetches a fresh URL each time the memory is opened.
