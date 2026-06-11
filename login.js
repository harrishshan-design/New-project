(function () {
  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("loginId");
  const passwordInput = document.getElementById("loginPassword");
  const status = document.getElementById("sharedStatus");
  const button = document.getElementById("loginButton");

  function setStatus(message, ok = false) {
    if (!status) return;
    status.textContent = message;
    status.classList.toggle("ok", ok);
  }

  function setLoading(isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.innerHTML = isLoading
      ? '<i class="fa-solid fa-circle-notch fa-spin"></i>Checking account'
      : '<i class="fa-solid fa-arrow-right-to-bracket"></i>Continue securely';
  }

  function readPreferredRoleFromQuery() {
    const params = new URLSearchParams(window.location.search || "");
    return String(params.get("role") || "").toLowerCase();
  }

  function highlightRole(role) {
    document.querySelectorAll(".role-card").forEach((card) => {
      card.classList.toggle("active", card.dataset.role === role);
    });
  }

  function initHeroScene() {
    const scene = document.getElementById("aiScene");
    const shell = document.getElementById("heroScene");
    const demoButton = document.getElementById("watchDemoButton");
    const demoRibbon = document.getElementById("demoRibbon");
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    const compactMotion = window.matchMedia?.("(max-width: 700px), (pointer: coarse)")?.matches;
    if (!scene || reduceMotion) return;

    let frame = 0;
    const updateParallax = (event) => {
      if (compactMotion) return;
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        const rect = shell.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
        const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
        scene.style.setProperty("--mx", x.toFixed(3));
        scene.style.setProperty("--my", y.toFixed(3));
      });
    };

    const resetParallax = () => {
      scene.style.setProperty("--mx", "0");
      scene.style.setProperty("--my", "0");
    };

    shell?.addEventListener("pointermove", updateParallax);
    shell?.addEventListener("pointerleave", resetParallax);
    demoButton?.addEventListener("click", () => {
      scene.classList.add("scene-demo-pulse");
      if (demoRibbon) {
        demoRibbon.innerHTML = '<i class="fa-solid fa-circle-nodes"></i>Demo: AI ranks listings, checks trust, and routes each role securely';
      }
      document.getElementById("loginId")?.focus({ preventScroll: false });
      window.setTimeout(() => scene.classList.remove("scene-demo-pulse"), 2200);
    });
  }

  function revealInternalRoleHints(role) {
    if (role !== "admin" && role !== "master") return;
    ["optionAdmin", "optionMaster"].forEach((id) => {
      const element = document.getElementById(id);
      if (!element) return;
      element.classList.remove("hidden-internal");
      element.classList.add("show");
    });
  }

  async function submitLogin(event) {
    event.preventDefault();
    const email = emailInput?.value.trim().toLowerCase() || "";
    const password = passwordInput?.value || "";

    if (!window.RealityGeniusAuth?.isValidEmail(email)) {
      setStatus("Enter a valid email address.");
      emailInput?.focus();
      return;
    }
    if (!password) {
      setStatus("Enter your password.");
      passwordInput?.focus();
      return;
    }

    setLoading(true);
    setStatus("Verifying your account...", true);
    try {
      const { profile } = await window.RealityGeniusAuth.signIn(email, password);
      const destination = window.RealityGeniusAuth.getSafeNext(profile);
      setStatus("Access approved. Opening your dashboard...", true);
      window.location.assign(destination);
    } catch (error) {
      await window.RealityGeniusAuth?.clearLocalAuthState?.();
      setStatus(error?.message || "Invalid email or password.");
      setLoading(false);
    }
  }

  function init() {
    document.getElementById("nameField")?.classList.add("hidden");
    if (emailInput) {
      emailInput.type = "email";
      emailInput.autocomplete = "email";
      emailInput.placeholder = "you@example.com";
    }
    const label = document.getElementById("loginIdLabel");
    if (label) label.textContent = "Email";
    const note = document.getElementById("roleNote");
    if (note) {
      note.innerHTML = '<i class="fa-solid fa-shield-heart"></i><span>Use one real email and password. RealityGenius detects your role automatically.</span>';
    }
    const meta = document.getElementById("loginMeta");
    if (meta) meta.innerHTML = "<span>Buyer</span><span>Agent</span><span>Admin / Master</span>";
    setLoading(false);

    const preferredRole = readPreferredRoleFromQuery();
    revealInternalRoleHints(preferredRole);
    highlightRole(["user", "agent", "admin", "master"].includes(preferredRole) ? preferredRole : "user");
    form?.addEventListener("submit", submitLogin);
    initHeroScene();
  }

  init();
})();
