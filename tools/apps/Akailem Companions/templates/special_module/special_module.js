/* =========================================================
   OPTIONAL SPECIAL MODULE TEMPLATE

   The generic companion shell supports one special module.
   Copy this file into a character's `special_modules/` folder only when
   that character genuinely needs a special module, then replace the example UI.
   ========================================================= */

(function () {
  "use strict";

  let runtime = null;
  let navButton = null;
  let panel = null;
  let identityLabel = null;
  let style = null;

  function refreshIdentity() {
    if (!identityLabel || !runtime) return;

    const identityId = runtime.getActiveIdentity();
    const profile = runtime.getCharacter().identities?.[identityId];

    identityLabel.textContent =
      profile?.shortName || identityId || "Unknown";
  }

  function open() {
    runtime?.enterSpecialMode?.();
    navButton?.classList.add("active");
    panel?.removeAttribute("hidden");
    refreshIdentity();
  }

  function close() {
    panel?.setAttribute("hidden", "");
    navButton?.classList.remove("active");
    runtime?.leaveSpecialMode?.();
  }

  window.CompanionSpecialModule = {
    id: "placeholder-module",
    name: "Module",

    init(nextRuntime) {
      runtime = nextRuntime;

      style = document.createElement("style");
      style.dataset.companionSpecialModule = "placeholder";
      style.textContent = `
        .template-module {
          padding: 18px;
          display: grid;
          gap: 14px;
        }
        .template-module-card {
          border: 1px solid var(--line);
          border-radius: 16px;
          padding: 16px;
          background: color-mix(in srgb, var(--panel2) 88%, black);
        }
        .template-module-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .template-module button {
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 9px 13px;
          cursor: pointer;
          color: var(--ink);
          background: var(--panel);
        }
      `;
      document.head.appendChild(style);

      navButton = document.createElement("button");
      navButton.type = "button";
      navButton.className = "mode-tab";
      navButton.textContent = "MODULE";
      navButton.addEventListener("click", open);
      runtime.mounts.navigation.appendChild(navButton);

      panel = document.createElement("section");
      panel.className = "template-module";
      panel.hidden = true;
      panel.innerHTML = `
        <div class="template-module-card">
          <strong>SPECIAL MODULE PLACEHOLDER</strong>
          <p>Replace special_module.js with this companion's real secondary feature.</p>
          <p>Active identity: <b data-module-identity>Unknown</b></p>
          <div class="template-module-actions">
            <button type="button" data-module-test>Test Runtime</button>
            <button type="button" data-module-close>Return to Chat</button>
          </div>
        </div>
      `;

      identityLabel = panel.querySelector("[data-module-identity]");

      panel
        .querySelector("[data-module-test]")
        .addEventListener("click", () => {
          runtime.showToast("Special module bridge is working.");
        });

      panel
        .querySelector("[data-module-close]")
        .addEventListener("click", close);

      runtime.mounts.content.appendChild(panel);
      refreshIdentity();
    },

    open,
    close,

    onIdentityChange() {
      refreshIdentity();
    },

    destroy() {
      navButton?.remove();
      panel?.remove();
      style?.remove();

      runtime = null;
      navButton = null;
      panel = null;
      identityLabel = null;
      style = null;
    }
  };
})();
