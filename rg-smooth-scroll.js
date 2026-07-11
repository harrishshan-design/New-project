(function () {
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lenisSource = "./js/vendor/lenis.min.js";
  const preventSelector = [
    "[data-lenis-prevent]",
    ".modal-backdrop",
    ".modal-card",
    ".drawer",
    ".review-drawer",
    ".drawer-body",
    ".drawer-list",
    ".sidebar",
    ".toast",
    "textarea",
    "select",
    "input",
    "[contenteditable='true']"
  ].join(",");

  function injectStyles() {
    if (document.getElementById("rgSmoothScrollStyles")) return;
    const style = document.createElement("style");
    style.id = "rgSmoothScrollStyles";
    style.textContent = `
      html.lenis, html.lenis body { height: auto; }
      .lenis.lenis-smooth { scroll-behavior: auto !important; }
      .lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
      .lenis.lenis-stopped { overflow: clip; }
      .rg-scroll-rail {
        position: fixed;
        z-index: 70;
        right: 18px;
        top: 50%;
        width: 4px;
        height: min(220px, 32vh);
        transform: translateY(-50%);
        border-radius: 999px;
        background: rgba(246, 241, 230, .16);
        box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 18px 60px rgba(0,0,0,.25);
        pointer-events: none;
        overflow: hidden;
      }
      .rg-scroll-rail::before {
        content: "";
        position: absolute;
        inset: 0;
        transform: scaleY(var(--rg-scroll-progress, 0));
        transform-origin: top;
        border-radius: inherit;
        background: linear-gradient(180deg, #fff8e7, #f6d27a 54%, #7dd3fc);
        box-shadow: 0 0 22px rgba(246,210,122,.62);
      }
      .rg-scroll-orb {
        position: fixed;
        z-index: 69;
        right: 9px;
        top: calc(50% - min(110px, 16vh) + (min(220px, 32vh) * var(--rg-scroll-progress, 0)));
        width: 22px;
        height: 22px;
        transform: translateY(-50%);
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #fff, #f6d27a 46%, rgba(246,210,122,.1) 70%);
        box-shadow: 0 0 28px rgba(246,210,122,.45);
        pointer-events: none;
        opacity: .9;
      }
      .rg-scroll-ready .smooth-reveal:not(.is-visible) {
        opacity: 0;
        transform: translateY(28px) scale(.985);
      }
      .rg-scroll-ready .smooth-reveal.is-visible {
        opacity: 1;
        transform: translateY(0) scale(1);
        transition: opacity .8s ease, transform .8s cubic-bezier(.2,.8,.2,1);
      }
      @media (max-width: 760px) {
        .rg-scroll-rail, .rg-scroll-orb { display: none; }
      }
      @media (prefers-reduced-motion: reduce) {
        .rg-scroll-rail, .rg-scroll-orb { display: none; }
        .smooth-reveal { opacity: 1 !important; transform: none !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureRail() {
    if (reduceMotion || document.querySelector(".rg-scroll-rail")) return;
    const rail = document.createElement("div");
    rail.className = "rg-scroll-rail";
    rail.setAttribute("aria-hidden", "true");
    const orb = document.createElement("div");
    orb.className = "rg-scroll-orb";
    orb.setAttribute("aria-hidden", "true");
    document.body.append(rail, orb);
  }

  function setProgress(scrollValue) {
    const scrollTop = Number(scrollValue || window.scrollY || 0);
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    root.style.setProperty("--rg-scroll-progress", String(Math.min(1, Math.max(0, scrollTop / maxScroll))));
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${src}"]`);
      if (existing) {
        existing.addEventListener("load", resolve, { once: true });
        existing.addEventListener("error", reject, { once: true });
        if (window.Lenis) resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function scrollToHash(hash) {
    if (!hash || hash === "#") return false;
    const target = document.querySelector(hash);
    if (!target) return false;
    const offset = window.innerWidth < 760 ? 72 : 88;
    if (window.__rgLenis) {
      window.__rgLenis.scrollTo(target, { offset: -offset, duration: 1.2 });
    } else {
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    return true;
  }

  function bindAnchorFallback() {
    document.addEventListener("click", (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || link.closest("[data-lenis-prevent]")) return;
      const href = link.getAttribute("href");
      if (!href || href === "#") return;
      const url = new URL(href, window.location.href);
      if (url.pathname !== window.location.pathname) return;
      if (!scrollToHash(url.hash)) return;
      event.preventDefault();
      history.pushState(null, "", url.hash);
    });
  }

  function initReveals() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    const revealSelector = [
      ".hero-panel",
      ".template-marquee",
      ".template-services",
      ".auction-night-section",
      ".trust-band",
      ".recommendation-section",
      ".personalized-section",
      ".feed-section",
      ".saved-section",
      ".site-footer",
      ".agentos-public-nav",
      ".agentos-public-hero",
      ".agentos-media-card",
      ".agentos-logo-strip",
      ".agentos-section",
      ".agentos-reality-section",
      ".agentos-process-section",
      ".agentos-pricing-section",
      ".agentos-use-cases",
      ".agentos-faq",
      ".agentos-final-cta",
      ".section-panel",
      ".panel",
      ".hero",
      ".agentos-top-nav",
      ".agentos-logo-strip",
      ".story-panel",
      ".auth-panel",
      ".cinematic-section"
    ].join(", ");

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    document.querySelectorAll(revealSelector).forEach((section) => {
      if (section.classList.contains("is-visible")) return;
      section.classList.add("smooth-reveal");
      observer.observe(section);
    });
  }

  function initLenis() {
    if (window.__rgLenis) {
      root.classList.add("rg-scroll-ready", "rg-lenis-active");
      if (typeof window.__rgLenis.on === "function") {
        window.__rgLenis.on("scroll", ({ scroll }) => setProgress(scroll));
      }
      setProgress(window.__rgLenis.scroll);
      initReveals();
      return;
    }

    if (reduceMotion || !window.Lenis) {
      root.classList.add("rg-scroll-ready");
      setProgress();
      initReveals();
      return;
    }

    const lenis = new Lenis({
      anchors: {
        offset: window.innerWidth < 760 ? -72 : -88
      },
      duration: 1.08,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1,
      prevent: (node) => Boolean(node && node.closest && node.closest(preventSelector))
    });

    window.__rgLenis = lenis;
    root.classList.add("rg-scroll-ready", "rg-lenis-active");
    lenis.on("scroll", ({ scroll }) => setProgress(scroll));

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    window.addEventListener("resize", () => {
      lenis.resize();
      setProgress(lenis.scroll);
    }, { passive: true });

    initReveals();
    setProgress(lenis.scroll);
  }

  function boot() {
    injectStyles();
    ensureRail();
    bindAnchorFallback();

    if (reduceMotion) {
      root.classList.add("rg-scroll-ready");
      initReveals();
      return;
    }

    loadScript(lenisSource)
      .then(initLenis)
      .catch(() => {
        root.classList.add("rg-scroll-ready", "rg-lenis-fallback");
        initReveals();
        setProgress();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot, { once: true });
  } else {
    boot();
  }
})();
