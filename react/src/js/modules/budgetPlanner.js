import { apiFetch } from "../utils/fetch.js";

/**
 * Budget Planner Module — Full UI
 */
export function init() {
  const container = document.getElementById("budgetPlanner");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📊 Budget Planner</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Income & Net Summary row -->
      <div class="grid-12" style="margin-bottom:1.5rem; gap:10px;">
        <div class="card-glass" style="grid-column:span 4; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Monthly Income</div>
          <div id="bp-income-display" style="font-size:1.75rem; font-weight:800; color:var(--success);">$0.00</div>
        </div>
        <div class="card-glass" style="grid-column:span 4; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Total Allocated</div>
          <div id="bp-allocated-display" style="font-size:1.75rem; font-weight:800; color:var(--warning);">$0.00</div>
        </div>
        <div class="card-glass" style="grid-column:span 4; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; margin-bottom:4px;">Remaining Budget</div>
          <div id="bp-remaining-display" style="font-size:1.75rem; font-weight:800; color:var(--primary);">$0.00</div>
        </div>
      </div>

      <div class="grid-12" style="gap:1rem;">
        <!-- Left: Setup form -->
        <div style="grid-column:span 5; display:flex; flex-direction:column; gap:1rem;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">💵 Monthly Income</label>
            <input type="number" id="bp-income-input" class="input-glass" placeholder="e.g. 3500" style="font-size:1rem; font-weight:700;" />
          </div>

          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary); margin-top:0.5rem;">Budget Categories</h3>

          <div id="bp-categories-form" style="display:flex; flex-direction:column; gap:8px;">
            <!-- Render dynamically -->
          </div>

          <button id="bp-add-cat-btn" class="btn-glass" style="font-size:0.85rem; width:100%; display:flex; align-items:center; justify-content:center; gap:6px;">
            <span>+</span> Add Category
          </button>

          <button id="bp-calculate-btn" class="btn-primary" style="width:100%; padding:0.75rem; font-weight:700; font-size:0.95rem;">Calculate Budget Plan</button>
        </div>

        <!-- Right: Visual breakdown -->
        <div style="grid-column:span 7; display:flex; flex-direction:column; gap:1rem; border-left:1px solid var(--glass-border); padding-left:1.25rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Allocation Breakdown</h3>

          <div id="bp-bars-container" style="display:flex; flex-direction:column; gap:12px;">
            <p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:40px 0;">Set your income and categories, then click Calculate.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const defaultCategories = [
    { name: "Housing & Rent", icon: "🏠", amount: 1200, color: "var(--primary)" },
    { name: "Food & Groceries", icon: "🍎", amount: 400, color: "var(--secondary)" },
    { name: "Transportation", icon: "🚗", amount: 200, color: "var(--warning)" },
    { name: "Utilities & Bills", icon: "⚡", amount: 150, color: "var(--success)" },
    { name: "Entertainment", icon: "🎮", amount: 100, color: "var(--danger)" },
    { name: "Savings", icon: "💰", amount: 500, color: "hsl(270, 80%, 65%)" }
  ];

  let categories = [...defaultCategories];
  const catForm = document.getElementById("bp-categories-form");
  const incomeInput = document.getElementById("bp-income-input");
  const addCatBtn = document.getElementById("bp-add-cat-btn");
  const calcBtn = document.getElementById("bp-calculate-btn");
  const barsContainer = document.getElementById("bp-bars-container");

  incomeInput.value = "3000";

  function renderCategoryInputs() {
    catForm.innerHTML = "";
    categories.forEach((cat, i) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; gap:6px; align-items:center;";
      row.innerHTML = `
        <span style="font-size:1.1rem; flex-shrink:0;">${cat.icon}</span>
        <input type="text" value="${cat.name}" class="input-glass" style="flex:2; font-size:0.8rem; padding:0.4rem 0.6rem;" placeholder="Category name" />
        <input type="number" value="${cat.amount}" class="input-glass" style="flex:1; font-size:0.8rem; padding:0.4rem 0.5rem; min-width:0;" placeholder="$" />
        <button class="cat-del-btn btn-glass" data-idx="${i}" style="font-size:0.75rem; padding:0.3rem 0.5rem; color:var(--danger); flex-shrink:0;">×</button>
      `;
      row.querySelectorAll("input")[0].addEventListener("input", e => { categories[i].name = e.target.value; });
      row.querySelectorAll("input")[1].addEventListener("input", e => { categories[i].amount = parseFloat(e.target.value) || 0; });
      row.querySelector(".cat-del-btn").addEventListener("click", () => { categories.splice(i, 1); renderCategoryInputs(); });
      catForm.appendChild(row);
    });
  }

  addCatBtn.addEventListener("click", () => {
    categories.push({ name: "New Category", icon: "📦", amount: 0, color: "var(--primary)" });
    renderCategoryInputs();
  });

  calcBtn.addEventListener("click", () => {
    const income = parseFloat(incomeInput.value) || 0;
    const totalAllocated = categories.reduce((s, c) => s + (c.amount || 0), 0);
    const remaining = income - totalAllocated;

    document.getElementById("bp-income-display").textContent = `$${income.toFixed(2)}`;
    document.getElementById("bp-allocated-display").textContent = `$${totalAllocated.toFixed(2)}`;
    const remainLbl = document.getElementById("bp-remaining-display");
    remainLbl.textContent = `$${remaining.toFixed(2)}`;
    remainLbl.style.color = remaining < 0 ? "var(--danger)" : remaining < income * 0.1 ? "var(--warning)" : "var(--success)";

    barsContainer.innerHTML = "";
    categories.forEach((cat, i) => {
      const pct = income > 0 ? Math.min((cat.amount / income) * 100, 100) : 0;
      const colors = ["var(--primary)", "var(--secondary)", "var(--warning)", "var(--success)", "var(--danger)", "hsl(270,80%,65%)", "hsl(200,80%,55%)"];
      const bar = document.createElement("div");
      bar.className = "anim-slide-up";
      bar.style.display = "flex";
      bar.style.flexDirection = "column";
      bar.style.gap = "4px";
      bar.innerHTML = `
        <div style="display:flex; justify-content:space-between; font-size:0.82rem; font-weight:600;">
          <span>${cat.icon} ${cat.name}</span>
          <span style="color:var(--text-muted);">$${cat.amount.toFixed(2)} (${pct.toFixed(1)}%)</span>
        </div>
        <div style="width:100%; height:10px; background:var(--glass-border); border-radius:10px; overflow:hidden;">
          <div style="height:100%; width:${pct}%; background:${colors[i % colors.length]}; border-radius:10px; transition:width 0.6s ease; box-shadow:0 0 8px ${colors[i % colors.length]}88;"></div>
        </div>
      `;
      barsContainer.appendChild(bar);
    });

    apiFetch("saveBudget", { income, categories, totalAllocated, remaining }).catch(err => console.error(err));
  });

  renderCategoryInputs();
  // Trigger initial calculation
  setTimeout(() => calcBtn.click(), 100);
}
