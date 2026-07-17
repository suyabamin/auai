import { apiFetch } from "../utils/fetch.js";

/**
 * Face Recognition — Biometric Security Key Module
 */
export function init() {
  const container = document.getElementById("faceRecognition");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🔑 Biometric Security Key</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12" style="gap:1.5rem;">
        <!-- Upload & scan -->
        <div style="grid-column:span 6; display:flex; flex-direction:column; gap:1rem; align-items:center;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary); width:100%;">Identify Person via Photo</h3>

          <!-- Upload box -->
          <div id="fr-dropzone" style="width:100%; height:220px; border:2px dashed var(--glass-border); border-radius:var(--border-radius-md); display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; position:relative; overflow:hidden; background:rgba(0,0,0,0.15);">
            <img id="fr-preview-img" style="display:none; width:100%; height:100%; object-fit:cover; border-radius:var(--border-radius-md);" />
            <div id="fr-dropzone-placeholder" style="text-align:center; pointer-events:none;">
              <span style="font-size:3rem; display:block;">👤</span>
              <span style="font-size:0.85rem; color:var(--text-secondary);">Upload or drop a face photo</span>
            </div>
            <!-- Scan overlay animation -->
            <div id="fr-scan-overlay" style="display:none; position:absolute; inset:0; pointer-events:none;">
              <div style="position:absolute; left:10%; right:10%; top:10%; bottom:10%; border:2px solid var(--primary); border-radius:8px; box-shadow:0 0 15px var(--primary-glow);"></div>
              <div id="fr-scanline" style="position:absolute; left:10%; right:10%; top:10%; height:3px; background:linear-gradient(90deg, transparent, var(--primary), transparent); animation:scanDown 2s linear infinite;"></div>
            </div>
            <input type="file" id="fr-file-input" accept="image/*" style="display:none;" />
          </div>

          <button id="fr-analyze-btn" class="btn-primary" style="width:100%; font-weight:700;" disabled>🔍 Analyze & Identify</button>
          <button id="fr-clear-btn" class="btn-glass" style="width:100%; font-size:0.85rem;" disabled>Clear Image</button>
        </div>

        <!-- Results panel -->
        <div style="grid-column:span 6; display:flex; flex-direction:column; gap:1rem; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Biometric Analysis Results</h3>

          <div id="fr-result-panel" class="card-glass" style="min-height:200px; background:rgba(0,0,0,0.2); padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem; justify-content:center; align-items:center; text-align:center;">
            <span style="font-size:3rem;">🔒</span>
            <p style="color:var(--text-muted); font-size:0.85rem;">Upload a face image and run analysis to see biometric results here.</p>
          </div>

          <!-- Access log -->
          <h4 style="font-size:0.85rem; font-weight:700; color:var(--text-secondary);">Access Log</h4>
          <div id="fr-log" style="display:flex; flex-direction:column; gap:6px; max-height:150px; overflow-y:auto; background:rgba(0,0,0,0.1); border-radius:8px; padding:0.5rem;">
            <p style="color:var(--text-muted); font-size:0.78rem; text-align:center;">No scan history yet.</p>
          </div>
        </div>
      </div>
    </div>
    <style>
      @keyframes scanDown {
        from { top: 10%; } to { top: calc(90% - 3px); }
      }
    </style>
  `;

  const dropzone = document.getElementById("fr-dropzone");
  const fileInput = document.getElementById("fr-file-input");
  const previewImg = document.getElementById("fr-preview-img");
  const placeholder = document.getElementById("fr-dropzone-placeholder");
  const scanOverlay = document.getElementById("fr-scan-overlay");
  const analyzeBtn = document.getElementById("fr-analyze-btn");
  const clearBtn = document.getElementById("fr-clear-btn");
  const resultPanel = document.getElementById("fr-result-panel");
  const logEl = document.getElementById("fr-log");

  const DATABASE = [
    { name: "Alex Commander", role: "Administrator", clearance: "Level 5", emoji: "👨‍💼" },
    { name: "Maria Vasquez", role: "Senior Engineer", clearance: "Level 4", emoji: "👩‍💻" },
    { name: "Unknown Visitor", role: "Unregistered", clearance: "None", emoji: "❓" }
  ];

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.style.borderColor = "var(--primary)"; });
  dropzone.addEventListener("dragleave", () => { dropzone.style.borderColor = "var(--glass-border)"; });
  dropzone.addEventListener("drop", e => {
    e.preventDefault(); dropzone.style.borderColor = "var(--glass-border)";
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) loadFile(f);
  });
  fileInput.addEventListener("change", () => { if (fileInput.files[0]) loadFile(fileInput.files[0]); });

  function loadFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      previewImg.src = e.target.result; previewImg.style.display = "block";
      placeholder.style.display = "none";
      analyzeBtn.disabled = false; clearBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }

  analyzeBtn.addEventListener("click", () => {
    analyzeBtn.disabled = true; analyzeBtn.textContent = "Scanning biometrics...";
    scanOverlay.style.display = "block";

    setTimeout(() => {
      scanOverlay.style.display = "none";
      analyzeBtn.textContent = "🔍 Analyze & Identify";
      analyzeBtn.disabled = false;

      // Simulate match (random)
      const match = DATABASE[Math.floor(Math.random() * DATABASE.length)];
      const granted = match.clearance !== "None";
      const timestamp = new Date().toLocaleTimeString();

      resultPanel.innerHTML = `
        <span style="font-size:3rem;">${match.emoji}</span>
        <h3 style="font-size:1.3rem; font-weight:800; color:${granted ? "var(--success)" : "var(--danger)"};">${match.name}</h3>
        <div class="badge" style="background:${granted ? "rgba(0,200,100,0.15)" : "rgba(255,60,60,0.15)"}; color:${granted ? "var(--success)" : "var(--danger)"}; padding:4px 12px; border-radius:20px; font-weight:700; font-size:0.85rem;">
          ${granted ? "✅ ACCESS GRANTED" : "🚫 ACCESS DENIED"}
        </div>
        <div style="display:flex; flex-direction:column; gap:4px; text-align:left; width:100%; font-size:0.82rem; margin-top:8px;">
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Role:</span><b>${match.role}</b></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Clearance:</span><b style="color:var(--primary);">${match.clearance}</b></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Confidence:</span><b style="color:var(--success);">${Math.floor(Math.random() * 15 + 83)}%</b></div>
          <div style="display:flex; justify-content:space-between;"><span style="color:var(--text-muted);">Scanned at:</span><b>${timestamp}</b></div>
        </div>
      `;

      // Add to log
      const logEntry = document.createElement("div");
      logEntry.style.cssText = `padding:4px 8px; border-radius:6px; background:${granted ? "rgba(0,200,100,0.08)" : "rgba(255,60,60,0.08)"}; font-size:0.75rem; display:flex; justify-content:space-between;`;
      logEntry.innerHTML = `<span>${granted ? "✅" : "🚫"} ${match.name}</span><span style="color:var(--text-muted);">${timestamp}</span>`;
      if (logEl.querySelector("p")) logEl.innerHTML = "";
      logEl.prepend(logEntry);

      apiFetch("faceRecognition", { name: match.name, granted }).catch(() => {});
    }, 2500);
  });

  clearBtn.addEventListener("click", () => {
    previewImg.style.display = "none"; previewImg.src = "";
    placeholder.style.display = "block";
    analyzeBtn.disabled = true; clearBtn.disabled = true;
    resultPanel.innerHTML = `<span style="font-size:3rem;">🔒</span><p style="color:var(--text-muted); font-size:0.85rem;">Upload a face image and run analysis.</p>`;
    fileInput.value = "";
  });
}
