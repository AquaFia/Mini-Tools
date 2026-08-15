/* =========================================================
   CHARACTER PACKAGE — MARINA ARLENSON
   ========================================================= */
(function(){
  "use strict";

  const PROFILE_NAME="Marina Arlenson";
  const COMPANION_NAME="Marina";
  const CHAT_NAME="Marina";

  const definition={
    schemaVersion:"1.0.4",
    id:"marina_arlenson",
    defaultIdentity:"marina",

    services:{
      awarenessCompanionId:"marina-arlenson",
      messageBankCompanion:COMPANION_NAME,
      profileCharacter:PROFILE_NAME
    },

    memory:{fileName:"marina_arlenson_memory.json"},

    startup:{fallbackMessage:"Connection established. Marina is online."},
    idle:{minMs:45000,maxMs:90000},

    episode:{
      selectionPrompt:"Which conversation did you mean?",
      offerPromptTemplate:"I have more to say about {trigger}. Do you want to continue?"},

    identities:{
      marina:{
        name:PROFILE_NAME,
        shortName:CHAT_NAME,
        initials:"MA",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:PROFILE_NAME.toUpperCase(),
        channelLine:"channel: marina_arlenson // online",
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
        episodeAbandon:{message:"Okay. We can leave that conversation there."},
        colors:{
          bg:"#e7747a",
          panel:"#c43636",
          panel2:"#9a1818",
          ink:"#3d0000",
          muted:"#d57676",
          accent:"#d9d068",
          secondary:"#d51a65",
          danger:"#7300ff",
          cyan:"#da6c6c",
          line:"#610000"
        }
      }
    },

    missingBankGuidance:{
      marina:[
        "The remote dialogue archive is unavailable right now.",
        `I don't have a general response bank loaded for ${CHAT_NAME} yet.`,
        "The dialogue archive didn't load, but the rest of the character profile is still available.",
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
