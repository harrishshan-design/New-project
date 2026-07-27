(function () {
  const els = {
    form: document.getElementById("arForm"),
    roomUpload: document.getElementById("roomUpload"),
    style: document.getElementById("style"),
    sourcePreview: document.getElementById("sourcePreview"),
    preview: document.getElementById("preview"),
    previewEmpty: document.getElementById("previewEmpty"),
    statusText: document.getElementById("statusText"),
    generateButton: document.getElementById("generateButton"),
    saveButton: document.getElementById("saveButton"),
    downloadImage: document.getElementById("downloadImage"),
    copyPromptButton: document.getElementById("copyPromptButton"),
    furnitureViewer: document.getElementById("furnitureViewer")
  };

  const styleImages = {
    "modern luxury": "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=88",
    "minimalist condo": "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=88",
    "malaysian family home": "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1600&q=88"
  };

  let currentResult = null;
  let currentSourceDataUrl = "";

  function setStatus(message, tone) {
    if (!els.statusText) return;
    els.statusText.textContent = message;
    els.statusText.dataset.tone = tone || "default";
  }

  function setBusy(isBusy) {
    if (!els.generateButton) return;
    els.generateButton.disabled = isBusy;
    els.generateButton.innerHTML = isBusy
      ? '<i class="fa-solid fa-spinner fa-spin"></i> Generating staging...'
      : '<i class="fa-solid fa-wand-magic-sparkles"></i> Generate AI Staging';
  }

  function stagingPrompt(style) {
    return `Transform this empty property room into a ${style} staged interior for Malaysian property marketing. Keep the original room structure, windows, doors, walls, and lighting realistic. Add sofa, table, lighting, decor, and clean premium real estate presentation.`;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function renderResult(data) {
    const style = els.style.value;
    const imageUrl = data && data.imageUrl ? data.imageUrl : styleImages[style];
    currentResult = {
      id: data && data.id ? data.id : `local-${Date.now()}`,
      imageUrl,
      style,
      sourceImage: currentSourceDataUrl,
      prompt: data && data.prompt ? data.prompt : stagingPrompt(style),
      demoMode: !data || data.demoMode !== false
    };

    els.preview.src = imageUrl;
    els.previewEmpty.style.display = "none";
    els.downloadImage.href = imageUrl;
    els.downloadImage.setAttribute("aria-disabled", "false");
    setStatus(currentResult.demoMode
      ? "Demo staging generated. Connect OpenAI + Supabase Storage for real image edits."
      : "AI staging generated and ready for AR furniture placement.",
      currentResult.demoMode ? "demo" : "ok");
  }

  async function generateStaging() {
    const file = els.roomUpload.files[0];
    const style = els.style.value;

    if (!file) {
      alert("Upload a room photo first");
      return;
    }

    setBusy(true);
    setStatus("Uploading room photo and preparing staging prompt...", "loading");

    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("style", style);

      const res = await fetch("/api/ar/generate", {
        method: "POST",
        body: formData
      });

      if (!res.ok) throw new Error(`AR API returned ${res.status}`);
      const data = await res.json();
      renderResult(data);
    } catch (error) {
      console.warn("AR staging fallback used:", error);
      renderResult({
        imageUrl: styleImages[style],
        style,
        prompt: stagingPrompt(style),
        demoMode: true
      });
    } finally {
      setBusy(false);
    }
  }

  async function saveCurrentProject() {
    if (!currentResult) {
      setStatus("Generate a staged room before saving.", "warning");
      return;
    }

    try {
      setStatus("Saving AR staging project...", "loading");
      const response = await fetch("/api/ar/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentResult)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Save failed");
      setStatus(`Saved AR project ${data.id || currentResult.id}.`, "ok");
    } catch (error) {
      const localProjects = JSON.parse(localStorage.getItem("rg_ar_projects") || "[]");
      const saved = { ...currentResult, id: currentResult.id || `local-${Date.now()}`, savedAt: new Date().toISOString() };
      localProjects.unshift(saved);
      localStorage.setItem("rg_ar_projects", JSON.stringify(localProjects.slice(0, 20)));
      setStatus("Saved locally. Backend save can be connected later.", "demo");
    }
  }

  async function copyPrompt() {
    const prompt = stagingPrompt(els.style.value);
    try {
      await navigator.clipboard.writeText(prompt);
      setStatus("Staging prompt copied.", "ok");
    } catch {
      setStatus(prompt, "demo");
    }
  }

  els.roomUpload.addEventListener("change", async () => {
    const file = els.roomUpload.files[0];
    if (!file) return;
    currentSourceDataUrl = await readFileAsDataUrl(file);
    els.sourcePreview.src = currentSourceDataUrl;
    setStatus("Room photo loaded. Choose a style and generate staging.", "ok");
  });

  els.form.addEventListener("submit", (event) => {
    event.preventDefault();
    generateStaging();
  });

  els.saveButton.addEventListener("click", saveCurrentProject);
  els.copyPromptButton.addEventListener("click", copyPrompt);

  document.querySelectorAll("[data-model]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-model]").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      if (els.furnitureViewer) els.furnitureViewer.src = button.dataset.model;
    });
  });

  window.generateStaging = generateStaging;
})();
