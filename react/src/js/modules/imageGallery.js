import { apiFetch } from "../utils/fetch.js";

/**
 * Image Gallery Module — Full UI
 */
export function init() {
  const container = document.getElementById("imageGallery");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🖼️ Media Gallery</h2>
        <div style="display:flex; gap:8px;">
          <button id="gal-view-grid-btn" class="btn-primary" style="font-size:0.8rem; padding:0.3rem 0.6rem;">⊞ Grid</button>
          <button id="gal-view-list-btn" class="btn-glass" style="font-size:0.8rem; padding:0.3rem 0.6rem;">☰ List</button>
          <button class="btn-glass btn-back-dash">🏠 Home</button>
        </div>
      </div>

      <!-- Upload zone -->
      <div id="gal-dropzone" style="border:2px dashed var(--glass-border); border-radius:var(--border-radius-md); padding:1.5rem; text-align:center; cursor:pointer; margin-bottom:1.5rem; transition:var(--transition-fast); background:rgba(255,255,255,0.02);">
        <span style="font-size:2.5rem; display:block; margin-bottom:0.5rem;">📁</span>
        <span style="font-size:0.85rem; color:var(--text-secondary);">Drop images here or click to upload</span>
        <input type="file" id="gal-file-input" accept="image/*" multiple style="display:none;" />
      </div>

      <!-- Gallery grid -->
      <div id="gal-image-container" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:10px;">
        <!-- Render dynamically -->
      </div>

      <!-- Lightbox overlay -->
      <div id="gal-lightbox" style="display:none; position:fixed; inset:0; z-index:2000; background:rgba(0,0,0,0.9); backdrop-filter:blur(10px); display:none; align-items:center; justify-content:center; flex-direction:column; gap:1rem;">
        <button id="gal-lightbox-close" style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.15); border:none; color:white; font-size:1.5rem; cursor:pointer; border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">×</button>
        <img id="gal-lightbox-img" style="max-width:90vw; max-height:80vh; border-radius:8px; object-fit:contain; box-shadow:0 20px 60px rgba(0,0,0,0.8);" />
        <div id="gal-lightbox-caption" style="color:white; font-size:0.9rem; opacity:0.7;"></div>
      </div>
    </div>
  `;

  const dropzone = document.getElementById("gal-dropzone");
  const fileInput = document.getElementById("gal-file-input");
  const imageContainer = document.getElementById("gal-image-container");
  const lightbox = document.getElementById("gal-lightbox");
  const lightboxImg = document.getElementById("gal-lightbox-img");
  const lightboxCaption = document.getElementById("gal-lightbox-caption");
  const closeLightbox = document.getElementById("gal-lightbox-close");

  let savedImages = JSON.parse(localStorage.getItem("gallery_images") || "[]");

  // Seed with placeholder grid on first load
  if (savedImages.length === 0) {
    const placeholderSeeds = [237, 432, 128, 854, 612, 741, 389, 567];
    placeholderSeeds.forEach((seed, i) => {
      savedImages.push({ src: `https://picsum.photos/seed/${seed}/400/300`, name: `Gallery_Image_${i+1}.jpg` });
    });
    localStorage.setItem("gallery_images", JSON.stringify(savedImages));
  }

  function renderGallery() {
    imageContainer.innerHTML = "";
    if (savedImages.length === 0) {
      imageContainer.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:60px; grid-column:1/-1;">Drop images above to start your gallery.</p>`;
      return;
    }
    savedImages.forEach((img, i) => {
      const card = document.createElement("div");
      card.className = "card-glass anim-slide-up";
      card.style.cssText = "overflow:hidden; cursor:pointer; border-radius:var(--border-radius-md); position:relative; aspect-ratio:4/3;";
      card.innerHTML = `
        <img src="${img.src}" alt="${img.name}" loading="lazy" style="width:100%; height:100%; object-fit:cover; display:block; transition:transform 0.3s;" />
        <div class="gal-overlay" style="position:absolute; inset:0; background:rgba(0,0,0,0.6); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; opacity:0; transition:opacity 0.2s;">
          <span style="color:white; font-size:0.75rem; font-weight:600; text-align:center; padding:0 6px;">${img.name}</span>
          <button class="btn-glass gal-del-btn" data-idx="${i}" style="font-size:0.72rem; padding:2px 8px; color:var(--danger);">🗑️ Delete</button>
        </div>
      `;
      card.addEventListener("mouseenter", () => card.querySelector(".gal-overlay").style.opacity = "1");
      card.addEventListener("mouseleave", () => card.querySelector(".gal-overlay").style.opacity = "0");
      card.addEventListener("click", e => {
        if (e.target.classList.contains("gal-del-btn")) return;
        openLightbox(img.src, img.name);
      });
      card.querySelector(".gal-del-btn").addEventListener("click", e => {
        e.stopPropagation();
        savedImages.splice(i, 1);
        localStorage.setItem("gallery_images", JSON.stringify(savedImages));
        renderGallery();
      });
      imageContainer.appendChild(card);
    });
  }

  function openLightbox(src, name) {
    lightboxImg.src = src;
    lightboxCaption.textContent = name;
    lightbox.style.display = "flex";
  }

  closeLightbox.addEventListener("click", () => { lightbox.style.display = "none"; });
  lightbox.addEventListener("click", e => { if (e.target === lightbox) lightbox.style.display = "none"; });

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", e => { e.preventDefault(); dropzone.style.borderColor = "var(--primary)"; });
  dropzone.addEventListener("dragleave", () => { dropzone.style.borderColor = "var(--glass-border)"; });
  dropzone.addEventListener("drop", e => {
    e.preventDefault();
    dropzone.style.borderColor = "var(--glass-border)";
    Array.from(e.dataTransfer.files).forEach(f => { if (f.type.startsWith("image/")) readFile(f); });
  });

  fileInput.addEventListener("change", () => {
    Array.from(fileInput.files).forEach(f => readFile(f));
  });

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = e => {
      savedImages.push({ src: e.target.result, name: file.name });
      localStorage.setItem("gallery_images", JSON.stringify(savedImages));
      renderGallery();
      apiFetch("uploadFile", { base64: e.target.result.split(",")[1], filename: file.name, mimeType: file.type }).catch(err => console.error(err));
    };
    reader.readAsDataURL(file);
  }

  // View toggle
  document.getElementById("gal-view-grid-btn").addEventListener("click", () => {
    imageContainer.style.gridTemplateColumns = "repeat(auto-fill, minmax(160px, 1fr))";
  });
  document.getElementById("gal-view-list-btn").addEventListener("click", () => {
    imageContainer.style.gridTemplateColumns = "1fr";
  });

  renderGallery();
}
