# Jacey Expression Repository — Phase 2: PortraitManager Runtime

This phase changes only the portrait/expression system.

## Included

```text
jacey_expression_repository_phase2/
├── jacey_companion_framework_v6_3_5_portrait_manager.html
└── expressions/
    ├── expression_manifest.json
    ├── J_Anger.webp
    ├── J_Clue.webp
    ├── J_Curious.webp
    ├── J_Deadpan.webp
    ├── J_Happy.webp
    ├── J_Overshare.webp
    ├── J_Panic.webp
    └── J_Vulnerable.webp
```

## PortraitManager behavior

- Loads `expressions/expression_manifest.json`.
- Resolves every portrait path relative to that manifest.
- Preloads all portraits listed in the manifest.
- Uses the active identity's manifest section.
- Keeps Jace, Mao, and Naoya in one shared manifest and folder.
- Shows the existing unavailable-portrait state when an identity has no images.
- Automatically begins using Mao or Naoya portraits after entries are added to
  their existing manifest sections.
- Keeps the existing global `setExpression()` entry point so message-bank,
  episode, Cipher Lab, and identity code continue calling the same portrait API.
- Falls back to the identity's manifest default when an unknown expression is
  requested.

## Intentionally unchanged

No message-bank, Notion, episode, memory, Cipher Lab, chat-routing, identity
phrase, storage, or content-library behavior was changed.

The expression panel still uses its existing layout in this phase. Layout growth
and scrolling belong to Phase 3.
