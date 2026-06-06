(function () {
  const script = document.currentScript;
  const explicitRole = script?.dataset.mobileRole || "";
  const path = window.location.pathname.toLowerCase();
  const role = explicitRole
    || (path.includes("agent") ? "agent"
      : path.includes("admin") ? "admin"
        : path.includes("master") ? "master"
          : "user");

  const canUseFloatingMenu = () => window.matchMedia("(max-width: 1440px), (pointer: coarse)").matches;
  let installPrompt = null;

  function $(selector) {
    return document.querySelector(selector);
  }

  function injectStyles() {
    if ($("#rgMobileAppStyles")) return;
    const style = document.createElement("style");
    style.id = "rgMobileAppStyles";
    style.textContent = `
      :root{--rg-mobile-safe-bottom:env(safe-area-inset-bottom,0px)}
      body.rg-mobile-app{padding-bottom:0}
      body.rg-mobile-app.rg-floating-menu-visible{padding-bottom:calc(96px + var(--rg-mobile-safe-bottom))}
      .rg-install-pill{position:fixed;left:14px;right:14px;bottom:calc(92px + var(--rg-mobile-safe-bottom));z-index:95;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border:1px solid rgba(20,184,166,.24);border-radius:18px;background:rgba(8,17,31,.92);color:#fff;box-shadow:0 18px 48px rgba(0,0,0,.26);backdrop-filter:blur(16px)}
      .rg-install-pill strong{display:block;font-size:.92rem}.rg-install-pill span{display:block;margin-top:2px;color:#cbd5e1;font-size:.78rem;line-height:1.35}.rg-install-pill button{border:0;border-radius:12px;padding:10px 12px;background:#14b8a6;color:#042f2e;font-weight:900;white-space:nowrap}
      .rg-mobile-nav{position:fixed;right:16px;left:auto;bottom:calc(16px + var(--rg-mobile-safe-bottom));z-index:94;width:min(360px,calc(100vw - 24px));display:grid;grid-template-columns:repeat(3,1fr);gap:7px;padding:7px;border:1px solid rgba(148,163,184,.24);border-radius:24px;background:rgba(8,17,31,.92);box-shadow:0 20px 58px rgba(0,0,0,.32);backdrop-filter:blur(18px);opacity:0;pointer-events:none;transform:translateY(18px) scale(.98);transition:opacity .2s ease,transform .2s ease}
      body.rg-floating-menu-visible .rg-mobile-nav{opacity:1;pointer-events:auto;transform:translateY(0) scale(1)}
      .rg-mobile-nav button{min-height:56px;border:0;border-radius:17px;background:rgba(255,255,255,.08);color:#fff;font:inherit;font-size:.76rem;font-weight:900;display:grid;place-items:center;gap:4px}
      .rg-mobile-nav i{font-size:1rem;color:#14b8a6}.rg-mobile-nav button:active{transform:translateY(1px);background:rgba(20,184,166,.18)}
      body.rg-mobile-role-user .rg-mobile-nav{border-color:rgba(181,90,56,.18);background:rgba(255,250,245,.92);box-shadow:0 22px 60px rgba(74,52,39,.18),0 0 0 1px rgba(255,255,255,.5)}
      body.rg-mobile-role-user .rg-mobile-nav button{background:rgba(255,255,255,.72);color:#2f241f;box-shadow:inset 0 0 0 1px rgba(231,216,204,.7)}
      body.rg-mobile-role-user .rg-mobile-nav button:first-child{background:linear-gradient(135deg,#201714,#493126);color:#fff;box-shadow:0 12px 24px rgba(32,23,20,.18)}
      body.rg-mobile-role-user .rg-mobile-nav i{color:#b55a38}
      body.rg-mobile-role-user .rg-mobile-nav button:first-child i{color:#f6c2a9}
      body.rg-mobile-role-user .rg-install-pill{border-color:rgba(181,90,56,.2);background:rgba(255,250,245,.94);color:#1f1814;box-shadow:0 18px 48px rgba(74,52,39,.2)}
      body.rg-mobile-role-user .rg-install-pill span{color:#75675d}
      body.rg-mobile-role-user .rg-install-pill button{background:linear-gradient(135deg,#b55a38,#d6855c);color:#fff}
      @media (max-width:820px){.rg-mobile-nav{left:12px;right:12px;bottom:calc(12px + var(--rg-mobile-safe-bottom));width:auto}.mobile-quick-nav{display:none!important}}
      @media (min-width:1441px) and (pointer:fine){.rg-install-pill,.rg-mobile-nav{display:none!important}body.rg-mobile-app{padding-bottom:0}}
    `;
    document.head.appendChild(style);
  }

  function markDecorativeIcons() {
    document.querySelectorAll("i[class*='fa-']:not([aria-hidden])").forEach((icon) => {
      icon.setAttribute("aria-hidden", "true");
    });
  }

  function watchDecorativeIcons() {
    markDecorativeIcons();
    const observer = new MutationObserver(markDecorativeIcons);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function setManifestLinks() {
    if (!document.querySelector('link[rel="manifest"]')) {
      const manifest = document.createElement("link");
      manifest.rel = "manifest";
      manifest.href = "/manifest.webmanifest";
      document.head.appendChild(manifest);
    }

    if (!document.querySelector('meta[name="theme-color"]')) {
      const theme = document.createElement("meta");
      theme.name = "theme-color";
      theme.content = role === "master" ? "#050604" : "#0f766e";
      document.head.appendChild(theme);
    }

    if (!document.querySelector('meta[name="apple-mobile-web-app-capable"]')) {
      const apple = document.createElement("meta");
      apple.name = "apple-mobile-web-app-capable";
      apple.content = "yes";
      document.head.appendChild(apple);
    }
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator) || window.location.protocol === "file:") return;
    navigator.serviceWorker.register("/service-worker.js").catch(() => {});
  }

  function loadFeedbackGate() {
    if (window.RealityGeniusFeedbackGate || document.getElementById("rgFeedbackGateScript")) return;
    const feedback = document.createElement("script");
    feedback.id = "rgFeedbackGateScript";
    feedback.src = "/rg-feedback-gate.js?v=39";
    feedback.dataset.feedbackRole = role;
    feedback.defer = true;
    document.body.appendChild(feedback);
  }

  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  }

  function renderInstallPill() {
    if (!canUseFloatingMenu() || isStandalone() || $("#rgInstallPill") || !installPrompt) return;
    const pill = document.createElement("aside");
    pill.id = "rgInstallPill";
    pill.className = "rg-install-pill";
    pill.innerHTML = `
      <div>
        <strong>Install RealtyGenius</strong>
        <span>Open faster from your home screen and keep deals one tap away.</span>
      </div>
      <button type="button">Install</button>
    `;
    pill.querySelector("button").addEventListener("click", async () => {
      if (installPrompt) {
        installPrompt.prompt();
        await installPrompt.userChoice.catch(() => null);
        installPrompt = null;
        pill.remove();
      } else {
        pill.querySelector("span").textContent = "Use Add to Home Screen from your browser menu.";
      }
    });
    document.body.appendChild(pill);
  }

  function jumpToSection(section) {
    const button = document.querySelector(`[data-section="${section}"]`);
    if (button) {
      button.click();
      return;
    }

    const panel = document.querySelector(`[data-panel="${section}"]`) || document.querySelector(`.${section}-section`);
    panel?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function focusSearch() {
    const input = $("#searchInput");
    input?.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => input?.focus(), 260);
  }

  function actionsForRole() {
    if (role === "agent") {
      return [
        ["fa-bullseye", "Leads", () => jumpToSection("leads")],
        ["fa-building", "Listings", () => jumpToSection("listings")],
        ["fa-wand-magic-sparkles", "AI", () => jumpToSection("content")]
      ];
    }
    if (role === "admin") {
      return [
        ["fa-user-shield", "Agents", () => jumpToSection("agents")],
        ["fa-triangle-exclamation", "Reports", () => jumpToSection("reports")],
        ["fa-clock-rotate-left", "Audit", () => jumpToSection("audit")]
      ];
    }
    if (role === "master") {
      return [
        ["fa-money-bill-transfer", "Revenue", () => jumpToSection("money")],
        ["fa-binoculars", "Logs", () => jumpToSection("panopticon")],
        ["fa-power-off", "Control", () => jumpToSection("killswitch")]
      ];
    }
    return [
      ["fa-magnifying-glass", "Search", focusSearch],
      ["fa-heart", "Saved", () => $(".saved-section")?.scrollIntoView({ behavior: "smooth", block: "start" })],
      ["fa-bell", "Alerts", () => $("#notificationsButton")?.click()]
    ];
  }

  function renderMobileNav() {
    if (!canUseFloatingMenu() || $("#rgMobileNav")) return;
    const nav = document.createElement("nav");
    nav.id = "rgMobileNav";
    nav.className = "rg-mobile-nav";
    nav.setAttribute("aria-label", "Mobile quick actions");
    actionsForRole().forEach(([icon, label, handler]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.innerHTML = `<i class="fa-solid ${icon}" aria-hidden="true"></i><span>${label}</span>`;
      button.addEventListener("click", handler);
      nav.appendChild(button);
    });
    document.body.appendChild(nav);
    document.body.classList.add("rg-mobile-app");
    updateFloatingMenuVisibility();
  }

  function getScrollDepth() {
    const candidates = [
      window.scrollY,
      document.documentElement?.scrollTop || 0,
      document.body?.scrollTop || 0,
      $(".main")?.scrollTop || 0,
      $(".panel-grid")?.scrollTop || 0,
      $(".shell")?.scrollTop || 0
    ];
    return Math.max(...candidates);
  }

  function updateFloatingMenuVisibility() {
    const show = canUseFloatingMenu() && getScrollDepth() > 150;
    document.body.classList.toggle("rg-floating-menu-visible", show);
  }

  function bindFloatingMenuVisibility() {
    const scrollTargets = [window, $(".main"), $(".panel-grid"), $(".shell")].filter(Boolean);
    scrollTargets.forEach((target) => target.addEventListener("scroll", updateFloatingMenuVisibility, { passive: true }));
    window.addEventListener("resize", updateFloatingMenuVisibility);
    updateFloatingMenuVisibility();
  }

  function boot() {
    document.body.classList.add(`rg-mobile-role-${role}`);
    setManifestLinks();
    registerServiceWorker();
    loadFeedbackGate();
    injectStyles();
    watchDecorativeIcons();
    renderMobileNav();
    bindFloatingMenuVisibility();
    renderInstallPill();
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    installPrompt = event;
    renderInstallPill();
  });

  window.addEventListener("appinstalled", () => {
    $("#rgInstallPill")?.remove();
  });

  window.addEventListener("resize", () => {
    renderMobileNav();
    renderInstallPill();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
