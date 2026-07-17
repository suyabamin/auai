/**
 * Barcode Generator — Full glassmorphic UI
 */
export function init() {
  const container = document.getElementById("barcodeGenerator");
  if (!container) return;

  const BARCODE_TYPES = [
    { label: "Code 128", type: "C128", desc: "Standard alphanumeric barcode" },
    { label: "Code 39", type: "C39", desc: "Industrial & logistics use" },
    { label: "EAN-13", type: "EAN13", desc: "Retail product scanning" },
    { label: "UPC-A", type: "UPCA", desc: "North American retail" },
    { label: "ISBN-13", type: "ISBN13", desc: "Book identification" }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width:620px; margin:0 auto;">
      <div class="module-header">
        <h2 class="module-title">🔢 Barcode Generator Studio</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Type selector -->
      <div style="margin-bottom:1.25rem;">
        <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Barcode Format</label>
        <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;" id="bc-type-btns">
          ${BARCODE_TYPES.map((t, i) => `<button class="btn-glass bc-type-btn" data-type="${t.type}" data-idx="${i}" style="font-size:0.8rem;">${t.label}</button>`).join("")}
        </div>
      </div>

      <!-- Input & Options row -->
      <div class="grid-12" style="gap:1rem; margin-bottom:1.25rem;">
        <div style="grid-column:span 8; display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Barcode Data</label>
          <input id="bc-data-input" class="input-glass" style="font-size:1rem;" placeholder="Enter text, numbers, product code..." value="1234567890128" />
          <div id="bc-format-hint" style="font-size:0.72rem; color:var(--text-muted);">Code 128 — Standard alphanumeric barcode</div>
        </div>
        <div style="grid-column:span 4; display:flex; flex-direction:column; gap:4px;">
          <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Bar Color</label>
          <input type="color" id="bc-color" value="#000000" style="width:100%; height:40px; border:none; border-radius:8px; cursor:pointer; background:none;" />
        </div>
      </div>

      <!-- Generate button -->
      <button id="bc-generate-btn" class="btn-primary" style="width:100%; padding:0.75rem; font-size:1rem; font-weight:700; margin-bottom:1.5rem;">Generate Barcode</button>

      <!-- Preview output -->
      <div class="card-glass" style="background:white; padding:1.5rem; text-align:center; border-radius:10px; min-height:140px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1rem;" id="bc-output-area">
        <p style="color:#888; font-size:0.85rem;">Barcode preview will appear here</p>
      </div>

      <!-- Action buttons -->
      <div style="display:flex; gap:10px; margin-top:1rem;" id="bc-action-btns" style="display:none;">
        <a id="bc-download-btn" class="btn-glass" style="flex:1; text-align:center; text-decoration:none; font-size:0.85rem; display:none; align-items:center; justify-content:center; gap:6px;">⬇️ Download PNG</a>
        <button id="bc-copy-url-btn" class="btn-glass" style="flex:1; font-size:0.85rem; display:none;">📋 Copy Image URL</button>
      </div>
    </div>
  `;

  let selectedType = "C128";
  const typeBtns = document.querySelectorAll(".bc-type-btn");

  typeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      typeBtns.forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-glass"); });
      btn.classList.add("btn-primary"); btn.classList.remove("btn-glass");
      selectedType = btn.dataset.type;
      const info = BARCODE_TYPES[parseInt(btn.dataset.idx)];
      document.getElementById("bc-format-hint").textContent = `${info.label} — ${info.desc}`;
    });
  });

  // Activate first by default
  typeBtns[0].classList.add("btn-primary"); typeBtns[0].classList.remove("btn-glass");

  document.getElementById("bc-generate-btn").addEventListener("click", () => {
    const data = document.getElementById("bc-data-input").value.trim();
    const color = document.getElementById("bc-color").value.replace("#", "");
    if (!data) return;

    const outputArea = document.getElementById("bc-output-area");
    outputArea.innerHTML = `<p style="color:#666; font-size:0.85rem;">Generating ${selectedType} barcode...</p>`;

    // Use Tec-It free barcode API
    const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(data)}&code=${selectedType}&dpi=96&unit=Fit&color=${color}&bgcolor=FFFFFF&frame=0`;

    const img = document.createElement("img");
    img.src = barcodeUrl;
    img.alt = "Generated Barcode";
    img.style.cssText = "max-width:100%; height:auto; border-radius:4px;";
    img.onload = () => {
      outputArea.innerHTML = "";
      outputArea.appendChild(img);
      const dataLabel = document.createElement("p");
      dataLabel.style.cssText = "font-size:0.85rem; color:#333; margin:0; font-family:monospace;";
      dataLabel.textContent = data;
      outputArea.appendChild(dataLabel);

      // Download link
      const dlBtn = document.getElementById("bc-download-btn");
      dlBtn.href = barcodeUrl;
      dlBtn.download = `barcode_${selectedType}.png`;
      dlBtn.style.display = "flex";

      const copyBtn = document.getElementById("bc-copy-url-btn");
      copyBtn.style.display = "block";
      copyBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(barcodeUrl).then(() => {
          copyBtn.textContent = "✅ Copied!";
          setTimeout(() => { copyBtn.textContent = "📋 Copy Image URL"; }, 2000);
        });
      });
    };
    img.onerror = () => {
      outputArea.innerHTML = `<p style="color:#c00; font-size:0.85rem;">⚠️ Failed to generate barcode. Check your data format matches the barcode type (e.g. EAN-13 requires exactly 12 digits).</p>`;
    };
  });
}
