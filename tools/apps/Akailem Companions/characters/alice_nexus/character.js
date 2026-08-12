/* =========================================================
   CHARACTER PACKAGE — ALICE NEXUS
   Source profile: Alice Nexus (Notion)
   ========================================================= */
(function(){
  "use strict";

  const PROFILE_NAME="Alice Nexus";
  const CHAT_NAME="Alice";

  const definition={
    id:"alice_nexus",
    defaultIdentity:"alice",

    services:{
      awarenessCompanionId:"alice-nexus",
      messageBankCompanion:CHAT_NAME,
      profileCharacter:PROFILE_NAME
    },

    memory:{
      fileName:"alice_nexus_memory.json"
    },

    startup:{
      fallbackMessage:`Connection established. ${PROFILE_NAME} is online.`
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
      alice:{
        name:PROFILE_NAME,
        shortName:CHAT_NAME,
        initials:"AN",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:PROFILE_NAME.toUpperCase(),
        channelLine:"channel: alice_nexus // online",
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

        coreBelief:"",
        
        episodeAbandon:{
          message:"Okay. We can leave that conversation there."
        },

        /* Temporary UI palette for the first live character test. */
        colors:{
          bg:"#080a0b",
          panel:"#101416",
          panel2:"#151b1d",
          ink:"#eef5ef",
          muted:"#93a59a",
          accent:"#a86ee8",
          secondary:"#5f9f73",
          danger:"#d55372",
          cyan:"#87caa0",
          line:"#31433a"
        }
      }
    },

    identityAwareness:{
      alice:{}
    },

    missingBankGuidance:{
      alice:[
        "The remote dialogue archive is unavailable right now.",
        "I don't have a general response bank loaded for Alice yet.",
        "The dialogue archive didn't load, but built-in episodes are still available.",
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
