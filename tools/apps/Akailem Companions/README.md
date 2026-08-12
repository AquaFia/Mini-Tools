# World Companion

This build uses one shared `companion.html` runtime and character packages under `characters/`.

## Runtime structure

```text
WORLD_COMPANION_TEMPLATE/
├── companion.html
├── character_list.js
├── characters/
│   └── alice_nexus/
│       ├── character.js
│       └── episodes/
├── shared/
│   └── context_awareness.js
└── templates/
    ├── single_identity/
    └── multiple_identities/
```

Only folders registered in `character_list.js` can be selected or loaded by the companion runtime. The `templates/` folder is intentionally outside `characters/` and is not registered, so template packages do not appear in the companion selector and cannot be selected through the normal character routing system.

## Adding a normal character

Most characters use one identity. Copy `templates/single_identity/` into `characters/<character_id>/`, then:

1. Rename the package `id`.
2. Rename the single identity key to the character's actual identity/message-bank name in slug form (for example `alice`).
3. Set `defaultIdentity` to that same key.
4. Update the character-specific runtime, service, memory, and color fields. Character profile/dossier facts are loaded from Notion.
5. Add the character to `character_list.js`.

For a normal character, there is no need to mention multiple identities anywhere in the character package.

## Characters with multiple identities

Use `templates/multiple_identities/` only when a character genuinely has more than one named identity. It demonstrates:

- more than one entry under `identities`
- a matching `defaultIdentity`
- per-identity `keyphrase`, `transitionLabel`, and `switchMessage`
- per-identity awareness and missing-bank guidance

The identity keys should match the slugs produced from the Notion `Identity` titles.

## Episodes

The existing episode JSON structure is unchanged. `expression` fields may be present, empty, or omitted; the text-only companion runtime ignores them.

## OG Worker

This build uses:

```text
https://og-companions.aquafia1247.workers.dev
```

Routes:

- `/message-banks/{companion}`
- `/context`

The context endpoint currently supplies birthday awareness only; `events` remains an empty array for compatibility with the shared context-awareness script.

## Notion character profiles

The OG Worker exposes `GET /characters/{name}`. Each character package sets `services.profileCharacter` to the exact `Name` used in the OG character database.

The companion currently displays these Notion fields in this order:

- Core profile: Name, Gender, Pronouns, Birthdate, Summary
- Alignments: MBTI, Moral Alignment, Temperament, Zodiac Sign, Hogwarts House
- Associations: Animal, Season, Plant, Scent

Empty fields are hidden. Relations, rollups, and formulas are ignored by the Worker. Add future eligible Alignment/Association fields to the layout lists in `companion.html`; the Worker property reader is generic and does not need character-specific code.
