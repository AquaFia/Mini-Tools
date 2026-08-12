/* =========================================================
   CHARACTER PACKAGE — TEMPLATE CHARACTER
   Copy this folder when adding a new character.
   ========================================================= */
(function(){
  "use strict";
  const definition={
    id:"template_character",
    defaultIdentity:"primary",
    services:{
      awarenessCompanionId:"replace-me",
      visualContextCompanionId:"replace-me",
      messageBankCompanion:"Replace Me"
    },
    memory:{fileName:"template_character_memory.json"},
    startup:{fallbackMessage:"Connection established."},
    companionModeLabel:"COMPANION MODE",
    idle:{minMs:45000,maxMs:90000},
    episode:{
      selectionPrompt:"Which conversation should we open?",
      offerPromptTemplate:"I have more to say about {trigger}. Do you want to continue?"
    },
    identities:{
      primary:{
        keyphrase:"activate primary.",
        name:"TEMPLATE CHARACTER",
        shortName:"Template",
        talent:"ROLE / TALENT",
        initials:"TC",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:"TEMPLATE CHANNEL",
        channelLine:"channel: template // online",
        speakerLabel:"TEMPLATE // VERIFIED",
        typingLabel:"TEMPLATE // TYPING",
        botStamp:"TEMPLATE",
        placeholder:"Message Template…",
        dossierTitle:"DOSSIER // TEMPLATE",
        status:"READY",
        switchMessage:"Primary profile activated.",
        quickReplies:["Hello","Tell me about yourself","This is private.","What are you thinking about?"],
        dossier:'SUBJECT: TEMPLATE CHARACTER<br>ROLE: ROLE / TALENT<br>STATUS: <span class="ok">READY</span>',
        coreBelief:"Replace this with the character's central belief.",
        transitionLabel:"PRIMARY PROFILE ACTIVE",
        episodeAbandon:{message:"Okay. We can leave that conversation there."},
        colors:{
          bg:"#08070d",panel:"#10101a",panel2:"#151426",ink:"#f4efff",muted:"#9b95b5",
          accent:"#a970ff",secondary:"#6d4aff",danger:"#d62952",cyan:"#c39cff",line:"#38244f"
        }
      }
    },
    identityAwareness:{primary:{}},
    missingBankGuidance:{
      primary:[
        "The remote dialogue archive is unavailable. Check the message-bank Worker.",
        "The message bank for this character has not loaded yet.",
        "The dialogue archive is unavailable right now.",
        "No remote dialogue data is available."
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
