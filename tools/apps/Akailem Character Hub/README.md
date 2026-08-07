# Akailem Character Hub — on-demand profile loading

This version keeps the frontend simple (`index.html`, `styles.css`, `app.js`) and uses one Cloudflare Worker (`worker.js`).

## What changed

- `GET /api/characters` is now a lightweight browse endpoint. It does **not** resolve Notion relations.
- `GET /api/characters/:id` loads one full character profile only when the user clicks that character.
- Character cards show the character name only. Compact view shows the name only. Table view shows Name + Last Updated.
- The main explorer still supports filters for inexpensive non-relation properties such as Gender, Pronouns, MBTI, Moral Alignment, Temperament, Zodiac Sign, Hogwarts House, and Season.
- Relation titles are deduplicated, retried, and edge-cached for 24 hours.
- Failed relation lookups are not cached and are hidden instead of displaying `Unavailable relation`.
- Relation lookups use concurrency 2, which is deliberately conservative for Notion rate limits.
- If a single relation property is too large for Notion's normal page response, the Worker automatically paginates that property only when needed.

## Cloudflare variables

- `NOTION_TOKEN` — Secret
- `NOTION_CHARACTERS_SOURCE_ID` — `1e910840-20d5-8161-817c-000bc7b58a2e`
- `ALLOWED_ORIGIN` — `https://aquafia.github.io`

No new variables are required.

## Endpoints

- `https://akailem.aquafia1247.workers.dev/api/characters`
- `https://akailem.aquafia1247.workers.dev/api/characters/<NOTION_PAGE_ID>`

Replace the Worker code in Cloudflare with `worker.js`, then publish the three frontend files to GitHub Pages when GitHub is available again.


## Current UI structure
Dashboard is now the world overview. Character Explorer lives under the Characters tab. Other sidebar tabs are lightweight placeholders until their Notion data sources are connected.
