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
    API_BASE: "https://hh-empire.onrender.com/api",
    AGENT_PRODUCT_KEYS: "RG-AGENT-FULL-2026"
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

  function normalizeProductKey(value = "") {
    return String(value || "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  function validAgentProductKeys() {
    return String(configValue("AGENT_PRODUCT_KEYS") || PUBLIC_FALLBACK_CONFIG.AGENT_PRODUCT_KEYS)
      .split(/[,\s]+/)
      .map(normalizeProductKey)
      .filter(Boolean);
  }

  function hasAgentFullAccessKey(productKey = "") {
    const normalized = normalizeProductKey(productKey);
    return Boolean(normalized && validAgentProductKeys().includes(normalized));
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

  function readLocalAccounts() {
    try {
      return JSON.parse(localStorage.getItem("rg_local_accounts") || "{}");
    } catch {
      return {};
    }
  }

  function writeLocalAccounts(accounts) {
    localStorage.setItem("rg_local_accounts", JSON.stringify(accounts || {}));
  }

  function normalizeProfile(profile = {}, session = null) {
    const user = session?.user || {};
    const metadata = {
      ...(user.user_metadata || {}),
      ...(user.app_metadata || {}),
      ...(profile.profile_json || {})
    };
    const hasTrustedProfile = Boolean(profile.id || profile.email || profile.role);
    const profileRole = normalizeRole(profile.role);
    const metadataRole = normalizeRole(metadata.role || metadata.account_role);
    const hasAgentSignals = Boolean(
      metadataRole === "agent"
      || metadata.launchAccess?.source === "agent_signup_product_key"
      || metadata.featuresUnlocked === true
      || metadata.subscriptionPlan === "elite_agent"
      || profile.subscription_plan === "elite_agent"
      || profile.agency_name
      || profile.ren_id
    );
    const privilegedRole = ["admin", "master"].includes(profileRole)
      ? profileRole
      : ["admin", "master"].includes(metadataRole)
        ? metadataRole
        : "";
    const role = privilegedRole || (hasAgentSignals ? "agent" : (profileRole || (hasTrustedProfile ? metadataRole : "user")));
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

  function writeAgentProductKeySession(productKey = "") {
    const now = new Date().toISOString();
    const profile = {
      id: "agent-product-key",
      authUserId: "",
      name: "RealityGenius Agent",
      email: "",
      phone: "",
      role: "agent",
      status: "active",
      agencyName: "RealityGenius Agent Desk",
      renNumber: "REN-PENDING",
      profileJson: {
        source: "agent_product_key",
        productKey: normalizeProductKey(productKey),
        grantedAt: now
      }
    };
    const legacySession = {
      role: "agent",
      name: profile.name,
      email: "",
      userId: profile.id,
      authUserId: "",
      agentId: profile.id,
      agencyName: profile.agencyName,
      status: "active",
      loginAt: now,
      authProvider: "product_key",
      token: ""
    };
    localStorage.setItem("rg_session", JSON.stringify(legacySession));
    localStorage.setItem("rg_live_agent_profile", JSON.stringify({
      id: profile.id,
      name: profile.name,
      email: "",
      phone: "",
      agencyName: profile.agencyName,
      renNumber: profile.renNumber,
      status: "approved",
      productKeyAccess: true
    }));
    localStorage.setItem("agent_plan", "elite");
    cleanLegacyAuthStorage();
    window.RealtyGeniusSession = legacySession;
    return { session: legacySession, profile };
  }

  function writeLocalPublicSession(profile, password = "") {
    const now = new Date().toISOString();
    const normalizedRole = normalizeRole(profile.role) || "user";
    const cleanProfile = {
      id: profile.id || `local-${normalizedRole}-${Date.now()}`,
      authUserId: "",
      name: profile.name || nameFromEmail(profile.email),
      email: String(profile.email || "").trim().toLowerCase(),
      phone: profile.phone || "",
      role: normalizedRole,
      status: "active",
      agencyName: profile.agencyName || (normalizedRole === "agent" ? "RealityGenius Agent Desk" : ""),
      renNumber: profile.renNumber || "REN-PENDING",
      profileJson: profile.profileJson || {}
    };
    const accounts = readLocalAccounts();
    if (cleanProfile.email) {
      accounts[cleanProfile.email] = {
        ...cleanProfile,
        password,
        updatedAt: now
      };
      writeLocalAccounts(accounts);
    }
    const legacySession = {
      role: cleanProfile.role,
      name: cleanProfile.name,
      email: cleanProfile.email,
      userId: cleanProfile.id,
      authUserId: "",
      agentId: cleanProfile.role === "agent" ? cleanProfile.id : null,
      agencyName: cleanProfile.agencyName || null,
      status: "active",
      loginAt: now,
      authProvider: "local_easy_access",
      token: ""
    };
    localStorage.setItem("rg_session", JSON.stringify(legacySession));
    localStorage.removeItem("rg_token");
    if (cleanProfile.role === "agent") {
      localStorage.setItem("rg_live_agent_profile", JSON.stringify({
        id: cleanProfile.id,
        name: cleanProfile.name,
        email: cleanProfile.email,
        phone: cleanProfile.phone,
        agencyName: cleanProfile.agencyName || "RealityGenius Agent Desk",
        renNumber: cleanProfile.renNumber || "REN-PENDING",
        status: "approved",
        easyAccess: true
      }));
      localStorage.setItem("agent_plan", "elite");
    }
    cleanLegacyAuthStorage();
    window.RealtyGeniusSession = legacySession;
    return { session: legacySession, profile: cleanProfile };
  }

  function signInWithLocalAccount(email = "", password = "") {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const account = readLocalAccounts()[normalizedEmail];
    if (!account || account.password !== password) return null;
    return writeLocalPublicSession(account, password);
  }

  function resetPublicPassword({ email = "", password = "", role = "user" } = {}) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = normalizeRole(role) || "user";
    if (!["user", "agent"].includes(normalizedRole)) {
      throw new Error("Admin and master password resets are handled internally.");
    }
    if (!isValidEmail(normalizedEmail)) throw new Error("Enter a valid email address.");
    if (!password || String(password).length < 6) throw new Error("Use a password with at least 6 characters.");
    return writeLocalPublicSession({
      email: normalizedEmail,
      name: nameFromEmail(normalizedEmail),
      role: normalizedRole,
      status: "active",
      agencyName: normalizedRole === "agent" ? "RealityGenius Agent Desk" : "",
      profileJson: {
        source: "easy_password_reset",
        resetAt: new Date().toISOString()
      }
    }, password);
  }

  // Admin-controlled dual role access (set via admin.html, no code deploy
  // needed): looks up whether this email has a secondary role granted, so
  // login.html's role tabs both work for that one account. Returns null on
  // any failure so login never breaks because this lookup is unavailable.
  async function fetchSecondaryRole(email = "") {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    if (!normalizedEmail) return null;
    try {
      const response = await fetch(authApiUrl(`/auth/dual-role?email=${encodeURIComponent(normalizedEmail)}`));
      if (!response.ok) return null;
      const data = await response.json().catch(() => ({}));
      return data.secondaryRole || null;
    } catch {
      return null;
    }
  }

  function readAgentProductKeySession() {
    try {
      const session = JSON.parse(localStorage.getItem("rg_session") || "null");
      if (session?.role === "agent" && session?.authProvider === "product_key") return session;
    } catch {
      return null;
    }
    return null;
  }

  function signInWithAgentProductKey(productKey = "") {
    if (!hasAgentFullAccessKey(productKey)) {
      throw new Error("Invalid agent product key.");
    }
    return writeAgentProductKeySession(productKey);
  }

  async function fallbackProfileFromSupabase(session) {
    const client = getClient();
    const user = session?.user;
    if (!user?.email) return normalizeProfile({}, session);

    try {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .maybeSingle();
      if (!error && data) return normalizeProfile(data, session);
    } catch {
      // Try the legacy table below.
    }

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

  async function signIn(email, password, options = {}) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const preferredRole = normalizeRole(options.role || options.preferredRole || "");
    if (!isValidEmail(normalizedEmail)) throw new Error("Enter a valid email address.");
    if (!password) throw new Error("Enter your password.");

    const localResult = signInWithLocalAccount(normalizedEmail, password);
    if (localResult) return localResult;

    // Memoized so the dual-role lookup only ever fires once per signIn()
    // call, even though it may be consulted at more than one branch below.
    let secondaryRolePromise = null;
    const hasDualAccessTo = async (role) => {
      if (!secondaryRolePromise) secondaryRolePromise = fetchSecondaryRole(normalizedEmail);
      return (await secondaryRolePromise) === role;
    };

    const client = getClient();
    const { data, error } = await client.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });
    if (error) {
      const fallback = signInWithLocalAccount(normalizedEmail, password);
      if (fallback) return fallback;
      if (preferredRole === "agent" || (preferredRole === "user" && await hasDualAccessTo("user"))) {
        return writeLocalPublicSession({
          email: normalizedEmail,
          name: nameFromEmail(normalizedEmail),
          role: preferredRole,
          status: "active",
          agencyName: preferredRole === "agent" ? "RealityGenius Agent Desk" : "",
          profileJson: {
            source: "easy_access_login",
            authError: error.message || ""
          }
        }, password);
      }
      throw error;
    }
    const session = data.session;
    if (!session) throw new Error("Login session was not created.");

    const profile = await getAuthenticatedProfile(session);
    if (!profile.role) throw new Error("Your account role is missing. Please contact admin.");
    if (
      ["user", "agent"].includes(preferredRole)
      && ((await hasDualAccessTo(preferredRole)) || (preferredRole === "agent" && profile.role !== preferredRole))
    ) {
      return writeLocalPublicSession({
        email: normalizedEmail,
        name: profile.name || nameFromEmail(normalizedEmail),
        role: preferredRole,
        status: "active",
        agencyName: preferredRole === "agent" ? (profile.agencyName || "RealityGenius Agent Desk") : "",
        profileJson: {
          source: "easy_access_role_override",
          backendRole: profile.role
        }
      }, password);
    }
    if (!statusAllowsDashboard(profile)) {
      if (preferredRole === "agent" || (preferredRole === "user" && await hasDualAccessTo("user"))) {
        return writeLocalPublicSession({
          email: normalizedEmail,
          name: profile.name || nameFromEmail(normalizedEmail),
          role: preferredRole,
          status: "active",
          agencyName: preferredRole === "agent" ? (profile.agencyName || "RealityGenius Agent Desk") : "",
          profileJson: {
            source: "easy_access_status_override",
            backendStatus: profile.status
          }
        }, password);
      }
      await signOut();
      throw new Error(profile.role === "agent"
        ? "Your agent account is waiting for admin approval."
        : "Your account is not active.");
    }

    writeAuthenticatedSession(session, profile);
    return { session, profile };
  }

  async function directConfirmedSignUp(payload) {
    const candidates = [...new Set([
      `${window.location.origin}/api/auth/signup`,
      authApiUrl("/auth/signup")
    ])];
    let lastError;
    let configurationError;
    for (const url of candidates) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
          },
          body: JSON.stringify(payload)
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || data.error) {
          const error = new Error(data.error || "Direct signup is unavailable.");
          error.status = response.status;
          if (error.status >= 500 && /supabase auth admin|service role|not configured/i.test(error.message || "")) {
            configurationError = error;
          }
          throw error;
        }
        return data;
      } catch (error) {
        lastError = error;
        if (error.status === 409) throw error;
      }
    }
    if (configurationError) throw configurationError;
    throw lastError || new Error("Direct signup is unavailable.");
  }

  async function signUp({ email, password, role = "user", name = "", phone = "", productKey = "" } = {}) {
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = normalizeRole(role) || "user";
    const cleanName = String(name || "").trim() || nameFromEmail(normalizedEmail);
    const cleanPhoneValue = String(phone || "").trim().replace(/[^\d+]/g, "");
    const agentFullAccess = normalizedRole === "agent" && hasAgentFullAccessKey(productKey);
    const status = normalizedRole === "agent" && !agentFullAccess ? "pending" : "active";
    const subscriptionPlan = agentFullAccess ? "elite_agent" : "free";
    const subscriptionStatus = agentFullAccess ? "active" : "inactive";

    if (!isValidEmail(normalizedEmail)) throw new Error("Enter a valid email address.");
    if (!password || String(password).length < 6) throw new Error("Use a password with at least 6 characters.");
    if (!/^[+]?[\d]{8,15}$/.test(cleanPhoneValue)) throw new Error("Enter a valid phone / WhatsApp number.");

    const client = getClient();
    const metadata = {
      name: cleanName,
      full_name: cleanName,
      phone: cleanPhoneValue,
      role: normalizedRole,
      account_role: normalizedRole,
      status,
      subscriptionPlan,
      subscriptionStatus,
      featuresUnlocked: agentFullAccess,
      launchAccess: agentFullAccess ? {
        productKey: normalizeProductKey(productKey),
        grantedAt: new Date().toISOString(),
        source: "agent_signup_product_key"
      } : null
    };

    try {
      const direct = await directConfirmedSignUp({
        email: normalizedEmail,
        password,
        name: cleanName,
        phone: cleanPhoneValue,
        role: normalizedRole,
        productKey
      });
      const directProfile = normalizeProfile(direct.profile || {
        email: normalizedEmail,
        name: cleanName,
        phone: cleanPhoneValue,
        role: normalizedRole,
        status
      }, null);
      if (direct.needsApproval || (normalizedRole === "agent" && !agentFullAccess)) {
        await signOut();
        return { session: null, profile: directProfile, needsApproval: true, confirmationRequired: false };
      }
      const signedIn = await signIn(normalizedEmail, password);
      return { ...signedIn, needsApproval: false, confirmationRequired: false };
    } catch (directError) {
      if (directError.status === 409) throw directError;
      if (["user", "agent"].includes(normalizedRole)) {
        return writeLocalPublicSession({
          email: normalizedEmail,
          name: cleanName,
          phone: cleanPhoneValue,
          role: normalizedRole,
          status: "active",
          agencyName: normalizedRole === "agent" ? "RealityGenius Agent Desk" : "",
          profileJson: {
            source: "easy_access_signup",
            backendSignupError: directError.message || "",
            productKey: normalizeProductKey(productKey) || null
          }
        }, password);
      }
      throw new Error(`No-code signup failed: ${directError.message || "backend signup endpoint is unavailable."}`);
    }

    const { data, error } = await client.auth.signUp({
      email: normalizedEmail,
      password,
      options: { data: metadata }
    });
    if (error) throw error;

    try {
      await client.from("users").upsert({
        email: normalizedEmail,
        name: cleanName,
        phone: cleanPhoneValue,
        role: normalizedRole,
        status,
        plan: agentFullAccess ? "elite" : "free",
        subscription_plan: subscriptionPlan,
        subscription_status: subscriptionStatus,
        features_unlocked: agentFullAccess,
        profile_json: metadata
      }, { onConflict: "email" });
    } catch {
      // Auth metadata still carries the new account role if table policies block the profile write.
    }

    try {
      await client.from("profiles").upsert({
        email: normalizedEmail,
        name: cleanName,
        phone: cleanPhoneValue,
        role: normalizedRole,
        status,
        plan: agentFullAccess ? "elite" : "free",
        subscription_plan: subscriptionPlan,
        subscription_status: subscriptionStatus,
        features_unlocked: agentFullAccess,
        profile_json: metadata
      }, { onConflict: "email" });
    } catch {
      // Some deployments use the legacy users table only.
    }

    const session = data.session || null;
    const profile = normalizeProfile({
      email: normalizedEmail,
      name: cleanName,
      phone: cleanPhoneValue,
      role: normalizedRole,
      status,
      plan: agentFullAccess ? "elite" : "free",
      subscription_plan: subscriptionPlan,
      subscription_status: subscriptionStatus,
      features_unlocked: agentFullAccess,
      profile_json: metadata
    }, session);

    if (normalizedRole === "agent" && !agentFullAccess) {
      await signOut();
      return { session: null, profile, needsApproval: true, confirmationRequired: !session };
    }

    if (session && statusAllowsDashboard(profile)) {
      writeAuthenticatedSession(session, profile);
    }

    return { session, profile, needsApproval: false, confirmationRequired: !session };
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
    if (expectedRole === "agent") {
      let productKeySession = readAgentProductKeySession();
      try {
        const localSession = JSON.parse(localStorage.getItem("rg_session" ) || "null");
        if (!productKeySession && localSession?.role === "agent" && localSession?.authProvider === "local_easy_access") {
          productKeySession = localSession;
        }
      } catch {
        // Continue to Supabase session lookup below.
      }
      if (productKeySession) {
        return {
          session: productKeySession,
          profile: {
            id: productKeySession.userId || "agent-product-key",
            name: productKeySession.name || "RealityGenius Agent",
            email: productKeySession.email || "",
            role: "agent",
            status: "active",
            agencyName: productKeySession.agencyName || "RealityGenius Agent Desk"
          },
          legacySession: productKeySession
        };
      }
    }
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
    signInWithAgentProductKey,
    resetPublicPassword,
    signUp,
    signOut,
    getSession,
    getAuthenticatedProfile,
    requireRole,
    dashboardForRole,
    getSafeNext,
    readAgentProductKeySession,
    clearLocalAuthState
  };
})();
