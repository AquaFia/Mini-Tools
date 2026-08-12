/* =========================================================
   CHARACTER TEMPLATE — MULTIPLE IDENTITIES
   Use only for a character who genuinely has multiple named identities.
   Copy this folder into characters/<character_id>/ and replace both
   example identities with their actual names and message-bank identities.
   ========================================================= */
(function(){
  "use strict";
  const definition={
    id:"template_multiple_identities",
    defaultIdentity:"identity_one",
    services:{
      awarenessCompanionId:"replace-me",
      visualContextCompanionId:"replace-me",
      messageBankCompanion:"Replace Me"
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
      identity_one:{
        name:"IDENTITY ONE",
        shortName:"Identity One",
        talent:"ROLE / TALENT",
        initials:"I1",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:"IDENTITY ONE",
        channelLine:"channel: identity_one // online",
        speakerLabel:"IDENTITY ONE // VERIFIED",
        typingLabel:"IDENTITY ONE // TYPING",
        botStamp:"IDENTITY ONE",
        placeholder:"Message Identity One…",
        dossierTitle:"DOSSIER // IDENTITY ONE",
        status:"READY",
        keyphrase:"switch to identity one",
        transitionLabel:"Loading Identity One…",
        switchMessage:"Identity One is active.",
        quickReplies:["Hello","Tell me about yourself"],
        dossier:'SUBJECT: IDENTITY ONE<br>STATUS: <span class="ok">READY</span>',
        coreBelief:"Identity One's central belief.",
        episodeAbandon:{message:"Okay. We can leave that conversation there."},
        colors:{
          bg:"#08070d",panel:"#10101a",panel2:"#151426",ink:"#f4efff",muted:"#9b95b5",
          accent:"#a970ff",secondary:"#6d4aff",danger:"#d62952",cyan:"#c39cff",line:"#38244f"
        }
      },
      identity_two:{
        name:"IDENTITY TWO",
        shortName:"Identity Two",
        talent:"ROLE / TALENT",
        initials:"I2",
        brand:"WORLD//LINK",
        brandSubtitle:"COMPANION TERMINAL",
        channelTitle:"IDENTITY TWO",
        channelLine:"channel: identity_two // online",
        speakerLabel:"IDENTITY TWO // VERIFIED",
        typingLabel:"IDENTITY TWO // TYPING",
        botStamp:"IDENTITY TWO",
        placeholder:"Message Identity Two…",
        dossierTitle:"DOSSIER // IDENTITY TWO",
        status:"READY",
        keyphrase:"switch to identity two",
        transitionLabel:"Loading Identity Two…",
        switchMessage:"Identity Two is active.",
        quickReplies:["Hello","Tell me about yourself"],
        dossier:'SUBJECT: IDENTITY TWO<br>STATUS: <span class="ok">READY</span>',
        coreBelief:"Identity Two's central belief.",
        episodeAbandon:{message:"Okay. We can leave that conversation there."},
        colors:{
          bg:"#090b10",panel:"#10151d",panel2:"#151c28",ink:"#eef7ff",muted:"#91a4ba",
          accent:"#5fa8ff",secondary:"#8e6cff",danger:"#e65d72",cyan:"#75d8ea",line:"#2e455e"
        }
      }
    },
    identityAwareness:{
      identity_one:{identity_two:"You recognize the change."},
      identity_two:{identity_one:"You recognize the change."}
    },
    missingBankGuidance:{
      identity_one:["No remote dialogue data is available for Identity One."],
      identity_two:["No remote dialogue data is available for Identity Two."]
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
