(function () {
  const CONFIG = {
    supabaseUrl: "https://tjmvbgdgddscbilfkggu.supabase.co",
    publishableKey: "sb_publishable_gdHnuY0_2GgMZJMNuVxC2g_g0ZB0mmJ",
    primaryAgentId: "22222222-2222-4222-8222-222222222222",
    primaryAgentName: "Arvind Govindasamy"
  };

  const state = {
    client: null,
    session: null,
    reviews: [],
    rating: 5,
    currentPropertyTitle: ""
  };

  function safe(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[character]));
  }

  function $(id) {
    return document.getElementById(id);
  }

  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function injectStyles() {
    if ($("rgTrustLoopStyles")) return;
    const style = document.createElement("style");
    style.id = "rgTrustLoopStyles";
    style.textContent = `
      .rg-agent-review-panel{margin-top:16px;padding:16px;border:1px solid rgba(35,194,199,.18);border-radius:16px;background:linear-gradient(180deg,rgba(35,194,199,.08),rgba(255,255,255,.035))}
      .rg-agent-review-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:12px}.rg-agent-review-head strong{display:block;font-size:1rem}.rg-agent-review-head span{display:block;color:var(--muted,#94a3b8);font-size:.86rem;margin-top:3px}
      .rg-rating-badge{display:inline-flex;align-items:center;gap:7px;padding:8px 10px;border-radius:999px;border:1px solid rgba(250,204,21,.24);background:rgba(250,204,21,.1);font-weight:900;white-space:nowrap}
      .rg-agent-review-form{display:grid;gap:10px}.rg-star-row{display:flex;gap:6px;flex-wrap:wrap}.rg-star-button{width:38px;height:36px;border-radius:10px;border:1px solid rgba(148,163,184,.24);background:rgba(255,255,255,.06);color:#94a3b8;cursor:pointer}.rg-star-button.active{border-color:rgba(250,204,21,.5);background:rgba(250,204,21,.16);color:#facc15}
      .rg-agent-review-form textarea{width:100%;min-height:82px;padding:12px;border:1px solid rgba(148,163,184,.22);border-radius:12px;background:rgba(255,255,255,.06);color:inherit;resize:vertical;outline:none}
      .rg-agent-review-foot{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap}.rg-agent-review-foot span{color:var(--muted,#94a3b8);font-size:.84rem}
      .rg-review-mini-list{display:grid;gap:8px;margin-top:12px}.rg-review-mini-item{padding:10px;border:1px solid rgba(148,163,184,.16);border-radius:12px;background:rgba(255,255,255,.045)}.rg-review-mini-item strong{display:block}.rg-review-mini-item p{margin:4px 0 0;color:var(--muted,#94a3b8);font-size:.86rem;line-height:1.45}
      @media (max-width:620px){.rg-agent-review-head{display:grid}.rg-rating-badge{width:max-content}}
    `;
    document.head.appendChild(style);
  }

  function propertyFromModal() {
    const title = $("modalTitle")?.textContent?.trim() || "";
    return (window.RealtyGeniusPropertyListings || []).find((property) => property.title === title) || { title };
  }

  function reviewStats() {
    const count = state.reviews.length;
    const average = count ? state.reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0) / count : 0;
    return {
      count,
      average,
      label: count ? `${average.toFixed(1)}/5 from ${count} buyer review${count === 1 ? "" : "s"}` : "No buyer reviews yet"
    };
  }

  async function loadReviews() {
    if (!state.client) return;
    const { data, error } = await state.client
      .from("agent_reviews")
      .select("rating, review_text, property_title, created_at")
      .eq("agent_id", CONFIG.primaryAgentId)
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(6);

    if (!error) {
      state.reviews = data || [];
    }
  }

  function ratingButtons() {
    return [1, 2, 3, 4, 5].map((rating) => `
      <button class="rg-star-button ${state.rating >= rating ? "active" : ""}" data-rg-rating="${rating}" type="button" aria-label="${rating} star">
        <i class="fa-solid fa-star"></i>
      </button>
    `).join("");
  }

  function reviewList() {
    return state.reviews.length ? `
      <div class="rg-review-mini-list">
        ${state.reviews.slice(0, 3).map((review) => `
          <article class="rg-review-mini-item">
            <strong>${Number(review.rating || 0)}/5 - ${safe(review.property_title || "Agent review")}</strong>
            <p>${safe(review.review_text)}</p>
          </article>
        `).join("")}
      </div>
    ` : "";
  }

  function renderPanel() {
    const modal = $("propertyModal");
    if (!modal || !modal.classList.contains("is-open")) return;

    injectStyles();
    const property = propertyFromModal();
    state.currentPropertyTitle = property.title || $("modalTitle")?.textContent?.trim() || "Property viewing";

    let panel = $("rgAgentReviewPanel");
    if (!panel) {
      panel = document.createElement("section");
      panel.id = "rgAgentReviewPanel";
      panel.className = "rg-agent-review-panel";
      const anchor = document.querySelector(".decision-panel") || document.querySelector(".booking-panel") || document.querySelector(".modal-copy");
      anchor?.insertAdjacentElement("afterend", panel);
    }

    const stats = reviewStats();
    const draftText = $("rgAgentReviewText")?.value || "";
    panel.innerHTML = `
      <div class="rg-agent-review-head">
        <div>
          <div class="eyebrow">Agent Trust Loop</div>
          <strong>${safe(CONFIG.primaryAgentName)}</strong>
          <span>Review the agent after contact or viewing. This becomes live reputation for agent, admin, and owner dashboards.</span>
        </div>
        <div class="rg-rating-badge"><i class="fa-solid fa-star"></i>${safe(stats.label)}</div>
      </div>
      <form class="rg-agent-review-form" id="rgAgentReviewForm">
        <div class="rg-star-row">${ratingButtons()}</div>
        <textarea id="rgAgentReviewText" placeholder="Example: Fast response, clear documents, honest viewing advice..." required>${safe(draftText)}</textarea>
        <div class="rg-agent-review-foot">
          <span>Trust data stays in-platform so good agents earn repeat business.</span>
          <button class="primary-button" type="submit"><i class="fa-solid fa-paper-plane"></i> Submit Review</button>
        </div>
      </form>
      ${reviewList()}
    `;
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!state.client) return;

    const { data: { session } } = await state.client.auth.getSession();
    state.session = session;
    if (!session?.user) {
      showToast("Sign in with a real buyer account to review agents");
      return;
    }

    const reviewText = $("rgAgentReviewText")?.value?.trim() || "";
    if (reviewText.length < 8) {
      showToast("Write a little more detail for the review");
      return;
    }

    const { error } = await state.client.from("agent_reviews").insert({
      agent_id: CONFIG.primaryAgentId,
      property_title: state.currentPropertyTitle,
      rating: state.rating,
      review_text: reviewText,
      source: "buyer_property_modal"
    });

    if (error) {
      showToast(error.message || "Could not save review");
      return;
    }

    showToast("Agent review saved live");
    await loadReviews();
    renderPanel();
  }

  function bindEvents() {
    document.addEventListener("click", (event) => {
      const ratingTarget = event.target instanceof Element ? event.target.closest("[data-rg-rating]") : null;
      if (!ratingTarget) return;
      state.rating = Number(ratingTarget.dataset.rgRating || 5);
      renderPanel();
    });

    document.addEventListener("submit", (event) => {
      if (event.target?.id === "rgAgentReviewForm") {
        submitReview(event);
      }
    });

    const modal = $("propertyModal");
    if (modal) {
      new MutationObserver(() => {
        if (modal.classList.contains("is-open")) renderPanel();
      }).observe(modal, { attributes: true, attributeFilter: ["class", "aria-hidden"] });
    }
  }

  async function start() {
    if (!window.supabase) return;
    state.client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.publishableKey);
    await loadReviews();
    bindEvents();
    renderPanel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
