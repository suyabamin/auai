import { apiFetch } from "../utils/fetch.js";

/**
 * Language Learning / Flashcard Drill Module
 */
export function init() {
  const container = document.getElementById("languageLearning");
  if (!container) return;

  const DECKS = {
    "🇪🇸 Spanish": [
      { q: "Hello", a: "Hola" }, { q: "Thank you", a: "Gracias" }, { q: "Goodbye", a: "Adiós" },
      { q: "Please", a: "Por favor" }, { q: "Yes / No", a: "Sí / No" }, { q: "Water", a: "Agua" },
      { q: "How are you?", a: "¿Cómo estás?" }, { q: "I love you", a: "Te quiero" },
      { q: "Food", a: "Comida" }, { q: "House", a: "Casa" }
    ],
    "🇫🇷 French": [
      { q: "Hello", a: "Bonjour" }, { q: "Thank you", a: "Merci" }, { q: "Goodbye", a: "Au revoir" },
      { q: "Please", a: "S'il vous plaît" }, { q: "Water", a: "Eau" }, { q: "Love", a: "Amour" },
      { q: "How are you?", a: "Comment allez-vous?" }, { q: "Beautiful", a: "Beau / Belle" }
    ],
    "🇩🇪 German": [
      { q: "Hello", a: "Hallo" }, { q: "Thank you", a: "Danke" }, { q: "Goodbye", a: "Auf Wiedersehen" },
      { q: "Please", a: "Bitte" }, { q: "Water", a: "Wasser" }, { q: "Yes / No", a: "Ja / Nein" },
      { q: "How are you?", a: "Wie geht es Ihnen?" }, { q: "Good morning", a: "Guten Morgen" }
    ],
    "🇯🇵 Japanese": [
      { q: "Hello", a: "こんにちは (Konnichiwa)" }, { q: "Thank you", a: "ありがとう (Arigatō)" },
      { q: "Goodbye", a: "さようなら (Sayōnara)" }, { q: "Yes / No", a: "はい / いいえ (Hai / Iie)" },
      { q: "Water", a: "水 (Mizu)" }, { q: "Food", a: "食べ物 (Tabemono)" }, { q: "Love", a: "愛 (Ai)" }
    ]
  };

  const deckNames = Object.keys(DECKS);

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📚 Language Flashcard Drill</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Deck Selector -->
      <div style="display:flex; gap:8px; margin-bottom:1.5rem; flex-wrap:wrap;" id="lang-deck-tabs">
        ${deckNames.map((d, i) => `<button class="btn-glass lang-deck-btn" data-deck="${d}" style="font-size:0.85rem;">${d}</button>`).join("")}
      </div>

      <div class="grid-12" style="gap:1.5rem;">
        <!-- Flashcard Left -->
        <div style="grid-column:span 7; display:flex; flex-direction:column; align-items:center; gap:1.25rem;">
          <!-- Card flip container -->
          <div id="flashcard-box" style="width:100%; height:220px; perspective:1000px; cursor:pointer;" title="Click to flip">
            <div id="flashcard-inner" style="position:relative; width:100%; height:100%; transition:transform 0.6s; transform-style:preserve-3d;">
              <!-- Front face -->
              <div class="card-glass" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; background:var(--primary-glow); border-color:var(--primary);">
                <div style="font-size:0.78rem; font-weight:600; color:var(--primary); text-transform:uppercase; letter-spacing:1px;">Question (English)</div>
                <div id="flashcard-front-text" style="font-size:1.75rem; font-weight:800; text-align:center; padding:0 1rem;">Click a deck to start</div>
                <div style="font-size:0.72rem; color:var(--text-muted); margin-top:0.5rem;">👆 Tap to reveal answer</div>
              </div>
              <!-- Back face -->
              <div class="card-glass" style="position:absolute; width:100%; height:100%; backface-visibility:hidden; transform:rotateY(180deg); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; background:rgba(var(--secondary-hsl), 0.15); border-color:var(--secondary);">
                <div style="font-size:0.78rem; font-weight:600; color:var(--secondary); text-transform:uppercase; letter-spacing:1px;">Answer (Translation)</div>
                <div id="flashcard-back-text" style="font-size:1.75rem; font-weight:800; text-align:center; padding:0 1rem; color:var(--secondary);">—</div>
              </div>
            </div>
          </div>

          <!-- Navigation controls -->
          <div style="display:flex; gap:12px; align-items:center; width:100%;">
            <button id="lang-prev-btn" class="btn-glass" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px;">← Previous</button>
            <div style="text-align:center; min-width:80px;">
              <div id="lang-card-num" style="font-size:1.1rem; font-weight:700; color:var(--primary);">0 / 0</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">Cards</div>
            </div>
            <button id="lang-next-btn" class="btn-primary" style="flex:1; display:flex; align-items:center; justify-content:center; gap:6px;">Next →</button>
          </div>

          <!-- Score buttons -->
          <div style="display:flex; gap:10px; width:100%;">
            <button id="lang-wrong-btn" class="btn-glass" style="flex:1; color:var(--danger); font-weight:700; font-size:0.9rem;">❌ Forgot</button>
            <button id="lang-correct-btn" class="btn-glass" style="flex:1; color:var(--success); font-weight:700; font-size:0.9rem;">✅ Knew It</button>
          </div>
        </div>

        <!-- Stats sidebar right -->
        <div style="grid-column:span 5; display:flex; flex-direction:column; gap:1rem; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Session Stats</h3>
          <div class="card-glass" style="background:rgba(0,0,0,0.2); padding:1rem; display:flex; flex-direction:column; gap:0.75rem;">
            <div style="display:flex; justify-content:space-between;"><span style="font-size:0.85rem;">✅ Correct:</span><b id="lang-score-correct" style="color:var(--success);">0</b></div>
            <div style="display:flex; justify-content:space-between;"><span style="font-size:0.85rem;">❌ Incorrect:</span><b id="lang-score-wrong" style="color:var(--danger);">0</b></div>
            <div style="display:flex; justify-content:space-between;"><span style="font-size:0.85rem;">📈 Accuracy:</span><b id="lang-accuracy" style="color:var(--primary);">—</b></div>
          </div>

          <button id="lang-shuffle-btn" class="btn-glass" style="font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:6px;">🔀 Shuffle Deck</button>
          <button id="lang-reset-btn" class="btn-glass" style="font-size:0.85rem; display:flex; align-items:center; justify-content:center; gap:6px; color:var(--danger);">🔄 Reset Score</button>

          <div id="lang-deck-list" style="display:flex; flex-direction:column; gap:6px; margin-top:0.5rem;">
            <h4 style="font-size:0.82rem; font-weight:700; color:var(--text-muted);">Available Decks</h4>
            ${deckNames.map(d => `<div class="card-glass" style="padding:0.5rem 0.75rem; font-size:0.82rem; cursor:pointer; background:rgba(0,0,0,0.15);" data-deck="${d}">${d} — ${DECKS[d].length} cards</div>`).join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  const flashcardInner = document.getElementById("flashcard-inner");
  const frontText = document.getElementById("flashcard-front-text");
  const backText = document.getElementById("flashcard-back-text");
  const cardNumLbl = document.getElementById("lang-card-num");
  const correctLbl = document.getElementById("lang-score-correct");
  const wrongLbl = document.getElementById("lang-score-wrong");
  const accuracyLbl = document.getElementById("lang-accuracy");

  let currentDeck = [];
  let currentIdx = 0;
  let flipped = false;
  let correct = 0, wrong = 0;

  function loadDeck(name) {
    currentDeck = [...DECKS[name]];
    currentIdx = 0;
    flipped = false;
    flashcardInner.style.transform = "rotateY(0deg)";
    showCard();
  }

  function showCard() {
    if (currentDeck.length === 0) return;
    const card = currentDeck[currentIdx];
    frontText.textContent = card.q;
    backText.textContent = card.a;
    cardNumLbl.textContent = `${currentIdx + 1} / ${currentDeck.length}`;
    flipped = false;
    flashcardInner.style.transform = "rotateY(0deg)";
  }

  document.getElementById("flashcard-box").addEventListener("click", () => {
    flipped = !flipped;
    flashcardInner.style.transform = flipped ? "rotateY(180deg)" : "rotateY(0deg)";
  });

  document.getElementById("lang-next-btn").addEventListener("click", () => {
    currentIdx = (currentIdx + 1) % currentDeck.length;
    showCard();
  });
  document.getElementById("lang-prev-btn").addEventListener("click", () => {
    currentIdx = (currentIdx - 1 + currentDeck.length) % currentDeck.length;
    showCard();
  });

  document.getElementById("lang-correct-btn").addEventListener("click", () => {
    correct++;
    correctLbl.textContent = correct;
    updateAccuracy();
    document.getElementById("lang-next-btn").click();
  });
  document.getElementById("lang-wrong-btn").addEventListener("click", () => {
    wrong++;
    wrongLbl.textContent = wrong;
    updateAccuracy();
    document.getElementById("lang-next-btn").click();
  });
  document.getElementById("lang-shuffle-btn").addEventListener("click", () => {
    currentDeck = currentDeck.sort(() => Math.random() - 0.5);
    currentIdx = 0;
    showCard();
  });
  document.getElementById("lang-reset-btn").addEventListener("click", () => {
    correct = 0; wrong = 0;
    correctLbl.textContent = 0;
    wrongLbl.textContent = 0;
    accuracyLbl.textContent = "—";
  });

  function updateAccuracy() {
    const total = correct + wrong;
    accuracyLbl.textContent = total > 0 ? Math.round((correct / total) * 100) + "%" : "—";
  }

  // Deck buttons
  const deckBtns = document.querySelectorAll(".lang-deck-btn");
  deckBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      deckBtns.forEach(b => { b.classList.remove("btn-primary"); b.classList.add("btn-glass"); });
      btn.classList.add("btn-primary");
      loadDeck(btn.dataset.deck);
    });
  });

  document.querySelectorAll("#lang-deck-list [data-deck]").forEach(el => {
    el.addEventListener("click", () => { loadDeck(el.dataset.deck); });
  });

  // Load first deck on start
  if (deckNames.length > 0) {
    deckBtns[0].classList.add("btn-primary");
    loadDeck(deckNames[0]);
  }
}
