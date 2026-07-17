import { apiFetch } from "../utils/fetch.js";

/**
 * File Manager Module — Full glassmorphic UI
 */
export function init() {
  const container = document.getElementById("fileManager");
  if (!container) return;

  const FILE_ICONS = {
    pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", gif: "🖼️", webp: "🖼️",
    mp3: "🎵", mp4: "🎬", wav: "🎵", mov: "🎬",
    zip: "📦", rar: "📦", txt: "📃", js: "💻", html: "🌐",
    css: "🎨", json: "⚙️", default: "📁"
  };

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📁 File Manager & Drive</h2>
        <div style="display:flex; gap:8px;">
          <button id="fm-view-grid" class="btn-primary" style="font-size:0.8rem; padding:0.3rem 0.6rem;">⊞ Grid</button>
          <button id="fm-view-list" class="btn-glass" style="font-size:0.8rem; padding:0.3rem 0.6rem;">☰ List</button>
          <button class="btn-glass btn-back-dash">🏠 Home</button>
        </div>
      </div>

      <!-- Stats row -->
      <div class="grid-12" style="margin-bottom:1.25rem; gap:10px;">
        <div class="card-glass" style="grid-column:span 4; padding:0.75rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div id="fm-total-files" style="font-size:1.5rem; font-weight:800; color:var(--primary);">0</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Total Files</div>
        </div>
        <div class="card-glass" style="grid-column:span 4; padding:0.75rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div id="fm-total-size" style="font-size:1.5rem; font-weight:800; color:var(--secondary);">0 KB</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Total Size</div>
        </div>
        <div class="card-glass" style="grid-column:span 4; padding:0.75rem; background:rgba(0,0,0,0.2);">
          <div style="display:flex; gap:8px; align-items:center; height:100%;">
            <input type="file" id="fm-upload-input" multiple style="display:none;" />
            <button id="fm-upload-btn" class="btn-primary" style="width:100%; font-size:0.85rem; font-weight:700;">⬆️ Upload Files</button>
          </div>
        </div>
      </div>

      <!-- Search + filter -->
      <div style="display:flex; gap:10px; margin-bottom:1rem;">
        <input id="fm-search-input" class="input-glass" style="flex:1;" placeholder="Search files by name or type..." />
        <select id="fm-type-filter" class="input-glass" style="min-width:130px;">
          <option value="all">All Types</option>
          <option value="image">🖼️ Images</option>
          <option value="document">📄 Documents</option>
          <option value="audio">🎵 Audio</option>
          <option value="video">🎬 Video</option>
        </select>
      </div>

      <!-- File display area -->
      <div id="fm-file-area" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:10px; min-height:200px;">
        <p style="color:var(--text-muted); text-align:center; padding:60px; grid-column:1/-1; font-size:0.9rem;">Upload files to get started. Files are managed locally in session.</p>
      </div>
    </div>
  `;

  let files = [];
  let viewMode = "grid";

  const fileArea = document.getElementById("fm-file-area");
  const uploadInput = document.getElementById("fm-upload-input");
  const uploadBtn = document.getElementById("fm-upload-btn");
  const searchInput = document.getElementById("fm-search-input");
  const typeFilter = document.getElementById("fm-type-filter");
  const totalFilesEl = document.getElementById("fm-total-files");
  const totalSizeEl = document.getElementById("fm-total-size");

  uploadBtn.addEventListener("click", () => uploadInput.click());

  uploadInput.addEventListener("change", () => {
    Array.from(uploadInput.files).forEach(f => {
      const reader = new FileReader();
      reader.onload = e => {
        files.push({
          id: Date.now() + Math.random(),
          name: f.name,
          size: f.size,
          type: f.type,
          ext: f.name.split(".").pop().toLowerCase(),
          src: e.target.result,
          date: new Date().toLocaleDateString()
        });
        updateStats();
        renderFiles();
        apiFetch("uploadFile", { base64: e.target.result.split(",")[1] || "", filename: f.name, mimeType: f.type }).catch(err => console.warn(err));
      };
      reader.readAsDataURL(f);
    });
  });

  // Drag-and-drop on the whole area
  fileArea.addEventListener("dragover", e => { e.preventDefault(); fileArea.style.borderColor = "var(--primary)"; });
  fileArea.addEventListener("dragleave", () => { fileArea.style.borderColor = ""; });
  fileArea.addEventListener("drop", e => {
    e.preventDefault(); fileArea.style.borderColor = "";
    uploadInput.files = e.dataTransfer.files;
    uploadInput.dispatchEvent(new Event("change"));
  });

  searchInput.addEventListener("input", renderFiles);
  typeFilter.addEventListener("change", renderFiles);

  document.getElementById("fm-view-grid").addEventListener("click", () => {
    viewMode = "grid";
    fileArea.style.gridTemplateColumns = "repeat(auto-fill, minmax(140px, 1fr))";
    document.getElementById("fm-view-grid").classList.add("btn-primary");
    document.getElementById("fm-view-grid").classList.remove("btn-glass");
    document.getElementById("fm-view-list").classList.remove("btn-primary");
    document.getElementById("fm-view-list").classList.add("btn-glass");
  });

  document.getElementById("fm-view-list").addEventListener("click", () => {
    viewMode = "list";
    fileArea.style.gridTemplateColumns = "1fr";
    document.getElementById("fm-view-list").classList.add("btn-primary");
    document.getElementById("fm-view-list").classList.remove("btn-glass");
    document.getElementById("fm-view-grid").classList.remove("btn-primary");
    document.getElementById("fm-view-grid").classList.add("btn-glass");
  });

  function getFileCategory(f) {
    const img = ["jpg","jpeg","png","gif","webp","svg","bmp"];
    const doc = ["pdf","doc","docx","txt","xls","xlsx","ppt","pptx","csv"];
    const aud = ["mp3","wav","aac","ogg","flac"];
    const vid = ["mp4","mov","avi","mkv","webm"];
    if (img.includes(f.ext)) return "image";
    if (doc.includes(f.ext)) return "document";
    if (aud.includes(f.ext)) return "audio";
    if (vid.includes(f.ext)) return "video";
    return "other";
  }

  function renderFiles() {
    const q = searchInput.value.toLowerCase();
    const type = typeFilter.value;
    const filtered = files.filter(f => {
      const matchName = f.name.toLowerCase().includes(q);
      const matchType = type === "all" || getFileCategory(f) === type;
      return matchName && matchType;
    });

    fileArea.innerHTML = "";
    if (filtered.length === 0) {
      fileArea.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:60px; grid-column:1/-1;">${files.length === 0 ? "Upload files to get started." : "No files match your filter."}</p>`;
      return;
    }

    filtered.forEach(f => {
      const icon = FILE_ICONS[f.ext] || FILE_ICONS.default;
      const card = document.createElement("div");
      card.className = "card-glass anim-slide-up";

      if (viewMode === "grid") {
        card.style.cssText = "padding:1rem; text-align:center; cursor:pointer; position:relative; overflow:hidden;";
        const isImage = ["jpg","jpeg","png","gif","webp"].includes(f.ext);
        card.innerHTML = `
          ${isImage ? `<img src="${f.src}" style="width:100%; height:80px; object-fit:cover; border-radius:6px; margin-bottom:0.5rem;" loading="lazy" />` : `<div style="font-size:3rem; margin-bottom:0.5rem;">${icon}</div>`}
          <div style="font-size:0.75rem; font-weight:700; word-break:break-all; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${f.name}</div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">${formatSize(f.size)}</div>
          <div style="position:absolute; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; gap:8px; opacity:0; transition:opacity 0.2s;" class="fm-hover-overlay">
            <a href="${f.src}" download="${f.name}" class="btn-glass" style="font-size:0.72rem; padding:4px 8px; text-decoration:none;">⬇️</a>
            <button class="btn-glass fm-del-btn" style="font-size:0.72rem; padding:4px 8px; color:var(--danger);" data-id="${f.id}">🗑️</button>
          </div>
        `;
        card.addEventListener("mouseenter", () => card.querySelector(".fm-hover-overlay").style.opacity = "1");
        card.addEventListener("mouseleave", () => card.querySelector(".fm-hover-overlay").style.opacity = "0");
      } else {
        card.style.cssText = "padding:0.75rem 1rem; display:flex; align-items:center; gap:12px; background:rgba(0,0,0,0.15);";
        card.innerHTML = `
          <span style="font-size:1.75rem; flex-shrink:0;">${icon}</span>
          <div style="flex:1; overflow:hidden;">
            <div style="font-size:0.85rem; font-weight:700; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${f.name}</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">${formatSize(f.size)} · ${f.date}</div>
          </div>
          <a href="${f.src}" download="${f.name}" class="btn-glass" style="font-size:0.72rem; padding:4px 8px; text-decoration:none; flex-shrink:0;">⬇️ Download</a>
          <button class="btn-glass fm-del-btn" style="font-size:0.72rem; padding:4px 8px; color:var(--danger); flex-shrink:0;" data-id="${f.id}">🗑️</button>
        `;
      }

      card.querySelector(".fm-del-btn")?.addEventListener("click", e => {
        e.stopPropagation();
        files = files.filter(file => file.id !== f.id);
        updateStats(); renderFiles();
        apiFetch("deleteFile", { filename: f.name }).catch(err => console.warn(err));
      });

      fileArea.appendChild(card);
    });
  }

  function updateStats() {
    totalFilesEl.textContent = files.length;
    const totalBytes = files.reduce((s, f) => s + f.size, 0);
    totalSizeEl.textContent = formatSize(totalBytes);
  }

  function formatSize(bytes) {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  }

  // Load previously listed files from backend
  apiFetch("listFiles", {}).then(res => {
    if (res && res.files) {
      files = res.files.map(f => ({ ...f, id: Date.now() + Math.random(), ext: (f.name || "").split(".").pop().toLowerCase(), date: new Date().toLocaleDateString() }));
      updateStats(); renderFiles();
    }
  }).catch(() => {});
}
