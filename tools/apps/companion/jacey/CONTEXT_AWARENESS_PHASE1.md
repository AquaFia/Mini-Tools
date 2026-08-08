# Context Awareness — Phase 1

Files added/updated:
- `jacey_companion_framework_v6_3_28_context_awareness.html`
- `shared/context_awareness.js`

Current capabilities:
- Browser-local date, weekday, month, year, hour, timezone, season, and time-of-day.
- Accepts supplied birthday and event data through `CompanionContext.setEvents(...)`.
- Detects birthdays and active one-off/recurring event ranges.
- Exposes `visualContexts` for later portrait/theme integration.
- Emits `companioncontextchange` whenever meaningful context changes.
- Does not connect to Notion yet.
- Does not directly modify message banks, portraits, themes, music, identity, episodes, or other runtime systems.

Public API:
- `CompanionContext.initialize(config)`
- `CompanionContext.get()`
- `CompanionContext.setEvents({birthdays, events})`
- `CompanionContext.clearEvents()`
- `CompanionContext.refresh()`
- `CompanionContext.subscribe(listener)`
