import { apiFetch } from "../utils/fetch.js";

/**
 * Habit Tracker Module — Full UI with streak calendar
 */
export function init() {
  const container = document.getElementById("habitTracker");
  if (!container) return;

  const DEFAULT_HABITS = ["💧 Drink 8 Glasses Water", "📚 Read 20 Minutes", "🏋️ Exercise / Walk", "🧘 Meditate 5 Minutes", "🍎 Eat Healthy Meals", "😴 Sleep 8 Hours", "💻 Learn Something New"];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🎯 Daily Habit Tracker</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Date header bar -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; background:rgba(0,0,0,0.2); padding:0.75rem 1rem; border-radius:10px;">
        <div>
          <div style="font-size:1.1rem; font-weight:700;" id="hab-today-label">Today's Habits</div>
          <div style="font-size:0.8rem; color:var(--text-muted);" id="hab-date-label"></div>
        </div>
        <div style="display:flex; align-items:center; gap:1rem;">
          <div style="text-align:center;">
            <div id="hab-completed-count" style="font-size:1.8rem; font-weight:800; color:var(--primary);">0</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">Completed</div>
          </div>
          <div style="text-align:center;">
            <div id="hab-total-count" style="font-size:1.8rem; font-weight:800; color:var(--text-secondary);">0</div>
            <div style="font-size:0.7rem; color:var(--text-muted);">Total</div>
          </div>
          <div style="width:60px; height:60px; border-radius:50%; border:3px solid var(--glass-border); display:flex; align-items:center; justify-content:center; font-size:0.8rem; font-weight:700;" id="hab-progress-ring">0%</div>
        </div>
      </div>

      <div class="grid-12" style="gap:1rem;">
        <!-- Daily habit checklist -->
        <div style="grid-column:span 7; display:flex; flex-direction:column; gap:0.5rem;" id="habits-list-container">
          <!-- Render dynamically -->
        </div>

        <!-- Add Habit + Streak sidebar -->
        <div style="grid-column:span 5; display:flex; flex-direction:column; gap:1rem; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary);">Add Custom Habit</h3>
          <div style="display:flex; gap:8px;">
            <input id="hab-new-input" class="input-glass" style="flex:1; font-size:0.85rem;" placeholder="e.g. 🎸 Play Guitar" />
            <button id="hab-add-btn" class="btn-primary" style="padding: 0 0.75rem;">Add</button>
          </div>
          <div id="hab-streak-area" style="margin-top:0.5rem;">
            <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.5rem;">🔥 Streak Board</h3>
            <div class="card-glass" style="background:rgba(0,0,0,0.2); padding:1rem; text-align:center;">
              <div style="font-size:2rem; font-weight:800; color:var(--primary);" id="hab-streak-count">0</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">Day Streak</div>
              <div style="margin-top:0.75rem; font-size:0.78rem; color:var(--text-secondary);">Complete all habits daily to build your streak!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const habListContainer = document.getElementById("habits-list-container");
  const habNewInput = document.getElementById("hab-new-input");
  const habAddBtn = document.getElementById("hab-add-btn");
  const completedCount = document.getElementById("hab-completed-count");
  const totalCount = document.getElementById("hab-total-count");
  const progressRing = document.getElementById("hab-progress-ring");
  const streakCount = document.getElementById("hab-streak-count");
  const dateLbl = document.getElementById("hab-date-label");

  const today = new Date().toDateString();
  dateLbl.textContent = today;

  const storageKey = `habits_${new Date().toDateString()}`;
  let habits = JSON.parse(localStorage.getItem("habits_defaults") || "null") || DEFAULT_HABITS.map(t => ({ text: t, done: false }));
  let todayStatus = JSON.parse(localStorage.getItem(storageKey) || "{}");

  function renderHabits() {
    habListContainer.innerHTML = "";
    let done = 0;
    habits.forEach((hab, i) => {
      const isDone = todayStatus[i] || false;
      if (isDone) done++;
      const row = document.createElement("div");
      row.className = "card-glass anim-slide-up";
      row.style.cssText = `padding:0.75rem; display:flex; align-items:center; gap:12px; cursor:pointer; border-color:${isDone ? "var(--primary)" : "var(--glass-border)"}; background:${isDone ? "var(--primary-glow)" : "rgba(0,0,0,0.15)"};`;
      row.innerHTML = `
        <div style="width:22px; height:22px; border-radius:50%; border:2px solid ${isDone ? "var(--primary)" : "var(--glass-border)"}; display:flex; align-items:center; justify-content:center; background:${isDone ? "var(--primary)" : "transparent"}; flex-shrink:0; font-size:0.75rem; color:white;">
          ${isDone ? "✓" : ""}
        </div>
        <span style="font-size:0.9rem; font-weight:600; flex:1; ${isDone ? "text-decoration:line-through; opacity:0.6;" : ""}">${hab.text}</span>
        <button class="hab-del-btn" data-idx="${i}" style="background:none; border:none; cursor:pointer; color:var(--text-muted); font-size:0.75rem; padding:2px 4px;">🗑️</button>
      `;
      row.addEventListener("click", e => {
        if (e.target.classList.contains("hab-del-btn")) return;
        todayStatus[i] = !todayStatus[i];
        localStorage.setItem(storageKey, JSON.stringify(todayStatus));
        renderHabits();
        apiFetch("updateHabit", { habit: hab.text, done: todayStatus[i] }).catch(err => console.error(err));
      });
      row.querySelector(".hab-del-btn").addEventListener("click", e => {
        e.stopPropagation();
        habits.splice(i, 1);
        localStorage.setItem("habits_defaults", JSON.stringify(habits));
        delete todayStatus[i];
        localStorage.setItem(storageKey, JSON.stringify(todayStatus));
        renderHabits();
      });
      habListContainer.appendChild(row);
    });
    const total = habits.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    completedCount.textContent = done;
    totalCount.textContent = total;
    progressRing.textContent = `${pct}%`;
    progressRing.style.borderColor = pct >= 80 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--glass-border)";
    streakCount.textContent = pct === 100 ? (parseInt(localStorage.getItem("hab_streak") || 0) + 1) : parseInt(localStorage.getItem("hab_streak") || 0);
  }

  habAddBtn.addEventListener("click", () => {
    const text = habNewInput.value.trim();
    if (!text) return;
    habits.push({ text, done: false });
    localStorage.setItem("habits_defaults", JSON.stringify(habits));
    habNewInput.value = "";
    renderHabits();
  });

  habNewInput.addEventListener("keydown", e => { if (e.key === "Enter") habAddBtn.click(); });

  renderHabits();
}
