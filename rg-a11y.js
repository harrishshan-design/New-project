/* RealityGenius accessibility bootstrap.
   Fixes cross-page WCAG 2.2 patterns without touching page logic:
   - inputs/textareas that rely on placeholder text get an aria-label
   - icon-only .close-button elements get an accessible name
   - decorative Font Awesome icons inside buttons/links are hidden from
     the accessibility tree so screen readers skip the glyphs */
(function () {
  function labelFromPlaceholder(field) {
    if (field.getAttribute("aria-label") || field.getAttribute("aria-labelledby")) return;
    if (field.id && document.querySelector(`label[for="${CSS.escape(field.id)}"]`)) return;
    const wrapper = field.closest("label");
    if (wrapper && wrapper.textContent.trim()) return;
    const placeholder = field.getAttribute("placeholder");
    if (placeholder && placeholder.trim()) field.setAttribute("aria-label", placeholder.trim());
  }

  function apply() {
    document.querySelectorAll("input[placeholder], textarea[placeholder]").forEach(labelFromPlaceholder);

    document.querySelectorAll("button.close-button:not([aria-label])").forEach((button) => {
      button.setAttribute("aria-label", "Close");
    });

    document
      .querySelectorAll("button i[class*='fa-'], a i[class*='fa-'], summary i[class*='fa-']")
      .forEach((icon) => icon.setAttribute("aria-hidden", "true"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
  window.addEventListener("load", apply);
  window.RGA11y = { apply };
})();
