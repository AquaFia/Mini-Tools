CORRECTED DORM-MAILBOX PATCH

This version starts from the original uploaded map.html.
Only the Dorms floor receives mailbox UI and behavior:
- mailbox badge inside each dorm tile
- Open Mailbox button in the Dorms side panel
- letter list/reader overlay

The 1F data, 2F/3F placeholders, Jacey immersive room markup, handbook controls,
and existing navigation logic were not replaced.

Files:
- map.html: corrected map
- worker.js: Cloudflare Worker with the existing memory routes plus letter routes

Cloudflare Worker variable required:
LETTERS_DATABASE_ID=3adc82745a1380b3b864deb1c395ae28

The existing NOTION_TOKEN remains unchanged.
