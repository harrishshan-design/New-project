(function () {
  const script = document.currentScript;
  const feedbackRole = script?.dataset.feedbackRole || document.body?.dataset.feedbackRole || inferRole();
  const visitId = getVisitId();
  const sessionKey = `rg_feedback_submitted_${visitId}`;
  const dailyPromptKey = `rg_feedback_daily_prompt_${todayKey()}`;
  const localStoreKey = "rg_exit_feedback_records";
  const exitIntentDelayMs = 12000;
  const dailyPromptDelayMs = 18000;
  const state = {
    active: false,
    resolver: null,
    pendingNavigation: null,
    reason: "leaving",
    readyAt: Date.now() + exitIntentDelayMs
  };

  function inferRole() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("master")) return "master";
    if (path.includes("admin")) return "admin";
    if (path.includes("agent")) return "agent";
    return "user";
  }

  function getVisitId() {
    const key = "rg_feedback_visit_id";
    try {
      const existing = sessionStorage.getItem(key);
      if (existing) return existing;
      const generated = globalThis.crypto?.randomUUID?.() || `visit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      sessionStorage.setItem(key, generated);
      return generated;
    } catch {
      return `visit-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    }
  }

  function todayKey() {
    try {
      return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kuala_Lumpur" });
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function readSession() {
    try {
      return window.RealtyGeniusSession || JSON.parse(localStorage.getItem("rg_session") || "null");
    } catch {
      return null;
    }
  }

  function safe(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[character]));
  }

  function hasSubmitted() {
    return sessionStorage.getItem(sessionKey) === "1";
  }

  function markSubmitted() {
    sessionStorage.setItem(sessionKey, "1");
  }

  function hasSeenDailyPrompt() {
    return localStorage.getItem(dailyPromptKey) === "1";
  }

  function markDailyPromptSeen() {
    localStorage.setItem(dailyPromptKey, "1");
  }

  function readLocalRecords() {
    try {
      return JSON.parse(localStorage.getItem(localStoreKey) || "[]");
    } catch {
      return [];
    }
  }

  function writeLocalRecord(payload) {
    const records = readLocalRecords();
    localStorage.setItem(localStoreKey, JSON.stringify([
      { ...payload, localOnly: true },
      ...records
    ].slice(0, 100)));
  }

  function injectStyles() {
    if (document.getElementById("rgFeedbackGateStyles")) return;
    const style = document.createElement("style");
    style.id = "rgFeedbackGateStyles";
    style.textContent = `
      .rg-feedback-backdrop{
        position:fixed;
        inset:0;
        z-index:9999;
        display:none;
        align-items:center;
        justify-content:center;
        padding:18px;
        background:rgba(2,6,23,.62);
        backdrop-filter:blur(18px);
      }
      .rg-feedback-backdrop.is-open{display:flex}
      .rg-feedback-card{
        width:min(100%,520px);
        border:1px solid rgba(214,179,89,.28);
        border-radius:18px;
        background:linear-gradient(180deg,rgba(255,255,255,.96),rgba(248,245,238,.98));
        box-shadow:0 30px 90px rgba(0,0,0,.36);
        color:#18201c;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        overflow:hidden;
      }
      .rg-feedback-head{padding:22px 22px 14px;border-bottom:1px solid rgba(24,32,28,.08)}
      .rg-feedback-kicker{display:flex;align-items:center;gap:8px;color:#8a6a25;font-size:.74rem;font-weight:900;letter-spacing:.1em;text-transform:uppercase}
      .rg-feedback-head h3{margin:8px 0 6px;font-size:1.35rem;letter-spacing:0;line-height:1.15}
      .rg-feedback-head p{margin:0;color:#5d6a63;line-height:1.5}
      .rg-feedback-body{display:grid;gap:14px;padding:18px 22px 22px}
      .rg-feedback-rating{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}
      .rg-feedback-rating button{
        min-height:48px;
        border:1px solid rgba(24,32,28,.14);
        border-radius:12px;
        background:#fff;
        color:#18201c;
        font-weight:900;
        cursor:pointer;
      }
      .rg-feedback-rating button.is-active{border-color:#b88a2d;background:#fff5dc;color:#7b5513;box-shadow:0 10px 24px rgba(184,138,45,.18)}
      .rg-feedback-field{display:grid;gap:7px}
      .rg-feedback-field span{font-size:.78rem;font-weight:900;color:#46534d}
      .rg-feedback-field select,
      .rg-feedback-field textarea{
        width:100%;
        border:1px solid rgba(24,32,28,.14);
        border-radius:12px;
        background:#fff;
        color:#18201c;
        outline:0;
        padding:12px 13px;
        font:inherit;
      }
      .rg-feedback-field textarea{resize:vertical;min-height:94px}
      .rg-feedback-error{min-height:18px;color:#b42318;font-size:.82rem;font-weight:800}
      .rg-feedback-actions{display:flex;gap:10px;flex-wrap:wrap}
      .rg-feedback-submit,
      .rg-feedback-stay{
        min-height:46px;
        border-radius:999px;
        padding:0 18px;
        font-weight:900;
        cursor:pointer;
      }
      .rg-feedback-submit{border:0;background:#14251f;color:#fff;box-shadow:0 14px 28px rgba(20,37,31,.22)}
      .rg-feedback-stay{border:1px solid rgba(24,32,28,.16);background:#fff;color:#18201c}
      .rg-feedback-micro{margin:0;color:#66746d;font-size:.82rem;line-height:1.45}
      .rg-feedback-float{
        position:fixed;
        right:18px;
        bottom:18px;
        z-index:96;
        display:inline-flex;
        align-items:center;
        gap:8px;
        min-height:44px;
        padding:0 14px;
        border:1px solid rgba(214,179,89,.28);
        border-radius:999px;
        background:linear-gradient(135deg,#14251f,#263b32);
        color:#fff;
        box-shadow:0 16px 42px rgba(0,0,0,.2);
        font:900 .86rem Inter,system-ui,sans-serif;
        cursor:pointer;
      }
      .rg-feedback-float i{color:#f7d37a}
      body.rg-mobile-app .rg-feedback-float{bottom:calc(86px + var(--rg-mobile-safe-bottom,0px))}
      .rg-feedback-space{
        width:min(1120px,calc(100% - 32px));
        margin:34px auto calc(34px + var(--rg-mobile-safe-bottom,0px));
        border:1px solid rgba(214,179,89,.24);
        border-radius:22px;
        background:
          radial-gradient(circle at 12% 0%,rgba(247,211,122,.2),transparent 28%),
          linear-gradient(135deg,rgba(255,255,255,.95),rgba(246,243,236,.96));
        box-shadow:0 20px 55px rgba(20,37,31,.11);
        color:#18201c;
        font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
        overflow:hidden;
      }
      .rg-feedback-space.is-highlighted{animation:rgFeedbackGlow 1.4s ease 2}
      @keyframes rgFeedbackGlow{
        0%,100%{box-shadow:0 20px 55px rgba(20,37,31,.11)}
        42%{box-shadow:0 24px 70px rgba(184,138,45,.32),0 0 0 4px rgba(247,211,122,.26)}
      }
      .rg-feedback-space-inner{
        display:grid;
        grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr);
        gap:18px;
        padding:22px;
      }
      .rg-feedback-space-copy{
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        gap:18px;
        min-height:100%;
        border-radius:18px;
        padding:20px;
        background:linear-gradient(145deg,#14251f,#263b32);
        color:#fff;
      }
      .rg-feedback-space-copy small{
        color:#f7d37a;
        font-size:.72rem;
        font-weight:900;
        letter-spacing:.12em;
        text-transform:uppercase;
      }
      .rg-feedback-space-copy h3{margin:8px 0 8px;font-size:1.45rem;line-height:1.12;letter-spacing:0}
      .rg-feedback-space-copy p{margin:0;color:rgba(255,255,255,.78);line-height:1.55}
      .rg-feedback-space-trust{
        display:flex;
        align-items:center;
        gap:8px;
        color:rgba(255,255,255,.82);
        font-size:.86rem;
        font-weight:800;
      }
      .rg-feedback-inline-form{
        display:grid;
        gap:13px;
        align-content:start;
      }
      .rg-feedback-inline-rating{
        display:grid;
        grid-template-columns:repeat(5,minmax(0,1fr));
        gap:8px;
      }
      .rg-feedback-inline-rating button{
        min-height:46px;
        border:1px solid rgba(24,32,28,.14);
        border-radius:12px;
        background:#fff;
        color:#18201c;
        font-weight:900;
        cursor:pointer;
      }
      .rg-feedback-inline-rating button.is-active{
        border-color:#b88a2d;
        background:#fff5dc;
        color:#7b5513;
        box-shadow:0 10px 22px rgba(184,138,45,.16);
      }
      .rg-feedback-inline-grid{
        display:grid;
        grid-template-columns:minmax(0,.86fr) minmax(0,1.14fr);
        gap:10px;
      }
      .rg-feedback-inline-form label{display:grid;gap:7px}
      .rg-feedback-inline-form span{font-size:.78rem;font-weight:900;color:#46534d}
      .rg-feedback-inline-form select,
      .rg-feedback-inline-form textarea{
        width:100%;
        border:1px solid rgba(24,32,28,.14);
        border-radius:12px;
        background:#fff;
        color:#18201c;
        outline:0;
        padding:12px 13px;
        font:inherit;
      }
      .rg-feedback-inline-form textarea{min-height:104px;resize:vertical}
      .rg-feedback-inline-actions{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        flex-wrap:wrap;
      }
      .rg-feedback-inline-submit{
        min-height:46px;
        border:0;
        border-radius:999px;
        padding:0 18px;
        background:#14251f;
        color:#fff;
        font-weight:900;
        box-shadow:0 14px 28px rgba(20,37,31,.18);
        cursor:pointer;
      }
      .rg-feedback-inline-submit:disabled{opacity:.72;cursor:wait}
      .rg-feedback-inline-status{
        margin:0;
        color:#647069;
        font-size:.84rem;
        font-weight:800;
        line-height:1.35;
      }
      body.rg-mobile-app .rg-feedback-space{margin-bottom:calc(108px + var(--rg-mobile-safe-bottom,0px))}
      @media(max-width:560px){
        .rg-feedback-backdrop{align-items:flex-end;padding:10px}
        .rg-feedback-card{border-radius:18px 18px 12px 12px}
        .rg-feedback-head{padding:19px 18px 12px}
        .rg-feedback-body{padding:16px 18px 18px}
        .rg-feedback-rating{gap:6px}
        .rg-feedback-rating button{min-height:44px}
        .rg-feedback-actions{display:grid;grid-template-columns:1fr}
        .rg-feedback-submit,.rg-feedback-stay{width:100%}
        .rg-feedback-float{right:12px;bottom:calc(82px + var(--rg-mobile-safe-bottom,0px));min-height:42px;padding:0 12px}
        .rg-feedback-space{width:calc(100% - 20px);margin-top:22px;border-radius:18px}
        .rg-feedback-space-inner{grid-template-columns:1fr;padding:12px;gap:12px}
        .rg-feedback-space-copy{padding:18px;border-radius:16px}
        .rg-feedback-space-copy h3{font-size:1.22rem}
        .rg-feedback-inline-grid{grid-template-columns:1fr}
        .rg-feedback-inline-actions{display:grid;grid-template-columns:1fr}
        .rg-feedback-inline-submit{width:100%}
      }
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    injectStyles();
    let modal = document.getElementById("rgFeedbackGate");
    if (modal) return modal;

    modal = document.createElement("div");
    modal.id = "rgFeedbackGate";
    modal.className = "rg-feedback-backdrop";
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = `
      <section class="rg-feedback-card" role="dialog" aria-modal="true" aria-labelledby="rgFeedbackTitle">
        <div class="rg-feedback-head">
          <div class="rg-feedback-kicker"><i class="fa-solid fa-shield-heart"></i><span>RealityGenius feedback</span></div>
          <h3 id="rgFeedbackTitle">Before you leave, tell us what to improve.</h3>
          <p id="rgFeedbackCopy">Your answer goes to the team so the platform gets sharper for buyers, agents, admins, and owners.</p>
        </div>
        <form class="rg-feedback-body" id="rgFeedbackForm">
          <div class="rg-feedback-field">
            <span>How was this session?</span>
            <div class="rg-feedback-rating" aria-label="Rating out of 5">
              ${[1, 2, 3, 4, 5].map((rating) => `<button type="button" data-feedback-rating="${rating}" aria-label="${rating} out of 5">${rating}</button>`).join("")}
            </div>
          </div>
          <label class="rg-feedback-field">
            <span>What made you leave?</span>
            <select id="rgFeedbackReason" required>
              <option value="">Choose one reason</option>
              <option value="found_what_i_needed">I found what I needed</option>
              <option value="missing_listing">Could not find the property or area</option>
              <option value="too_complex">The page felt too complex</option>
              <option value="need_more_trust">I need more trust or verification</option>
              <option value="price_or_budget">Price or budget was not right</option>
              <option value="just_browsing">Just browsing for now</option>
              <option value="technical_issue">Something did not work</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label class="rg-feedback-field">
            <span>One sentence that would make RealityGenius better</span>
            <textarea id="rgFeedbackNote" maxlength="700" placeholder="Example: Add more landed homes in Shah Alam, or make agent contact clearer."></textarea>
          </label>
          <div class="rg-feedback-error" id="rgFeedbackError" role="status"></div>
          <div class="rg-feedback-actions">
            <button class="rg-feedback-submit" type="submit">Send feedback and continue</button>
            <button class="rg-feedback-stay" type="button" id="rgFeedbackStay">Stay on RealityGenius</button>
          </div>
          <p class="rg-feedback-micro">For browser tab closing, your browser may show its own confirmation box. Websites cannot force a custom form after the tab is closed.</p>
        </form>
      </section>
    `;
    document.body.appendChild(modal);
    bindModal(modal);
    return modal;
  }

  function ensureFloatButton() {
    injectStyles();
    if (document.getElementById("rgFeedbackFloat")) return;
    const button = document.createElement("button");
    button.id = "rgFeedbackFloat";
    button.className = "rg-feedback-float";
    button.type = "button";
    button.innerHTML = '<i class="fa-solid fa-comment-dots"></i><span>Feedback form</span>';
    button.addEventListener("click", () => {
      ensureInlineFeedbackSpace();
      const space = document.getElementById("rgFeedbackSpace");
      if (!space) {
        openModal("manual_feedback");
        return;
      }
      space.scrollIntoView({ behavior: "smooth", block: "center" });
      space.classList.add("is-highlighted");
      window.setTimeout(() => space.classList.remove("is-highlighted"), 2900);
    });
    document.body.appendChild(button);
  }

  function ensureInlineFeedbackSpace() {
    injectStyles();
    if (document.getElementById("rgFeedbackSpace")) return;

    const copy = feedbackRole === "agent"
      ? {
        title: "Tell us what helps you close faster.",
        body: "Share what would make listings, leads, content, and agent tools easier to use today."
      }
      : feedbackRole === "admin" || feedbackRole === "master"
        ? {
          title: "Tell us what the control room needs next.",
          body: "Share what would make approvals, monitoring, live revenue, and platform safety clearer."
        }
        : {
          title: "Tell us what would make property search better.",
          body: "Share what helped, what confused you, or what property insight you wanted but could not find."
        };

    const section = document.createElement("section");
    section.id = "rgFeedbackSpace";
    section.className = "rg-feedback-space";
    section.setAttribute("aria-label", "RealityGenius feedback space");
    section.innerHTML = `
      <div class="rg-feedback-space-inner">
        <div class="rg-feedback-space-copy">
          <div>
            <small>Feedback space</small>
            <h3>${safe(copy.title)}</h3>
            <p>${safe(copy.body)}</p>
          </div>
          <div class="rg-feedback-space-trust">
            <i class="fa-solid fa-shield-heart" aria-hidden="true"></i>
            <span>Your feedback goes to RealityGenius support and product review.</span>
          </div>
        </div>
        <form class="rg-feedback-inline-form" id="rgInlineFeedbackForm">
          <label>
            <span>Rate this page</span>
            <div class="rg-feedback-inline-rating" aria-label="Rating out of 5">
              ${[1, 2, 3, 4, 5].map((rating) => `<button type="button" data-inline-feedback-rating="${rating}" aria-label="${rating} out of 5">${rating}</button>`).join("")}
            </div>
          </label>
          <div class="rg-feedback-inline-grid">
            <label>
              <span>Feedback type</span>
              <select id="rgInlineFeedbackReason" required>
                <option value="">Choose one</option>
                <option value="missing_listing">Missing property, area, or listing</option>
                <option value="too_complex">Page feels confusing</option>
                <option value="need_more_trust">Need more proof or trust</option>
                <option value="technical_issue">Something is not working</option>
                <option value="feature_request">Feature request</option>
                <option value="good_experience">Good experience</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label>
              <span>Your note</span>
              <textarea id="rgInlineFeedbackNote" maxlength="900" placeholder="Example: I want more Shah Alam landed homes with verified photos."></textarea>
            </label>
          </div>
          <div class="rg-feedback-inline-actions">
            <button class="rg-feedback-inline-submit" type="submit">Send feedback</button>
            <p class="rg-feedback-inline-status" id="rgInlineFeedbackStatus">This helps us improve buyer, agent, admin, and owner dashboards.</p>
          </div>
        </form>
      </div>
    `;

    const target = document.querySelector("main") || document.querySelector(".main") || document.querySelector(".dashboard") || document.body;
    target.appendChild(section);
    bindInlineFeedbackSpace(section);
  }

  function bindInlineFeedbackSpace(section) {
    section.addEventListener("click", (event) => {
      const ratingButton = event.target.closest("[data-inline-feedback-rating]");
      if (!ratingButton) return;
      section.querySelectorAll("[data-inline-feedback-rating]").forEach((button) => button.classList.toggle("is-active", button === ratingButton));
      section.dataset.rating = ratingButton.dataset.inlineFeedbackRating;
      const status = document.getElementById("rgInlineFeedbackStatus");
      if (status) status.textContent = "Good. Add a short note if you want, then send it.";
    });

    const form = section.querySelector("#rgInlineFeedbackForm");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rating = Number(section.dataset.rating || 0);
      const reason = document.getElementById("rgInlineFeedbackReason")?.value || "";
      const note = document.getElementById("rgInlineFeedbackNote")?.value.trim() || "";
      const status = document.getElementById("rgInlineFeedbackStatus");

      if (!rating || !reason) {
        if (status) {
          status.textContent = "Please choose a rating and feedback type first.";
          status.style.color = "#b42318";
        }
        return;
      }

      const submit = section.querySelector(".rg-feedback-inline-submit");
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Sending...";
      }
      if (status) {
        status.textContent = "Saving your feedback...";
        status.style.color = "#647069";
      }

      await submitFeedback({ rating, reason, note, trigger: "inline_feedback_space" });
      markSubmitted();

      if (status) {
        status.textContent = "Thank you. Your feedback is saved for review.";
        status.style.color = "#166534";
      }
      if (submit) {
        submit.disabled = false;
        submit.textContent = "Send another note";
      }
      form.reset();
      section.dataset.rating = "";
      section.querySelectorAll("[data-inline-feedback-rating]").forEach((button) => button.classList.remove("is-active"));
    });
  }

  function bindModal(modal) {
    modal.addEventListener("click", (event) => {
      const ratingButton = event.target.closest("[data-feedback-rating]");
      if (!ratingButton) return;
      modal.querySelectorAll("[data-feedback-rating]").forEach((button) => button.classList.toggle("is-active", button === ratingButton));
      modal.dataset.rating = ratingButton.dataset.feedbackRating;
      const error = document.getElementById("rgFeedbackError");
      if (error) error.textContent = "";
    });

    const stay = modal.querySelector("#rgFeedbackStay");
    stay?.addEventListener("click", () => closeModal(false));

    const form = modal.querySelector("#rgFeedbackForm");
    form?.addEventListener("submit", async (event) => {
      event.preventDefault();
      const rating = Number(modal.dataset.rating || 0);
      const reason = document.getElementById("rgFeedbackReason")?.value || "";
      const note = document.getElementById("rgFeedbackNote")?.value.trim() || "";
      const error = document.getElementById("rgFeedbackError");

      if (!rating || !reason) {
        if (error) error.textContent = "Please choose a rating and reason before continuing.";
        return;
      }

      const submit = modal.querySelector(".rg-feedback-submit");
      if (submit) {
        submit.disabled = true;
        submit.textContent = "Sending...";
      }

      await submitFeedback({ rating, reason, note, trigger: state.reason });
      markSubmitted();
      closeModal(true);

      if (submit) {
        submit.disabled = false;
        submit.textContent = "Send feedback and continue";
      }
    });
  }

  function openModal(reason = "leaving") {
    if (hasSubmitted()) return Promise.resolve(true);
    if (state.active) return new Promise((resolve) => {
      state.resolver = resolve;
    });

    const modal = ensureModal();
    state.active = true;
    state.reason = reason;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    const title = document.getElementById("rgFeedbackTitle");
    const copy = document.getElementById("rgFeedbackCopy");
    if (reason === "today_checkin") markDailyPromptSeen();
    if (title) {
      title.textContent = reason === "today_checkin"
        ? "Quick check-in for today"
        : reason === "manual_feedback"
          ? "Tell us what to improve"
          : reason === "logout"
            ? "Before you log out, leave quick feedback."
            : "Before you leave, tell us what to improve.";
    }
    if (copy) copy.textContent = feedbackRole === "agent"
      ? "Your feedback helps us make leads, listings, AI tools, and revenue workflows easier for agents."
      : feedbackRole === "admin" || feedbackRole === "master"
        ? "Your feedback helps us improve the control room, live data, approvals, and revenue visibility."
        : "Your feedback helps us improve search, trust, maps, recommendations, and property discovery.";

    setTimeout(() => modal.querySelector("[data-feedback-rating='5']")?.focus(), 30);
    return new Promise((resolve) => {
      state.resolver = resolve;
    });
  }

  function closeModal(submitted) {
    const modal = ensureModal();
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    state.active = false;

    const resolve = state.resolver;
    state.resolver = null;
    if (resolve) resolve(Boolean(submitted));
  }

  async function submitFeedback({ rating, reason, note, trigger }) {
    const session = readSession();
    const payload = {
      rating,
      reason,
      note,
      trigger,
      role: session?.role || feedbackRole,
      name: session?.name || "",
      email: session?.email || "",
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      url: window.location.href,
      submittedAt: new Date().toISOString(),
      userAgent: navigator.userAgent
    };

    writeLocalRecord(payload);

    try {
      const headers = { "Content-Type": "application/json" };
      if (session?.token) headers.Authorization = `Bearer ${session.token}`;
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        keepalive: true
      });
      if (!response.ok) throw new Error("Feedback API failed");
    } catch (error) {
      if (window.RGLogError) window.RGLogError(error, { feature: "feedback_gate_submit" });
    }
  }

  function isModifiedClick(event) {
    return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;
  }

  function shouldGateLink(anchor) {
    if (!anchor || anchor.dataset.feedbackSkip === "true" || anchor.hasAttribute("download")) return false;
    const href = anchor.getAttribute("href") || "";
    if (!href || href.startsWith("#") || href.startsWith("javascript:")) return false;

    try {
      const target = new URL(href, window.location.href);
      if (target.pathname === window.location.pathname && target.hash && !target.search) return false;
      return true;
    } catch {
      return false;
    }
  }

  function continueTo(anchor) {
    const href = anchor.getAttribute("href");
    const target = anchor.getAttribute("target");
    if (target && target !== "_self") {
      window.open(href, target, "noopener,noreferrer");
      return;
    }
    window.location.href = href;
  }

  function bindNavigationGate() {
    ensureFloatButton();
    ensureInlineFeedbackSpace();

    window.setTimeout(() => {
      if (hasSubmitted() || hasSeenDailyPrompt() || state.active || document.visibilityState === "hidden") return;
      openModal("today_checkin");
    }, dailyPromptDelayMs);

    document.addEventListener("click", async (event) => {
      if (isModifiedClick(event)) return;
      const anchor = event.target.closest("a[href]");
      if (!shouldGateLink(anchor) || hasSubmitted()) return;

      event.preventDefault();
      state.pendingNavigation = anchor;
      const submitted = await openModal(anchor.hostname && anchor.hostname !== window.location.hostname ? "external_link" : "navigation");
      if (submitted && state.pendingNavigation) continueTo(state.pendingNavigation);
      state.pendingNavigation = null;
    }, true);

    window.addEventListener("beforeunload", (event) => {
      if (hasSubmitted() || state.active) return;
      event.preventDefault();
      event.returnValue = "Please leave quick feedback before exiting RealityGenius.";
      return event.returnValue;
    });

    document.addEventListener("mouseout", (event) => {
      if (hasSubmitted() || state.active || Date.now() < state.readyAt) return;
      if (event.clientY <= 0 && !event.relatedTarget) openModal("exit_intent");
    });
  }

  window.RealityGeniusFeedbackGate = {
    request: ({ reason = "leaving" } = {}) => openModal(reason),
    hasSubmitted,
    submitFeedback
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindNavigationGate);
  } else {
    bindNavigationGate();
  }
})();
