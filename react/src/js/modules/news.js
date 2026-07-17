import { apiFetch } from "../utils/fetch.js";

/**
 * News Widget Module — Compact headlines panel
 */
export function init() {
  const container = document.getElementById("news");
  if (!container) return;

  const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";
  const FEEDS = [
    { label: "🌍 BBC World", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { label: "💻 TechCrunch", url: "https://techcrunch.com/feed/" },
    { label: "🏆 Sports", url: "https://www.espn.com/espn/rss/news" }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📰 Live News Widget</h2>
        <div style="display:flex; gap:8px;">
          <button id="news-widget-refresh" class="btn-glass" style="font-size:0.8rem;">🔄</button>
          <button class="btn-glass btn-back-dash">🏠 Home</button>
        </div>
      </div>

      <!-- Feed tabs -->
      <div style="display:flex; gap:6px; margin-bottom:1rem;" id="news-widget-tabs">
        ${FEEDS.map((f, i) => `<button class="btn-glass nw-tab" data-idx="${i}" style="font-size:0.8rem;">${f.label}</button>`).join("")}
      </div>

      <!-- Headlines list -->
      <div id="news-widget-headlines" style="display:flex; flex-direction:column; gap:8px; max-height:480px; overflow-y:auto;">
        <p style="color:var(--text-muted); text-align:center; padding:60px 0;">Loading headlines...</p>
      </div>

      <p style="font-size:0.7rem; color:var(--text-muted); margin-top:1rem; text-align:center;">Powered by RSS2JSON free API</p>
    </div>
  `;

  let activeIdx = 0;
  const tabs = document.querySelectorAll(".nw-tab");
  const headlinesEl = document.getElementById("news-widget-headlines");

  function setTab(idx) {
    activeIdx = idx;
    tabs.forEach((t, i) => {
      t.classList.toggle("btn-primary", i === idx);
      t.classList.toggle("btn-glass", i !== idx);
    });
    loadFeed(idx);
  }

  tabs.forEach(t => t.addEventListener("click", () => setTab(parseInt(t.dataset.idx))));
  document.getElementById("news-widget-refresh").addEventListener("click", () => setTab(activeIdx));

  function loadFeed(idx) {
    headlinesEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:40px 0;">Loading ${FEEDS[idx].label}...</p>`;
    fetch(`${RSS_PROXY}${encodeURIComponent(FEEDS[idx].url)}`)
      .then(r => r.json())
      .then(data => {
        headlinesEl.innerHTML = "";
        const items = (data.items || []).slice(0, 12);
        if (!items.length) { headlinesEl.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:40px 0;">No articles loaded.</p>`; return; }
        items.forEach(item => {
          const card = document.createElement("a");
          card.href = item.link || "#";
          card.target = "_blank";
          card.rel = "noopener noreferrer";
          card.className = "card-glass anim-slide-up";
          card.style.cssText = "padding:0.75rem; display:flex; gap:12px; background:rgba(0,0,0,0.15); text-decoration:none; border-color:var(--glass-border); transition:var(--transition-fast);";
          const pub = item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "";
          const thumb = item.thumbnail || item.enclosure?.link || "";
          card.innerHTML = `
            ${thumb ? `<img src="${thumb}" style="width:65px; height:55px; object-fit:cover; border-radius:6px; flex-shrink:0;" loading="lazy" />` : `<div style="width:65px; height:55px; background:rgba(255,255,255,0.05); border-radius:6px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:1.5rem;">📰</div>`}
            <div style="flex:1; overflow:hidden;">
              <p style="font-size:0.85rem; font-weight:700; line-height:1.4; color:var(--text-primary); margin:0 0 4px;">${item.title}</p>
              <span style="font-size:0.7rem; color:var(--text-muted);">${pub}${item.author ? " · " + item.author : ""}</span>
            </div>
          `;
          headlinesEl.appendChild(card);
        });
      })
      .catch(() => {
        headlinesEl.innerHTML = "";
        const mocks = ["AI Systems Break New Records in Performance Benchmarks","Tech Giants Invest Billions in Quantum Computing","Global Climate Summit Reaches Historic Agreement","Scientists Discover New Exoplanet in Habitable Zone","Space Tourism Reaches New Altitude Milestone"];
        mocks.forEach(t => {
          const card = document.createElement("div");
          card.className = "card-glass";
          card.style.cssText = "padding:0.75rem; background:rgba(0,0,0,0.15); display:flex; gap:12px;";
          card.innerHTML = `<span style="font-size:1.5rem; flex-shrink:0;">📰</span><p style="font-size:0.85rem; font-weight:600; margin:0; line-height:1.4;">${t}</p>`;
          headlinesEl.appendChild(card);
        });
      });
  }

  setTab(0);
}
