import { apiFetch } from "../utils/fetch.js";

/**
 * Google Search Hub Module
 */
export function init() {
  const container = document.getElementById("googleSearch");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🔍 Smart Search Hub</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Search Engines Toggle -->
      <div style="display:flex; gap:8px; margin-bottom:1rem; flex-wrap:wrap;">
        <button class="btn-primary search-engine-btn" data-engine="google" style="font-size:0.85rem; display:flex; align-items:center; gap:6px;">🔍 Google</button>
        <button class="btn-glass search-engine-btn" data-engine="youtube" style="font-size:0.85rem; display:flex; align-items:center; gap:6px;">📺 YouTube</button>
        <button class="btn-glass search-engine-btn" data-engine="github" style="font-size:0.85rem; display:flex; align-items:center; gap:6px;">💻 GitHub</button>
        <button class="btn-glass search-engine-btn" data-engine="stackoverflow" style="font-size:0.85rem; display:flex; align-items:center; gap:6px;">💬 StackOverflow</button>
        <button class="btn-glass search-engine-btn" data-engine="mdn" style="font-size:0.85rem; display:flex; align-items:center; gap:6px;">📚 MDN Docs</button>
      </div>

      <!-- Search Bar -->
      <div style="display:flex; gap:10px; margin-bottom:1.5rem;">
        <input id="gsearch-input" class="input-glass" style="flex:1; font-size:1rem;" placeholder="Search the web..." />
        <button id="gsearch-btn" class="btn-primary" style="min-width:100px;">Search</button>
      </div>

      <!-- Quick Links Grid -->
      <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.75rem;">🚀 Quick Links</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:10px; margin-bottom:1.5rem;">
        <a href="https://google.com" target="_blank" class="card-glass" style="padding:0.75rem; text-align:center; cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:4px; background:rgba(0,0,0,0.2);">
          <span style="font-size:1.75rem;">🔍</span>
          <span style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Google</span>
        </a>
        <a href="https://github.com" target="_blank" class="card-glass" style="padding:0.75rem; text-align:center; cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:4px; background:rgba(0,0,0,0.2);">
          <span style="font-size:1.75rem;">💻</span>
          <span style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">GitHub</span>
        </a>
        <a href="https://stackoverflow.com" target="_blank" class="card-glass" style="padding:0.75rem; text-align:center; cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:4px; background:rgba(0,0,0,0.2);">
          <span style="font-size:1.75rem;">💬</span>
          <span style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Stack Overflow</span>
        </a>
        <a href="https://developer.mozilla.org" target="_blank" class="card-glass" style="padding:0.75rem; text-align:center; cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:4px; background:rgba(0,0,0,0.2);">
          <span style="font-size:1.75rem;">📚</span>
          <span style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">MDN Web Docs</span>
        </a>
        <a href="https://www.youtube.com" target="_blank" class="card-glass" style="padding:0.75rem; text-align:center; cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:4px; background:rgba(0,0,0,0.2);">
          <span style="font-size:1.75rem;">📺</span>
          <span style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">YouTube</span>
        </a>
        <a href="https://www.wikipedia.org" target="_blank" class="card-glass" style="padding:0.75rem; text-align:center; cursor:pointer; text-decoration:none; display:flex; flex-direction:column; align-items:center; gap:4px; background:rgba(0,0,0,0.2);">
          <span style="font-size:1.75rem;">📖</span>
          <span style="font-size:0.78rem; font-weight:600; color:var(--text-primary);">Wikipedia</span>
        </a>
      </div>

      <p style="font-size:0.78rem; color:var(--text-muted);">Searches open in a new browser tab. Use the engine toggles above to switch providers.</p>
    </div>
  `;

  let activeEngine = "google";
  const engineUrls = {
    google: q => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
    youtube: q => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
    github: q => `https://github.com/search?q=${encodeURIComponent(q)}`,
    stackoverflow: q => `https://stackoverflow.com/search?q=${encodeURIComponent(q)}`,
    mdn: q => `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(q)}`
  };

  const engineBtns = document.querySelectorAll(".search-engine-btn");
  engineBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      engineBtns.forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-glass"); });
      btn.classList.remove("btn-glass");
      btn.classList.add("btn-primary");
      activeEngine = btn.dataset.engine;
    });
  });

  const input = document.getElementById("gsearch-input");
  const btn = document.getElementById("gsearch-btn");

  function doSearch() {
    const q = input.value.trim();
    if (!q) return;
    const url = engineUrls[activeEngine](q);
    window.open(url, "_blank");
  }

  btn.addEventListener("click", doSearch);
  input.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });
}
