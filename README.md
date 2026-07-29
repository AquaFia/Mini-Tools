# Oddball Tools Library Base

A lightweight GitHub Pages homepage for standalone HTML tools.

## Folder layout

```text
/
├─ index.html
├─ tools-catalog.json
└─ tools/
   └─ apps/
      ├─ companion/
      ├─ converters/
      └─ worldbuilding/
```

You can organize `tools/` however you like. Nested subfolders work as long as the path in `tools-catalog.json` matches the file location exactly.

## Add a tool

Add an object inside the `tools` array:

```json
{
  "title": "My Tool",
  "file": "tools/apps/my-tool.html",
  "icon": "✦",
  "accent": "#a970ff",
  "description": "What the tool does.",
  "tags": ["utility", "editor"]
}
```

A nested example:

```json
{
  "title": "Grouped Tool",
  "file": "tools/groups/writing/grouped-tool.html",
  "icon": "◇",
  "accent": "#4cc9f0",
  "description": "A tool stored inside a category folder.",
  "tags": ["writing"]
}
```

The homepage order matches the order of objects in the JSON array.

Add `"hidden": true` to temporarily hide an entry without deleting it. You may also use an external `"url"` instead of `"file"`.

## GitHub Pages

1. Upload this folder's contents to a GitHub repository.
2. In the repository, open **Settings → Pages**.
3. Publish from your chosen branch and the repository root.
4. Open the generated GitHub Pages address.

The page loads `tools-catalog.json` dynamically, so use the published GitHub Pages site rather than opening `index.html` directly from disk or through GitHub's raw-file view.


## Included catalog entries

The catalog is prefilled for these four tools, but their HTML files are intentionally not included:

- `tools/apps/worldbuilding/Worldscript Compass.html`
- `tools/apps/companion/Companion Episode Studio.html`
- `tools/apps/companion/jacey_companion_debugging_panel.html`
- `tools/apps/converters/image-to-base64.html`

Place each existing HTML file at the matching path, or edit its `file` value in `tools-catalog.json` to match the filename you use. GitHub Pages paths are case-sensitive.
