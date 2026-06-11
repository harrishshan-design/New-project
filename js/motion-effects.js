(function () {
  function prefersReducedMotion() {
    return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  function isCompactMotion() {
    return Boolean(window.matchMedia?.("(max-width: 700px), (pointer: coarse)")?.matches);
  }

  function initHeroSceneMotion() {
    const scene = document.getElementById("aiScene");
    const shell = document.getElementById("heroScene");
    const demoButton = document.getElementById("watchDemoButton");
    const demoRibbon = document.getElementById("demoRibbon");
    if (!scene || !shell) return;

    let frame = 0;
    const resetParallax = () => {
      scene.style.setProperty("--mx", "0");
      scene.style.setProperty("--my", "0");
    };

    if (!prefersReducedMotion() && !isCompactMotion()) {
      shell.addEventListener("pointermove", (event) => {
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(() => {
          const rect = shell.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
          const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
          scene.style.setProperty("--mx", x.toFixed(3));
          scene.style.setProperty("--my", y.toFixed(3));
        });
      });
      shell.addEventListener("pointerleave", resetParallax);
    }

    demoButton?.addEventListener("click", () => {
      scene.classList.add("scene-demo-pulse");
      if (demoRibbon) {
        demoRibbon.innerHTML = '<i class="fa-solid fa-circle-nodes"></i>Demo: AI ranks listings, checks trust, and routes each role securely';
      }
      document.getElementById("loginId")?.focus({ preventScroll: false });
      window.setTimeout(() => scene.classList.remove("scene-demo-pulse"), 2200);
    });
  }

  function initScrollReveal() {
    const targets = document.querySelectorAll(".hero-copy, .ai-scene, .auth-card");
    if (!targets.length) return;

    targets.forEach((target) => target.classList.add("js-reveal"));

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      targets.forEach((target) => target.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18 }
    );

    targets.forEach((target) => observer.observe(target));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initHeroSceneMotion();
    initScrollReveal();
  });
})();
