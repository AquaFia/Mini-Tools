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

## Local `file://` testing

The Worker also accepts the browser origin `null`, which is what browsers send when `index.html` is opened directly from your computer with a `file://` URL. You do **not** need to change `ALLOWED_ORIGIN`; keep it set to `https://aquafia.github.io`.

This means the same `index.html` can call the deployed Worker from both GitHub Pages and a directly opened local file. Other website origins are still not granted CORS access.

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

## Left bookshelf: multi-location Book Collection

The left bookcase now opens a separate **Book Collection**. It can combine:

- any number of Notion databases from the same workspace as the existing Memory Archive,
- any number of Notion databases from a second Notion workspace,
- direct external books/series such as Webtoon links.

Notion books open inside the site's existing full-page reader. External books open their configured URL in a new tab.

### Cloudflare variables for the Book Collection

The existing `NOTION_TOKEN` is used for databases marked as `primary`.

Add a second encrypted Worker secret for the second Notion workspace:

`SECOND_NOTION_TOKEN`

Each Notion integration must be connected/shared with every database that it needs to read in its own workspace.

Add a text Worker variable named `BOOK_DATABASES`. Its value is a JSON array. Add as many databases as needed:

```json
[
  {
    "id": "PRIMARY_WORKSPACE_DATABASE_ID_1",
    "workspace": "primary",
    "label": "Workspace One"
  },
  {
    "id": "PRIMARY_WORKSPACE_DATABASE_ID_2",
    "workspace": "primary",
    "label": "Workspace One"
  },
  {
    "id": "SECOND_WORKSPACE_DATABASE_ID_1",
    "workspace": "secondary",
    "label": "Workspace Two"
  }
]
```

`label` is displayed near the bottom of each generated book cover, so it can be a workspace name, database name, series category, or any other short source label.

External/public books are maintained in `external_books.js`, not in Cloudflare. Edit the `window.EXTERNAL_BOOKS` array to add, remove, or reorder links. Example:

```js
window.EXTERNAL_BOOKS = [
  {
    title: "The Eternal Savior",
    url: "https://www.webtoons.com/en/canvas/the-eternal-savior/list?title_no=439471",
    label: "Webtoon"
  }
];
```

These entries are merged into the left bookshelf by `index.html`. Clicking one opens its public URL directly, so no Notion token or Worker redeploy is involved.

### New Book Collection API routes

- `GET /api/books` returns books from the configured Notion databases plus the dedicated Akailem source. External/public books are loaded locally from `external_books.js`.
- `GET /api/books/db0/PAGE_ID` opens a page from the first configured Notion database.
- `GET /api/books/db1/PAGE_ID` opens a page from the second configured Notion database, and so on.

The database key is generated from the order in `BOOK_DATABASES`; the browser handles these keys automatically.

### Important: database title properties

The Book Collection does not require every database to use the same title-property name. The Worker automatically finds the database's Notion `title` property for each page.

The existing Memory Archive configuration and routes are unchanged.

## Akailem series: books → chapters → chapter content

Akailem is intentionally separate from the generic `BOOK_DATABASES` logic. Its chapter database uses a `Book` relation, so the left bookshelf first queries the related Books database and displays those rows as the physical books. Chapter rows are only requested after one of those books is opened.

Akailem is in the second Notion workspace, so it uses the existing encrypted `SECOND_NOTION_TOKEN`. There are no extra Akailem token or database-ID variables to create. The Akailem Books and Chapters database IDs are source-specific constants inside its Worker adapter.

The Notion integration behind `SECOND_NOTION_TOKEN` must be connected/shared with both the Akailem Books database and the Akailem Chapters database. The right-side Memory Archive continues using its own existing token and routes.

Do not also add the Akailem Books database to `BOOK_DATABASES`; the dedicated Akailem adapter already supplies those books to `/api/books`.

Akailem uses these dedicated routes:

- `GET /api/books` includes Akailem **book** rows in the mixed left-bookcase shelf. It does not return chapter rows as shelf books.
- `GET /api/books/akailem/BOOK_PAGE_ID` returns that book plus its available chapters. Chapters are grouped by the Notion `Book` relation and ordered using the numeric `Chapter` property, with prologues/epilogues handled when the number is blank.
- `GET /api/books/akailem/chapters/CHAPTER_PAGE_ID` returns the selected chapter's actual Notion page content for the reader.

The current `index.html` understands this three-level flow: shelf book → chapter list → chapter reader. Generic Notion books and direct external/Webtoon links keep their existing behavior.


## Left bookshelf label filters

The left Book Collection automatically builds its filter buttons from each book's displayed label/source. `All` is always shown first. Akailem books use the `Akailem` label from the Worker, while public books use the `label` value in `external_books.js` (for example, The Eternal Savior uses `TES`). Adding a new label later automatically adds a matching filter button; no filter HTML needs to be hardcoded.
