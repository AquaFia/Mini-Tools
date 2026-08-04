# Jacey Expression Repository Foundation

## Files

```text
jacey_companion_framework_v6_3_5_expression_repository.html
expressions/
  expression_manifest.json
  J_Curious.webp
  J_Happy.webp
  J_Clue.webp
  J_Deadpan.webp
  J_Overshare.webp
  J_Panic.webp
  J_Anger.webp
  J_Vulnerable.webp
```

All three identities use the same manifest and the same `expressions` folder.

Prefixes:

- `J_` for Jace
- `N_` for Naoya
- `M_` for Mao

Naoya and Mao currently have empty expression lists, so their existing portrait-unavailable display remains in place.

## Adding more expressions

Add the image to `expressions/`, then add an entry under the correct identity in `expression_manifest.json`.

```json
{
  "id": "annoyed",
  "label": "ANNOYED",
  "file": "J_Annoyed.webp"
}
```

The buttons are created from the manifest. The grid supports more than eight entries and scrolls vertically when needed.

Keep the HTML and `expressions` folder beside one another when uploading to GitHub Pages.
