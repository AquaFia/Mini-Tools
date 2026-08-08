# Phase 4A — Visual Context Foundation

Added:
- `shared/visual_context.js`
- `themes/README.md`

Updated:
- Jacey HTML: one shared script include + one initializer only.

Current behavior:
- Listens to `companioncontextchange`.
- Tracks active `visualContexts`.
- Loads optional `themes/<context>.css` files.
- Removes theme stylesheets when contexts end.
- Exposes portrait fallback candidates:
  combined context -> individual contexts -> normal.
- Emits `companionvisualcontextchange`.

Not implemented yet:
- Actual Halloween/birthday theme CSS.
- Event-specific portrait files or manifest entries.
- PortraitManager integration that selects those variants.

No changes were made to IdentityManager, MusicManager, MessageBankManager,
EpisodeManager, Cipher Lab, responsive layout rules, or persistence logic.
