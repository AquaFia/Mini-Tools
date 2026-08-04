# Jacey Expression Repository — Phase 3: Dynamic Portrait UI

This phase changes only the portrait-expression interface.

## Dynamic layout

The expression button area now:

- builds from every expression listed in `expressions/expression_manifest.json`;
- uses a responsive grid instead of a fixed four-column assumption;
- keeps the existing numbered buttons;
- grows naturally until it reaches its maximum height;
- becomes vertically scrollable when more expressions are added;
- keeps the portrait and the rest of the sidebar from being pushed out of place;
- hides itself when the active identity has no portraits;
- adds accessible labels from each manifest entry's `displayName`,
  `statusLabel`, or expression ID.

Eight expressions retain the familiar compact grid. Adding a ninth, twelfth,
twentieth, or later expression requires no HTML change.

## Adding expressions

1. Put the image in `expressions/`.
2. Use the correct prefix:
   - `J_` for Jace
   - `M_` for Mao
   - `N_` for Naoya
3. Add its entry to the correct identity in
   `expressions/expression_manifest.json`.
4. Refresh the page.

## Intentionally unchanged

No message-bank, Notion, episode, memory, Cipher Lab, chat-routing, identity,
storage, or content-library code was changed.
