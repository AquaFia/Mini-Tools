# Akailem Character Hub — Simple Version

This version keeps the requested dashboard layout while removing the original multi-folder frontend structure and all placeholder character data.

## Files

- `index.html` — page markup
- `styles.css` — all styling
- `app.js` — Notion API loading, dashboard, search, filters, views, and profiles
- `worker.js` — Cloudflare Worker code

## GitHub Pages

Put these three files at the root of your GitHub Pages repository:

- `index.html`
- `styles.css`
- `app.js`

The frontend is already configured to use:

`https://akailem.aquafia1247.workers.dev/api/characters`

## Cloudflare Worker

Paste the contents of `worker.js` into your `akailem` Cloudflare Worker.

Add these Cloudflare bindings:

- Secret: `NOTION_TOKEN`
- Text: `NOTION_CHARACTERS_SOURCE_ID` = `1e910840-20d5-8161-817c-000bc7b58a2e`
- Text: `ALLOWED_ORIGIN` = `https://aquafia.github.io`

Your Notion integration must be connected to the Character database.

## No placeholder data

There is no local JSON character list. Every displayed character comes from your live Notion data source.

## Character profile fields

The character popup is intentionally curated. It displays only these groups:

- Identity / Core Information
- Personality / Symbolism
- Story Connections
- Profile

To add another visible property later, edit `PROFILE_SECTIONS` near the top of `app.js`. This keeps display-only choices separate from Notion's internal sorting/helper properties.

The Worker also resolves the configured relation properties into readable related-page names before returning them to the site.

## Character profile layout

Character profiles display content in this order:

1. Summary
2. Identity / Core Information
3. Personality / Symbolism
4. Story Connections
5. Spells & Items
6. Gallery

Summary, Spells & Items, and Gallery are full-width standalone sections. Empty properties are hidden automatically.

## Relation retrieval / caching

The Worker now:

- de-duplicates relation page IDs before resolving them;
- resolves at most 3 relation pages concurrently;
- retries Notion 429 and 5xx responses with exponential backoff and honors `Retry-After`;
- caches resolved relation titles at Cloudflare's edge for 6 hours;
- caches the complete character response for 5 minutes;
- supports `/api/characters?refresh=1` to bypass the 5-minute full-response cache after a Notion edit;
- logs relation lookup failures instead of silently pretending the page is literally named `Related Page`.

No additional Cloudflare variables are required.
