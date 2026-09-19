(() => {
  "use strict";

  let deferredPrompt = null;

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
        .catch(error => console.warn("StudyQuest PWA registration failed:", error));
    });
  }

  function addInstallButton() {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "sq-install-app";
    button.textContent = "📱 Install StudyQuest";
    button.setAttribute("aria-label", "Install StudyQuest app");
    button.hidden = true;

    Object.assign(button.style, {
      position: "fixed",
      right: "18px",
      bottom: "18px",
      zIndex: "99999",
      border: "0",
      borderRadius: "999px",
      padding: "12px 18px",
      font: "700 14px system-ui, sans-serif",
      color: "#fff",
      background: "linear-gradient(135deg,#7c3aed,#2563eb)",
      boxShadow: "0 10px 30px rgba(0,0,0,.28)",
      cursor: "pointer"
    });

    button.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") button.hidden = true;
      deferredPrompt = null;
    });

    document.body.appendChild(button);

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredPrompt = event;
      button.hidden = false;
    });

    window.addEventListener("appinstalled", () => {
      deferredPrompt = null;
      button.hidden = true;
    });
  }

  registerServiceWorker();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addInstallButton, { once: true });
  } else {
    addInstallButton();
  }
})();