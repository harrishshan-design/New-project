(function () {
  class PropertyARModule {
    constructor(config) {
      this.viewer = config.viewer;
      this.fallback = config.fallback;
      this.launchButton = config.launchButton;
      this.resetButton = config.resetButton;
      this.status = config.status;
      this.hiddenLaunch = config.hiddenLaunch || null;
      this.property = null;
      this.defaultCameraOrbit = "0deg 75deg 105%";
      this.defaultFieldOfView = "30deg";

      this.attachEvents();
      this.clear();
    }

    attachEvents() {
      if (this.viewer) {
        this.viewer.addEventListener("load", () => {
          if (!this.property?.modelUrl) return;
          this.setStatus(this.isMobile()
            ? "Model ready. Launch AR to place it in your space."
            : "Model ready. Rotate and zoom here, or use mobile for AR placement.",
          "ready");
        });

        this.viewer.addEventListener("error", () => {
          this.setStatus("Model failed to load. Try another property or refresh the view.", "error");
          this.showFallback("We could not load this property model right now.");
        });

        this.viewer.addEventListener("ar-status", (event) => {
          const status = event.detail.status;
          if (status === "session-started") {
            this.setStatus("Camera activated. Move your device and place the property model.", "live");
          } else if (status === "object-placed") {
            this.setStatus("Property placed. Pinch to zoom and drag to rotate.", "live");
          } else if (status === "failed") {
            this.setStatus("AR launch failed on this device. Use the 3D preview instead.", "error");
          } else if (status === "not-presenting") {
            this.setStatus(this.property?.modelUrl
              ? "AR session closed. You can relaunch or keep exploring in 3D."
              : "Waiting for a property model",
            this.property?.modelUrl ? "ready" : "");
          }
        });
      }

      if (this.launchButton) {
        this.launchButton.addEventListener("click", () => this.activate());
      }

      if (this.resetButton) {
        this.resetButton.addEventListener("click", () => this.resetView());
      }
    }

    setProperty(property) {
      this.property = property;

      if (!property?.modelUrl) {
        this.clear("This listing does not have an AR-ready model yet. Use the imagery and AI notes before booking.");
        return;
      }

      this.viewer.src = property.modelUrl;
      this.viewer.poster = property.image || "";
      this.viewer.alt = `${property.title} AR model`;
      this.viewer.cameraOrbit = this.defaultCameraOrbit;
      this.viewer.fieldOfView = this.defaultFieldOfView;
      this.showViewer();
      this.setEnabled(true);
      this.setStatus(this.isMobile()
        ? "Tap Launch AR to activate the camera and place the model."
        : "Preview the model here. On mobile, Launch AR opens placement mode.",
      "ready");
    }

    activate() {
      if (!this.property?.modelUrl) {
        this.setStatus("No AR model is available for this property yet.", "error");
        return;
      }

      this.setStatus("Launching camera and preparing floor placement...", "live");

      if (typeof this.viewer.activateAR === "function") {
        this.viewer.activateAR();
        return;
      }

      if (this.hiddenLaunch) {
        this.hiddenLaunch.click();
      }
    }

    resetView() {
      if (!this.property?.modelUrl) return;
      this.viewer.cameraOrbit = this.defaultCameraOrbit;
      this.viewer.fieldOfView = this.defaultFieldOfView;
      if (typeof this.viewer.jumpCameraToGoal === "function") {
        this.viewer.jumpCameraToGoal();
      }
      this.setStatus("3D preview reset. Rotate, zoom, or relaunch AR anytime.", "ready");
    }

    clear(message = "AR preview will appear here for supported listings.") {
      this.property = null;
      this.viewer.removeAttribute("src");
      this.viewer.poster = "";
      this.showFallback(message);
      this.setEnabled(false);
      this.setStatus("Waiting for a property model", "");
    }

    showFallback(message) {
      this.fallback.hidden = false;
      this.fallback.textContent = message;
    }

    showViewer() {
      this.fallback.hidden = true;
    }

    setEnabled(enabled) {
      this.launchButton.disabled = !enabled;
      this.resetButton.disabled = !enabled;
    }

    setStatus(message, tone) {
      this.status.textContent = message;
      this.status.classList.remove("is-ready", "is-live", "is-error");
      if (tone === "ready") this.status.classList.add("is-ready");
      if (tone === "live") this.status.classList.add("is-live");
      if (tone === "error") this.status.classList.add("is-error");
    }

    isMobile() {
      return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    }
  }

  window.PropertyARModule = PropertyARModule;
})();
