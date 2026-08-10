/* =========================================================
   COMPANION CHARACTER DEFINITION TEMPLATE

   Edit this file when creating a new companion.
   Keep character-specific names, identity text, colors, fallback
   messages, expression defaults, and service identifiers here.
   ========================================================= */

(function () {
  "use strict";

  const definition = {
    id: "primary",
    defaultIdentity: "primary",

    services: {
      awarenessCompanionId: "replace-me",
      visualContextCompanionId: "replace-me",
      messageBankCompanion: "Replace Me"
    },

    memory: {
      fileName: "replace_me_memory.json"
    },

    startup: {
      fallbackMessage:
        "Connection established.",

      fallbackExpression: "default"
    },

    expressions: {
      genericFallback: "default",
      glitch: "alert",
      episodeSelection: "thinking"
    },

    companionModeLabel: "COMPANION MODE",

    idle: {
      minMs: 45000,
      maxMs: 90000
    },

    episode: {
      selectionPrompt:
        "Which conversation should we open?",

      offerPromptTemplate:
        "I have more to say about {trigger}. Do you want to continue?"
    },

    identities: {
      primary: {
        keyphrase: "activate primary.",

        name: "PRIMARY CHARACTER",
        shortName: "Primary",
        talent: "ROLE / TALENT",
        initials: "PC",

        brand: "PRIMARY//LINK",
        brandSubtitle: "COMPANION TERMINAL",
        channelTitle: "PRIMARY CHANNEL",
        channelLine: "channel: primary // online",

        speakerLabel: "PRIMARY // VERIFIED",
        typingLabel: "PRIMARY // TYPING",
        botStamp: "PRIMARY",
        placeholder: "Message Primary…",
        dossierTitle: "DOSSIER // PRIMARY",

        status: "PRIMARY_READY",

        responseMode: "expression",
        fallbackExpression: "default",

        episodeAbandon: {
          expression: "default",
          message: "Okay. We can leave that conversation there."
        },

        switchMessage:
          "Primary identity activated.",

        quickReplies: [
          "Hello",
          "Tell me about yourself",
          "This is private.",
          "What are you thinking about?"
        ],

        dossier:
          'SUBJECT: PRIMARY CHARACTER<br>' +
          'ROLE: ROLE / TALENT<br>' +
          'ACTIVE IDENTITY: PRIMARY<br>' +
          'STATUS: <span class="ok">READY</span>',

        coreBelief:
          "Replace this with the identity's central belief.",

        transitionLabel: "PRIMARY PROFILE ACTIVE",

        colors: {
          bg: "#08070d",
          panel: "#10101a",
          panel2: "#151426",
          ink: "#f4efff",
          muted: "#9b95b5",
          accent: "#a970ff",
          secondary: "#6d4aff",
          danger: "#d62952",
          cyan: "#c39cff",
          line: "#38244f"
        }
      },

      secondary: {
        keyphrase: "activate secondary.",

        name: "SECONDARY IDENTITY",
        shortName: "Secondary",
        talent: "SECONDARY ROLE",
        initials: "SI",

        brand: "SECONDARY//LINK",
        brandSubtitle: "COMPANION TERMINAL",
        channelTitle: "SECONDARY CHANNEL",
        channelLine: "channel: secondary // online",

        speakerLabel: "SECONDARY // VERIFIED",
        typingLabel: "SECONDARY // TYPING",
        botStamp: "SECONDARY",
        placeholder: "Message Secondary…",
        dossierTitle: "DOSSIER // SECONDARY",

        status: "SECONDARY_READY",

        responseMode: "expression",
        fallbackExpression: "default",

        episodeAbandon: {
          expression: "default",
          message: "Episode closed."
        },

        switchMessage:
          "Secondary identity activated.",

        quickReplies: [
          "Hello",
          "Tell me about yourself",
          "What changed?",
          "Return to the main topic."
        ],

        dossier:
          'SUBJECT: SECONDARY IDENTITY<br>' +
          'ROLE: SECONDARY ROLE<br>' +
          'ACTIVE IDENTITY: SECONDARY<br>' +
          'STATUS: <span class="ok">READY</span>',

        coreBelief:
          "Replace this with the secondary identity's central belief.",

        transitionLabel: "SECONDARY PROFILE ACTIVE",

        colors: {
          bg: "#0a1014",
          panel: "#101a22",
          panel2: "#17232e",
          ink: "#f3fbff",
          muted: "#9bb0be",
          accent: "#64b4e8",
          secondary: "#467ba5",
          danger: "#d65f73",
          cyan: "#76d9e9",
          line: "#335469"
        }
      },

      tertiary: {
        keyphrase: "activate tertiary.",

        name: "TERTIARY IDENTITY",
        shortName: "Tertiary",
        talent: "TERTIARY ROLE",
        initials: "TI",

        brand: "TERTIARY//LINK",
        brandSubtitle: "COMPANION TERMINAL",
        channelTitle: "TERTIARY CHANNEL",
        channelLine: "channel: tertiary // online",

        speakerLabel: "TERTIARY // VERIFIED",
        typingLabel: "TERTIARY // TYPING",
        botStamp: "TERTIARY",
        placeholder: "Message Tertiary…",
        dossierTitle: "DOSSIER // TERTIARY",

        status: "TERTIARY_READY",

        responseMode: "expression",
        fallbackExpression: "default",

        episodeAbandon: {
          expression: "default",
          message: "Episode closed."
        },

        switchMessage:
          "Tertiary identity activated.",

        quickReplies: [
          "Hello",
          "Tell me about yourself",
          "What did you notice?",
          "Return to the main topic."
        ],

        dossier:
          'SUBJECT: TERTIARY IDENTITY<br>' +
          'ROLE: TERTIARY ROLE<br>' +
          'ACTIVE IDENTITY: TERTIARY<br>' +
          'STATUS: <span class="ok">READY</span>',

        coreBelief:
          "Replace this with the tertiary identity's central belief.",

        transitionLabel: "TERTIARY PROFILE ACTIVE",

        colors: {
          bg: "#0b120d",
          panel: "#122018",
          panel2: "#1a2c22",
          ink: "#f5fff7",
          muted: "#9fb6a6",
          accent: "#69c68c",
          secondary: "#478b68",
          danger: "#d76671",
          cyan: "#83dbc0",
          line: "#355946"
        }
      }
    },

    identityAwareness: {
      primary: {
        secondary:
          "The secondary identity was active before this one.",
        tertiary:
          "The tertiary identity was active before this one."
      },

      secondary: {
        primary:
          "The primary identity yielded the channel.",
        tertiary:
          "The tertiary identity yielded the channel."
      },

      tertiary: {
        primary:
          "The primary identity yielded the channel.",
        secondary:
          "The secondary identity yielded the channel."
      }
    },

    missingBankGuidance: {
      primary: [
        [
          "alert",
          "The remote dialogue archive is unavailable. Check the message-bank Worker."
        ],
        [
          "default",
          "The message bank for this companion has not loaded yet."
        ],
        [
          "thinking",
          "The dialogue archive is unavailable right now."
        ],
        [
          "default",
          "No remote dialogue data is available."
        ]
      ],

      secondary: [
        [
          "alert",
          "The remote dialogue archive is unavailable for the secondary identity."
        ],
        [
          "default",
          "The secondary message bank has not loaded yet."
        ],
        [
          "thinking",
          "The secondary dialogue archive is unavailable right now."
        ],
        [
          "default",
          "No remote dialogue data is available."
        ]
      ],

      tertiary: [
        [
          "alert",
          "The remote dialogue archive is unavailable for the tertiary identity."
        ],
        [
          "default",
          "The tertiary message bank has not loaded yet."
        ],
        [
          "thinking",
          "The tertiary dialogue archive is unavailable right now."
        ],
        [
          "default",
          "No remote dialogue data is available."
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
