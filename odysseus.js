(function () {
  const APP_ID = "odysseus.pinokio.git";
  const PINOKIO_ORIGINS = [
    "http://127.0.0.1:42000",
    "http://localhost:42000"
  ];
  const POLL_INTERVAL_MS = 5000;
  const REQUEST_TIMEOUT_MS = 3500;

  const elements = {
    refresh: document.getElementById("refreshOdysseusButton"),
    openWorkspace: document.getElementById("openWorkspaceButton"),
    openPinokio: document.getElementById("openPinokioButton"),
    statusDot: document.getElementById("odysseusStatusDot"),
    statusLabel: document.getElementById("odysseusStatusLabel"),
    statusMessage: document.getElementById("odysseusStatusMessage"),
    installState: document.getElementById("odysseusInstallState"),
    processState: document.getElementById("odysseusProcessState"),
    readyState: document.getElementById("odysseusReadyState"),
    toast: document.getElementById("toast"),
    tools: Array.from(document.querySelectorAll("[data-odysseus-path]"))
  };

  let activeOrigin = PINOKIO_ORIGINS[0];
  let readyUrl = "";
  let pollTimer = null;
  let checking = false;

  function showToast(message) {
    if (!elements.toast) return;
    elements.toast.textContent = message;
    elements.toast.classList.add("is-visible");
    window.setTimeout(() => elements.toast.classList.remove("is-visible"), 2800);
  }

  function setToolAvailability(enabled) {
    elements.tools.forEach((tool) => {
      tool.disabled = !enabled;
      tool.setAttribute("aria-disabled", String(!enabled));
    });
    elements.openWorkspace.disabled = !enabled;
  }

  function setStatus({ state, label, message, install, process, web }) {
    elements.statusDot.dataset.state = state;
    elements.statusLabel.textContent = label;
    elements.statusMessage.textContent = message;
    elements.installState.textContent = install;
    elements.processState.textContent = process;
    elements.readyState.textContent = web;
  }

  function pinokioAppUrl() {
    return `${activeOrigin}/api/${encodeURIComponent(APP_ID)}`;
  }

  function normalizeReadyUrl(value) {
    try {
      const parsed = new URL(String(value || ""));
      if (!["http:", "https:"].includes(parsed.protocol)) return "";
      if (!["127.0.0.1", "localhost", "::1"].includes(parsed.hostname)) return "";
      return parsed.href.replace(/\/+$/, "");
    } catch {
      return "";
    }
  }

  async function fetchStatus(origin) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${origin}/apps/status/${encodeURIComponent(APP_ID)}`, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        credentials: "omit",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`Pinokio returned ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timeout);
    }
  }

  async function readLocalStatus() {
    let lastError = null;
    for (const origin of PINOKIO_ORIGINS) {
      try {
        const status = await fetchStatus(origin);
        activeOrigin = origin;
        return status;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Pinokio was not found.");
  }

  function renderStatus(status) {
    readyUrl = normalizeReadyUrl(status?.ready_url);
    const installed = Boolean(status?.path);
    const runningScripts = Array.isArray(status?.running_scripts) ? status.running_scripts : [];
    const isRunning = Boolean(status?.running || runningScripts.length);
    const state = String(status?.state || "").toLowerCase();

    if (readyUrl) {
      setStatus({
        state: "ready",
        label: "Odysseus is ready",
        message: "The private workspace is running on this device. RealityGenius can open it without exposing it to the public internet.",
        install: "Installed",
        process: "Running",
        web: "Ready"
      });
      setToolAvailability(true);
      return;
    }

    setToolAvailability(false);
    if (isRunning || ["starting", "installing"].includes(state)) {
      setStatus({
        state: "starting",
        label: state === "installing" ? "Installation in progress" : "Odysseus is starting",
        message: "Keep Pinokio open. This console will enable the workspace tools as soon as the local Web UI is ready.",
        install: installed ? "Installed" : "Installing",
        process: "Starting",
        web: "Waiting"
      });
      return;
    }

    setStatus({
      state: "offline",
      label: "Odysseus is installed but stopped",
      message: "Open the Pinokio control page, select Start, then return here. Status refreshes automatically.",
      install: installed ? "Installed" : "Not found",
      process: "Stopped",
      web: "Offline"
    });
  }

  function renderUnavailable() {
    readyUrl = "";
    setToolAvailability(false);
    setStatus({
      state: "offline",
      label: "Local Pinokio was not detected",
      message: "This private workspace is available only on an owner device with Pinokio and the Odysseus launcher installed. Open Pinokio Control to install or start it.",
      install: "Not detected",
      process: "Unavailable",
      web: "Offline"
    });
  }

  async function refreshStatus({ announce = false } = {}) {
    if (checking) return;
    checking = true;
    elements.refresh?.classList.add("is-loading");
    try {
      const status = await readLocalStatus();
      renderStatus(status);
      if (announce) showToast("Local Odysseus status refreshed.");
    } catch {
      renderUnavailable();
      if (announce) showToast("Pinokio is not reachable on this device.");
    } finally {
      checking = false;
      elements.refresh?.classList.remove("is-loading");
    }
  }

  function openLocalUrl(url) {
    const popup = window.open(url, "_blank", "noopener,noreferrer");
    if (!popup) window.location.href = url;
  }

  elements.refresh?.addEventListener("click", () => refreshStatus({ announce: true }));
  elements.openPinokio?.addEventListener("click", () => openLocalUrl(pinokioAppUrl()));
  elements.openWorkspace?.addEventListener("click", () => {
    if (readyUrl) openLocalUrl(readyUrl);
  });

  elements.tools.forEach((tool) => {
    tool.addEventListener("click", () => {
      if (!readyUrl) return;
      const path = String(tool.dataset.odysseusPath || "/");
      openLocalUrl(new URL(path, `${readyUrl}/`).href);
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshStatus();
  });

  refreshStatus();
  pollTimer = window.setInterval(() => {
    if (document.visibilityState === "visible") refreshStatus();
  }, POLL_INTERVAL_MS);

  window.addEventListener("pagehide", () => {
    if (pollTimer) window.clearInterval(pollTimer);
  }, { once: true });
})();
