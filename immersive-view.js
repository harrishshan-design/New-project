/* RealityGenius Immersive View
   Full-screen premium overlay combining a 360-degree panorama room tour
   (Pannellum, lazy-loaded from CDN) and buyer-facing AI staging with a
   before/after compare slider. Self-contained: exposes window.RGImmersiveView. */
(function () {
  const PANNELLUM_CSS = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css";
  const PANNELLUM_JS = "https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js";

  const STAGING_STYLES = [
    { value: "modern luxury", label: "Modern Luxury", icon: "fa-gem" },
    { value: "minimalist condo", label: "Minimalist Condo", icon: "fa-circle-half-stroke" },
    { value: "malaysian family home", label: "Malaysian Family Home", icon: "fa-house-chimney" }
  ];

  const state = {
    property: null,
    apiUrl: "/api/ar/generate",
    activeTab: "tour",
    panoViewer: null,
    panoIndex: 0,
    photoIndex: 0,
    styleValue: STAGING_STYLES[0].value,
    generating: false,
    stagedUrl: "",
    els: null,
    pannellumPromise: null
  };

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getPanoramas(property) {
    return (Array.isArray(property?.panoramas) ? property.panoramas : [])
      .map((item) => ({
        label: item?.label || "360 Room",
        url: String(item?.url || "").trim()
      }))
      .filter((item) => /^https?:\/\//i.test(item.url))
      .slice(0, 3);
  }

  function getPhotos(property) {
    const photos = (Array.isArray(property?.gallery) ? property.gallery : [])
      .map((item) => ({
        label: item?.label || "Photo",
        url: String(item?.url || "").trim()
      }))
      .filter((item) => /^https?:\/\//i.test(item.url));
    if (!photos.length && /^https?:\/\//i.test(String(property?.image || ""))) {
      photos.push({ label: "Front View", url: property.image });
    }
    return photos.slice(0, 12);
  }

  function isAvailable(property) {
    return Boolean(getPanoramas(property).length || getPhotos(property).length);
  }

  function loadPannellum() {
    if (window.pannellum) return Promise.resolve();
    if (state.pannellumPromise) return state.pannellumPromise;
    state.pannellumPromise = new Promise((resolve, reject) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = PANNELLUM_CSS;
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.src = PANNELLUM_JS;
      script.onload = () => resolve();
      script.onerror = () => {
        state.pannellumPromise = null;
        reject(new Error("The 360 viewer could not be loaded. Check your connection."));
      };
      document.head.appendChild(script);
    });
    return state.pannellumPromise;
  }

  function buildOverlay() {
    if (state.els) return state.els;

    const root = document.createElement("div");
    root.className = "rg-immersive";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Immersive property view");
    root.innerHTML = `
      <div class="rg-immersive-inner">
        <div class="rg-immersive-head">
          <div>
            <span class="rg-immersive-eyebrow"><i class="fa-solid fa-vr-cardboard"></i> Immersive View</span>
            <h2 data-rgiv="title"></h2>
            <p class="rg-immersive-location" data-rgiv="location"></p>
          </div>
          <button class="rg-immersive-close" type="button" data-rgiv="close">
            <i class="fa-solid fa-xmark"></i> Close
          </button>
        </div>

        <div class="rg-immersive-tabs" role="tablist">
          <button class="rg-immersive-tab" type="button" role="tab" data-rgiv-tab="tour">
            <i class="fa-solid fa-panorama"></i> 360&deg; Tour
          </button>
          <button class="rg-immersive-tab" type="button" role="tab" data-rgiv-tab="staging">
            <i class="fa-solid fa-wand-magic-sparkles"></i> AI Staging
          </button>
        </div>

        <div class="rg-immersive-stage">
          <div class="rg-immersive-panel" data-rgiv-panel="tour">
            <div class="rg-immersive-pano" data-rgiv="pano"></div>
            <div class="rg-immersive-pano-hint">Drag to look around the room</div>
            <div class="rg-immersive-pano-rooms" data-rgiv="rooms"></div>
          </div>

          <div class="rg-immersive-panel" data-rgiv-panel="staging">
            <div class="rg-immersive-staging">
              <aside class="rg-immersive-staging-side">
                <div>
                  <div class="rg-immersive-side-label">1. Pick a room photo</div>
                  <div class="rg-immersive-photo-strip" data-rgiv="photos"></div>
                </div>
                <div>
                  <div class="rg-immersive-side-label">2. Choose a style</div>
                  <div class="rg-immersive-style-chips" data-rgiv="styles"></div>
                </div>
                <button class="rg-immersive-generate" type="button" data-rgiv="generate">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> Reimagine this room
                </button>
                <p class="rg-immersive-staging-note" data-rgiv="note">AI redesigns the photo while keeping the real room structure.</p>
              </aside>

              <div class="rg-immersive-compare-wrap">
                <div class="rg-immersive-compare" data-rgiv="compare">
                  <img class="rg-before" data-rgiv="before" alt="Original room photo">
                  <img class="rg-after" data-rgiv="after" alt="AI staged concept">
                  <div class="rg-immersive-compare-handle" data-rgiv="handle"></div>
                  <span class="rg-immersive-compare-tag rg-tag-before">Original</span>
                  <span class="rg-immersive-compare-tag rg-tag-after">AI Staged</span>
                  <div class="rg-immersive-compare-empty" data-rgiv="empty">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    <strong>Your staged room appears here</strong>
                    <span>Pick a photo, choose a style, and generate. Then drag the divider to compare.</span>
                  </div>
                </div>
                <div class="rg-immersive-compare-toolbar">
                  <span class="rg-immersive-staging-note" data-rgiv="compareNote">Drag the divider to compare original and staged.</span>
                  <a class="rg-immersive-download" data-rgiv="download" href="#" download="realitygenius-staged-room.png" aria-disabled="true">
                    <i class="fa-solid fa-download"></i> Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(root);

    const q = (sel) => root.querySelector(sel);
    state.els = {
      root,
      title: q('[data-rgiv="title"]'),
      location: q('[data-rgiv="location"]'),
      close: q('[data-rgiv="close"]'),
      tabs: Array.from(root.querySelectorAll("[data-rgiv-tab]")),
      panels: Array.from(root.querySelectorAll("[data-rgiv-panel]")),
      pano: q('[data-rgiv="pano"]'),
      rooms: q('[data-rgiv="rooms"]'),
      photos: q('[data-rgiv="photos"]'),
      styles: q('[data-rgiv="styles"]'),
      generate: q('[data-rgiv="generate"]'),
      note: q('[data-rgiv="note"]'),
      compare: q('[data-rgiv="compare"]'),
      before: q('[data-rgiv="before"]'),
      after: q('[data-rgiv="after"]'),
      handle: q('[data-rgiv="handle"]'),
      empty: q('[data-rgiv="empty"]'),
      compareNote: q('[data-rgiv="compareNote"]'),
      download: q('[data-rgiv="download"]')
    };

    attachEvents();
    return state.els;
  }

  function attachEvents() {
    const els = state.els;

    els.close.addEventListener("click", close);
    els.root.addEventListener("click", (event) => {
      if (event.target === els.root) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && els.root.classList.contains("is-open")) close();
    });

    els.tabs.forEach((tab) => {
      tab.addEventListener("click", () => setTab(tab.dataset.rgivTab));
    });

    els.rooms.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-rgiv-room]");
      if (chip) showPanorama(Number(chip.dataset.rgivRoom));
    });

    els.photos.addEventListener("click", (event) => {
      const pick = event.target.closest("[data-rgiv-photo]");
      if (pick) selectPhoto(Number(pick.dataset.rgivPhoto));
    });

    els.styles.addEventListener("click", (event) => {
      const chip = event.target.closest("[data-rgiv-style]");
      if (chip) selectStyle(chip.dataset.rgivStyle);
    });

    els.generate.addEventListener("click", generateStaging);

    // Before/after divider drag (pointer events cover mouse + touch)
    const moveDivider = (clientX) => {
      const rect = els.compare.getBoundingClientRect();
      const ratio = Math.min(0.98, Math.max(0.02, (clientX - rect.left) / rect.width));
      els.after.style.clipPath = `inset(0 0 0 ${ratio * 100}%)`;
      els.handle.style.left = `${ratio * 100}%`;
    };
    let dragging = false;
    els.compare.addEventListener("pointerdown", (event) => {
      if (!state.stagedUrl) return;
      dragging = true;
      els.compare.setPointerCapture(event.pointerId);
      moveDivider(event.clientX);
    });
    els.compare.addEventListener("pointermove", (event) => {
      if (dragging) moveDivider(event.clientX);
    });
    els.compare.addEventListener("pointerup", () => { dragging = false; });
    els.compare.addEventListener("pointercancel", () => { dragging = false; });
  }

  function setTab(tab) {
    state.activeTab = tab;
    state.els.tabs.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.rgivTab === tab);
    });
    state.els.panels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.rgivPanel === tab);
    });
    if (tab === "tour") showPanorama(state.panoIndex);
  }

  function renderRoomChips(panoramas) {
    state.els.rooms.hidden = panoramas.length < 2;
    state.els.rooms.innerHTML = panoramas.map((pano, index) => `
      <button class="rg-immersive-room-chip ${index === state.panoIndex ? "is-active" : ""}" type="button" data-rgiv-room="${index}">
        ${esc(pano.label)}
      </button>
    `).join("");
  }

  async function showPanorama(index) {
    const panoramas = getPanoramas(state.property);
    if (!panoramas.length) return;
    state.panoIndex = Math.min(index, panoramas.length - 1);
    renderRoomChips(panoramas);

    try {
      await loadPannellum();
    } catch (error) {
      state.els.pano.innerHTML = `<div class="rg-immersive-compare-empty" style="position:static;height:100%"><i class="fa-solid fa-triangle-exclamation"></i><strong>${esc(error.message)}</strong></div>`;
      return;
    }

    if (state.panoViewer) {
      try { state.panoViewer.destroy(); } catch { /* already gone */ }
      state.panoViewer = null;
    }
    state.els.pano.innerHTML = "";
    state.panoViewer = window.pannellum.viewer(state.els.pano, {
      type: "equirectangular",
      panorama: panoramas[state.panoIndex].url,
      autoLoad: true,
      autoRotate: -2,
      showControls: false,
      compass: false,
      friction: 0.18
    });
  }

  function renderPhotoStrip() {
    const photos = getPhotos(state.property);
    state.els.photos.innerHTML = photos.map((photo, index) => `
      <button class="rg-immersive-photo-pick ${index === state.photoIndex ? "is-active" : ""}" type="button" data-rgiv-photo="${index}" title="${esc(photo.label)}">
        <img src="${esc(photo.url)}" alt="${esc(photo.label)}" loading="lazy">
      </button>
    `).join("");
  }

  function renderStyleChips() {
    state.els.styles.innerHTML = STAGING_STYLES.map((style) => `
      <button class="rg-immersive-style-chip ${style.value === state.styleValue ? "is-active" : ""}" type="button" data-rgiv-style="${esc(style.value)}">
        <i class="fa-solid ${style.icon}"></i> ${esc(style.label)}
      </button>
    `).join("");
  }

  function selectPhoto(index) {
    state.photoIndex = index;
    state.stagedUrl = "";
    renderPhotoStrip();
    syncCompare();
  }

  function selectStyle(value) {
    state.styleValue = value;
    renderStyleChips();
  }

  function setNote(message, tone = "") {
    state.els.note.className = `rg-immersive-staging-note ${tone}`;
    state.els.note.textContent = message;
  }

  function syncCompare() {
    const photos = getPhotos(state.property);
    const current = photos[state.photoIndex];
    const els = state.els;

    els.before.src = current ? current.url : "";
    if (state.stagedUrl) {
      els.after.src = state.stagedUrl;
      els.after.style.display = "";
      els.handle.style.display = "";
      els.empty.style.display = "none";
      els.after.style.clipPath = "inset(0 0 0 50%)";
      els.handle.style.left = "50%";
      els.download.href = state.stagedUrl;
      els.download.setAttribute("aria-disabled", "false");
    } else {
      els.after.style.display = "none";
      els.handle.style.display = "none";
      els.empty.style.display = "";
      els.download.setAttribute("aria-disabled", "true");
    }
  }

  async function generateStaging() {
    if (state.generating) return;
    const photos = getPhotos(state.property);
    const current = photos[state.photoIndex];
    if (!current) {
      setNote("This listing has no photos available for staging yet.", "is-error");
      return;
    }

    state.generating = true;
    const els = state.els;
    const originalLabel = els.generate.innerHTML;
    els.generate.disabled = true;
    els.generate.innerHTML = '<span class="rg-immersive-spinner"></span> Designing your room...';
    setNote("The AI is restaging the photo. This can take up to a minute.");

    try {
      const response = await fetch(state.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: current.url, style: state.styleValue })
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Staging failed. Please try again.");

      state.stagedUrl = payload.imageUrl || "";
      syncCompare();
      if (payload.demoMode) {
        setNote(payload.aiError || "Showing a style preview. Full AI staging arrives with agent-uploaded photos.", "is-demo");
      } else {
        setNote("Done. Drag the divider to compare original and staged.");
      }
    } catch (error) {
      setNote(error.message || "Staging failed. Please try again.", "is-error");
    } finally {
      state.generating = false;
      els.generate.disabled = false;
      els.generate.innerHTML = originalLabel;
    }
  }

  function open(property, options = {}) {
    if (!isAvailable(property)) return;
    const els = buildOverlay();

    state.property = property;
    if (options.apiUrl) state.apiUrl = options.apiUrl;
    state.panoIndex = 0;
    state.photoIndex = 0;
    state.stagedUrl = "";

    els.title.textContent = property.title || "Property";
    els.location.textContent = property.location || property.area || "";

    const hasPano = getPanoramas(property).length > 0;
    els.tabs.forEach((tab) => {
      if (tab.dataset.rgivTab === "tour") tab.hidden = !hasPano;
    });

    renderPhotoStrip();
    renderStyleChips();
    setNote("AI redesigns the photo while keeping the real room structure.");
    syncCompare();
    setTab(hasPano ? "tour" : "staging");

    document.body.style.overflow = "hidden";
    els.root.classList.add("is-open");
  }

  function close() {
    if (!state.els) return;
    state.els.root.classList.remove("is-open");
    document.body.style.overflow = "";
    if (state.panoViewer) {
      try { state.panoViewer.destroy(); } catch { /* already gone */ }
      state.panoViewer = null;
      state.els.pano.innerHTML = "";
    }
  }

  window.RGImmersiveView = { open, close, isAvailable };
})();
