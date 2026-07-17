import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise QR & Barcode Generator module.
 */
export function init() {
  const container = document.getElementById("qrGenerator");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width: 500px; margin: 0 auto;">
      <div class="module-header">
        <h2 class="module-title">🔗 QR & Barcode Generator</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1rem; align-items: center; justify-content: center; padding: 1rem 0;">
        
        <!-- Toggle switches -->
        <div style="display: flex; gap: 10px; width: 100%;">
          <button id="qr-toggle-qr" class="btn-glass active" style="flex: 1; padding: 0.4rem 0;">QR Code Mode</button>
          <button id="qr-toggle-bar" class="btn-glass" style="flex: 1; padding: 0.4rem 0;">Barcode Mode</button>
        </div>

        <div style="width: 100%; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
          <label style="color: var(--text-secondary); font-weight: 600;">Content to Encode (Text / URL / SKU)</label>
          <input type="text" id="qr-content-input" class="input-glass" placeholder="Type text value here..." value="https://google.com" />
        </div>

        <!-- Render Target Frame -->
        <div id="qr-image-frame" style="width: 220px; height: 220px; border: 2px solid var(--glass-border); border-radius: var(--border-radius-md); background: rgba(255,255,255,0.03); display: flex; align-items: center; justify-content: center; overflow: hidden; box-shadow: 0 8px 30px var(--primary-glow); margin: 0.5rem 0;">
          <img id="qr-output-img" style="max-width: 90%; max-height: 90%; display: none; filter: drop-shadow(0 0 5px rgba(255,255,255,0.2)); border-radius: 4px;" />
          <span id="qr-frame-placeholder" style="color: var(--text-muted); font-size: 0.85rem;">Generate Code Preview</span>
        </div>

        <div style="display: flex; gap: 10px; width: 100%;">
          <button id="qr-generate-btn" class="btn-primary" style="flex: 1; font-weight: 700;">Generate Output</button>
          <button id="qr-download-btn" class="btn-glass" style="display: none;">💾 Download</button>
        </div>
      </div>
    </div>
  `;

  const btnQR = document.getElementById("qr-toggle-qr");
  const btnBar = document.getElementById("qr-toggle-bar");
  const content = document.getElementById("qr-content-input");
  const framePlaceholder = document.getElementById("qr-frame-placeholder");
  const outputImg = document.getElementById("qr-output-img");
  const genBtn = document.getElementById("qr-generate-btn");
  const downloadBtn = document.getElementById("qr-download-btn");

  let activeMode = "qr"; // qr or barcode

  btnQR.addEventListener("click", () => {
    btnQR.classList.add("active");
    btnBar.classList.remove("active");
    activeMode = "qr";
    content.placeholder = "Type text to encode as QR...";
  });

  btnBar.addEventListener("click", () => {
    btnBar.classList.add("active");
    btnQR.classList.remove("active");
    activeMode = "barcode";
    content.placeholder = "Type SKU / Numbers to encode as Barcode...";
  });

  genBtn.addEventListener("click", () => {
    const textVal = content.value.trim();
    if (!textVal) return;

    genBtn.disabled = true;
    genBtn.textContent = "Encoding data...";
    framePlaceholder.textContent = "Loading pixels...";
    outputImg.style.display = "none";
    downloadBtn.style.display = "none";

    let url = "";

    if (activeMode === "qr") {
      // Free QR API
      url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(textVal)}`;
    } else {
      // Free Barcode API (using canvas/api tool barcode generator)
      url = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(textVal)}&code=Code128&translate-esc=on`;
    }

    // Assign image source loader
    outputImg.src = url;
    outputImg.onload = () => {
      framePlaceholder.style.display = "none";
      outputImg.style.display = "block";
      downloadBtn.style.display = "block";
      genBtn.disabled = false;
      genBtn.textContent = "Generate Output";

      // Sync backend
      apiFetch("qrGenerator", { text: textVal, mode: activeMode })
        .catch(err => console.error(err));
    };

    outputImg.onerror = () => {
      framePlaceholder.style.display = "block";
      framePlaceholder.textContent = "Generation failed. Verify input.";
      genBtn.disabled = false;
      genBtn.textContent = "Generate Output";
    };
  });

  downloadBtn.addEventListener("click", () => {
    const src = outputImg.src;
    if (!src) return;
    
    // Attempt download file bridge
    const a = document.createElement("a");
    a.href = src;
    a.target = "_blank";
    a.download = `${activeMode}_code_${Date.now()}.png`;
    a.click();
  });
}
