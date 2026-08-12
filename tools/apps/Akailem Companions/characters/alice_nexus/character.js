/* =========================================================
   CHARACTER PACKAGE — ALICE NEXUS
   Source profile: Alice Nexus (Notion)
   ========================================================= */
(function(){
  "use strict";

  const definition={
    id:"alice_nexus",
    defaultIdentity:"alice",

    services:{
      awarenessCompanionId:"alice-nexus",
      visualContextCompanionId:"alice-nexus",
      messageBankCompanion:"Alice"
    },

    memory:{
      fileName:"alice_nexus_memory.json"
    },

    startup:{
      fallbackMessage:"Connection established. Alice Nexus is online."
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
                name:"ALICE NEXUS",
        shortName:"Alice",
        talent:"ISTJ-A // LOGISTICIAN",
        initials:"AN",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:"ALICE NEXUS",
        channelLine:"channel: alice_nexus // online",
        speakerLabel:"ALICE // VERIFIED",
        typingLabel:"ALICE // TYPING",
        botStamp:"ALICE",
        placeholder:"Message Alice…",
        dossierTitle:"DOSSIER // ALICE NEXUS",
        status:"READY",
        
        quickReplies:[
          "Hello",
          "Tell me about Adair",
          "Tell me about Tyler",
          "How are you?"
        ],

        dossier:[
          'SUBJECT: ALICE NEXUS',
          'ALIAS: ALI <span class="muted">// friends & family</span>',
          'PRONOUNS: SHE/HER',
          'GENDER: FEMININE',
          'BIRTHDATE: 1987-06-20',
          'HANDEDNESS: RIGHT',
          'MBTI: ISTJ-A <span class="muted">// Logistician</span>',
          'ANIMAL: FOX',
          'HOGWARTS HOUSE: SLYTHERIN',
          '',
          'HISTORY: <span class="warning">PROFILE INCOMPLETE</span>'
        ].join('<br>'),

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
