(function () {
  const CONFIG = {
    supabaseUrl: "https://tjmvbgdgddscbilfkggu.supabase.co",
    publishableKey: "sb_publishable_gdHnuY0_2GgMZJMNuVxC2g_g0ZB0mmJ"
  };

  const state = {
    client: null,
    session: null,
    timers: {},
    lastSent: new Map()
  };

  function $(id) {
    return document.getElementById(id);
  }

  function properties() {
    return window.RealtyGeniusPropertyListings || [];
  }

  function propertyById(id) {
    return properties().find((property) => String(property.id) === String(id));
  }

  function propertyByModalTitle() {
    const title = $("modalTitle")?.textContent?.trim() || "";
    return properties().find((property) => property.title === title) || null;
  }

  function buyerProfile() {
    try {
      return JSON.parse(localStorage.getItem("kvai_user_buyer_profile") || "{}") || {};
    } catch {
      return {};
    }
  }

  function scoreFor(eventType, payload = {}) {
    const base = {
      search: 54,
      property_view: 62,
      property_save: 78,
      whatsapp_contact: 86,
      viewing_request: 92,
      loan_interest: 95,
      offer_interest: 95,
      review_submitted: 70
    }[eventType] || 50;

    const price = Number(payload.property_price || 0);
    return Math.min(100, base + (price > 0 ? 3 : 0) + (payload.buyer_phone ? 4 : 0));
  }

  async function refreshSession() {
    if (!state.client) return null;
    const { data: { session } } = await state.client.auth.getSession();
    state.session = session || null;
    return state.session;
  }

  function dedupeKey(eventType, payload) {
    return [
      eventType,
      payload.search_query || "",
      payload.property_title || "",
      payload.area || ""
    ].join("|").toLowerCase();
  }

  async function sendBehavior(eventType, payload = {}) {
    if (!state.client) return;
    const session = state.session || await refreshSession();
    if (!session?.user) return;

    const key = dedupeKey(eventType, payload);
    const now = Date.now();
    if (now - Number(state.lastSent.get(key) || 0) < 12000) return;
    state.lastSent.set(key, now);

    const profile = buyerProfile();
    const row = {
      event_type: eventType,
      buyer_user_id: session.user.id,
      search_query: payload.search_query || null,
      property_title: payload.property_title || null,
      area: payload.area || null,
      property_price: payload.property_price || null,
      buyer_name: payload.buyer_name || profile.name || null,
      buyer_phone: payload.buyer_phone || profile.phone || null,
      intent_score: scoreFor(eventType, { ...payload, buyer_phone: payload.buyer_phone || profile.phone }),
      metadata: {
        source: "user_dashboard",
        page: window.location.pathname,
        filter: document.querySelector(".filter-chip.active")?.textContent?.trim() || null,
        sort: $("sortSelect")?.value || null,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        ...payload.metadata
      }
    };

    await state.client.from("buyer_behavior_events").insert(row);
  }

  function trackSearch(value) {
    const query = String(value || "").trim();
    if (query.length < 3) return;
    clearTimeout(state.timers.search);
    state.timers.search = setTimeout(() => {
      sendBehavior("search", {
        search_query: query,
        metadata: {
          exact_matches: document.querySelectorAll(".property-card").length,
          has_location_insight: Boolean(document.querySelector(".location-insight-card"))
        }
      });
    }, 850);
  }

  function trackProperty(eventType, property, metadata = {}) {
    if (!property) return;
    sendBehavior(eventType, {
      property_title: property.title,
      area: property.area,
      property_price: property.price,
      metadata: {
        property_id: property.id,
        property_type: property.propertyType || property.type,
        source_url: property.sourceUrl || null,
        ...metadata
      }
    });
  }

  function bindEvents() {
    $("searchInput")?.addEventListener("input", (event) => trackSearch(event.target.value));

    document.addEventListener("click", (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const actionTarget = target?.closest("[data-action]");
      const action = actionTarget?.dataset.action;
      const id = actionTarget?.dataset.id;
      if (action === "toggle-save") {
        setTimeout(() => trackProperty("property_save", propertyById(id), { action: "save_toggle" }), 80);
      }
      if (action === "open-details") {
        trackProperty("property_view", propertyById(id), { action: "open_details" });
      }

      const contactTarget = target?.closest(".quick-contact, .quick-contact-card");
      if (contactTarget) {
        trackProperty("whatsapp_contact", propertyByModalTitle() || propertyById(contactTarget.dataset.id), {
          action: "whatsapp_contact"
        });
      }
    });

    $("bookingForm")?.addEventListener("submit", () => {
      const property = propertyByModalTitle();
      setTimeout(() => {
        trackProperty("viewing_request", property, {
          booking_date: $("bookingDate")?.value || null,
          booking_time: $("bookingTime")?.value || null
        });
      }, 120);
    });

    $("startLoanPackButton")?.addEventListener("click", () => trackProperty("loan_interest", propertyByModalTitle(), { action: "start_loan_pack" }));
    $("submitPartnerBankButton")?.addEventListener("click", () => trackProperty("loan_interest", propertyByModalTitle(), { action: "submit_partner_bank" }));
    $("generateOfferButton")?.addEventListener("click", () => trackProperty("offer_interest", propertyByModalTitle(), { action: "generate_offer" }));
    $("buyerSignOfferButton")?.addEventListener("click", () => trackProperty("offer_interest", propertyByModalTitle(), { action: "buyer_sign_offer" }));

    const modal = $("propertyModal");
    if (modal) {
      new MutationObserver(() => {
        if (!modal.classList.contains("is-open")) return;
        setTimeout(() => trackProperty("property_view", propertyByModalTitle(), { action: "modal_open" }), 120);
      }).observe(modal, { attributes: true, attributeFilter: ["class", "aria-hidden"] });
    }
  }

  async function start() {
    if (!window.supabase) return;
    state.client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.publishableKey);
    await refreshSession();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
