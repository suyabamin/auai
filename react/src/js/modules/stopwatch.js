/**
 * Stopwatch Module — Full glassmorphic UI
 */
export function init() {
  const container = document.getElementById("stopwatch");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width:500px; margin:0 auto;">
      <div class="module-header">
        <h2 class="module-title">⏱️ Precision Stopwatch</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Big Time Display -->
      <div class="card-glass" style="background:rgba(0,0,0,0.25); padding:2.5rem; text-align:center; margin-bottom:1.5rem; border-color:var(--primary);">
        <div id="sw-display" style="font-size:4rem; font-weight:800; font-family:monospace; color:var(--primary); text-shadow:0 0 20px var(--primary-glow); letter-spacing:4px;">00:00:00</div>
        <div id="sw-ms-display" style="font-size:1.25rem; font-weight:600; font-family:monospace; color:var(--text-secondary); margin-top:4px;">.000</div>
        <div id="sw-status-lbl" style="font-size:0.8rem; color:var(--text-muted); margin-top:8px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Stopped</div>
      </div>

      <!-- Controls -->
      <div style="display:flex; gap:10px; justify-content:center; margin-bottom:1.5rem;">
        <button id="sw-start-btn" class="btn-primary" style="min-width:110px; padding:0.75rem 1.5rem; font-weight:700; font-size:1rem;">▶ Start</button>
        <button id="sw-lap-btn" class="btn-glass" style="min-width:90px; font-size:1rem;" disabled>🏁 Lap</button>
        <button id="sw-reset-btn" class="btn-glass" style="min-width:90px; font-size:1rem; color:var(--danger);">↺ Reset</button>
      </div>

      <!-- Lap Log -->
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary);">Lap Times</h3>
          <span id="sw-lap-count" class="badge badge-primary">0 laps</span>
        </div>
        <div id="sw-lap-list" style="display:flex; flex-direction:column; gap:6px; max-height:220px; overflow-y:auto;"></div>
      </div>
    </div>
  `;

  let startTime = 0, elapsed = 0, timerId = null, running = false;
  let laps = [], lapStart = 0;

  const display = document.getElementById("sw-display");
  const msDisplay = document.getElementById("sw-ms-display");
  const statusLbl = document.getElementById("sw-status-lbl");
  const startBtn = document.getElementById("sw-start-btn");
  const lapBtn = document.getElementById("sw-lap-btn");
  const resetBtn = document.getElementById("sw-reset-btn");
  const lapList = document.getElementById("sw-lap-list");
  const lapCountBadge = document.getElementById("sw-lap-count");

  function formatTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  }

  function tick() {
    const total = elapsed + (Date.now() - startTime);
    display.textContent = formatTime(total);
    msDisplay.textContent = "." + String(total % 1000).padStart(3, "0");
  }

  startBtn.addEventListener("click", () => {
    if (!running) {
      startTime = Date.now();
      if (laps.length === 0) lapStart = Date.now();
      timerId = setInterval(tick, 30);
      running = true;
      startBtn.textContent = "⏸ Pause";
      startBtn.style.background = "var(--warning)";
      lapBtn.disabled = false;
      statusLbl.textContent = "Running";
      statusLbl.style.color = "var(--success)";
    } else {
      elapsed += Date.now() - startTime;
      clearInterval(timerId);
      timerId = null;
      running = false;
      startBtn.textContent = "▶ Resume";
      startBtn.style.background = "";
      lapBtn.disabled = true;
      statusLbl.textContent = "Paused";
      statusLbl.style.color = "var(--warning)";
    }
  });

  lapBtn.addEventListener("click", () => {
    const now = Date.now();
    const lapTime = elapsed + (now - startTime);
    const lapDelta = now - lapStart;
    lapStart = now;
    laps.push({ num: laps.length + 1, total: lapTime, split: lapDelta });

    // Re-render lap list
    lapList.innerHTML = "";
    const best = Math.min(...laps.map(l => l.split));
    const worst = Math.max(...laps.map(l => l.split));
    [...laps].reverse().forEach(lap => {
      const row = document.createElement("div");
      const isBest = lap.split === best && laps.length > 1;
      const isWorst = lap.split === worst && laps.length > 1;
      row.className = "card-glass";
      row.style.cssText = `padding:0.6rem 0.75rem; display:flex; justify-content:space-between; background:rgba(0,0,0,0.2); font-family:monospace; font-size:0.85rem;`;
      row.innerHTML = `
        <span style="color:var(--text-muted);">Lap ${lap.num}</span>
        <span style="color:${isBest ? "var(--success)" : isWorst ? "var(--danger)" : "var(--text-primary)"}; font-weight:700;">+${formatTime(lap.split)}.${String(lap.split % 1000).padStart(3,"0")}</span>
        <span style="color:var(--text-secondary);">${formatTime(lap.total)}</span>
      `;
      lapList.appendChild(row);
    });
    lapCountBadge.textContent = `${laps.length} laps`;
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timerId);
    timerId = null; running = false; elapsed = 0; laps = [];
    display.textContent = "00:00:00"; msDisplay.textContent = ".000";
    startBtn.textContent = "▶ Start"; startBtn.style.background = "";
    lapBtn.disabled = true; lapList.innerHTML = "";
    lapCountBadge.textContent = "0 laps"; statusLbl.textContent = "Stopped";
    statusLbl.style.color = "var(--text-muted)";
  });
}
