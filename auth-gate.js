(function () {
  const script = document.currentScript;
  const requiredRole = script?.dataset.requiredRole || "";
  const internalRole = requiredRole === "admin" || requiredRole === "master";
  const configuredLoginPage = script?.dataset.loginPath || (internalRole ? "/" : "/");
  const loginPage = configuredLoginPage === "/backend" ? "/" : configuredLoginPage;
  const requireRealSession = false;

  function readSession() {
    try {
      return JSON.parse(localStorage.getItem("rg_session") || "null");
    } catch {
      return null;
    }
  }

  function redirectToLogin() {
    const currentPage = `${window.location.pathname || ""}${window.location.search || ""}${window.location.hash || ""}`;
    const query = new URLSearchParams({
      next: currentPage,
      role: requiredRole
    });
    window.location.replace(`${loginPage}?${query.toString()}`);
  }

  const session = readSession();
  
  const token = String(session?.token || "");
  const isLocalOnlySession = token.startsWith("demo-") || token.startsWith("local-");
  const params = new URLSearchParams(window.location.search || "");
  const isMasterSession = session?.role === "master";
  const isExplicitMasterInspection = isMasterSession && requiredRole && requiredRole !== "master" && params.get("as") === requiredRole;
  const hasRequiredRole = session?.role === requiredRole || isExplicitMasterInspection;

  if (isMasterSession && requiredRole && requiredRole !== "master" && !isExplicitMasterInspection) {
    window.location.replace("/backend/master.html");
    return;
  }

  if (!session || !hasRequiredRole || (requireRealSession && isLocalOnlySession)) {
    redirectToLogin();
    return;
  }

  window.RealtyGeniusSession = session;

  function injectSessionStyles() {
    if (document.getElementById("realtyGeniusAuthStyles")) return;
    const style = document.createElement("style");
    style.id = "realtyGeniusAuthStyles";
    style.textContent = `
      .rg-session-pill{
        display:inline-flex;
        align-items:center;
        gap:9px;
        min-height:42px;
        padding:9px 12px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.08);
        color:inherit;
        font-weight:800;
        white-space:nowrap;
      }
      .rg-session-pill i{color:#23c2c7}
      .rg-session-pill span{
        max-width:150px;
        overflow:hidden;
        text-overflow:ellipsis;
      }
      .rg-logout-button{
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
        min-height:42px;
        padding:9px 12px;
        border-radius:999px;
        border:1px solid rgba(255,255,255,.18);
        background:rgba(255,255,255,.08);
        color:inherit;
        font-weight:900;
        cursor:pointer;
      }
      .rg-logout-button:hover{background:rgba(255,255,255,.14)}
      @media (max-width:720px){
        .rg-session-pill span{max-width:96px}
      }
    `;
    document.head.appendChild(style);
  }

  async function clearSession() {
    if (window.RealityGeniusFeedbackGate) {
      const submitted = await window.RealityGeniusFeedbackGate.request({ reason: "logout" });
      if (!submitted) return;
    }

    // If Supabase is available globally, sign out
    if (typeof supabase !== 'undefined') {
        try { await supabase.auth.signOut(); } catch(e) {}
    }
    
    localStorage.removeItem("rg_session");
    localStorage.removeItem("kvai_role");
    localStorage.removeItem("kvai_name");
    localStorage.removeItem("rg_token");
    localStorage.removeItem("kvai_agent_phone");
    window.location.href = loginPage;
  }

  function injectSessionControls() {
    injectSessionStyles();
    const target = document.querySelector(".top-actions") || document.querySelector(".main") || document.body;
    if (!target || document.getElementById("rgLogoutButton")) return;

    const pill = document.createElement("div");
    pill.className = "rg-session-pill";

    const icon = document.createElement("i");
    icon.className = session.role === "admin"
      ? "fa-solid fa-shield-halved"
      : session.role === "agent"
        ? "fa-solid fa-user-tie"
        : "fa-solid fa-house-user";

    const text = document.createElement("span");
    text.textContent = `${session.name || "User"} (${session.role})`;

    pill.append(icon, text);

    const logout = document.createElement("button");
    logout.className = "rg-logout-button";
    logout.id = "rgLogoutButton";
    logout.type = "button";
    logout.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i><span>Logout</span>';
    logout.addEventListener("click", clearSession);

    target.append(pill, logout);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectSessionControls);
  } else {
    injectSessionControls();
  }
})();
