import { apiFetch } from "../utils/fetch.js";

/**
 * News Aggregator Module — Full UI
 */
export function init() {
  const container = document.getElementById("newsAggregator");
  if (!container) return;

  // Free RSS-to-JSON proxy sources (no API key needed)
  const FEEDS = [
    { label: "🌍 BBC World", url: "https://feeds.bbci.co.uk/news/rss.xml" },
    { label: "💻 Tech Crunch", url: "https://techcrunch.com/feed/" },
    { label: "📡 Reuters", url: "https://feeds.reuters.com/reuters/topNews" },
    { label: "🤖 AI News", url: "https://feeds.feedburner.com/nvidiablog" }
  ];
  const RSS_PROXY = "https://api.rss2json.com/v1/api.json?rss_url=";

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📰 News Aggregation Hub</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Feed Selector row -->
      <div style="display:flex; gap:8px; margin-bottom:1rem; flex-wrap:wrap;" id="news-feed-tabs">
        ${FEEDS.map((f, i) => `<button class="btn-glass news-tab-btn" data-idx="${i}" style="font-size:0.8rem;">${f.label}</button>`).join("")}
        <button id="news-refresh-btn" class="btn-glass" style="margin-left:auto; font-size:0.8rem;">🔄 Refresh</button>
      </div>

      <!-- Article view grid -->
      <div class="grid-12" style="gap:1rem;">
        <!-- List left -->
        <div style="grid-column:span 5; display:flex; flex-direction:column; gap:8px; max-height:450px; overflow-y:auto;" id="news-articles-list">
          <p style="color:var(--text-muted); text-align:center; padding-top:80px;">Loading headlines...</p>
        </div>

        <!-- Article preview right -->
        <div style="grid-column:span 7;" id="news-article-preview">
          <div class="card-glass" style="background:rgba(0,0,0,0.15); min-height:350px; padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
            <h3 id="news-preview-title" style="font-size:1.2rem; font-weight:800; line-height:1.4;">Select an article</h3>
            <p id="news-preview-meta" style="font-size:0.72rem; color:var(--text-muted);"></p>
            <p id="news-preview-body" style="font-size:0.9rem; line-height:1.7; color:var(--text-secondary); flex:1; overflow-y:auto; max-height:200px;">
              Click any headline from the list to read a preview here.
            </p>
            <a id="news-preview-link" href="#" target="_blank" class="btn-glass" style="display:none; font-size:0.8rem; width:fit-content;">Read Full Article →</a>
          </div>
        </div>
      </div>
    </div>
  `;

  let activeFeedIdx = 0;
  const tabBtns = document.querySelectorAll(".news-tab-btn");
  const articlesList = document.getElementById("news-articles-list");
  const previewTitle = document.getElementById("news-preview-title");
  const previewMeta = document.getElementById("news-preview-meta");
  const previewBody = document.getElementById("news-preview-body");
  const previewLink = document.getElementById("news-preview-link");

  function setActiveTab(idx) {
    tabBtns.forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-glass"); });
    tabBtns[idx].classList.add("btn-primary");
    tabBtns[idx].classList.remove("btn-glass");
    activeFeedIdx = idx;
    loadFeed(idx);
  }

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => setActiveTab(parseInt(btn.dataset.idx)));
  });
  document.getElementById("news-refresh-btn").addEventListener("click", () => setActiveTab(activeFeedIdx));

  function loadFeed(idx) {
    articlesList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding-top:80px;">Fetching headlines...</p>`;
    const feedUrl = FEEDS[idx].url;

    fetch(`${RSS_PROXY}${encodeURIComponent(feedUrl)}`)
      .then(r => r.json())
      .then(data => {
        articlesList.innerHTML = "";
        const items = data.items || [];

        if (items.length === 0) {
          articlesList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding-top:80px;">No articles found</p>`;
          return;
        }

        items.slice(0, 15).forEach(item => {
          const card = document.createElement("div");
          card.className = "card-glass anim-slide-up";
          card.style.cssText = "padding:0.75rem; cursor:pointer; background:rgba(0,0,0,0.15); border-color:var(--glass-border);";
          const pubDate = item.pubDate ? new Date(item.pubDate).toLocaleDateString() : "";
          card.innerHTML = `
            <h5 style="font-size:0.82rem; font-weight:700; line-height:1.4; margin-bottom:4px;">${item.title}</h5>
            <span style="font-size:0.68rem; color:var(--text-muted);">${pubDate} • ${item.author || "News"}</span>
          `;
          card.addEventListener("click", () => showPreview(item));
          articlesList.appendChild(card);
        });

        // Show first article by default
        if (items[0]) showPreview(items[0]);
      })
      .catch(err => {
        console.warn("News RSS fetch failed, showing mock:", err);
        showMockNews(idx);
      });
  }

  function showPreview(item) {
    previewTitle.textContent = item.title;
    previewMeta.textContent = `${item.pubDate ? new Date(item.pubDate).toLocaleString() : ""} • ${item.author || "Editorial"}`;
    const cleanBody = (item.description || item.content || "No summary available.").replace(/<[^>]+>/g, "").substring(0, 600);
    previewBody.textContent = cleanBody + (cleanBody.length >= 600 ? "..." : "");
    previewLink.href = item.link || "#";
    previewLink.style.display = "block";
  }

  function showMockNews(idx) {
    articlesList.innerHTML = "";
    const headlines = [
      { title: "AI Assistant Systems Reach Production-Ready Milestone", pubDate: new Date().toISOString(), author: "Tech Weekly" },
      { title: "Google Apps Script Powers Next-Gen Web Backends", pubDate: new Date().toISOString(), author: "Dev Digest" },
      { title: "PWA Standards Updated for 2026 Browser Compliance", pubDate: new Date().toISOString(), author: "Web Standards" },
      { title: "Glassmorphism Continues to Dominate UI Design Trends", pubDate: new Date().toISOString(), author: "UI/UX Tribune" },
    ];
    headlines.forEach(item => {
      const card = document.createElement("div");
      card.className = "card-glass anim-slide-up";
      card.style.cssText = "padding:0.75rem; cursor:pointer; background:rgba(0,0,0,0.15);";
      card.innerHTML = `<h5 style="font-size:0.82rem; font-weight:700;">${item.title}</h5><span style="font-size:0.68rem; color:var(--text-muted);">${FEEDS[idx].label}</span>`;
      card.addEventListener("click", () => showPreview({ ...item, description: "This is a mock article summary. Connect the Apps Script backend to pull live RSS feeds.", link: "#" }));
      articlesList.appendChild(card);
    });
    if (headlines[0]) showPreview({ ...headlines[0], description: "Live RSS feed unavailable. Showing mock headlines. Configure the Apps Script backend RSS action to fetch live articles.", link: "#" });
  }

  // Load first feed on init
  setActiveTab(0);
}
