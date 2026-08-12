# World Companion Template — Alice Test Build

This build uses one `companion.html` for the whole cast. Character-specific files live under `characters/`. Portrait/expression and audio runtime systems are not used by the interface.

## Structure

```text
WORLD_COMPANION_TEMPLATE/
├── companion.html
├── character_list.js
├── shared/
│   ├── context_awareness.js
│   └── visual_context.js
├── themes/
│   └── halloween.css
└── characters/
    ├── alice_nexus/
    │   ├── character.js
    │   └── episodes/
    │       ├── episode_list.json
    │       ├── about_adair.json
    │       └── about_tyler.json
    └── template_character/
        └── character.js
```

## Alice test character

Alice Nexus is included as the first real character package. The template character remains in the directory so character switching can be tested without adding another finished character first.

Alice currently includes two unfinished built-in episode snippets:

- `About Adair`
- `About Tyler`

The episode files deliberately retain empty `expression` fields. The text-only episode runtime ignores those fields, so episodes exported by the existing Episode Creator Studio remain compatible without changing its schema.

## Character switching

Use **SWITCH CHARACTER** in the sidebar. The directory is searchable by name, subtitle/role, group, and ID. The chosen character is stored in `localStorage` and written to the URL as `?character=<id>`.

## Adding a character

1. Copy an existing character package or create `characters/<stable_id>/`.
2. Add `character.js` and keep `definition.id` identical to the directory ID.
3. Add the character to `character_list.js`.
4. Add `episodes/episode_list.json` if the character has episodes.
5. Add `special_modules/` only when that character needs a special module.

## Episode compatibility

The existing `companion-episode-v1` structure is unchanged. `expression` may be populated, empty, or omitted; the current text-only renderer does not read it.

## Shared awareness and themes

`companion.html` loads the real shared awareness files from `shared/` and context CSS from `themes/`. The Halloween visual context remains available through `themes/halloween.css`.

## Remote message bank note

Alice's character configuration currently uses `Alice` as the `messageBankCompanion` service key. If the deployed message-bank Worker uses a different Alice key, change only that value in `characters/alice_nexus/character.js`. Built-in episodes remain local and do not depend on the message bank.


## OG Worker endpoint

This build is configured to use the combined OG companion Worker at `https://og-companions.aquafia1247.workers.dev`. Message banks use `/message-banks/{companion}` and birthday awareness uses `/context`.


## Identity convention

Most OG characters use one identity whose key matches the character/message-bank identity slug. Example: Alice uses `defaultIdentity: "alice"` and `identities.alice`. Do not use a generic `primary` identity unless that is intentionally the Notion Identity title. Characters with additional identities can duplicate the main identity block and give each one its actual identity name/key.
