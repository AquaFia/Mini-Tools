/* =========================================================
   CHARACTER TEMPLATE — SINGLE IDENTITY
   Copy this folder into characters/<character_id>/ and rename
   the identity key to the character's own name/lookup key.
   ========================================================= */
(function(){
  "use strict";
  const definition={
    id:"template_single",
    defaultIdentity:"template",
    services:{
      awarenessCompanionId:"replace-me",
      messageBankCompanion:"Replace Me",
      profileCharacter:"Replace Me"
    },
    memory:{fileName:"replace_me_memory.json"},
    startup:{fallbackMessage:"Connection established."},
    companionModeLabel:"COMPANION MODE",
    idle:{minMs:45000,maxMs:90000},
    episode:{
      selectionPrompt:"Which conversation should we open?",
      offerPromptTemplate:"I have more to say about {trigger}. Do you want to continue?"
    },
    identities:{
      template:{
        name:"TEMPLATE CHARACTER",
        shortName:"Template",
        initials:"TC",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:"TEMPLATE CHARACTER",
        channelLine:"channel: template // online",
        speakerLabel:"TEMPLATE // VERIFIED",
        typingLabel:"TEMPLATE // TYPING",
        botStamp:"TEMPLATE",
        placeholder:"Message Template…",
        status:"READY",
        quickReplies:["Hello","Tell me about yourself","How are you?"],
        episodeAbandon:{message:"Okay. We can leave that conversation there."},
        colors:{
          bg:"#08070d",panel:"#10101a",panel2:"#151426",ink:"#f4efff",muted:"#9b95b5",
          accent:"#a970ff",secondary:"#6d4aff",danger:"#d62952",cyan:"#c39cff",line:"#38244f"
        }
      }
    },
    missingBankGuidance:{
      template:[
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
