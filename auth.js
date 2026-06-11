(function () {
  const ROLE_DASHBOARDS = {
    user: "/user.html",
    agent: "/agent.html",
    admin: "/admin.html",
    master: "/master.html"
  };

  const ROLE_ALIASES = {
    buyer: "user",
    customer: "user",
    user: "user",
    agent: "agent",
    admin: "admin",
    master: "master"
  };

  const PUBLIC_FALLBACK_CONFIG = {
    SUPABASE_URL: "https://tjmvbgdgddscbilfkggu.supabase.co",
    SUPABASE_PUBLISHABLE_KEY: "sb_publishable_gdHnuY0_2GgMZJMNuVxC2g_g0ZB0mmJ",
    API_BASE: "https://hh-empire.onrender.com/api"
  };

  let cachedClient = null;

  function configValue(key) {
    const configured = window.REALTYGENIUS_CONFIG?.[key] || "";
    return String(configured || PUBLIC_FALLBACK_CONFIG[key] || "").trim().replace(/\/rest\/v1\/?$/i, "").replace(/\/+$/, "");
  }

  function apiBaseUrl() {
    if (window.REALTYGENIUS_API_BASE) return String(window.REALTYGENIUS_API_BASE).replace(/\/+$/, "");
    const configured = configValue("API_BASE");
    if (configured) return configured.replace(/\/+$/, "");
    if (["localhost", "127.0.0.1"].includes(window.location.hostname) && window.location.port !== "3000") {
      return "http://localhost:3000/api";
    }
    return `${window.location.origin}/api`;
  }

  function authApiUrl(path) {
    const base = apiBaseUrl();
    const normalized = path.startsWith("/") ? path : `/${path}`;
    return base.endsWith("/api") && normalized.startsWith("/api/")
      ? `${base}${normalized.slice(4)}`
      : `${base}${normalized}`;
  }

  function getClient() {
    if (cachedClient) return cachedClient;
    const url = configValue("SUPABASE_URL");
    const key = configValue("SUPABASE_PUBLISHABLE_KEY");
    if (!url || !key || !window.supabase?.createClient) {
      throw new Error("Authentication is not configured.");
    }
    cachedClient = window.supabase.createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    return cachedClient;
  }

  function normalizeRole(role) {
    return ROLE_ALIASES[String(role || "").trim().toLowerCase()] || "";
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
  }

  function nameFromEmail(email) {
    return String(email || "")
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) || "RealityGenius User";
  }

  function cleanLegacyAuthStorage() {
    [
      "kvai_role",
      "kvai_name",
      "kvai_token",
      "kvai_user_account",
      "kvai_agent_phone"
    ].forEach((key) => localStorage.removeItem(key));
  }

  function clearLocalAuthState() {
    [
      "rg_session",
      "rg_token",
      "rg_live_agent_profile"
    ].forEach((key) => localStorage.removeItem(key));
    cleanLegacyAuthStorage();
  }

  function normalizeProfile(profile = {}, session = null) {
    const user = session?.user || {};
    const metadata = {
      ...(user.user_metadata || {}),
      ...(user.app_metadata || {}),
      ...(profile.profile_json || {})
    };
    const role = normalizeRole(profile.role || metadata.role || metadata.account_role);
    const email = profile.email || user.email || "";
    const name = profile.name || metadata.name || metadata.full_name || nameFromEmail(email);
    return {
      id: profile.id || user.id || "",
      authUserId: user.id || "",
      name,
      email,
      phone: profile.phone || metadata.phone || "",
      role,
      status: String(profile.status || metadata.status || "active").toLowerCase(),
      agencyName: profile.agency_name || profile.agencyName || metadata.agency_name || "",
      renNumber: profile.ren_id || profile.renNumber || metadata.ren_id || "",
      profileJson: profile.profile_json || {}
    };
  }

  function statusAllowsDashboard(profile) {
    if (!profile?.status) return true;
    if (profile.status === "active" || profile.status === "approved") return true;
    return false;
  }

  function writeAuthenticatedSession(session, profile) {
    const legacySession = {
      role: profile.role,
      name: profile.name,
      email: profile.email,
      userId: profile.id,
      authUserId: profile.authUserId,
      agentId: profile.role === "agent" ? profile.id : null,
      agencyName: profile.agencyName || null,
      status: profile.status,
      loginAt: new Date().toISOString(),
      authProvider: "supabase",
      token: session.access_token
    };
    localStorage.setItem("rg_session", JSON.stringify(legacySession));
    localStorage.setItem("rg_token", session.access_token);
    cleanLegacyAuthStorage();

    if (profile.role === "agent") {
      localStorage.setItem("rg_live_agent_profile", JSON.stringify({
        id: profile.id,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        agencyName: profile.agencyName || "RealityGenius Agent Desk",
        renNumber: profile.renNumber || "REN-PENDING",
        status: profile.status === "active" ? "approved" : profile.status
      }));
    }

    window.RealtyGeniusSession = legacySession;
    return legacySession;
  }

  async function fallbackProfileFromSupabase(session) {
    const client = getClient();
    const user = session?.user;
    if (!user?.email) return normalizeProfile({}, session);

    try {
      const { data, error } = await client
        .from("users")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();
      if (!error && data) return normalizeProfile(data, session);
    } catch {
      return normalizeProfile({}, session);
    }
    return normalizeProfile({}, session);
  }

  async function getAuthenticatedProfile(session) {
    if (!session?.access_token) throw new Error("No active login session.");
    try {
      const response = await fetch(authApiUrl("/auth/me"), {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const payload = await response.json().catch(() => ({}));
      if (response.ok && payload.profile) {
        return normalizeProfile(payload.profile, session);
      }
    } catch {
      return fallbackProfileFromSupabase(session);
    }
    return fallbackProfileFromSupabase(session);
  }

  async function getSession() {
    const client = getClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data.session || null;
  }

  async function signIn(email, password) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!isValidEmail(normalizedEmail)) throw new Error("Enter a valid email address.");
    if (!password) throw new Error("Enter your password.");

    const client = getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (error) throw error;
    const session = data.session;
    if (!session) throw new Error("Login session was not created.");

    const profile = await getAuthenticatedProfile(session);
    if (!profile.role) throw new Error("Your account role is missing. Please contact admin.");
    if (!statusAllowsDashboard(profile)) {
      await signOut();
      throw new Error(profile.role === "agent"
        ? "Your agent account is waiting for admin approval."
        : "Your account is not active.");
    }

    writeAuthenticatedSession(session, profile);
    return { session, profile };
  }

  async function signOut() {
    try {
      await getClient().auth.signOut();
    } catch {
      // local cleanup still runs below
    }
    clearLocalAuthState();
  }

  function dashboardForRole(role) {
    return ROLE_DASHBOARDS[normalizeRole(role)] || "";
  }

  function getSafeNext(profile) {
    const params = new URLSearchParams(window.location.search || "");
    const next = params.get("next") || "";
    const expected = dashboardForRole(profile.role);
    if (!next || !expected) return expected;
    try {
      const nextUrl = new URL(next, window.location.origin);
      if (nextUrl.origin !== window.location.origin) return expected;
      return nextUrl.pathname.endsWith(expected) || nextUrl.pathname === expected
        ? `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
        : expected;
    } catch {
      return expected;
    }
  }

  async function requireRole(requiredRole) {
    const expectedRole = normalizeRole(requiredRole);
    const session = await getSession();
    if (!session) throw new Error("Login required.");

    const profile = await getAuthenticatedProfile(session);
    if (!profile.role || profile.role !== expectedRole || !statusAllowsDashboard(profile)) {
      await signOut();
      throw new Error("Access denied.");
    }

    const legacySession = writeAuthenticatedSession(session, profile);
    return { session, profile, legacySession };
  }

  window.RealityGeniusAuth = {
    isValidEmail,
    signIn,
    signOut,
    getSession,
    getAuthenticatedProfile,
    requireRole,
    dashboardForRole,
    getSafeNext,
    clearLocalAuthState
  };
})();
