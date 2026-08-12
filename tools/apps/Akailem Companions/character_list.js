/* =========================================================
   WORLD COMPANION CHARACTER DIRECTORY
   Add one small entry here for every character package.
   The full character definition stays inside that character's folder.
   ========================================================= */
(function(){
  "use strict";
  const directory=[
    {
      id:"alice_nexus",
      name:"Alice Nexus",
      subtitle:"",
      group:"",
      initials:"AN",
      path:"characters/alice_nexus",
      specialModule:false
    }
  ];

  const params=new URLSearchParams(location.search);
  const requested=params.get("character")||localStorage.getItem("companion.activeCharacter");
  const selected=directory.find(item=>item.id===requested)||directory[0];
  if(!selected)throw new Error("character_list.js contains no characters.");

  window.CompanionCharacterDirectory=Object.freeze(directory.map(item=>Object.freeze({...item})));
  window.CompanionCharacterRoute=Object.freeze({id:selected.id,basePath:selected.path});
  localStorage.setItem("companion.activeCharacter",selected.id);

  document.write('<script src="'+selected.path+'/character.js"><\/script>');
  if(selected.specialModule){
    document.write('<script src="'+selected.path+'/special_modules/special_module.js"><\/script>');
  }
})();
