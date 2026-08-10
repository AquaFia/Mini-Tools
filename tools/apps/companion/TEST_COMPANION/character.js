/* =========================================================
   MINIMAL TEST COMPANION — CHARACTER DEFINITION
   v7.0.9 Duplicate-Character Acceptance Template

   This file is intentionally synthetic. Replace its values when
   creating a real companion; the generic companion.html should not
   need character-specific edits.
   ========================================================= */

(function () {
  "use strict";

  const definition = {
    id: "probe",
    defaultIdentity: "probe",

    services: {
      awarenessCompanionId: "template-test",
      visualContextCompanionId: "template-test",
      messageBankCompanion: "Template Test"
    },

    memory: {
      fileName: "template_test_memory.json"
    },

    startup: {
      fallbackMessage:
        "Template connection established. No character-specific startup line is active.",

      fallbackExpression: "active"
    },

    expressions: {
      genericFallback: "idle",
      glitch: "warning",
      episodeSelection: "module"
    },

    companionModeLabel: "TEST MODE",

    idle: {
      minMs: 15000,
      maxMs: 25000
    },

    episode: {
      selectionPrompt:
        "More than one test episode matched. Choose one.",

      offerPromptTemplate:
        "A test episode matched {trigger}. Open it?"
    },

    identities: {
      probe: {
        keyphrase: "activate probe.",
        name: "Probe Unit",
        shortName: "Probe",
        talent: "Template Identity",
        initials: "PU",

        brand: "PROBE//LINK",
        brandSubtitle: "BASE TEST TERMINAL",
        channelTitle: "PROBE TEST CHANNEL",
        channelLine: "channel: probe.test // template online",

        speakerLabel: "PROBE // ACTIVE",
        typingLabel: "PROBE // PROCESSING",
        botStamp: "TEST-A",
        placeholder: "Message Probe…",
        dossierTitle: "TEST DOSSIER // PROBE",

        status: "PROBE_ACTIVE",

        responseMode: "expression",
        fallbackExpression: "idle",

        episodeAbandon: {
          expression: "active",
          message: "Episode test closed."
        },

        switchMessage:
          "Probe identity activated.",

        quickReplies: [
          "Hello",
          "Run template test",
          "This is private.",
          "Did you find a contradiction?"
        ],

        dossier:
          'SUBJECT: PROBE UNIT<br>' +
          'PURPOSE: DUPLICATION TEST<br>' +
          'ACTIVE IDENTITY: PROBE<br>' +
          'STATUS: <span class="ok">READY</span>',

        coreBelief:
          "A reusable base should work without character-specific runtime edits.",

        transitionLabel: "PROBE PROFILE ACTIVE",

        colors: {
          bg: "#091018",
          panel: "#101b27",
          panel2: "#172536",
          ink: "#f5fbff",
          muted: "#9fb1c2",
          accent: "#6fb8ff",
          secondary: "#5685d8",
          danger: "#e15f77",
          cyan: "#7ce8df",
          line: "#314d68"
        }
      },

      echo: {
        keyphrase: "activate echo.",
        name: "Echo Unit",
        shortName: "Echo",
        talent: "Secondary Test Identity",
        initials: "EU",

        brand: "ECHO//LINK",
        brandSubtitle: "BASE TEST TERMINAL",
        channelTitle: "ECHO TEST CHANNEL",
        channelLine: "channel: echo.test // template online",

        speakerLabel: "ECHO // ACTIVE",
        typingLabel: "ECHO // PROCESSING",
        botStamp: "TEST-B",
        placeholder: "Message Echo…",
        dossierTitle: "TEST DOSSIER // ECHO",

        status: "ECHO_ACTIVE",

        responseMode: "expression",
        fallbackExpression: "idle",

        episodeAbandon: {
          expression: "active",
          message: "Episode test closed."
        },

        switchMessage:
          "Echo identity activated.",

        quickReplies: [
          "Hello",
          "What did Probe say?",
          "Run template test",
          "Open the module."
        ],

        dossier:
          'SUBJECT: ECHO UNIT<br>' +
          'PURPOSE: IDENTITY SWITCH TEST<br>' +
          'ACTIVE IDENTITY: ECHO<br>' +
          'STATUS: <span class="ok">READY</span>',

        coreBelief:
          "Identity switching should change presentation without changing the shell.",

        transitionLabel: "ECHO PROFILE ACTIVE",

        colors: {
          bg: "#120b18",
          panel: "#201329",
          panel2: "#2d1a39",
          ink: "#fff7ff",
          muted: "#bea8c8",
          accent: "#d487ff",
          secondary: "#9a63d1",
          danger: "#ef6f91",
          cyan: "#d5a7ff",
          line: "#684477"
        }
      },

      signal: {
        keyphrase: "activate signal.",
        name: "Signal Unit",
        shortName: "Signal",
        talent: "Tertiary Test Identity",
        initials: "SU",

        brand: "SIGNAL//LINK",
        brandSubtitle: "BASE TEST TERMINAL",
        channelTitle: "SIGNAL TEST CHANNEL",
        channelLine: "channel: signal.test // template online",

        speakerLabel: "SIGNAL // ACTIVE",
        typingLabel: "SIGNAL // PROCESSING",
        botStamp: "TEST-C",
        placeholder: "Message Signal…",
        dossierTitle: "TEST DOSSIER // SIGNAL",

        status: "SIGNAL_ACTIVE",

        responseMode: "expression",
        fallbackExpression: "idle",

        episodeAbandon: {
          expression: "active",
          message: "Episode test closed."
        },

        switchMessage:
          "Signal identity activated.",

        quickReplies: [
          "Hello",
          "What did Echo say?",
          "Run template test",
          "Check the time."
        ],

        dossier:
          'SUBJECT: SIGNAL UNIT<br>' +
          'PURPOSE: THIRD IDENTITY TEST<br>' +
          'ACTIVE IDENTITY: SIGNAL<br>' +
          'STATUS: <span class="ok">READY</span>',

        coreBelief:
          "Character data belongs in character.js, not in the generic runtime.",

        transitionLabel: "SIGNAL PROFILE ACTIVE",

        colors: {
          bg: "#08140e",
          panel: "#10231a",
          panel2: "#173326",
          ink: "#f4fff7",
          muted: "#9cb9a6",
          accent: "#69d693",
          secondary: "#3e9f72",
          danger: "#df6e75",
          cyan: "#82e8c1",
          line: "#315e49"
        }
      }
    },

    identityAwareness: {
      probe: {
        echo:
          "Echo was active before Probe.",
        signal:
          "Signal was active before Probe."
      },

      echo: {
        probe:
          "Probe yielded the channel to Echo.",
        signal:
          "Signal yielded the channel to Echo."
      },

      signal: {
        probe:
          "Probe yielded the channel to Signal.",
        echo:
          "Echo yielded the channel to Signal."
      }
    },

    missingBankGuidance: {
      probe: [
        [
          "warning",
          "Template Test message banks are unavailable. Add the minimal Notion test pages described in README_TEST_TEMPLATE.md."
        ],
        [
          "active",
          "The shell is running, but the Template Test Notion message bank has not been installed yet."
        ],
        [
          "module",
          "Message-bank fallback test reached successfully."
        ],
        [
          "idle",
          "No remote dialogue data is available for Probe."
        ]
      ],

      echo: [
        [
          "warning",
          "Template Test message banks are unavailable for Echo."
        ],
        [
          "active",
          "Echo fallback response loaded."
        ],
        [
          "module",
          "Echo message-bank fallback test reached successfully."
        ],
        [
          "idle",
          "No remote dialogue data is available for Echo."
        ]
      ],

      signal: [
        [
          "warning",
          "Template Test message banks are unavailable for Signal."
        ],
        [
          "active",
          "Signal fallback response loaded."
        ],
        [
          "module",
          "Signal message-bank fallback test reached successfully."
        ],
        [
          "idle",
          "No remote dialogue data is available for Signal."
        ]
      ]
    }
  };

  function deepFreeze(value) {
    if (!value || typeof value !== "object" || Object.isFrozen(value)) {
      return value;
    }

    Object.freeze(value);

    for (const item of Object.values(value)) {
      deepFreeze(item);
    }

    return value;
  }

  window.CompanionCharacter = deepFreeze(definition);
})();
