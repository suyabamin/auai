/**
 * Screen Capture Module — Full glassmorphic UI using html2canvas + Screen API
 */
export function init() {
  const container = document.getElementById("screenshot");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📸 Screen Capture Studio</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Mode selector -->
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:1.5rem;">
        <div id="sc-mode-screen" class="card-glass" style="padding:1.25rem; text-align:center; cursor:pointer; border-color:var(--primary); background:var(--primary-glow);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">🖥️</div>
          <div style="font-size:0.85rem; font-weight:700; color:var(--primary);">Screen Capture</div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">Capture full browser tab</div>
        </div>
        <div id="sc-mode-region" class="card-glass" style="padding:1.25rem; text-align:center; cursor:pointer; background:rgba(0,0,0,0.15);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">✂️</div>
          <div style="font-size:0.85rem; font-weight:700;">Timed Capture</div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">3-second countdown snap</div>
        </div>
        <div id="sc-mode-upload" class="card-glass" style="padding:1.25rem; text-align:center; cursor:pointer; background:rgba(0,0,0,0.15);">
          <div style="font-size:2rem; margin-bottom:0.5rem;">📁</div>
          <div style="font-size:0.85rem; font-weight:700;">Upload Screenshot</div>
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:4px;">Import existing image</div>
        </div>
      </div>

      <!-- Capture Controls -->
      <div style="display:flex; gap:10px; margin-bottom:1.5rem; flex-wrap:wrap; align-items:center;">
        <button id="sc-capture-btn" class="btn-primary" style="flex:1; min-width:160px; padding:0.75rem; font-weight:700; font-size:1rem;">📸 Capture Now</button>
        <button id="sc-timed-btn" class="btn-glass" style="min-width:140px; padding:0.75rem; font-size:0.9rem;">⏱️ 3s Timer</button>
        <input type="file" id="sc-upload-input" accept="image/*" style="display:none;" />
        <button id="sc-upload-btn" class="btn-glass" style="min-width:140px; padding:0.75rem; font-size:0.9rem;">📁 Import Image</button>
      </div>

      <!-- Countdown display -->
      <div id="sc-countdown" style="display:none; text-align:center; margin-bottom:1rem;">
        <div id="sc-count-num" style="font-size:5rem; font-weight:800; color:var(--primary); animation:pulseDot 1s infinite; text-shadow:0 0 20px var(--primary-glow);">3</div>
        <p style="color:var(--text-muted); font-size:0.85rem;">Switch to the window you want to capture...</p>
      </div>

      <!-- Preview area -->
      <div class="card-glass" id="sc-preview-area" style="background:#111; border-radius:10px; min-height:250px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem; overflow:hidden; padding:1rem;">
        <span style="font-size:3rem; color:var(--text-muted);">📷</span>
        <p style="color:var(--text-muted); font-size:0.85rem;">Capture a screenshot to see it here</p>
      </div>

      <!-- Action buttons (hidden until capture done) -->
      <div id="sc-actions" style="display:none; flex; gap:10px; margin-top:1rem;">
        <a id="sc-download-btn" class="btn-primary" style="flex:1; text-align:center; text-decoration:none; font-size:0.9rem; padding:0.6rem; display:flex; align-items:center; justify-content:center; gap:6px;" download="screenshot.png">⬇️ Download PNG</a>
        <button id="sc-copy-btn" class="btn-glass" style="flex:1; font-size:0.9rem; padding:0.6rem;">📋 Copy to Clipboard</button>
        <button id="sc-clear-btn" class="btn-glass" style="font-size:0.9rem; padding:0.6rem; color:var(--danger);">🗑️ Clear</button>
      </div>
    </div>
  `;

  const captureBtn = document.getElementById("sc-capture-btn");
  const timedBtn = document.getElementById("sc-timed-btn");
  const uploadInput = document.getElementById("sc-upload-input");
  const uploadBtn = document.getElementById("sc-upload-btn");
  const previewArea = document.getElementById("sc-preview-area");
  const actionsEl = document.getElementById("sc-actions");
  const downloadBtn = document.getElementById("sc-download-btn");
  const copyBtn = document.getElementById("sc-copy-btn");
  const clearBtn = document.getElementById("sc-clear-btn");
  const countdownEl = document.getElementById("sc-countdown");
  const countNum = document.getElementById("sc-count-num");

  let capturedDataUrl = null;

  async function captureScreen() {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      alert("Screen capture requires a modern browser (Chrome/Edge) and HTTPS. Alternatively, use the Import Image option.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }, audio: false });
      const track = stream.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const bitmap = await imageCapture.grabFrame();
      track.stop();

      const offCanvas = document.createElement("canvas");
      offCanvas.width = bitmap.width; offCanvas.height = bitmap.height;
      offCanvas.getContext("2d").drawImage(bitmap, 0, 0);
      capturedDataUrl = offCanvas.toDataURL("image/png");
      showPreview(capturedDataUrl, `${bitmap.width}×${bitmap.height}px captured`);
    } catch (err) {
      if (err.name !== "NotAllowedError") {
        console.error("Screen capture error:", err);
        alert("Capture failed. Use the Import Image option instead.");
      }
    }
  }

  captureBtn.addEventListener("click", captureScreen);

  timedBtn.addEventListener("click", () => {
    countdownEl.style.display = "block"; countNum.textContent = "3"; let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count <= 0) { clearInterval(interval); countdownEl.style.display = "none"; captureScreen(); }
      else countNum.textContent = count;
    }, 1000);
  });

  uploadBtn.addEventListener("click", () => uploadInput.click());
  uploadInput.addEventListener("change", () => {
    const f = uploadInput.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => { capturedDataUrl = e.target.result; showPreview(capturedDataUrl, f.name); };
    reader.readAsDataURL(f);
  });

  function showPreview(src, label) {
    previewArea.innerHTML = "";
    const img = document.createElement("img");
    img.src = src;
    img.style.cssText = "max-width:100%; max-height:400px; border-radius:8px; object-fit:contain; display:block;";
    previewArea.appendChild(img);
    const lbl = document.createElement("p");
    lbl.textContent = label;
    lbl.style.cssText = "font-size:0.75rem; color:var(--text-muted); margin:0.5rem 0 0;";
    previewArea.appendChild(lbl);

    downloadBtn.href = src;
    actionsEl.style.display = "flex";
  }

  copyBtn.addEventListener("click", async () => {
    if (!capturedDataUrl) return;
    try {
      const resp = await fetch(capturedDataUrl);
      const blob = await resp.blob();
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      copyBtn.textContent = "✅ Copied!";
      setTimeout(() => { copyBtn.textContent = "📋 Copy to Clipboard"; }, 2000);
    } catch { copyBtn.textContent = "❌ Failed (HTTPS required)"; setTimeout(() => { copyBtn.textContent = "📋 Copy to Clipboard"; }, 2500); }
  });

  clearBtn.addEventListener("click", () => {
    capturedDataUrl = null;
    previewArea.innerHTML = `<span style="font-size:3rem; color:var(--text-muted);">📷</span><p style="color:var(--text-muted); font-size:0.85rem;">Capture a screenshot to see it here</p>`;
    actionsEl.style.display = "none";
  });
}
