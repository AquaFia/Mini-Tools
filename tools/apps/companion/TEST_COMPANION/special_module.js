/* =========================================================
   MINIMAL TEST COMPANION — SPECIAL MODULE
   v7.0.9 Duplicate-Character Acceptance Template

   This module exists only to verify the one-module bridge.
   Replace this entire file for a real companion's special feature.
   ========================================================= */

(function () {
  "use strict";

  let runtime = null;
  let navButton = null;
  let panel = null;
  let identityLabel = null;
  let style = null;

  function activeIdentity() {
    return runtime?.getActiveIdentity?.() || "";
  }

  function refreshIdentity() {
    if (!identityLabel) return;
    const id = activeIdentity();
    const profile = runtime?.getCharacter?.()?.identities?.[id];
    identityLabel.textContent =
      profile ? `${profile.shortName} (${id})` : id || "unknown";
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

  function build() {
    const mounts = runtime.mounts;

    style = document.createElement("style");
    style.dataset.testSpecialModule = "true";
    style.textContent = `
      .test-module {
        padding: 18px;
        display: grid;
        gap: 14px;
      }
      .test-module-card {
        border: 1px solid var(--line);
        border-radius: 16px;
        padding: 16px;
        background: color-mix(in srgb, var(--panel2) 88%, black);
      }
      .test-module-actions {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .test-module button {
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
    navButton.textContent = "MODULE TEST";
    navButton.addEventListener("click", open);
    mounts.navigation.appendChild(navButton);

    panel = document.createElement("section");
    panel.className = "test-module";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="test-module-card">
        <strong>SPECIAL MODULE BRIDGE</strong>
        <p>This panel proves that a character-owned module can mount, open, close, read the active identity, show a toast, and request an expression without knowing the companion runtime internals.</p>
        <p>Active identity: <b data-module-identity>unknown</b></p>
        <div class="test-module-actions">
          <button type="button" data-module-ping>Ping Runtime</button>
          <button type="button" data-module-expression>Test Expression</button>
          <button type="button" data-module-close>Return to Chat</button>
        </div>
      </div>
    `;

    identityLabel = panel.querySelector("[data-module-identity]");

    panel.querySelector("[data-module-ping]").addEventListener("click", () => {
      runtime.showToast("Special module runtime bridge works.");
    });

    panel
      .querySelector("[data-module-expression]")
      .addEventListener("click", () => {
        const character = runtime.getCharacter();
        runtime.setExpression(character.expressions.episodeSelection);
        runtime.showToast("Expression request sent by special module.");
      });

    panel.querySelector("[data-module-close]").addEventListener("click", close);

    mounts.content.appendChild(panel);
    refreshIdentity();
  }

  window.CompanionSpecialModule = {
    id: "template-module-test",
    name: "Module Test",

    init(nextRuntime) {
      runtime = nextRuntime;
      build();
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
