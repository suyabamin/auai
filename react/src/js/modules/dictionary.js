/**
 * Dictionary Module — Free DictionaryAPI.dev Integration
 */
export function init() {
  const container = document.getElementById("dictionary");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📖 Dictionary & Thesaurus</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div style="display:flex; gap:10px; margin-bottom:1.5rem;">
        <input id="dict-input" class="input-glass" style="flex:1; font-size:1rem;" placeholder="Enter a word to look up..." />
        <button id="dict-search-btn" class="btn-primary" style="min-width:120px;">Define</button>
      </div>

      <!-- History chips -->
      <div id="dict-history-chips" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:1rem; min-height:28px;"></div>

      <!-- Result area -->
      <div id="dict-result-area" style="display:flex; flex-direction:column; gap:1rem;">
        <p style="color:var(--text-muted); text-align:center; padding:60px 0;">Type a word and click Define to see its meaning, phonetics, and examples.</p>
      </div>
    </div>
  `;

  const dictInput = document.getElementById("dict-input");
  const searchBtn = document.getElementById("dict-search-btn");
  const resultArea = document.getElementById("dict-result-area");
  const historyChips = document.getElementById("dict-history-chips");
  const lookupHistory = [];

  searchBtn.addEventListener("click", doLookup);
  dictInput.addEventListener("keydown", e => { if (e.key === "Enter") doLookup(); });

  function doLookup() {
    const word = dictInput.value.trim().toLowerCase();
    if (!word) return;

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";
    resultArea.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:60px 0;">Looking up "${word}"...</p>`;

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data) || data[0]?.title) throw new Error("Not found");
        renderResult(data[0], word);
        addToHistory(word);
      })
      .catch(err => {
        resultArea.innerHTML = `
          <div class="card-glass" style="background:rgba(255,0,0,0.05); border-color:var(--danger); padding:1.5rem; text-align:center;">
            <span style="font-size:2rem; display:block; margin-bottom:0.5rem;">🔍</span>
            <h3>Word not found: "${word}"</h3>
            <p style="color:var(--text-muted); font-size:0.85rem; margin-top:0.5rem;">Check spelling or try a different word.</p>
          </div>
        `;
      })
      .finally(() => {
        searchBtn.disabled = false;
        searchBtn.textContent = "Define";
      });
  }

  function renderResult(data, word) {
    resultArea.innerHTML = "";

    // Header bar
    const header = document.createElement("div");
    header.className = "card-glass";
    header.style.cssText = "padding:1.25rem; background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center;";
    const phonetic = data.phonetics?.find(p => p.text)?.text || "";
    const audioUrl = data.phonetics?.find(p => p.audio)?.audio || "";
    header.innerHTML = `
      <div>
        <h2 style="font-size:2rem; font-weight:800; color:var(--primary);">${data.word}</h2>
        <p style="font-size:1rem; color:var(--text-secondary); font-style:italic;">${phonetic}</p>
      </div>
      ${audioUrl ? `<button id="dict-audio-btn" class="btn-glass" style="font-size:1.5rem; width:52px; height:52px; border-radius:50%;">🔊</button>` : ""}
    `;
    resultArea.appendChild(header);

    if (audioUrl) {
      const audio = new Audio(audioUrl);
      document.getElementById("dict-audio-btn").addEventListener("click", () => audio.play().catch(e => console.error(e)));
    }

    // Meanings
    (data.meanings || []).forEach(meaning => {
      const card = document.createElement("div");
      card.className = "card-glass";
      card.style.cssText = "padding:1.25rem; background:rgba(0,0,0,0.15);";
      card.innerHTML = `
        <h4 style="font-size:0.9rem; font-weight:700; color:var(--secondary); text-transform:uppercase; margin-bottom:0.75rem;">${meaning.partOfSpeech}</h4>
        <div style="display:flex; flex-direction:column; gap:0.75rem;">
          ${(meaning.definitions || []).slice(0, 3).map((def, i) => `
            <div style="padding-left:0.75rem; border-left:3px solid var(--glass-border);">
              <p style="font-size:0.9rem; line-height:1.5;">${i + 1}. ${def.definition}</p>
              ${def.example ? `<p style="font-size:0.8rem; color:var(--text-muted); margin-top:4px; font-style:italic;">e.g. "${def.example}"</p>` : ""}
            </div>
          `).join("")}
        </div>
        ${meaning.synonyms?.length ? `
          <div style="margin-top:0.75rem;">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Synonyms: </span>
            <span style="font-size:0.8rem; color:var(--primary);">${meaning.synonyms.slice(0, 6).join(", ")}</span>
          </div>
        ` : ""}
        ${meaning.antonyms?.length ? `
          <div style="margin-top:4px;">
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Antonyms: </span>
            <span style="font-size:0.8rem; color:var(--danger);">${meaning.antonyms.slice(0, 6).join(", ")}</span>
          </div>
        ` : ""}
      `;
      resultArea.appendChild(card);
    });
  }

  function addToHistory(word) {
    if (lookupHistory.includes(word)) return;
    lookupHistory.unshift(word);
    if (lookupHistory.length > 8) lookupHistory.pop();
    historyChips.innerHTML = "";
    lookupHistory.forEach(w => {
      const chip = document.createElement("span");
      chip.className = "badge badge-primary";
      chip.style.cssText = "cursor:pointer; font-size:0.75rem;";
      chip.textContent = w;
      chip.addEventListener("click", () => { dictInput.value = w; doLookup(); });
      historyChips.appendChild(chip);
    });
  }
}
