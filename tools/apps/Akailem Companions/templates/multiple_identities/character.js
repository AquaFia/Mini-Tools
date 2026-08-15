/* =========================================================
   CHARACTER TEMPLATE — MULTIPLE IDENTITIES
   Use only for a character who genuinely has multiple named identities.
   PROFILE_NAME is the character's full profile name in Notion.
   COMPANION_NAME is the Notion Companion field/full first name.
   Each identity key/name must match its own Notion Identity entry.
   ========================================================= */
(function(){
  "use strict";

  const PROFILE_NAME="Template Character";
  const COMPANION_NAME="Template";

  const definition={
    schemaVersion:"1.0.4",
    id:"template_multiple_identities",
    defaultIdentity:"identity_one",

    services:{
      awarenessCompanionId:"template-multiple-identities",
      messageBankCompanion:COMPANION_NAME,
      profileCharacter:PROFILE_NAME
    },

    memory:{
      fileName:"template_multiple_identities_memory.json"
    },

    startup:{
      fallbackMessage:"Connection established."
    },

    idle:{
      minMs:45000,
      maxMs:90000
    },

    episode:{
      selectionPrompt:"Which conversation did you mean?",
      offerPromptTemplate:"I have more to say about {trigger}. Do you want to continue?"
    },

    identities:{
      identity_one:{
        name:"Identity One",
        shortName:"Identity One",
        initials:"I1",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:"IDENTITY ONE",
        channelLine:"channel: identity_one // online",
        speakerLabel:"IDENTITY ONE // VERIFIED",
        typingLabel:"IDENTITY ONE // TYPING",
        botStamp:"IDENTITY ONE",
        placeholder:"Message Identity One…",
        status:"READY",
        keyphrase:"switch to identity one",
        transitionLabel:"Loading Identity One…",
        switchMessage:"Identity One is active.",

        quickReplies:[
          "Hello",
          "How are you?",
          "Tell me something about yourself"
        ],

        coreBelief:"Identity One's central belief.",

        episodeAbandon:{
          message:"Okay. We can leave that conversation there."
        },

        colors:{
          bg:"#090a0f",
          panel:"#11141d",
          panel2:"#181d2a",
          ink:"#f1f3f8",
          muted:"#9ba3b5",
          accent:"#8c72dc",
          secondary:"#777d91",
          danger:"#8e8698",
          cyan:"#b6b9c7",
          line:"#373c4a"
        }
      },

      identity_two:{
        name:"Identity Two",
        shortName:"Identity Two",
        initials:"I2",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:"IDENTITY TWO",
        channelLine:"channel: identity_two // online",
        speakerLabel:"IDENTITY TWO // VERIFIED",
        typingLabel:"IDENTITY TWO // TYPING",
        botStamp:"IDENTITY TWO",
        placeholder:"Message Identity Two…",
        status:"READY",
        keyphrase:"switch to identity two",
        transitionLabel:"Loading Identity Two…",
        switchMessage:"Identity Two is active.",

        quickReplies:[
          "Hello",
          "How are you?",
          "Tell me something about yourself"
        ],

        coreBelief:"Identity Two's central belief.",

        episodeAbandon:{
          message:"Okay. We can leave that conversation there."
        },

        colors:{
          bg:"#090b10",
          panel:"#10151d",
          panel2:"#151c28",
          ink:"#eef7ff",
          muted:"#91a4ba",
          accent:"#5fa8ff",
          secondary:"#8e6cff",
          danger:"#986f88",
          cyan:"#75d8ea",
          line:"#2e455e"
        }
      }
    },

    identityAwareness:{
      identity_one:{identity_two:"You recognize the change."},
      identity_two:{identity_one:"You recognize the change."}
    },

    missingBankGuidance:{
      identity_one:[
        "No remote dialogue data is available for Identity One."
      ],
      identity_two:[
        "No remote dialogue data is available for Identity Two."
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
