import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Reminders, Alarms, Timer, and Stopwatch Hub.
 */
export function init() {
  const container = document.getElementById("reminder");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🔔 Time Management Hub</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Reminders & Alarms column -->
        <div style="grid-column: span 4; display: flex; flex-direction: column; gap: 1rem; border-right: 1px solid var(--glass-border); padding-right: 1rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Set Reminders</h3>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
            <input type="text" id="remind-msg" class="input-glass" placeholder="What to remember..." />
            <input type="datetime-local" id="remind-time" class="input-glass" />
            <button id="remind-save-btn" class="btn-primary" style="width:100%;">Schedule Reminder</button>
          </div>

          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700; margin-top: 0.5rem;">Schedules</h3>
          <div id="remind-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
            <!-- Reminders lists will render -->
            <p style="color:var(--text-muted); font-size:0.8rem;">No notifications pending</p>
          </div>
        </div>

        <!-- Countdown Timer column -->
        <div style="grid-column: span 4; display: flex; flex-direction: column; gap: 1rem; align-items: center; border-right: 1px solid var(--glass-border); padding-right: 1rem; padding-left: 0.75rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700; width:100%;">Countdown Timer</h3>
          
          <div style="font-size: 2.75rem; font-weight: 800; color: var(--primary); font-family: monospace;" id="timer-display">
            05:00
          </div>

          <div style="display: flex; gap: 6px; width: 100%;">
            <input type="number" id="timer-min-input" class="input-glass" placeholder="Min" style="width: 50%; min-width:0; text-align:center;" min="0" max="60" value="5" />
            <input type="number" id="timer-sec-input" class="input-glass" placeholder="Sec" style="width: 50%; min-width:0; text-align:center;" min="0" max="59" value="0" />
          </div>

          <div style="display: flex; gap: 6px; width: 100%;">
            <button id="timer-start-btn" class="btn-primary" style="flex:1;">Start</button>
            <button id="timer-pause-btn" class="btn-glass" style="flex:1;" disabled>Pause</button>
            <button id="timer-reset-btn" class="btn-glass">🔄</button>
          </div>
        </div>

        <!-- Stopwatch counter column -->
        <div style="grid-column: span 4; display: flex; flex-direction: column; gap: 1rem; align-items: center; padding-left: 0.75rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700; width:100%;">Stopwatch</h3>

          <div style="font-size: 2.75rem; font-weight: 800; color: var(--secondary); font-family: monospace;" id="stopwatch-display">
            00:00.00
          </div>

          <div style="display: flex; gap: 6px; width: 100%;">
            <button id="sw-start-btn" class="btn-primary" style="flex:1; background: var(--secondary); box-shadow: 0 4px 15px var(--secondary-glow);">Start</button>
            <button id="sw-lap-btn" class="btn-glass" style="flex:1;" disabled>Lap</button>
            <button id="sw-reset-btn" class="btn-glass">🔄</button>
          </div>

          <div id="sw-lap-deck" style="width: 100%; border: 1px solid var(--glass-border); background:rgba(0,0,0,0.1); border-radius:6px; height: 120px; overflow-y:auto; padding: 6px; font-family:monospace; font-size:0.8rem;">
            <!-- Lap entries -->
            <p style="color:var(--text-muted); text-align:center; padding-top:40px;">No laps logged</p>
          </div>
        </div>
      </div>
    </div>
  `;

  // --- Reminders module ---
  const remindMsg = document.getElementById("remind-msg");
  const remindTime = document.getElementById("remind-time");
  const remindSave = document.getElementById("remind-save-btn");
  const remindList = document.getElementById("remind-list");

  let remindersArray = [];
  loadReminders();

  function loadReminders() {
    try {
      remindersArray = JSON.parse(localStorage.getItem("reminders") || "[]");
    } catch(e) {}
    renderReminders();
  }

  function renderReminders() {
    remindList.innerHTML = "";
    if (remindersArray.length === 0) {
      remindList.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; text-align:center; margin-top:20px;">No reminders scheduled</p>`;
      return;
    }

    remindersArray.forEach(rem => {
      const card = document.createElement("div");
      card.className = "widget-list-item anim-slide-up";
      card.style.background = "var(--glass-bg-accent)";
      card.style.border = "1px solid var(--glass-border)";
      card.style.padding = "6px 10px";
      card.style.borderRadius = "8px";
      card.style.display = "flex";
      card.style.justifyContent = "space-between";
      card.style.alignItems = "center";

      card.innerHTML = `
        <div>
          <h5 style="font-size:0.8rem; font-weight:700;">${rem.msg}</h5>
          <span style="font-size:0.68rem; color:var(--text-muted);">${new Date(rem.time).toLocaleString()}</span>
        </div>
        <button class="rem-del-btn" style="background:none; border:none; cursor:pointer;" data-id="${rem.id}">🗑️</button>
      `;

      card.querySelector(".rem-del-btn").addEventListener("click", () => deleteReminder(rem.id));
      remindList.appendChild(card);
    });
  }

  function deleteReminder(id) {
    remindersArray = remindersArray.filter(e => e.id !== id);
    localStorage.setItem("reminders", JSON.stringify(remindersArray));
    renderReminders();
  }

  remindSave.addEventListener("click", () => {
    const msg = remindMsg.value.trim();
    const time = remindTime.value;

    if (!msg || !time) return;

    const mockId = Date.now();
    remindersArray.push({ id: mockId, msg, time });
    localStorage.setItem("reminders", JSON.stringify(remindersArray));
    renderReminders();

    remindMsg.value = "";
    remindTime.value = "";

    apiFetch("reminder", { msg, datetime: time })
      .catch(err => console.error(err));
  });

  // Check alarm notifications loop
  setInterval(() => {
    const curTime = new Date().getTime();
    remindersArray.forEach((rem, idx) => {
      const remTime = new Date(rem.time).getTime();
      if (curTime >= remTime) {
        alert(`🔔 ALERT REMINDER: ${rem.msg}`);
        remindersArray.splice(idx, 1);
        localStorage.setItem("reminders", JSON.stringify(remindersArray));
        renderReminders();
      }
    });
  }, 5000);

  // --- Countdown module ---
  const timerDisplay = document.getElementById("timer-display");
  const minIn = document.getElementById("timer-min-input");
  const secIn = document.getElementById("timer-sec-input");
  const timerStart = document.getElementById("timer-start-btn");
  const timerPause = document.getElementById("timer-pause-btn");
  const timerReset = document.getElementById("timer-reset-btn");

  let timerSecs = 300;
  let timerInterval = null;

  function updateTimerUI() {
    const m = Math.floor(timerSecs / 60);
    const s = timerSecs % 60;
    timerDisplay.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  timerStart.addEventListener("click", () => {
    if (timerInterval) return;
    
    const minutesVal = parseInt(minIn.value) || 0;
    const secondsVal = parseInt(secIn.value) || 0;
    
    // Only fetch input on initial start
    if (timerSecs === 300 || timerSecs === 0) {
      timerSecs = (minutesVal * 60) + secondsVal;
    }

    if (timerSecs <= 0) return;

    timerStart.disabled = true;
    timerPause.disabled = false;
    
    timerInterval = setInterval(() => {
      timerSecs--;
      updateTimerUI();

      if (timerSecs <= 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        timerStart.disabled = false;
        timerPause.disabled = true;
        alert("⏳ TIMER REACHED DEADLINE!");
      }
    }, 1000);
  });

  timerPause.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerStart.disabled = false;
    timerPause.disabled = true;
  });

  timerReset.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    timerSecs = (parseInt(minIn.value) || 0) * 60 + (parseInt(secIn.value) || 0);
    updateTimerUI();
    timerStart.disabled = false;
    timerPause.disabled = true;
  });

  // --- Stopwatch module ---
  const swDisplay = document.getElementById("stopwatch-display");
  const swStart = document.getElementById("sw-start-btn");
  const swLap = document.getElementById("sw-lap-btn");
  const swReset = document.getElementById("sw-reset-btn");
  const swLapDeck = document.getElementById("sw-lap-deck");

  let swInterval = null;
  let swStartTime = 0;
  let swElapsed = 0;
  let lapCount = 0;

  function formatSW(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const hundredths = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(hundredths).padStart(2,'0')}`;
  }

  swStart.addEventListener("click", () => {
    if (swInterval) {
      // Pause action
      clearInterval(swInterval);
      swInterval = null;
      swElapsed += Date.now() - swStartTime;
      swStart.textContent = "Resume";
      swLap.disabled = true;
    } else {
      // Start action
      swStartTime = Date.now();
      swInterval = setInterval(() => {
        const timeVal = swElapsed + (Date.now() - swStartTime);
        swDisplay.textContent = formatSW(timeVal);
      }, 10);
      swStart.textContent = "Pause";
      swLap.disabled = false;
    }
  });

  swLap.addEventListener("click", () => {
    if (!swInterval) return;
    const timeVal = swElapsed + (Date.now() - swStartTime);
    lapCount++;
    if (lapCount === 1) swLapDeck.innerHTML = "";
    
    const div = document.createElement("div");
    div.style.padding = "4px 0";
    div.style.borderBottom = "1px solid var(--glass-border)";
    div.innerHTML = `<span>Lap ${lapCount}:</span> <b style="float:right;">${formatSW(timeVal)}</b>`;
    swLapDeck.prepend(div);
  });

  swReset.addEventListener("click", () => {
    clearInterval(swInterval);
    swInterval = null;
    swElapsed = 0;
    lapCount = 0;
    swDisplay.textContent = "00:00.00";
    swStart.textContent = "Start";
    swLap.disabled = true;
    swLapDeck.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding-top:40px;">No laps logged</p>`;
  });
}
