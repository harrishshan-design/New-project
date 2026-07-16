(function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginId");
  const passwordInput = document.getElementById("loginPassword");
  const emailField = document.getElementById("loginEmailField");
  const passwordField = document.getElementById("loginPasswordField");
  const resetPasswordInput = document.getElementById("resetPassword");
  const resetPasswordField = document.getElementById("resetPasswordField");
  const forgotPasswordButton = document.getElementById("forgotPasswordButton");
  const nameInput = document.getElementById("signupName");
  const nameField = document.getElementById("signupNameField");
  const phoneInput = document.getElementById("signupPhone");
  const phoneField = document.getElementById("signupPhoneField");
  const agentProductKeyInput = document.getElementById("agentProductKey");
  const agentProductKeyField = document.getElementById("agentProductKeyField");
  const status = document.getElementById("sharedStatus");
  const button = document.getElementById("loginButton");
  const modeButtons = document.querySelectorAll("[data-auth-mode]");
  const PUBLIC_SIGNUP_ROLES = ["user", "agent"];
  const LOGIN_ROLES = ["user", "agent", "admin", "master"];
  let authMode = "login";
  let selectedRole = "user";
  let internalRolesUnlocked = false;

  function cleanPhone(value = "") {
    return String(value || "").trim().replace(/[^\d+]/g, "");
  }

  function phoneLooksValid(value = "") {
    return /^[+]?[\d]{8,15}$/.test(cleanPhone(value));
  }

  function setStatus(message, ok = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("ok", ok);
  }

  function setLoading(isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    const readyText = authMode === "reset"
      ? '<i class="fa-solid fa-key"></i>Reset & Open Dashboard'
      : authMode === "signup"
      ? '<i class="fa-solid fa-user-plus"></i>Create account'
      : '<i class="fa-solid fa-arrow-right-to-bracket"></i>Next';
    button.innerHTML = isLoading
      ? '<i class="fa-solid fa-circle-notch fa-spin"></i>Checking access'
      : readyText;
  }

  function readPreferredRoleFromQuery() {
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("role") || "").toLowerCase();
  }

  function loadScriptOnce(src, test) {
    if (test?.()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => test?.() ? resolve() : reject(new Error("Account service did not load."));
      script.onerror = () => reject(new Error("Account service could not be loaded."));
      document.head.appendChild(script);
    });
  }

  async function loadFirstAvailableScript(sources, test) {
    let lastError;
    for (const src of sources) {
      try {
        await loadScriptOnce(src, test);
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError || new Error("Required account script could not be loaded.");
  }

  async function ensureAuthRuntime() {
    if (window.RealityGeniusAuth?.isValidEmail) return window.RealityGeniusAuth;
    if (!window.supabase?.createClient) {
      await loadFirstAvailableScript([
        "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
        "https://unpkg.com/@supabase/supabase-js@2"
      ], () => window.supabase?.createClient);
    }
    await loadScriptOnce(`./auth.js?v=${Date.now()}`, () => window.RealityGeniusAuth?.isValidEmail);
    return window.RealityGeniusAuth;
  }

  function highlightRole(role) {
    const requestedRole = LOGIN_ROLES.includes(role) ? role : "user";
    selectedRole = ["admin", "master"].includes(requestedRole) && !internalRolesUnlocked ? "user" : requestedRole;
    document.querySelectorAll(".role-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.role === selectedRole);
    });
    document.querySelectorAll(".privileged-role").forEach((card) => {
      card.hidden = !internalRolesUnlocked;
    });
    renderMode();
  }

  function renderMode() {
    if ((authMode === "signup" || authMode === "reset") && !PUBLIC_SIGNUP_ROLES.includes(selectedRole)) {
      authMode = "login";
    }
    modeButtons.forEach((item) => {
      item.classList.toggle("active", item.dataset.authMode === authMode);
      if (item.dataset.authMode === "signup") {
        item.hidden = !PUBLIC_SIGNUP_ROLES.includes(selectedRole);
      }
    });
    const isAgentSignup = authMode === "signup" && selectedRole === "agent";
    const isResetMode = authMode === "reset";
    nameField?.classList.toggle("hidden", authMode !== "signup");
    phoneField?.classList.toggle("hidden", authMode !== "signup");
    agentProductKeyField?.classList.toggle("hidden", !isAgentSignup);
    emailField?.classList.remove("hidden");
    passwordField?.classList.toggle("hidden", isResetMode);
    resetPasswordField?.classList.toggle("hidden", !isResetMode);
    if (emailInput) emailInput.required = true;
    if (passwordInput) passwordInput.required = !isResetMode;
    if (resetPasswordInput) resetPasswordInput.required = isResetMode;
    if (phoneInput) phoneInput.required = authMode === "signup";
    if (agentProductKeyInput) agentProductKeyInput.required = false;
    forgotPasswordButton?.classList.toggle("hidden", isResetMode || authMode === "signup");

    const heading = document.querySelector(".auth-head p");
    if (heading) heading.textContent = authMode === "reset" ? "Reset password" : authMode === "signup" ? "Sign up" : "Login";

    const note = document.getElementById("roleNote");
    if (note) {
      if (selectedRole === "admin") {
        note.innerHTML = '<i class="fa-solid fa-shield-halved"></i><span>Admin access is internal only. Use your approved admin account.</span>';
      } else if (selectedRole === "master") {
        note.innerHTML = '<i class="fa-solid fa-crown"></i><span>Master access is owner-only. Use the approved master account.</span>';
      } else if (authMode === "reset") {
        note.innerHTML = '<i class="fa-solid fa-key"></i><span>Enter your email and a new password. Buyer and agent reset opens the selected dashboard immediately.</span>';
      } else if (authMode === "signup" && selectedRole === "agent") {
        note.innerHTML = '<i class="fa-solid fa-user-shield"></i><span>Agents enter name, phone, email, and optional launch key. Sign-up opens without email code confirmation.</span>';
      } else if (authMode === "signup") {
        note.innerHTML = '<i class="fa-solid fa-circle-check"></i><span>Buyers enter name, phone, and email, then start exploring without an email code.</span>';
      } else {
        note.innerHTML = '<i class="fa-solid fa-shield-heart"></i><span>Use one real email and password. RealityGenius detects your role automatically.</span>';
      }
    }

    const meta = document.getElementById("loginMeta");
    if (meta) {
      if (selectedRole === "admin") {
        meta.innerHTML = "<span>Admin QC</span><span>Internal access</span>";
      } else if (selectedRole === "master") {
        meta.innerHTML = "<span>Owner mode</span><span>Highest privilege</span>";
      } else {
        meta.innerHTML = authMode === "reset"
          ? "<span>Reset password</span><span>No email code</span>"
          : authMode === "signup"
          ? "<span>No email code</span><span>Auto login</span>"
          : "<span>Buyer</span><span>Agent</span>";
      }
    }

    if (passwordInput) {
      passwordInput.autocomplete = authMode === "signup" ? "new-password" : "current-password";
      passwordInput.placeholder = authMode === "signup" ? "Create password" : "Enter password";
    }
    if (resetPasswordInput) resetPasswordInput.placeholder = "Create new password";
    setLoading(false);
  }

  function setMode(mode) {
    authMode = mode === "signup" ? "signup" : mode === "reset" ? "reset" : "login";
    setStatus("");
    renderMode();
  }

  async function submitAuth(event) {
    event.preventDefault();
    const email = emailInput?.value.trim().toLowerCase() || "";
    const password = passwordInput?.value || "";
    const name = nameInput?.value.trim() || "";
    const phone = cleanPhone(phoneInput?.value || "");
    let auth;

    try {
      auth = await ensureAuthRuntime();
    } catch (error) {
      setStatus(error?.message || "Account service is still loading. Try again.");
      return;
    }

    if (!auth.isValidEmail(email)) {
      setStatus("Enter a valid email address.");
      emailInput?.focus();
      return;
    }
    if (authMode === "signup" && !name) {
      setStatus("Enter your full name.");
      nameInput?.focus();
      return;
    }
    if (authMode === "signup" && !phoneLooksValid(phone)) {
      setStatus("Enter a valid phone / WhatsApp number.");
      phoneInput?.focus();
      return;
    }
    if (authMode === "reset") {
      const newPassword = resetPasswordInput?.value || "";
      setLoading(true);
      setStatus("Resetting password...", true);
      try {
        const result = auth.resetPublicPassword({ email, password: newPassword, role: selectedRole });
        setStatus("Password reset. Opening your dashboard...", true);
        window.location.assign(auth.getSafeNext(result.profile));
      } catch (error) {
        setStatus(error?.message || "Could not reset password.");
        resetPasswordInput?.focus();
        setLoading(false);
      }
      return;
    }
    if (!password) {
      setStatus("Enter your password.");
      passwordInput?.focus();
      return;
    }

    setLoading(true);
    setStatus(authMode === "signup" ? "Creating your account..." : "Verifying your account...", true);
    try {
      if (authMode === "signup") {
        if (!PUBLIC_SIGNUP_ROLES.includes(selectedRole)) {
          throw new Error("Admin and master accounts must be created internally.");
        }
        const result = await auth.signUp({
          email,
          password,
          name,
          phone,
          role: selectedRole,
          productKey: selectedRole === "agent" ? agentProductKeyInput?.value.trim() : ""
        });
        if (result.needsApproval) {
          setMode("login");
          setStatus("Agent account created. Admin approval is needed before login.", true);
          setLoading(false);
          return;
        }
        if (result.confirmationRequired) {
          setMode("login");
          setStatus("Account created, but Supabase email confirmation is still enabled. Please disable Confirm email in Supabase Auth settings or try login if already active.", true);
          setLoading(false);
          return;
        }
        const destination = auth.getSafeNext(result.profile);
        if (result.founderPromo) {
          setStatus("Free full features unlocked! Redirecting you to add your first listing...", true);
          const separator = destination.includes("?") ? "&" : "?";
          window.location.assign(`${destination}${separator}founderPromo=1#listingCreator`);
          return;
        }
        setStatus("Account ready. Opening your dashboard...", true);
        window.location.assign(destination);
        return;
      }

      const { profile } = await auth.signIn(email, password, { role: selectedRole });
      const destination = auth.getSafeNext(profile);
      setStatus("Access approved. Opening your dashboard...", true);
      window.location.assign(destination);
    } catch (error) {
      await auth?.clearLocalAuthState?.();
      setStatus(error?.message || "Invalid email or password.");
      setLoading(false);
    }
  }

  function init() {
    if (emailInput) {
      emailInput.type = "email";
      emailInput.autocomplete = "email";
      emailInput.placeholder = "you@example.com";
    }
    const label = document.getElementById("loginIdLabel");
    if (label) label.textContent = "Email";
    const preferredRole = readPreferredRoleFromQuery();
    highlightRole(LOGIN_ROLES.includes(preferredRole) ? preferredRole : "user");
    document.querySelectorAll(".role-card").forEach((card) => {
      card.addEventListener("click", () => highlightRole(card.dataset.role));
    });
    modeButtons.forEach((item) => {
      item.addEventListener("click", () => setMode(item.dataset.authMode));
    });
    forgotPasswordButton?.addEventListener("click", () => setMode("reset"));
    document.getElementById("masterTrigger")?.addEventListener("click", () => {
      internalRolesUnlocked = true;
      document.querySelectorAll(".privileged-role").forEach((card) => {
        card.hidden = false;
      });
      setStatus("Internal admin and master login unlocked.", true);
    });
    renderMode();
    form?.addEventListener("submit", submitAuth);
  }

  init();
})();
