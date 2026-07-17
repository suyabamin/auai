import { apiFetch } from "../utils/fetch.js";

/**
 * Alarm Module — Multi-alarm manager with notifications
 */
export function init() {
  const container = document.getElementById("alarm");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">⏰ Alarm & Reminders Manager</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Current Time Big Display -->
      <div class="card-glass" style="background:rgba(0,0,0,0.2); padding:1.25rem; text-align:center; margin-bottom:1.5rem;">
        <div id="alarm-now-time" style="font-size:3rem; font-weight:800; color:var(--primary); font-family:monospace; text-shadow:0 0 15px var(--primary-glow);">00:00:00</div>
        <div id="alarm-now-date" style="font-size:0.9rem; color:var(--text-secondary); margin-top:4px;"></div>
      </div>

      <div class="grid-12" style="gap:1rem;">
        <!-- Add Alarm Form left -->
        <div style="grid-column:span 5; display:flex; flex-direction:column; gap:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Set New Alarm</h3>

          <div style="display:flex; flex-direction:column; gap:8px;">
            <input type="time" id="alarm-time-input" class="input-glass" style="font-size:1.25rem; font-weight:700;" />
            <input type="text" id="alarm-label-input" class="input-glass" placeholder='Alarm label (e.g. "Morning Standup")' style="font-size:0.85rem;" />

            <select id="alarm-repeat-sel" class="input-glass" style="font-size:0.85rem;">
              <option value="once">Once Only</option>
              <option value="daily">Every Day</option>
              <option value="weekdays">Weekdays Only (Mon–Fri)</option>
              <option value="weekends">Weekends Only (Sat–Sun)</option>
            </select>

            <button id="alarm-set-btn" class="btn-primary" style="width:100%; padding:0.75rem; font-size:0.95rem; font-weight:700;">⏰ Set Alarm</button>
          </div>

          <div id="alarm-status-msg" style="font-size:0.8rem; color:var(--text-muted); text-align:center;"></div>
        </div>

        <!-- Alarms list right -->
        <div style="grid-column:span 7; display:flex; flex-direction:column; gap:0.75rem; border-left:1px solid var(--glass-border); padding-left:1.25rem;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Active Alarms</h3>
            <span id="alarm-count-badge" class="badge badge-primary">0 set</span>
          </div>
          <div id="alarm-list" style="display:flex; flex-direction:column; gap:10px; max-height:300px; overflow-y:auto;">
            <p style="color:var(--text-muted); text-align:center; padding:40px 0; font-size:0.85rem;">No alarms set yet. Add one on the left.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  let alarms = JSON.parse(localStorage.getItem("alarms_list") || "[]");
  let checkInterval;

  // Request notification permission on init
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }

  // Real-time clock
  function updateClock() {
    const now = new Date();
    document.getElementById("alarm-now-time").textContent = now.toLocaleTimeString("en-US", { hour12: false });
    document.getElementById("alarm-now-date").textContent = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  }
  setInterval(updateClock, 1000);
  updateClock();

  document.getElementById("alarm-set-btn").addEventListener("click", () => {
    const time = document.getElementById("alarm-time-input").value;
    const label = document.getElementById("alarm-label-input").value.trim() || "Alarm";
    const repeat = document.getElementById("alarm-repeat-sel").value;
    if (!time) { showStatus("Please set a time first.", "var(--danger)"); return; }

    alarms.push({ id: Date.now(), time, label, repeat, active: true });
    localStorage.setItem("alarms_list", JSON.stringify(alarms));
    renderAlarms();
    showStatus(`✓ Alarm set for ${time} (${repeat})`, "var(--success)");

    apiFetch("alarm", { time, label, repeat }).catch(err => console.error(err));
  });

  function showStatus(msg, color) {
    const el = document.getElementById("alarm-status-msg");
    el.textContent = msg;
    el.style.color = color;
    setTimeout(() => { el.textContent = ""; }, 3000);
  }

  function renderAlarms() {
    const list = document.getElementById("alarm-list");
    document.getElementById("alarm-count-badge").textContent = `${alarms.length} set`;

    if (alarms.length === 0) {
      list.innerHTML = `<p style="color:var(--text-muted); text-align:center; padding:40px 0; font-size:0.85rem;">No alarms set yet.</p>`;
      return;
    }

    list.innerHTML = "";
    alarms.forEach((alarm, i) => {
      const card = document.createElement("div");
      card.className = "card-glass anim-slide-up";
      card.style.cssText = `padding:0.75rem; display:flex; justify-content:space-between; align-items:center; border-color:${alarm.active ? "var(--primary)" : "var(--glass-border)"};`;
      card.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
          <label class="switch" style="position:relative; display:inline-block; width:36px; height:20px; cursor:pointer;">
            <input type="checkbox" ${alarm.active ? "checked" : ""} style="opacity:0; width:0; height:0;" class="alarm-toggle" data-idx="${i}" />
            <span style="position:absolute; inset:0; background:${alarm.active ? "var(--primary)" : "var(--glass-border)"}; border-radius:20px; transition:0.3s;"></span>
            <span style="position:absolute; top:3px; left:${alarm.active ? "17px" : "3px"}; width:14px; height:14px; background:white; border-radius:50%; transition:0.3s;"></span>
          </label>
          <div>
            <div style="font-size:1.2rem; font-weight:800; color:${alarm.active ? "var(--primary)" : "var(--text-muted)"}; font-family:monospace;">${alarm.time}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${alarm.label} · ${alarm.repeat}</div>
          </div>
        </div>
        <button class="alarm-del-btn btn-glass" data-idx="${i}" style="font-size:0.75rem; padding:2px 8px; color:var(--danger);">🗑️</button>
      `;
      card.querySelector(".alarm-toggle").addEventListener("change", e => {
        alarms[i].active = e.target.checked;
        localStorage.setItem("alarms_list", JSON.stringify(alarms));
        renderAlarms();
      });
      card.querySelector(".alarm-del-btn").addEventListener("click", () => {
        alarms.splice(i, 1);
        localStorage.setItem("alarms_list", JSON.stringify(alarms));
        renderAlarms();
      });
      list.appendChild(card);
    });
  }

  // Alarm tick checker
  function checkAlarms() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    const currentTime = `${hh}:${mm}`;
    const dayOfWeek = now.getDay();

    alarms.forEach(alarm => {
      if (!alarm.active) return;
      if (alarm.time !== currentTime) return;
      if (alarm._lastTriggered === currentTime) return;

      const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      if (alarm.repeat === "weekdays" && !isWeekday) return;
      if (alarm.repeat === "weekends" && !isWeekend) return;

      alarm._lastTriggered = currentTime;
      triggerAlarm(alarm);
    });
  }

  function triggerAlarm(alarm) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`⏰ ${alarm.label}`, { body: `It's ${alarm.time} — Alarm triggered!`, icon: "icons/icon-192.png" });
    } else {
      alert(`⏰ Alarm! ${alarm.label} — It's ${alarm.time}`);
    }
    if (alarm.repeat === "once") {
      alarm.active = false;
      localStorage.setItem("alarms_list", JSON.stringify(alarms));
      renderAlarms();
    }
  }

  setInterval(checkAlarms, 30000);
  renderAlarms();
}
