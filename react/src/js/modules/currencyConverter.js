import { apiFetch } from "../utils/fetch.js";

/**
 * Currency Converter Module — Full UI
 */
export function init() {
  const container = document.getElementById("currencyConverter");
  if (!container) return;

  const CURRENCIES = [
    { code: "USD", name: "US Dollar", flag: "🇺🇸" },
    { code: "EUR", name: "Euro", flag: "🇪🇺" },
    { code: "GBP", name: "British Pound", flag: "🇬🇧" },
    { code: "JPY", name: "Japanese Yen", flag: "🇯🇵" },
    { code: "CNY", name: "Chinese Yuan", flag: "🇨🇳" },
    { code: "INR", name: "Indian Rupee", flag: "🇮🇳" },
    { code: "BDT", name: "Bangladeshi Taka", flag: "🇧🇩" },
    { code: "AUD", name: "Australian Dollar", flag: "🇦🇺" },
    { code: "CAD", name: "Canadian Dollar", flag: "🇨🇦" },
    { code: "SGD", name: "Singapore Dollar", flag: "🇸🇬" },
    { code: "AED", name: "UAE Dirham", flag: "🇦🇪" },
    { code: "SAR", name: "Saudi Riyal", flag: "🇸🇦" },
    { code: "CHF", name: "Swiss Franc", flag: "🇨🇭" },
    { code: "MYR", name: "Malaysian Ringgit", flag: "🇲🇾" },
    { code: "KRW", name: "South Korean Won", flag: "🇰🇷" }
  ];

  const currOpts = CURRENCIES.map(c => `<option value="${c.code}">${c.flag} ${c.code} — ${c.name}</option>`).join("");

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width:600px; margin:0 auto;">
      <div class="module-header">
        <h2 class="module-title">💱 Live Currency Exchange</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Amount input -->
        <div>
          <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Amount</label>
          <input type="number" id="cur-amount" class="input-glass" style="font-size:1.5rem; font-weight:700; margin-top:4px;" value="100" min="0" step="0.01" />
        </div>

        <!-- From / Swap / To row -->
        <div style="display:flex; gap:10px; align-items:center;">
          <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.75rem; color:var(--text-muted);">From Currency</label>
            <select id="cur-from" class="input-glass">${currOpts}</select>
          </div>
          <button id="cur-swap-btn" class="btn-glass" style="width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; flex-shrink:0; margin-top:18px;" title="Swap">🔄</button>
          <div style="flex:1; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.75rem; color:var(--text-muted);">To Currency</label>
            <select id="cur-to" class="input-glass">${currOpts}</select>
          </div>
        </div>

        <!-- Convert Button -->
        <button id="cur-convert-btn" class="btn-primary" style="font-size:1rem; font-weight:700; padding:0.75rem; width:100%;">Convert Now</button>

        <!-- Result Big Display -->
        <div class="card-glass" style="background:rgba(0,0,0,0.2); padding:1.5rem; text-align:center; display:none;" id="cur-result-card">
          <div id="cur-result-amount" style="font-size:2.5rem; font-weight:800; color:var(--primary);"></div>
          <div id="cur-result-rate" style="font-size:0.85rem; color:var(--text-secondary); margin-top:8px;"></div>
          <div style="font-size:0.7rem; color:var(--text-muted); margin-top:4px;" id="cur-rate-date"></div>
        </div>

        <!-- Quick Reference Table -->
        <div>
          <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.75rem;">Common Rates vs USD</h3>
          <div id="cur-rates-table" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
            <!-- Render dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

  const amountIn = document.getElementById("cur-amount");
  const fromSel = document.getElementById("cur-from");
  const toSel = document.getElementById("cur-to");
  const swapBtn = document.getElementById("cur-swap-btn");
  const convertBtn = document.getElementById("cur-convert-btn");
  const resultCard = document.getElementById("cur-result-card");
  const resultAmount = document.getElementById("cur-result-amount");
  const resultRate = document.getElementById("cur-result-rate");
  const rateDateLbl = document.getElementById("cur-rate-date");
  const ratesTable = document.getElementById("cur-rates-table");

  // Set defaults
  fromSel.value = "USD";
  toSel.value = "BDT";

  // Fetch live rates using free exchangerate-api
  let cachedRates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 157.5, CNY: 7.25, INR: 83.5, BDT: 110.5, AUD: 1.54, CAD: 1.37, SGD: 1.35, AED: 3.67, SAR: 3.75, CHF: 0.90, MYR: 4.72, KRW: 1370 };

  fetch("https://api.exchangerate-api.com/v4/latest/USD")
    .then(r => r.json())
    .then(data => {
      cachedRates = data.rates;
      renderRatesTable();
    })
    .catch(() => renderRatesTable());

  function renderRatesTable() {
    ratesTable.innerHTML = "";
    const highlight = ["EUR", "GBP", "JPY", "INR", "BDT", "AUD", "CAD", "AED", "CNY"];
    highlight.forEach(code => {
      const rate = cachedRates[code];
      if (!rate) return;
      const curr = CURRENCIES.find(c => c.code === code);
      const card = document.createElement("div");
      card.className = "card-glass";
      card.style.cssText = "padding:0.6rem; text-align:center; background:rgba(0,0,0,0.2);";
      card.innerHTML = `
        <div style="font-size:1.1rem;">${curr?.flag || ""}</div>
        <div style="font-size:0.78rem; font-weight:700;">${code}</div>
        <div style="font-size:0.72rem; color:var(--primary);">${rate.toFixed(2)}</div>
      `;
      ratesTable.appendChild(card);
    });
  }

  convertBtn.addEventListener("click", () => {
    const amount = parseFloat(amountIn.value);
    const from = fromSel.value;
    const to = toSel.value;
    if (isNaN(amount) || amount < 0) return;

    const fromRate = cachedRates[from] || 1;
    const toRate = cachedRates[to] || 1;
    const converted = (amount / fromRate) * toRate;
    const rate = toRate / fromRate;

    resultAmount.textContent = `${converted.toFixed(2)} ${to}`;
    resultRate.textContent = `1 ${from} = ${rate.toFixed(4)} ${to}`;
    rateDateLbl.textContent = `Rate source: exchangerate-api.com (free tier) • Live`;
    resultCard.style.display = "block";

    apiFetch("currencyConverter", { amount, from, to, result: converted }).catch(err => console.error(err));
  });

  swapBtn.addEventListener("click", () => {
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
  });
}
