(function () {
  const script = document.currentScript;
  const requiredRole = String(script?.dataset.requiredRole || "").trim().toLowerCase();
  const loginPage = script?.dataset.loginPath || "/login.html";

  document.documentElement.classList.add("rg-auth-checking");

  function injectAuthStyles() {
    if (document.getElementById("realtyGeniusAuthStyles")) return;
    const style = document.createElement("style");
    style.id = "realtyGeniusAuthStyles";
    style.textContent = `
      .rg-auth-checking body{visibility:hidden}
      .rg-session-pill{
        display:inline-flex;align-items:center;gap:9px;min-height:42px;
        padding:9px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.08);color:inherit;font-weight:800;white-space:nowrap
      }
      .rg-session-pill i{color:#23c2c7}
      .rg-session-pill span{max-width:150px;overflow:hidden;text-overflow:ellipsis}
      .rg-logout-button{
        display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:42px;
        padding:9px 12px;border-radius:999px;border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.08);color:inherit;font-weight:900;cursor:pointer
      }
      .rg-logout-button:hover{background:rgba(255,255,255,.14)}
      @media (max-width:720px){.rg-session-pill span{max-width:96px}}
    `;
    document.head.appendChild(style);
  }

  function redirectToLogin() {
    const currentPage = `${window.location.pathname || ""}${window.location.search || ""}${window.location.hash || ""}`;
    const query = new URLSearchParams({
      next: currentPage,
      role: requiredRole
    });
    window.location.replace(`${loginPage}?${query.toString()}`);
  }

  function sessionIcon(role) {
    if (role === "admin") return "fa-solid fa-shield-halved";
    if (role === "master") return "fa-solid fa-crown";
    if (role === "agent") return "fa-solid fa-user-tie";
    return "fa-solid fa-house-user";
  }

  async function clearSession() {
    if (window.RealityGeniusFeedbackGate) {
      const submitted = await window.RealityGeniusFeedbackGate.request({ reason: "logout" });
      if (!submitted) return;
    }
    await window.RealityGeniusAuth?.signOut?.();
    window.location.href = loginPage;
  }

  function injectSessionControls(session) {
    const target = document.querySelector(".top-actions") || document.querySelector(".main") || document.body;
    if (!target || document.getElementById("rgLogoutButton")) return;

    const pill = document.createElement("div");
    pill.className = "rg-session-pill";

    const icon = document.createElement("i");
    icon.className = sessionIcon(session.role);

    const text = document.createElement("span");
    text.textContent = `${session.name || "User"} (${session.role})`;

    const logout = document.createElement("button");
    logout.className = "rg-logout-button";
    logout.id = "rgLogoutButton";
    logout.type = "button";
    logout.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i><span>Logout</span>';
    logout.addEventListener("click", clearSession);

    pill.append(icon, text);
    target.append(pill, logout);
  }

  async function boot() {
    injectAuthStyles();
    try {
      if (!window.RealityGeniusAuth?.requireRole) throw new Error("Auth helper unavailable.");
      const result = await window.RealityGeniusAuth.requireRole(requiredRole);
      window.RealtyGeniusSession = result.legacySession;
      document.documentElement.classList.remove("rg-auth-checking");
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => injectSessionControls(result.legacySession));
      } else {
        injectSessionControls(result.legacySession);
      }
    } catch {
      await window.RealityGeniusAuth?.signOut?.();
      redirectToLogin();
    }
  }

  boot();
})();
