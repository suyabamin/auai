import { apiFetch } from "../utils/fetch.js";

/**
 * Health Tracker Module — Full UI
 */
export function init() {
  const container = document.getElementById("healthTracker");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">❤️ Vital Health Metrics</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Stats Ring Row -->
      <div class="grid-12" style="gap:1rem; margin-bottom:1.5rem;">
        <div class="card-glass" style="grid-column:span 3; text-align:center; padding:1rem; background:rgba(0,0,0,0.2);">
          <div style="font-size:2rem;">👣</div>
          <div id="hlth-steps-display" style="font-size:1.8rem; font-weight:800; color:var(--primary); margin:4px 0;">0</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Steps Today</div>
          <div style="width:100%; height:4px; background:var(--glass-border); border-radius:4px; margin-top:8px; overflow:hidden;"><div id="steps-bar" style="height:100%; background:var(--primary); border-radius:4px; width:0%; transition:width 0.5s;"></div></div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Goal: 10,000</div>
        </div>
        <div class="card-glass" style="grid-column:span 3; text-align:center; padding:1rem; background:rgba(0,0,0,0.2);">
          <div style="font-size:2rem;">🔥</div>
          <div id="hlth-cal-display" style="font-size:1.8rem; font-weight:800; color:var(--danger); margin:4px 0;">0</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Calories Burned</div>
          <div style="width:100%; height:4px; background:var(--glass-border); border-radius:4px; margin-top:8px; overflow:hidden;"><div id="cal-bar" style="height:100%; background:var(--danger); border-radius:4px; width:0%; transition:width 0.5s;"></div></div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Goal: 500 kcal</div>
        </div>
        <div class="card-glass" style="grid-column:span 3; text-align:center; padding:1rem; background:rgba(0,0,0,0.2);">
          <div style="font-size:2rem;">💧</div>
          <div id="hlth-water-display" style="font-size:1.8rem; font-weight:800; color:var(--secondary); margin:4px 0;">0</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Water Glasses</div>
          <div style="width:100%; height:4px; background:var(--glass-border); border-radius:4px; margin-top:8px; overflow:hidden;"><div id="water-bar" style="height:100%; background:var(--secondary); border-radius:4px; width:0%; transition:width 0.5s;"></div></div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Goal: 8 glasses</div>
        </div>
        <div class="card-glass" style="grid-column:span 3; text-align:center; padding:1rem; background:rgba(0,0,0,0.2);">
          <div style="font-size:2rem;">😴</div>
          <div id="hlth-sleep-display" style="font-size:1.8rem; font-weight:800; color:var(--warning); margin:4px 0;">0h</div>
          <div style="font-size:0.72rem; color:var(--text-muted);">Sleep Hours</div>
          <div style="width:100%; height:4px; background:var(--glass-border); border-radius:4px; margin-top:8px; overflow:hidden;"><div id="sleep-bar" style="height:100%; background:var(--warning); border-radius:4px; width:0%; transition:width 0.5s;"></div></div>
          <div style="font-size:0.65rem; color:var(--text-muted); margin-top:2px;">Goal: 8 hours</div>
        </div>
      </div>

      <!-- Log Daily Entry -->
      <div class="grid-12" style="gap:1rem;">
        <div style="grid-column:span 8;">
          <h3 style="font-size:1rem; font-weight:700; color:var(--text-secondary); margin-bottom:1rem;">Log Today's Data</h3>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:0.78rem; color:var(--text-muted);">👣 Steps Walked</label>
              <input type="number" id="hlth-steps-in" class="input-glass" placeholder="e.g. 7500" />
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:0.78rem; color:var(--text-muted);">🔥 Calories Burned</label>
              <input type="number" id="hlth-cal-in" class="input-glass" placeholder="e.g. 350" />
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:0.78rem; color:var(--text-muted);">💧 Water Glasses</label>
              <input type="number" id="hlth-water-in" class="input-glass" placeholder="e.g. 6" min="0" max="20" />
            </div>
            <div style="display:flex; flex-direction:column; gap:4px;">
              <label style="font-size:0.78rem; color:var(--text-muted);">😴 Sleep Hours</label>
              <input type="number" id="hlth-sleep-in" class="input-glass" placeholder="e.g. 7.5" step="0.5" min="0" max="24" />
            </div>
          </div>
          <button id="hlth-log-btn" class="btn-primary" style="width:100%; margin-top:1rem; padding:0.75rem; font-weight:700;">Log Health Data</button>
          <div id="hlth-log-status" style="font-size:0.8rem; color:var(--text-muted); margin-top:6px; text-align:center;"></div>
        </div>

        <!-- BMI Calculator -->
        <div style="grid-column:span 4; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.75rem;">BMI Calculator</h3>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <input type="number" id="bmi-weight" class="input-glass" placeholder="Weight (kg)" style="font-size:0.85rem;" />
            <input type="number" id="bmi-height" class="input-glass" placeholder="Height (cm)" style="font-size:0.85rem;" />
            <button id="bmi-calc-btn" class="btn-glass" style="font-size:0.85rem; padding:0.5rem;">Calculate BMI</button>
            <div id="bmi-result" class="card-glass" style="display:none; padding:0.75rem; text-align:center; background:rgba(0,0,0,0.2);">
              <div id="bmi-value" style="font-size:1.75rem; font-weight:800; color:var(--primary);"></div>
              <div id="bmi-category" style="font-size:0.82rem; font-weight:700; margin-top:4px;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  const stepsIn = document.getElementById("hlth-steps-in");
  const calIn = document.getElementById("hlth-cal-in");
  const waterIn = document.getElementById("hlth-water-in");
  const sleepIn = document.getElementById("hlth-sleep-in");
  const logBtn = document.getElementById("hlth-log-btn");
  const logStatus = document.getElementById("hlth-log-status");

  const stepsDisplay = document.getElementById("hlth-steps-display");
  const calDisplay = document.getElementById("hlth-cal-display");
  const waterDisplay = document.getElementById("hlth-water-display");
  const sleepDisplay = document.getElementById("hlth-sleep-display");

  // Load saved data
  const savedToday = JSON.parse(localStorage.getItem(`health_${new Date().toDateString()}`) || "{}");
  if (savedToday.steps) { stepsIn.value = savedToday.steps; stepsDisplay.textContent = savedToday.steps; document.getElementById("steps-bar").style.width = Math.min(savedToday.steps / 100, 100) + "%"; }
  if (savedToday.calories) { calIn.value = savedToday.calories; calDisplay.textContent = savedToday.calories; document.getElementById("cal-bar").style.width = Math.min(savedToday.calories / 5, 100) + "%"; }
  if (savedToday.water) { waterIn.value = savedToday.water; waterDisplay.textContent = savedToday.water; document.getElementById("water-bar").style.width = Math.min(savedToday.water / 8 * 100, 100) + "%"; }
  if (savedToday.sleep) { sleepIn.value = savedToday.sleep; sleepDisplay.textContent = savedToday.sleep + "h"; document.getElementById("sleep-bar").style.width = Math.min(savedToday.sleep / 8 * 100, 100) + "%"; }

  logBtn.addEventListener("click", () => {
    const steps = parseInt(stepsIn.value) || 0;
    const calories = parseInt(calIn.value) || 0;
    const water = parseInt(waterIn.value) || 0;
    const sleep = parseFloat(sleepIn.value) || 0;

    // Update display
    stepsDisplay.textContent = steps;
    calDisplay.textContent = calories;
    waterDisplay.textContent = water;
    sleepDisplay.textContent = sleep + "h";

    // Update bars
    document.getElementById("steps-bar").style.width = Math.min(steps / 100, 100) + "%";
    document.getElementById("cal-bar").style.width = Math.min(calories / 5, 100) + "%";
    document.getElementById("water-bar").style.width = Math.min(water / 8 * 100, 100) + "%";
    document.getElementById("sleep-bar").style.width = Math.min(sleep / 8 * 100, 100) + "%";

    // Save locally
    const data = { steps, calories, water, sleep };
    localStorage.setItem(`health_${new Date().toDateString()}`, JSON.stringify(data));
    logStatus.textContent = "✓ Health data saved locally!";
    logStatus.style.color = "var(--success)";
    setTimeout(() => { logStatus.textContent = ""; }, 2500);

    apiFetch("logHealth", data).catch(err => console.error("Health log sync error:", err));
  });

  // BMI Calculator
  const bmiWeight = document.getElementById("bmi-weight");
  const bmiHeight = document.getElementById("bmi-height");
  const bmiCalcBtn = document.getElementById("bmi-calc-btn");
  const bmiResult = document.getElementById("bmi-result");
  const bmiValue = document.getElementById("bmi-value");
  const bmiCategory = document.getElementById("bmi-category");

  bmiCalcBtn.addEventListener("click", () => {
    const w = parseFloat(bmiWeight.value);
    const h = parseFloat(bmiHeight.value) / 100;
    if (!w || !h) return;
    const bmi = w / (h * h);
    bmiValue.textContent = bmi.toFixed(1);

    let cat, col;
    if (bmi < 18.5) { cat = "Underweight"; col = "var(--secondary)"; }
    else if (bmi < 25) { cat = "Normal Weight ✅"; col = "var(--success)"; }
    else if (bmi < 30) { cat = "Overweight ⚠️"; col = "var(--warning)"; }
    else { cat = "Obese 🔴"; col = "var(--danger)"; }

    bmiCategory.textContent = cat;
    bmiCategory.style.color = col;
    bmiResult.style.display = "block";
  });
}
