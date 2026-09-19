(() => {
  "use strict";

  let deferredPrompt = null;
  let installButton = null;

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./service-worker.js", { scope: "./" })
        .then(() => console.log("StudyQuest PWA service worker ready"))
        .catch(error => console.warn("StudyQuest PWA registration failed:", error));
    });
  }

  function showInstallButton() {
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return;

    installButton = document.createElement("button");
    installButton.type = "button";
    installButton.className = "sq-install-app";
    installButton.textContent = "📱 INSTALL STUDYQUEST";
    installButton.setAttribute("aria-label", "Install StudyQuest app");

    Object.assign(installButton.style, {
      position: "fixed",
      right: "18px",
      bottom: "18px",
      zIndex: "999999",
      border: "2px solid rgba(255,255,255,.35)",
      borderRadius: "999px",
      padding: "13px 20px",
      font: "800 14px system-ui, sans-serif",
      color: "#fff",
      background: "linear-gradient(135deg,#7c3aed,#2563eb)",
      boxShadow: "0 10px 35px rgba(0,0,0,.38)",
      cursor: "pointer"
    });

    installButton.addEventListener("click", async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") installButton.remove();
        deferredPrompt = null;
        return;
      }

      alert(
        "StudyQuest is ready as a web app. If the install popup did not appear, open your browser menu (⋮) and choose 'Install StudyQuest' or 'Add to Home screen'."
      );
    });

    document.body.appendChild(installButton);
  }

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredPrompt = event;
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    if (installButton) installButton.remove();
  });

  registerServiceWorker();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", showInstallButton, { once: true });
  } else {
    showInstallButton();
  }
})();