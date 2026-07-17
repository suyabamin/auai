import { apiFetch } from "../utils/fetch.js";

/**
 * Wikipedia Search Module — Full UI
 */
export function init() {
  const container = document.getElementById("wikipediaSearch");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📖 Wikipedia Knowledge Hub</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:1.5rem;">
        <input id="wiki-search-input" class="input-glass" style="flex:1;" placeholder="Search Wikipedia (e.g. Artificial Intelligence, Black Holes, HTML5)..." />
        <button id="wiki-search-btn" class="btn-primary" style="min-width:120px;">Search</button>
      </div>

      <div class="grid-12" style="gap:1rem;">
        <!-- Results list left -->
        <div style="grid-column:span 4; display:flex; flex-direction:column; gap:8px; max-height:420px; overflow-y:auto;" id="wiki-results-list">
          <p style="color:var(--text-muted); text-align:center; padding-top:80px; font-size:0.9rem;">Enter a search term above</p>
        </div>

        <!-- Article preview right -->
        <div style="grid-column:span 8; display:flex; flex-direction:column; gap:1rem;" id="wiki-article-pane">
          <div class="card-glass" style="background:rgba(0,0,0,0.15); min-height:350px; padding:1.5rem; display:flex; flex-direction:column; gap:0.75rem;">
            <h3 id="wiki-article-title" style="font-size:1.3rem; font-weight:800;">Select an Article</h3>
            <div id="wiki-article-body" style="font-size:0.9rem; line-height:1.7; color:var(--text-secondary); flex:1; overflow-y:auto; max-height:280px;">
              Results and article summaries will appear here after searching.
            </div>
            <a id="wiki-article-link" href="#" target="_blank" class="btn-glass" style="display:none; width:fit-content; font-size:0.8rem;">Read Full Article on Wikipedia →</a>
          </div>
        </div>
      </div>
    </div>
  `;

  const searchInput = document.getElementById("wiki-search-input");
  const searchBtn = document.getElementById("wiki-search-btn");
  const resultsList = document.getElementById("wiki-results-list");
  const articleTitle = document.getElementById("wiki-article-title");
  const articleBody = document.getElementById("wiki-article-body");
  const articleLink = document.getElementById("wiki-article-link");

  searchBtn.addEventListener("click", doSearch);
  searchInput.addEventListener("keydown", e => { if (e.key === "Enter") doSearch(); });

  function doSearch() {
    const query = searchInput.value.trim();
    if (!query) return;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    resultsList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding-top:60px;">Querying Wikipedia API...</p>`;

    fetch(`https://en.wikipedia.org/w/api.php?action=search&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=8`)
      .then(r => r.json())
      .then(data => {
        resultsList.innerHTML = "";
        const results = data.query?.search || [];
        if (results.length === 0) {
          resultsList.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding-top:80px;">No results found</p>`;
          return;
        }
        results.forEach(r => {
          const card = document.createElement("div");
          card.className = "card-glass anim-slide-up";
          card.style.cssText = "padding:0.75rem; cursor:pointer; border-color:var(--glass-border);";
          card.innerHTML = `
            <h5 style="font-size:0.85rem; font-weight:700; margin-bottom:4px;">${r.title}</h5>
            <p style="font-size:0.72rem; color:var(--text-muted); line-height:1.4;">${(r.snippet || "").replace(/<[^>]+>/g, "").substring(0, 80)}...</p>
          `;
          card.addEventListener("click", () => loadArticle(r.title));
          resultsList.appendChild(card);
        });

        // Load first automatically
        if (results[0]) loadArticle(results[0].title);
      })
      .catch(err => {
        console.error("Wikipedia search error:", err);
        resultsList.innerHTML = `<p style="color:var(--danger); text-align:center; padding-top:80px;">Search failed. Check connection.</p>`;
      })
      .finally(() => {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
      });
  }

  function loadArticle(title) {
    articleTitle.textContent = title;
    articleBody.textContent = "Loading article summary...";
    articleLink.style.display = "none";

    fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro&explaintext&titles=${encodeURIComponent(title)}&format=json&origin=*`)
      .then(r => r.json())
      .then(data => {
        const pages = data.query.pages;
        const page = Object.values(pages)[0];
        const extract = page.extract || "No extract available for this article.";
        articleTitle.textContent = page.title;
        articleBody.textContent = extract.substring(0, 1200) + (extract.length > 1200 ? "..." : "");
        articleLink.href = `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`;
        articleLink.style.display = "block";
      })
      .catch(err => {
        articleBody.textContent = "Failed to load article content.";
        console.error(err);
      });
  }
}
