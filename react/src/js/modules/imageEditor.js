/**
 * Image Editor — Full Canvas-based editor with filters and transforms
 */
export function init() {
  const container = document.getElementById("imageEditor");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🎨 Image Editor Studio</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12" style="gap:1rem;">
        <!-- Canvas area left -->
        <div style="grid-column:span 8; display:flex; flex-direction:column; gap:1rem; align-items:center;">
          <!-- Upload zone -->
          <div id="ie-dropzone" style="width:100%; min-height:50px; border:2px dashed var(--glass-border); border-radius:8px; display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; padding:0.75rem; background:rgba(255,255,255,0.02);">
            <input type="file" id="ie-file-input" accept="image/*" style="display:none;" />
            <span style="font-size:1.25rem;">📁</span>
            <span style="font-size:0.85rem; color:var(--text-secondary);">Click or drag to upload image</span>
          </div>

          <!-- Canvas -->
          <div style="background:#111; border-radius:8px; overflow:hidden; width:100%; display:flex; align-items:center; justify-content:center; min-height:240px; position:relative;">
            <canvas id="ie-canvas" style="max-width:100%; max-height:400px; display:block; border-radius:4px;"></canvas>
            <p id="ie-canvas-placeholder" style="position:absolute; color:#555; font-size:0.85rem; user-select:none;">Upload an image to edit</p>
          </div>

          <!-- Adjustments sliders -->
          <div id="ie-sliders" style="width:100%; display:grid; grid-template-columns:1fr 1fr; gap:10px; display:none;">
            <div style="display:flex; flex-direction:column; gap:3px;">
              <label style="font-size:0.75rem; color:var(--text-muted);">Brightness: <span id="lbl-brightness">100%</span></label>
              <input type="range" id="sl-brightness" min="0" max="200" value="100" style="accent-color:var(--primary);" />
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
              <label style="font-size:0.75rem; color:var(--text-muted);">Contrast: <span id="lbl-contrast">100%</span></label>
              <input type="range" id="sl-contrast" min="0" max="200" value="100" style="accent-color:var(--primary);" />
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
              <label style="font-size:0.75rem; color:var(--text-muted);">Saturation: <span id="lbl-saturation">100%</span></label>
              <input type="range" id="sl-saturation" min="0" max="200" value="100" style="accent-color:var(--primary);" />
            </div>
            <div style="display:flex; flex-direction:column; gap:3px;">
              <label style="font-size:0.75rem; color:var(--text-muted);">Blur: <span id="lbl-blur">0px</span></label>
              <input type="range" id="sl-blur" min="0" max="20" value="0" style="accent-color:var(--primary);" />
            </div>
          </div>
        </div>

        <!-- Tools sidebar right -->
        <div style="grid-column:span 4; display:flex; flex-direction:column; gap:1rem; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Filters</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <button class="btn-glass ie-filter-btn" data-filter="none" style="font-size:0.75rem; padding:0.5rem;">🔲 Original</button>
            <button class="btn-glass ie-filter-btn" data-filter="grayscale" style="font-size:0.75rem; padding:0.5rem;">⬛ Grayscale</button>
            <button class="btn-glass ie-filter-btn" data-filter="sepia" style="font-size:0.75rem; padding:0.5rem;">🟫 Sepia</button>
            <button class="btn-glass ie-filter-btn" data-filter="invert" style="font-size:0.75rem; padding:0.5rem;">🔄 Invert</button>
            <button class="btn-glass ie-filter-btn" data-filter="blur" style="font-size:0.75rem; padding:0.5rem;">🌫️ Blur</button>
            <button class="btn-glass ie-filter-btn" data-filter="saturate" style="font-size:0.75rem; padding:0.5rem;">🌈 Vivid</button>
          </div>

          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Transforms</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <button class="btn-glass ie-transform" id="ie-rotate-left" style="font-size:0.75rem; padding:0.5rem;">↺ Rotate L</button>
            <button class="btn-glass ie-transform" id="ie-rotate-right" style="font-size:0.75rem; padding:0.5rem;">↻ Rotate R</button>
            <button class="btn-glass ie-transform" id="ie-flip-h" style="font-size:0.75rem; padding:0.5rem;">↔️ Flip H</button>
            <button class="btn-glass ie-transform" id="ie-flip-v" style="font-size:0.75rem; padding:0.5rem;">↕️ Flip V</button>
          </div>

          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Export</h3>
          <button id="ie-download-btn" class="btn-primary" style="font-size:0.85rem; padding:0.6rem;" disabled>⬇️ Download Edited PNG</button>
          <button id="ie-reset-btn" class="btn-glass" style="font-size:0.85rem; color:var(--danger);" disabled>↺ Reset All</button>

          <div id="ie-image-info" style="font-size:0.72rem; color:var(--text-muted); margin-top:auto; padding:0.5rem; background:rgba(0,0,0,0.15); border-radius:8px; display:none;">
            <div id="ie-info-text"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const canvas = document.getElementById("ie-canvas");
  const ctx = canvas.getContext("2d");
  const placeholder = document.getElementById("ie-canvas-placeholder");
  const dropzone = document.getElementById("ie-dropzone");
  const fileInput = document.getElementById("ie-file-input");
  const downloadBtn = document.getElementById("ie-download-btn");
  const resetBtn = document.getElementById("ie-reset-btn");
  const sliders = document.getElementById("ie-sliders");
  const infoBox = document.getElementById("ie-image-info");
  const infoText = document.getElementById("ie-info-text");

  let originalImage = null, currentFilter = "none";
  let rotation = 0, flipH = false, flipV = false;
  let brightness = 100, contrast = 100, saturation = 100, blur = 0;

  // Drop/upload handler
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.style.borderColor = "var(--primary)"; });
  dropzone.addEventListener("dragleave", () => { dropzone.style.borderColor = "var(--glass-border)"; });
  dropzone.addEventListener("drop", e => {
    e.preventDefault(); dropzone.style.borderColor = "var(--glass-border)";
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) loadImage(f);
  });
  fileInput.addEventListener("change", () => { if (fileInput.files[0]) loadImage(fileInput.files[0]); });

  function loadImage(file) {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        originalImage = img;
        canvas.width = img.width; canvas.height = img.height;
        placeholder.style.display = "none";
        sliders.style.display = "grid";
        infoBox.style.display = "block";
        infoText.textContent = `${img.width}×${img.height}px · ${(file.size / 1024).toFixed(1)} KB`;
        downloadBtn.disabled = false; resetBtn.disabled = false;
        renderCanvas();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function renderCanvas() {
    if (!originalImage) return;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    const filterStr = buildFilterStr();
    ctx.filter = filterStr;
    ctx.drawImage(originalImage, -originalImage.width / 2, -originalImage.height / 2);
    ctx.restore();
  }

  function buildFilterStr() {
    let f = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) blur(${blur}px)`;
    if (currentFilter === "grayscale") f += " grayscale(100%)";
    else if (currentFilter === "sepia") f += " sepia(100%)";
    else if (currentFilter === "invert") f += " invert(100%)";
    else if (currentFilter === "blur") f = `blur(8px) ${f}`;
    else if (currentFilter === "saturate") f = `saturate(200%) ${f}`;
    return f;
  }

  // Filter buttons
  document.querySelectorAll(".ie-filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".ie-filter-btn").forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-glass"); });
      btn.classList.add("btn-primary"); btn.classList.remove("btn-glass");
      currentFilter = btn.dataset.filter;
      renderCanvas();
    });
  });

  // Transform buttons
  document.getElementById("ie-rotate-left").addEventListener("click", () => { rotation = (rotation - 90 + 360) % 360; renderCanvas(); });
  document.getElementById("ie-rotate-right").addEventListener("click", () => { rotation = (rotation + 90) % 360; renderCanvas(); });
  document.getElementById("ie-flip-h").addEventListener("click", () => { flipH = !flipH; renderCanvas(); });
  document.getElementById("ie-flip-v").addEventListener("click", () => { flipV = !flipV; renderCanvas(); });

  // Sliders
  function bindSlider(id, varName, suffix, labelId) {
    const el = document.getElementById(id);
    el.addEventListener("input", () => {
      if (varName === "brightness") brightness = parseInt(el.value);
      else if (varName === "contrast") contrast = parseInt(el.value);
      else if (varName === "saturation") saturation = parseInt(el.value);
      else if (varName === "blur") blur = parseInt(el.value);
      document.getElementById(labelId).textContent = el.value + suffix;
      renderCanvas();
    });
  }
  bindSlider("sl-brightness", "brightness", "%", "lbl-brightness");
  bindSlider("sl-contrast", "contrast", "%", "lbl-contrast");
  bindSlider("sl-saturation", "saturation", "%", "lbl-saturation");
  bindSlider("sl-blur", "blur", "px", "lbl-blur");

  // Download
  downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "edited_image.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    rotation = 0; flipH = false; flipV = false;
    brightness = 100; contrast = 100; saturation = 100; blur = 0;
    currentFilter = "none";
    ["sl-brightness","sl-contrast","sl-saturation"].forEach(id => document.getElementById(id).value = 100);
    document.getElementById("sl-blur").value = 0;
    ["lbl-brightness","lbl-contrast","lbl-saturation"].forEach(id => document.getElementById(id).textContent = "100%");
    document.getElementById("lbl-blur").textContent = "0px";
    document.querySelectorAll(".ie-filter-btn").forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-glass"); });
    renderCanvas();
  });
}
