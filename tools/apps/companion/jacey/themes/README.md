# Contextual Interface Themes

The companion automatically loads `themes/<visual-context>.css`.

Examples of the naming rule:
- an event normalized to `summer-festival` loads `summer-festival.css`
- a context normalized to `special-day` loads `special-day.css`

Adding another theme does not require editing companion HTML or JavaScript.

## Authoring rules

- Use the normalized visual-context key as the CSS filename.
- Keep theme files presentation-only.
- Override existing variables/selectors instead of duplicating base layouts.
- Missing theme files are valid and are ignored.
- Multiple active themes stack in active-context order.
- A stylesheet is removed automatically when its context ends.
- The root element exposes `data-visual-contexts`.

Example:

```css
:root[data-visual-contexts~="summer-festival"] {
  /* visual overrides */
}
```

Do not place identity, music, routing, episode, or portrait-selection logic here.
