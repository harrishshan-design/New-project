(function () {
  const ERROR_LOG_LIMIT = 30;
  const script = document.currentScript;
  const surface = script?.dataset.rgSurface || "static";
  const sentryDsn = script?.dataset.sentryDsn || window.REALTYGENIUS_SENTRY_DSN || "";

  function normalizeError(error) {
    if (error instanceof Error) {
      return { name: error.name, message: error.message, stack: error.stack };
    }
    if (typeof error === "string") return { name: "Error", message: error };
    return { name: "UnknownError", message: error?.message || "Unknown client error", details: error };
  }

  function payloadFor(error, context) {
    return {
      error: normalizeError(error),
      context: {
        app: "RealityGenius",
        surface,
        url: window.location.href,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        ...(context || {})
      }
    };
  }

  function storeLocal(payload) {
    try {
      const current = JSON.parse(localStorage.getItem("rg_error_log") || "[]");
      current.unshift(payload);
      localStorage.setItem("rg_error_log", JSON.stringify(current.slice(0, ERROR_LOG_LIMIT)));
    } catch {}
  }

  function send(payload) {
    const body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        if (navigator.sendBeacon("/api/client-error", blob)) return;
      }

      fetch("/api/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true
      }).catch(function () {});
    } catch {}
  }

  function log(error, context) {
    const payload = payloadFor(error, context);
    console.error("[RealityGenius]", payload);
    storeLocal(payload);
    send(payload);

    if (window.Sentry?.captureException) {
      window.Sentry.captureException(error instanceof Error ? error : new Error(payload.error.message));
    }
  }

  window.RGLogError = log;

  window.addEventListener("error", function (event) {
    log(event.error || event.message, {
      feature: "window_error",
      source: event.filename,
      line: event.lineno,
      column: event.colno
    });
  });

  window.addEventListener("unhandledrejection", function (event) {
    log(event.reason || "Unhandled promise rejection", {
      feature: "unhandled_rejection"
    });
  });

  if (sentryDsn) {
    const sentryScript = document.createElement("script");
    sentryScript.src = "https://browser.sentry-cdn.com/8.55.0/bundle.min.js";
    sentryScript.crossOrigin = "anonymous";
    sentryScript.onload = function () {
      if (window.Sentry?.init) {
        window.Sentry.init({ dsn: sentryDsn, environment: "production", tracesSampleRate: 0.05 });
      }
    };
    document.head.appendChild(sentryScript);
  }
})();
