(function () {
  const script = document.currentScript;
  const role = script?.dataset.pushRole || "user";
  const supported = "Notification" in window;
  const serviceWorkerSupported = "serviceWorker" in navigator;
  const buttonState = new WeakMap();

  function permission() {
    return supported ? Notification.permission : "unsupported";
  }

  function roleLabel() {
    if (role === "admin") return "Admin";
    if (role === "agent") return "Agent";
    if (role === "master") return "Owner";
    return "Buyer";
  }

  function statusText() {
    const value = permission();
    if (value === "granted") return "On";
    if (value === "denied") return "Blocked";
    if (value === "unsupported") return "Unavailable";
    return "Off";
  }

  function updateButton(button) {
    if (!button) return;
    const status = button.querySelector("[data-push-status]");
    if (status) status.textContent = statusText();
    button.classList.toggle("push-enabled", permission() === "granted");
    button.classList.toggle("push-blocked", permission() === "denied");
    button.setAttribute("aria-label", `Browser push notifications ${statusText()}`);
  }

  async function ensureServiceWorker() {
    if (!serviceWorkerSupported || location.protocol !== "https:") {
      if (location.hostname !== "localhost" && location.hostname !== "127.0.0.1") return null;
    }

    try {
      const existing = await navigator.serviceWorker.getRegistration("/");
      if (existing) return existing;
      return await navigator.serviceWorker.register("/service-worker.js", { scope: "/" });
    } catch {
      return null;
    }
  }

  async function requestPermission() {
    if (!supported) return "unsupported";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";

    const result = await Notification.requestPermission();
    await ensureServiceWorker();
    document.querySelectorAll("[data-push-permission]").forEach(updateButton);
    return result;
  }

  async function notify(title, message, options = {}) {
    if (!supported || Notification.permission !== "granted") return false;

    const body = message || options.body || "";
    const notificationOptions = {
      body,
      icon: options.icon || "/android-chrome-192x192.png",
      badge: options.badge || "/favicon-48x48.png",
      tag: options.tag || `rg-${role}-${String(title).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 48)}`,
      renotify: Boolean(options.renotify),
      data: {
        role,
        url: options.url || location.href,
        createdAt: new Date().toISOString()
      }
    };

    const registration = await ensureServiceWorker();
    if (registration?.showNotification) {
      await registration.showNotification(title, notificationOptions);
      return true;
    }

    new Notification(title, notificationOptions);
    return true;
  }

  function installButton(button, onChange) {
    if (!button) return;
    button.dataset.pushPermission = role;
    buttonState.set(button, { onChange });
    updateButton(button);
    button.addEventListener("click", async () => {
      const result = await requestPermission();
      updateButton(button);
      const callback = buttonState.get(button)?.onChange;
      if (callback) callback(result);
      if (result === "granted") {
        notify(`${roleLabel()} push enabled`, "RealityGenius will alert you when important deal activity happens.", {
          tag: `rg-${role}-push-enabled`,
          renotify: true
        });
      }
    });
  }

  window.RealtyGeniusPush = {
    installButton,
    notify,
    permission,
    requestPermission,
    statusText
  };

  ensureServiceWorker().then(() => {
    document.querySelectorAll("[data-push-permission]").forEach(updateButton);
  });
})();
