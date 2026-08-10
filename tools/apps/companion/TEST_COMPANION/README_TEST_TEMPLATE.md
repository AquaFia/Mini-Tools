MINIMAL TEST COMPANION / FUTURE JACEY-BASE TEMPLATE
===================================================

PURPOSE
-------
This synthetic companion is the v7.0.9 duplicate-character acceptance test.
It is intentionally not a detailed character. It exists to verify the generic
Jacey-base shell and to serve as a clean starting folder for future companions.

EXPECTED PROJECT LAYOUT
-----------------------
Place TEST_COMPANION beside your existing shared and themes folders:

Student Handbook/
  shared/
    context_awareness.js
    visual_context.js
  themes/
    halloween.css
    birthday.css
    ...
  TEST_COMPANION/
    companion.html
    character.js
    special_module.js
    audio/
    expressions/
    episodes/

The template companion.html already points to ../shared/ and ../themes/.

WHAT THIS PACKAGE TESTS
-----------------------
1. Generic HTML shell
2. Three identity profiles and identity switching
3. Character-owned colors, labels, dossier, quick replies, and keyphrases
4. Completely non-Jacey expression IDs:
     idle / active / warning / module
5. Expression manifest + portrait switching
6. Halloween and Birthday portrait-context files
7. Per-identity audio manifests using tiny generated WAV loops
8. Episode detection, branching, transition node, locked requirement,
   unlock, replay, two endings, and achievement
9. Portable memory filename
10. Context/Event startup fallback support
11. One optional special module using the generic runtime bridge
12. Missing-message-bank fallback behavior

IDENTITY KEYPHRASES
-------------------
Probe  : activate probe.
Echo   : activate echo.
Signal : activate signal.

EPISODE TEST
------------
As Probe, send:
  run template test

First run:
  - choose "Take the open route."
  - finish Ending A

Replay:
  - "Take the locked route." should now be available
  - finish Ending B
  - achievement should complete after both endings

SPECIAL MODULE TEST
-------------------
Open MODULE TEST.
Verify:
  - active identity name appears
  - Ping Runtime shows a toast
  - Test Expression changes the portrait
  - Return to Chat restores the normal chat UI
Switch identities and reopen it to verify identity refresh.

NOTION MESSAGE-BANK TEST
------------------------
The only feature that cannot be bundled locally is the real Worker-backed
Notion message-bank source.

Create THREE minimal Message Bank pages:

Companion: Template Test
Identity: Probe

Add:
  Generic
  Keywords:

  Expression | Response
  active     | Probe generic response one.
  idle       | Probe generic response two.

Also add one toggle named:
  Context/Event

with this table:

  Expression | Response                                  | Context/Event
  active     | Morning startup line from Notion.         | morning
  module     | Halloween startup line from Notion.       | halloween

Companion: Template Test
Identity: Echo

Add:
  Generic
  Keywords:

  Expression | Response
  active     | Echo generic response one.
  idle       | Echo generic response two.

Companion: Template Test
Identity: Signal

Add:
  Generic
  Keywords:

  Expression | Response
  active     | Signal generic response one.
  warning    | Signal generic response two.

After the Worker cache refreshes, reload companion.html.
This proves that a wholly new companion/identity set can be loaded without
editing the generic HTML runtime.

AWARENESS / THEMES
------------------
Time-of-day Context Awareness works without character-specific content.
The Probe Context/Event rows above let Morning replace the default startup line.

Event and Birthday visual themes still depend on the shared awareness service
and your project-level themes/ folder. The expression manifest includes
halloween and birthday portrait variants so those paths are testable whenever
the corresponding context is active.

TURNING THIS INTO A REAL COMPANION
----------------------------------
Duplicate the TEST_COMPANION folder.

Then edit only:
  character.js
  special_module.js (replace/remove its test content as desired)
  audio/
  expressions/
  episodes/
  Notion Message Bank pages

Do not customize companion.html for character personality/content. If a future
character requires a shell change, treat that as a reusable base feature first.
