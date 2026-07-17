import { apiFetch } from "../utils/fetch.js";

/**
 * Unit Converter Module — Full UI with all categories
 */
export function init() {
  const container = document.getElementById("unitConverter");
  if (!container) return;

  const CATEGORIES = {
    Length: {
      units: ["Meter", "Kilometer", "Centimeter", "Millimeter", "Mile", "Yard", "Foot", "Inch"],
      toBase: { Meter:1, Kilometer:1000, Centimeter:0.01, Millimeter:0.001, Mile:1609.34, Yard:0.9144, Foot:0.3048, Inch:0.0254 }
    },
    Weight: {
      units: ["Kilogram", "Gram", "Milligram", "Pound", "Ounce", "Ton"],
      toBase: { Kilogram:1, Gram:0.001, Milligram:0.000001, Pound:0.453592, Ounce:0.0283495, Ton:1000 }
    },
    Temperature: {
      units: ["Celsius", "Fahrenheit", "Kelvin"],
      toBase: null // special case
    },
    Volume: {
      units: ["Liter", "Milliliter", "Gallon (US)", "Quart", "Pint", "Cup"],
      toBase: { Liter:1, Milliliter:0.001, "Gallon (US)":3.78541, Quart:0.946353, Pint:0.473176, Cup:0.236588 }
    },
    Area: {
      units: ["Square Meter", "Square Kilometer", "Square Foot", "Square Inch", "Acre", "Hectare"],
      toBase: { "Square Meter":1, "Square Kilometer":1e6, "Square Foot":0.0929, "Square Inch":0.000645, Acre:4046.86, Hectare:10000 }
    },
    Speed: {
      units: ["m/s", "km/h", "mph", "Knot"],
      toBase: { "m/s":1, "km/h":0.277778, mph:0.44704, Knot:0.514444 }
    }
  };

  const categoryTabs = Object.keys(CATEGORIES).map((cat, i) =>
    `<button class="btn-glass unit-cat-btn" data-cat="${cat}" style="font-size:0.8rem;">${cat}</button>`
  ).join("");

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width:580px; margin:0 auto;">
      <div class="module-header">
        <h2 class="module-title">📐 Unit Converter Suite</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Category Tabs -->
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:1.25rem;" id="unit-cat-tabs">
        ${categoryTabs}
      </div>

      <div style="display:flex; flex-direction:column; gap:1rem;">
        <div class="grid-12" style="gap:10px;">
          <div style="grid-column:span 5; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">From Unit</label>
            <select id="unit-from-sel" class="input-glass"></select>
          </div>
          <button id="unit-swap-btn" class="btn-glass" style="grid-column:span 2; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.25rem; margin:auto; margin-top:22px;" title="Swap">🔄</button>
          <div style="grid-column:span 5; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">To Unit</label>
            <select id="unit-to-sel" class="input-glass"></select>
          </div>
        </div>

        <div class="grid-12" style="gap:10px;">
          <div style="grid-column:span 6; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">Input Value</label>
            <input type="number" id="unit-input" class="input-glass" value="1" style="font-size:1.2rem; font-weight:700;" />
          </div>
          <div style="grid-column:span 6; display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">Result</label>
            <input type="text" id="unit-result" class="input-glass" readonly style="font-size:1.2rem; font-weight:700; background:rgba(0,0,0,0.2); color:var(--primary);" />
          </div>
        </div>

        <button id="unit-convert-btn" class="btn-primary" style="width:100%; padding:0.75rem; font-size:1rem; font-weight:700;">Convert</button>

        <div id="unit-formula" style="font-size:0.8rem; color:var(--text-muted); padding:0.5rem 0; min-height:24px; text-align:center;"></div>
      </div>
    </div>
  `;

  let currentCat = "Length";
  const catButtons = document.querySelectorAll(".unit-cat-btn");
  const fromSel = document.getElementById("unit-from-sel");
  const toSel = document.getElementById("unit-to-sel");
  const inputField = document.getElementById("unit-input");
  const resultField = document.getElementById("unit-result");
  const swapBtn = document.getElementById("unit-swap-btn");
  const convertBtn = document.getElementById("unit-convert-btn");
  const formulaLbl = document.getElementById("unit-formula");

  function activateCat(cat) {
    currentCat = cat;
    catButtons.forEach(b => {
      b.classList.toggle("btn-primary", b.dataset.cat === cat);
      b.classList.toggle("btn-glass", b.dataset.cat !== cat);
    });
    const units = CATEGORIES[cat].units;
    fromSel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join("");
    toSel.innerHTML = units.map(u => `<option value="${u}">${u}</option>`).join("");
    if (units.length > 1) toSel.selectedIndex = 1;
    resultField.value = "";
    formulaLbl.textContent = "";
  }

  catButtons.forEach(btn => btn.addEventListener("click", () => activateCat(btn.dataset.cat)));
  activateCat("Length");

  function convertTemperature(value, from, to) {
    let celsius;
    if (from === "Celsius") celsius = value;
    else if (from === "Fahrenheit") celsius = (value - 32) * 5 / 9;
    else celsius = value - 273.15;

    if (to === "Celsius") return celsius;
    if (to === "Fahrenheit") return (celsius * 9 / 5) + 32;
    return celsius + 273.15;
  }

  convertBtn.addEventListener("click", () => {
    const val = parseFloat(inputField.value);
    const from = fromSel.value;
    const to = toSel.value;
    if (isNaN(val)) return;

    let result;
    if (currentCat === "Temperature") {
      result = convertTemperature(val, from, to);
      formulaLbl.textContent = `Formula applied: ${from} → ${to}`;
    } else {
      const map = CATEGORIES[currentCat].toBase;
      const inBase = val * map[from];
      result = inBase / map[to];
      formulaLbl.textContent = `${val} ${from} × ${map[from]} ÷ ${map[to]} = ${result.toFixed(6)} ${to}`;
    }

    resultField.value = result.toFixed(6).replace(/\.?0+$/, "");
  });

  swapBtn.addEventListener("click", () => {
    const tmp = fromSel.value;
    fromSel.value = toSel.value;
    toSel.value = tmp;
    const tmpVal = inputField.value;
    inputField.value = resultField.value || tmpVal;
    resultField.value = "";
  });

  // Real-time conversion on input
  inputField.addEventListener("input", () => convertBtn.click());
  fromSel.addEventListener("change", () => convertBtn.click());
  toSel.addEventListener("change", () => convertBtn.click());
}
