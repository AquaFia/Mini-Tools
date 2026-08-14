/* =========================================================
   CHARACTER PACKAGE — DAHLBERG ATWOOD
   Source profile: Dahlberg Atwood (Notion)
   ========================================================= */
(function(){
  "use strict";

  const PROFILE_NAME="Dahlberg Atwood";
  const COMPANION_NAME="Dahlberg";
  const CHAT_NAME="Dale";

  const definition={
    id:"dahlberg_atwood",
    defaultIdentity:"dale",

    services:{
      awarenessCompanionId:"dahlberg-atwood",
      messageBankCompanion:COMPANION_NAME,
      profileCharacter:PROFILE_NAME
    },

    memory:{
      fileName:"dahlberg_atwood_memory.json"
    },

    startup:{
      fallbackMessage:`Connection established. ${CHAT_NAME} is online.`
    },

    companionModeLabel:"COMPANION MODE",

    idle:{
      minMs:45000,
      maxMs:90000
    },

    episode:{
      selectionPrompt:"Which conversation did you mean?",
      offerPromptTemplate:"I have more to say about {trigger}. Do you want to continue?"
    },

    identities:{
      dale:{
        name:PROFILE_NAME,
        shortName:CHAT_NAME,
        initials:"DA",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:PROFILE_NAME.toUpperCase(),
        channelLine:"channel: dahlberg_atwood // online",
        speakerLabel:`${CHAT_NAME.toUpperCase()} // VERIFIED`,
        typingLabel:`${CHAT_NAME.toUpperCase()} // TYPING`,
        botStamp:CHAT_NAME.toUpperCase(),
        placeholder:`Message ${CHAT_NAME}…`,
        status:"READY",

        quickReplies:[
          "Hello",
          "How are you?",
          "What have you been up to?",
          "Tell me something about yourself"
        ],

        episodeAbandon:{
          message:"Okay. We can leave that conversation there."
        },

        colors:{
          bg:"#071023",
          panel:"#0b1833",
          panel2:"#10234a",
          ink:"#f2f6ff",
          muted:"#9caed0",
          accent:"#245edb",
          secondary:"#3f79ee",
          danger:"#7088bd",
          cyan:"#75a7ff",
          line:"#2c4f98"
        }
      }
    },

    missingBankGuidance:{
      dale:[
        "The remote dialogue archive is unavailable right now.",
        "I don't have a general response bank loaded for Dale yet.",
        "The dialogue archive didn't load, but the rest of Dale's profile is still available.",
        "No remote dialogue data is available for this response."
      ]
    }
  };

  function deepFreeze(value){
    if(!value||typeof value!=="object"||Object.isFrozen(value))return value;
    Object.freeze(value);
    for(const item of Object.values(value))deepFreeze(item);
    return value;
  }

  window.CompanionCharacter=deepFreeze(definition);
})();
