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
