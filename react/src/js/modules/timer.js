/**
 * Countdown Timer Module — Full glassmorphic UI with presets
 */
export function init() {
  const container = document.getElementById("timer");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width:480px; margin:0 auto;">
      <div class="module-header">
        <h2 class="module-title">⏳ Countdown Timer</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Preset buttons -->
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:1.25rem;">
        <span style="font-size:0.78rem; color:var(--text-muted); align-self:center;">Quick Set:</span>
        <button class="btn-glass preset-btn" data-s="300" style="font-size:0.8rem;">5 min</button>
        <button class="btn-glass preset-btn" data-s="600" style="font-size:0.8rem;">10 min</button>
        <button class="btn-glass preset-btn" data-s="900" style="font-size:0.8rem;">15 min</button>
        <button class="btn-glass preset-btn" data-s="1500" style="font-size:0.8rem;">25 min 🍅</button>
        <button class="btn-glass preset-btn" data-s="3600" style="font-size:0.8rem;">60 min</button>
      </div>

      <!-- Manual H:M:S inputs -->
      <div style="display:flex; gap:10px; align-items:center; justify-content:center; margin-bottom:1.5rem;">
        <div style="text-align:center;">
          <input type="number" id="timer-h-in" class="input-glass" min="0" max="23" value="0" style="width:70px; text-align:center; font-size:1.5rem; font-weight:700;" />
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Hours</div>
        </div>
        <span style="font-size:2rem; font-weight:700; color:var(--text-muted); margin-bottom:18px;">:</span>
        <div style="text-align:center;">
          <input type="number" id="timer-m-in" class="input-glass" min="0" max="59" value="5" style="width:70px; text-align:center; font-size:1.5rem; font-weight:700;" />
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Minutes</div>
        </div>
        <span style="font-size:2rem; font-weight:700; color:var(--text-muted); margin-bottom:18px;">:</span>
        <div style="text-align:center;">
          <input type="number" id="timer-s-in" class="input-glass" min="0" max="59" value="0" style="width:70px; text-align:center; font-size:1.5rem; font-weight:700;" />
          <div style="font-size:0.72rem; color:var(--text-muted); margin-top:2px;">Seconds</div>
        </div>
      </div>

      <!-- Big countdown display -->
      <div class="card-glass" style="background:rgba(0,0,0,0.25); padding:2.5rem; text-align:center; margin-bottom:1.5rem; border-color:var(--primary);">
        <div id="timer-display" style="font-size:4.5rem; font-weight:800; font-family:monospace; color:var(--primary); text-shadow:0 0 20px var(--primary-glow); letter-spacing:4px;">05:00</div>
        <div id="timer-progress-bar" style="width:100%; height:6px; background:var(--glass-border); border-radius:6px; margin-top:1rem; overflow:hidden;">
          <div id="timer-progress-fill" style="height:100%; width:100%; background:var(--primary); border-radius:6px; transition:width 0.5s linear; box-shadow:0 0 8px var(--primary-glow);"></div>
        </div>
        <div id="timer-status" style="font-size:0.8rem; color:var(--text-muted); margin-top:8px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Ready</div>
      </div>

      <!-- Control buttons -->
      <div style="display:flex; gap:10px; justify-content:center;">
        <button id="timer-start-btn" class="btn-primary" style="min-width:120px; padding:0.75rem 1.5rem; font-weight:700; font-size:1rem;">▶ Start</button>
        <button id="timer-reset-btn" class="btn-glass" style="min-width:100px; font-size:1rem; color:var(--danger);">↺ Reset</button>
      </div>
    </div>
  `;

  const hIn = document.getElementById("timer-h-in");
  const mIn = document.getElementById("timer-m-in");
  const sIn = document.getElementById("timer-s-in");
  const display = document.getElementById("timer-display");
  const fill = document.getElementById("timer-progress-fill");
  const statusLbl = document.getElementById("timer-status");
  const startBtn = document.getElementById("timer-start-btn");
  const resetBtn = document.getElementById("timer-reset-btn");

  let intervalId = null, remaining = 0, totalSeconds = 0, running = false;

  function getTotalFromInputs() {
    return (parseInt(hIn.value) || 0) * 3600 + (parseInt(mIn.value) || 0) * 60 + (parseInt(sIn.value) || 0);
  }

  function formatDisplay(s) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  }

  function updateDisplay() {
    display.textContent = formatDisplay(remaining);
    fill.style.width = totalSeconds > 0 ? `${(remaining / totalSeconds) * 100}%` : "0%";
    const pct = totalSeconds > 0 ? remaining / totalSeconds : 1;
    fill.style.background = pct > 0.5 ? "var(--primary)" : pct > 0.2 ? "var(--warning)" : "var(--danger)";
    fill.style.boxShadow = `0 0 8px ${pct > 0.5 ? "var(--primary-glow)" : pct > 0.2 ? "rgba(255,180,0,0.4)" : "rgba(255,60,60,0.4)"}`;
  }

  // Preset buttons
  document.querySelectorAll(".preset-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const sec = parseInt(btn.dataset.s);
      hIn.value = Math.floor(sec / 3600);
      mIn.value = Math.floor((sec % 3600) / 60);
      sIn.value = sec % 60;
      if (running) stopTimer();
      remaining = sec; totalSeconds = sec;
      updateDisplay(); statusLbl.textContent = "Ready";
    });
  });

  startBtn.addEventListener("click", () => {
    if (!running) {
      if (remaining === 0) {
        remaining = getTotalFromInputs();
        totalSeconds = remaining;
      }
      if (remaining === 0) return;
      intervalId = setInterval(() => {
        remaining--;
        updateDisplay();
        if (remaining <= 0) {
          clearInterval(intervalId);
          intervalId = null; running = false;
          startBtn.textContent = "▶ Start"; startBtn.style.background = "";
          statusLbl.textContent = "✅ Done!"; statusLbl.style.color = "var(--success)";
          display.style.color = "var(--success)";
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("⏳ Timer Finished!", { body: "Your countdown timer has completed." });
          }
        }
      }, 1000);
      running = true;
      startBtn.textContent = "⏸ Pause";
      startBtn.style.background = "var(--warning)";
      statusLbl.textContent = "Counting Down..."; statusLbl.style.color = "var(--primary)";
      display.style.color = "var(--primary)";
    } else {
      stopTimer();
    }
  });

  function stopTimer() {
    clearInterval(intervalId); intervalId = null; running = false;
    startBtn.textContent = "▶ Resume"; startBtn.style.background = "";
    statusLbl.textContent = "Paused"; statusLbl.style.color = "var(--warning)";
  }

  resetBtn.addEventListener("click", () => {
    clearInterval(intervalId); intervalId = null; running = false;
    remaining = 0; totalSeconds = 0;
    display.textContent = "00:00"; display.style.color = "var(--primary)";
    fill.style.width = "100%"; fill.style.background = "var(--primary)";
    startBtn.textContent = "▶ Start"; startBtn.style.background = "";
    statusLbl.textContent = "Ready"; statusLbl.style.color = "var(--text-muted)";
  });

  // Init display
  remaining = getTotalFromInputs(); totalSeconds = remaining;
  updateDisplay();

  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
}
