/**
 * Typing Speed Test Module — Full glassmorphic UI
 */
export function init() {
  const container = document.getElementById("typingAnimation");
  if (!container) return;

  const SAMPLES = [
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs. How vexingly quick daft zebras jump!",
    "Artificial intelligence is transforming the way humans interact with technology. Machine learning models can now process vast amounts of data to detect patterns.",
    "JavaScript is a lightweight, interpreted programming language with first-class functions. It is the scripting language of the World Wide Web alongside HTML and CSS.",
    "Google Apps Script is a cloud-based scripting platform that allows you to extend Google Workspace apps and automate workflows across Gmail, Sheets, and Drive.",
    "The glassmorphism design trend uses frosted glass effects, blurred backgrounds, transparency, and subtle borders to create a modern and premium visual aesthetic."
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">⌨️ Typing Speed Test</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Stats Row -->
      <div class="grid-12" style="gap:10px; margin-bottom:1.5rem;">
        <div class="card-glass" style="grid-column:span 3; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div id="typ-wpm" style="font-size:2rem; font-weight:800; color:var(--primary);">0</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">WPM</div>
        </div>
        <div class="card-glass" style="grid-column:span 3; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div id="typ-acc" style="font-size:2rem; font-weight:800; color:var(--success);">100%</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Accuracy</div>
        </div>
        <div class="card-glass" style="grid-column:span 3; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div id="typ-time" style="font-size:2rem; font-weight:800; color:var(--warning);">60</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Seconds Left</div>
        </div>
        <div class="card-glass" style="grid-column:span 3; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div id="typ-errors" style="font-size:2rem; font-weight:800; color:var(--danger);">0</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Errors</div>
        </div>
      </div>

      <!-- Sample text display -->
      <div class="card-glass" style="padding:1.25rem; margin-bottom:1rem; background:rgba(0,0,0,0.2); line-height:2; font-size:1rem; min-height:80px; border-radius:10px; font-family:'Courier New', monospace; user-select:none;">
        <span id="typ-text-display"></span>
      </div>

      <!-- Typing input -->
      <input id="typ-input" class="input-glass" style="width:100%; font-size:1rem; font-family:'Courier New', monospace; margin-bottom:1rem;" placeholder="Start typing here to begin the test..." />

      <!-- Controls -->
      <div style="display:flex; gap:10px;">
        <button id="typ-restart-btn" class="btn-primary" style="flex:1; font-weight:700;">🔄 New Test</button>
        <select id="typ-duration-sel" class="input-glass" style="min-width:130px; font-size:0.85rem;">
          <option value="30">30 Seconds</option>
          <option value="60" selected>60 Seconds</option>
          <option value="120">2 Minutes</option>
        </select>
      </div>

      <!-- Result overlay -->
      <div id="typ-result-overlay" style="display:none; margin-top:1.5rem;" class="card-glass anim-slide-up">
        <div style="padding:1.5rem; text-align:center; background:rgba(0,0,0,0.2); border-radius:10px;">
          <div style="font-size:3rem; margin-bottom:0.5rem;">🎉</div>
          <h3 style="font-size:1.3rem; font-weight:800; margin-bottom:0.75rem;">Test Complete!</h3>
          <div style="display:flex; justify-content:center; gap:2rem; flex-wrap:wrap;">
            <div><div id="res-wpm" style="font-size:2rem; font-weight:800; color:var(--primary);">0</div><div style="font-size:0.78rem; color:var(--text-muted);">WPM</div></div>
            <div><div id="res-acc" style="font-size:2rem; font-weight:800; color:var(--success);">100%</div><div style="font-size:0.78rem; color:var(--text-muted);">Accuracy</div></div>
            <div><div id="res-errs" style="font-size:2rem; font-weight:800; color:var(--danger);">0</div><div style="font-size:0.78rem; color:var(--text-muted);">Errors</div></div>
          </div>
        </div>
      </div>
    </div>
  `;

  const textDisplay = document.getElementById("typ-text-display");
  const typInput = document.getElementById("typ-input");
  const wpmEl = document.getElementById("typ-wpm");
  const accEl = document.getElementById("typ-acc");
  const timeEl = document.getElementById("typ-time");
  const errorsEl = document.getElementById("typ-errors");
  const resultOverlay = document.getElementById("typ-result-overlay");
  const restartBtn = document.getElementById("typ-restart-btn");
  const durationSel = document.getElementById("typ-duration-sel");

  let targetText = "", typed = "", started = false, intervalId = null, timeLeft = 60, wordsTyped = 0, errorCount = 0;

  function startTest() {
    targetText = SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
    typed = "";
    started = false;
    wordsTyped = 0;
    errorCount = 0;
    timeLeft = parseInt(durationSel.value);

    clearInterval(intervalId); intervalId = null;
    resultOverlay.style.display = "none";
    typInput.value = "";
    typInput.disabled = false;
    typInput.focus();
    timeEl.textContent = timeLeft;
    wpmEl.textContent = "0"; accEl.textContent = "100%"; errorsEl.textContent = "0";
    renderText();
  }

  function renderText() {
    let html = "";
    for (let i = 0; i < targetText.length; i++) {
      if (i < typed.length) {
        const correct = typed[i] === targetText[i];
        html += `<span style="color:${correct ? "var(--success)" : "var(--danger)"}; ${!correct ? "text-decoration:underline;" : ""}">${targetText[i]}</span>`;
      } else if (i === typed.length) {
        html += `<span style="background:var(--primary); color:white; border-radius:2px; animation: pulseDot 0.8s infinite;">${targetText[i]}</span>`;
      } else {
        html += `<span style="color:var(--text-muted);">${targetText[i]}</span>`;
      }
    }
    textDisplay.innerHTML = html;
  }

  typInput.addEventListener("input", e => {
    if (!started) {
      started = true;
      intervalId = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;
        if (timeLeft <= 0) { clearInterval(intervalId); endTest(); }
      }, 1000);
    }
    typed = typInput.value;
    errorCount = 0;
    for (let i = 0; i < typed.length; i++) {
      if (typed[i] !== targetText[i]) errorCount++;
    }
    wordsTyped = typed.trim().split(/\s+/).filter(w => w).length;
    const elapsed = (parseInt(durationSel.value) - timeLeft) || 1;
    const wpm = Math.round((wordsTyped / elapsed) * 60);
    const acc = typed.length > 0 ? Math.round(((typed.length - errorCount) / typed.length) * 100) : 100;
    wpmEl.textContent = wpm;
    accEl.textContent = acc + "%";
    errorsEl.textContent = errorCount;
    renderText();
    if (typed.length >= targetText.length) endTest();
  });

  function endTest() {
    clearInterval(intervalId); typInput.disabled = true;
    const elapsed = (parseInt(durationSel.value) - timeLeft) || 1;
    const finalWpm = Math.round((wordsTyped / elapsed) * 60);
    const finalAcc = typed.length > 0 ? Math.round(((typed.length - errorCount) / typed.length) * 100) : 100;
    document.getElementById("res-wpm").textContent = finalWpm;
    document.getElementById("res-acc").textContent = finalAcc + "%";
    document.getElementById("res-errs").textContent = errorCount;
    resultOverlay.style.display = "block";
  }

  restartBtn.addEventListener("click", startTest);
  durationSel.addEventListener("change", startTest);
  startTest();
}
