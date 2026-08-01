# Dorm Mailbox Patch

This patch adds a Notion-powered mailbox to every dorm room in `map.html` and adds `/api/letters` routes to the existing Cloudflare Worker.

## Cloudflare Worker
Replace the current `memory-scenes` Worker code with `worker.js`. Keep the existing variables and add:

`LETTERS_DATABASE_ID = 3adc82745a1380b3b864deb1c395ae28`

The same `NOTION_TOKEN` is reused. The Notion integration must have access to the **OC Dorm Room Letters** database. Keep `ALLOWED_ORIGIN` as your GitHub Pages origin.

## GitHub Pages
Replace the map file with this package's `map.html`. It already points to:

`https://memory-scenes.aquafia1247.workers.dev/api/letters`

## Date behavior
The year is ignored. A letter becomes visible every year on its Delivery Date month/day. Without an Expiration Date it remains visible through December 31, then hides until its next annual delivery date. With an Expiration Date it remains visible through that month/day; ranges crossing New Year are supported.

## Routing
The Notion `Character` select determines the mailbox. Rooms with no matching letters simply show an empty mailbox.
