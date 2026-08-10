# Companion Template

This folder is the reusable starting point for companions that use the Jacey-base runtime.

## Files you normally edit

### `character.js`
Edit:
- companion/service identifiers
- memory filename
- startup fallback
- identity names and keyphrases
- UI labels
- dossier text
- quick replies
- identity-awareness lines
- colors
- expression fallback IDs
- missing-message-bank fallback lines

### `special_module.js`
Replace the placeholder module with the companion's actual special/secondary feature.
The current base supports one special module.

### `expressions/`
Replace the placeholder portraits and update `expression_manifest.json`.

The included placeholder expressions are:
- `default`
- `thinking`
- `alert`

Their image filenames are only examples. Expression IDs may be completely different for a real companion.

### `audio/`
Replace the placeholder WAV files and update `music_manifest.json`.

### `episodes/`
Delete or replace `sample_01.json`, then update `episode_list.json`.

### Notion Message Banks
Create the companion's Message Bank pages using the `messageBankCompanion` value in `character.js`.

## File you normally do NOT edit

### `companion.html`
This is the reusable generic shell.

If a new character appears to require a change inside `companion.html`, first determine whether the change is genuinely character-specific. Character content belongs in `character.js`, assets/manifests, Notion Message Banks, or `special_module.js`.

## Suggested duplication workflow

1. Duplicate this entire folder.
2. Rename the folder for the new companion.
3. Edit `character.js`.
4. Replace expression assets and manifest entries.
5. Replace audio assets and manifest entries.
6. Replace/add episodes.
7. Create Notion Message Bank pages.
8. Replace the placeholder special module if needed.
9. Test startup, identity switching, expressions, audio, episodes, awareness/themes, persistence, and the special module.
10. Leave `companion.html` unchanged unless the reusable base itself needs a feature.

## Project-level folders

The Student Handbook project keeps shared systems and visual themes outside individual companion folders:

- `shared/`
- `themes/`

Keep your existing project path arrangement consistent with the working companion base.
