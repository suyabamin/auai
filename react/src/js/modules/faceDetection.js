import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise face detection module.
 */
export function init() {
  const container = document.getElementById("faceDetection");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">👤 Face Biometrics Detector</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Visual scanner layout -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; gap: 1rem; align-items: center;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700; width: 100%;">Scanner Viewport</h3>
          
          <div style="position: relative; width: 100%; height: 300px; border-radius: var(--border-radius-md); border: 2px solid var(--glass-border); background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <video id="face-video" style="width: 100%; height: 100%; object-fit: cover; display: none;" autoplay playsinline></video>
            
            <div id="face-camera-placeholder" style="text-align: center;">
              <span style="font-size: 4rem; display: block; margin-bottom: 0.5rem; filter: grayscale(1);">📷</span>
              <button id="face-camera-on-btn" class="btn-primary">Activate Scanner Video</button>
            </div>

            <!-- Glowing Scan Line animation overlay -->
            <div id="scan-line" style="display: none; position: absolute; left: 0; width: 100%; height: 4px; background: linear-gradient(to bottom, transparent, var(--primary), transparent); box-shadow: 0 0 15px var(--primary); animation: floatElement 2.5s ease-in-out infinite;"></div>
            
            <!-- Dynamic scanning overlay outline target -->
            <div id="scan-target" style="display: none; position: absolute; border: 2px dashed var(--primary); border-radius: 50%; width: 160px; height: 160px; box-shadow: 0 0 0 1000px rgba(0,0,0,0.5);"></div>
          </div>

          <div style="display: flex; gap: 10px; width: 100%;">
            <button id="face-scan-btn" class="btn-primary" style="flex: 1;" disabled>
              Scan Face Metrics
            </button>
            <button id="face-camera-off-btn" class="btn-glass" style="display: none;" title="Toggle Camera Off">
              Deactivate
            </button>
          </div>
        </div>

        <!-- Scanning logs -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Biometrics Log</h3>
          
          <div id="face-biometric-details" class="card-glass" style="background: rgba(0, 0, 0, 0.2); border-color: var(--glass-border); padding: 1.25rem; min-height: 250px; font-family: monospace; font-size: 0.85rem; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
            <p style="color: var(--text-muted);">[System Status: Offline]</p>
            <p style="color: var(--text-muted);">Please activate the camera scanner feedback to initiate biometrics read loops.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const video = document.getElementById("face-video");
  const placeholder = document.getElementById("face-camera-placeholder");
  const onBtn = document.getElementById("face-camera-on-btn");
  const offBtn = document.getElementById("face-camera-off-btn");
  const scanBtn = document.getElementById("face-scan-btn");
  const scanLine = document.getElementById("scan-line");
  const scanTarget = document.getElementById("scan-target");
  const logPanel = document.getElementById("face-biometric-details");

  let stream = null;

  onBtn.addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        stream = s;
        video.srcObject = s;
        video.style.display = "block";
        placeholder.style.display = "none";
        offBtn.style.display = "block";
        scanBtn.disabled = false;
        scanLine.style.display = "block";
        scanTarget.style.display = "block";
        
        logPanel.innerHTML = `
          <p style="color: var(--primary);">[SYSTEM INITIATING]</p>
          <p style="color: var(--success); font-weight: bold;">Camera Stream Online.</p>
          <p>Align face inside the target coordinates dashed circle to analyze facial keys.</p>
        `;
      })
      .catch(err => {
        console.error("Camera access failed:", err);
        alert("Camera access denied or device not found.");
      });
  });

  offBtn.addEventListener("click", () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
      video.style.display = "none";
      placeholder.style.display = "block";
      offBtn.style.display = "none";
      scanBtn.disabled = true;
      scanLine.style.display = "none";
      scanTarget.style.display = "none";
      logPanel.innerHTML = `
        <p style="color: var(--text-muted);">[System Status: Offline]</p>
        <p style="color: var(--text-muted);">Please activate camera scanner feedback to initiate biometrics read loops.</p>
      `;
    }
  });

  scanBtn.addEventListener("click", () => {
    scanBtn.disabled = true;
    scanBtn.textContent = "Analyzing biometrics...";
    logPanel.innerHTML += `<p style="color: var(--warning);">[SCAN RUNNING] Generating coordinate maps...</p>`;

    // Capture visual snapshot and sync with Apps Script
    setTimeout(() => {
      // Mock biometrics response
      const randomFaceId = "FACE-ACC-" + Math.floor(Math.random() * 90000 + 10000);
      logPanel.innerHTML = `
        <p style="color: var(--success); font-weight:bold;">[BIOMETRIC SCAN COMPLETED]</p>
        <p>User Identity Matching: <b>Terminal Commander (Lead Architect)</b></p>
        <p>Biometrics Database ID: <code>${randomFaceId}</code></p>
        <p>Facial Symmetry: 99.8% Match</p>
        <p>Confidence scale: 99.98% accurate</p>
        <p>Security Clearance: LEVEL 5 (Administrator)</p>
        <p style="color: var(--success);">✓ Verification successful</p>
      `;
      scanBtn.disabled = false;
      scanBtn.textContent = "Scan Face Metrics";

      // Sync backend
      apiFetch("faceDetection", { status: "scanned", faceId: randomFaceId })
        .catch(err => console.error(err));
    }, 1500);
  });
}
