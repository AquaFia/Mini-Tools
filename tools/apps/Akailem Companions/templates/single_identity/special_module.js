/* =========================================================
   OPTIONAL SPECIAL MODULE — REFERENCE TEMPLATE

   Use this file only when a character has a special module.
   It sits beside character.js:

     characters/<character>/
       character.js
       special_module.js

   If special_module.js does not exist, the companion simply has
   no special-module tab.

   CONTRACT
   --------
   Define window.CompanionSpecialModule with an init(runtime)
   function. The shared companion supplies the tab/content mounts
   and handles the surrounding interface mode.

   Runtime:
     runtime.getCharacter()
       Current window.CompanionCharacter definition.

     runtime.getActiveIdentity()
       Current identity key.

     runtime.showToast(message)
       Shows a normal companion toast.

     runtime.mounts.navigation
       Mount your module's top-level tab/button here.

     runtime.mounts.content
       Mount your module's content here.

     runtime.enterSpecialMode()
       Hides the normal chat view and shows the special-module area.

     runtime.leaveSpecialMode()
       Returns to normal chat.

   COLORS
   ------
   Module UI inherits the active character's companion CSS variables.
   Use the same variables as the shared interface, for example:

     var(--bg)
     var(--panel)
     var(--panel2)
     var(--ink)
     var(--muted)
     var(--violet)  -> character accent
     var(--blue)    -> character secondary
     var(--red)     -> character danger
     var(--cyan)    -> character highlight
     var(--line)

   A character still has only ONE special_module.js file. That file
   may build as many internal views, tools, or sub-tabs as needed.
   The shared companion does not need to know what they are.
   ========================================================= */

(function () {
  "use strict";

  let runtime = null;
  let navButton = null;
  let panel = null;
  let style = null;

  function open() {
    runtime.enterSpecialMode();
    navButton.classList.add("active");
    panel.hidden = false;
  }

  function close() {
    panel.hidden = true;
    navButton.classList.remove("active");
    runtime.leaveSpecialMode();
  }

  window.CompanionSpecialModule = {
    id: "replace-with-module-id",
    name: "Replace With Module Name",

    init(nextRuntime) {
      runtime = nextRuntime;

      /*
       * Everything mounted here automatically uses the character's
       * current companion palette through the shared CSS variables.
       *
       * Keep module CSS scoped to a unique class so it cannot affect
       * the rest of companion.html.
       */
      style = document.createElement("style");
      style.dataset.companionSpecialModule = "replace-with-module-id";
      style.textContent = `
        .example-special-module {
          min-height: 100%;
          padding: 18px;
          color: var(--ink);
        }

        .example-special-module-card {
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 16px;
          background:
            linear-gradient(
              145deg,
              color-mix(in srgb, var(--panel2) 90%, var(--violet)),
              var(--panel)
            );
        }
      `;
      document.head.appendChild(style);

      /*
       * This is the ONE top-level companion tab for this character's
       * special module. If your module contains multiple tools/views,
       * create their navigation INSIDE panel instead of adding more
       * companion-level module files.
       */
      navButton = document.createElement("button");
      navButton.type = "button";
      navButton.className = "mode-tab";
      navButton.textContent = "MODULE";
      navButton.addEventListener("click", open);
      runtime.mounts.navigation.appendChild(navButton);

      /*
       * Replace this sample markup with the character's actual module.
       * It may be as simple or as complex as that character requires.
       */
      panel = document.createElement("section");
      panel.className = "example-special-module";
      panel.hidden = true;
      panel.innerHTML = `
        <div class="example-special-module-card">
          Replace this with the character's module UI.
        </div>
      `;
      runtime.mounts.content.appendChild(panel);
    },

    /*
     * The shared companion calls close() when the user returns to Chat.
     */
    close,

    /*
     * Optional hook. Remove it if the module does not care about
     * identity changes.
     */
    onIdentityChange(identityId) {
      void identityId;
    },

    /*
     * Optional cleanup hook for future lifecycle use or manual cleanup.
     */
    destroy() {
      navButton?.remove();
      panel?.remove();
      style?.remove();

      runtime = null;
      navButton = null;
      panel = null;
      style = null;
    }
  };
})();
