/**
 * Scientific Calculator — alias to full calculator module (shares container `scientificCalculator`)
 */
export function init() {
  const container = document.getElementById("scientificCalculator");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width:500px; margin:0 auto;">
      <div class="module-header">
        <h2 class="module-title">📐 Scientific Formula Calculator</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Expression input with history -->
      <div class="card-glass" style="background:rgba(0,0,0,0.3); padding:1rem; border-radius:8px; margin-bottom:1rem; display:flex; flex-direction:column; align-items:flex-end; justify-content:center; min-height:90px; gap:4px;">
        <div id="sci-history" style="font-size:0.75rem; color:var(--text-muted); font-family:monospace; word-break:break-all; text-align:right;"></div>
        <div id="sci-display" style="font-size:1.8rem; font-weight:bold; color:var(--primary); font-family:monospace; word-break:break-all; text-align:right;">0</div>
      </div>

      <!-- Buttons -->
      <div style="display:grid; grid-template-columns:repeat(5, 1fr); gap:7px;">
        <!-- Row 1: Scientific -->
        <button class="btn-glass sci-key" data-val="sin(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">sin</button>
        <button class="btn-glass sci-key" data-val="cos(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">cos</button>
        <button class="btn-glass sci-key" data-val="tan(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">tan</button>
        <button class="btn-glass sci-key" data-val="log10(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">log</button>
        <button class="btn-glass sci-key" data-val="Math.log(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">ln</button>

        <!-- Row 2: More -->
        <button class="btn-glass sci-key" data-val="Math.sqrt(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">√x</button>
        <button class="btn-glass sci-key" data-val="Math.pow(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">x^y</button>
        <button class="btn-glass sci-key" data-val="Math.PI" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">π</button>
        <button class="btn-glass sci-key" data-val="Math.E" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">e</button>
        <button class="btn-glass sci-key" data-val="Math.abs(" style="padding:0.5rem 0; font-size:0.72rem; font-weight:700;">|x|</button>

        <!-- Row 3: Control -->
        <button class="btn-glass sci-key" data-val="(" style="padding:0.5rem 0; font-size:0.8rem; font-weight:700; color:var(--secondary);">(</button>
        <button class="btn-glass sci-key" data-val=")" style="padding:0.5rem 0; font-size:0.8rem; font-weight:700; color:var(--secondary);">)</button>
        <button class="btn-glass sci-key" data-val="%" style="padding:0.5rem 0; font-size:0.8rem; font-weight:700;">%</button>
        <button class="btn-glass sci-key" data-val="C" style="padding:0.5rem 0; font-size:0.8rem; font-weight:700; color:var(--danger);">C</button>
        <button class="btn-glass sci-key" data-val="back" style="padding:0.5rem 0; font-size:0.8rem; font-weight:700; color:var(--warning);">⌫</button>

        <!-- Number rows -->
        <button class="btn-glass sci-key" data-val="7" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">7</button>
        <button class="btn-glass sci-key" data-val="8" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">8</button>
        <button class="btn-glass sci-key" data-val="9" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">9</button>
        <button class="btn-glass sci-key" data-val="*" style="padding:0.75rem 0; font-weight:700; font-size:1rem; color:var(--secondary);">×</button>
        <button class="btn-glass sci-key" data-val="/" style="padding:0.75rem 0; font-weight:700; font-size:1rem; color:var(--secondary);">÷</button>

        <button class="btn-glass sci-key" data-val="4" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">4</button>
        <button class="btn-glass sci-key" data-val="5" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">5</button>
        <button class="btn-glass sci-key" data-val="6" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">6</button>
        <button class="btn-glass sci-key" data-val="+" style="padding:0.75rem 0; font-weight:700; font-size:1rem; color:var(--secondary);">+</button>
        <button class="btn-glass sci-key" data-val="-" style="padding:0.75rem 0; font-weight:700; font-size:1rem; color:var(--secondary);">-</button>

        <button class="btn-glass sci-key" data-val="1" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">1</button>
        <button class="btn-glass sci-key" data-val="2" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">2</button>
        <button class="btn-glass sci-key" data-val="3" style="padding:0.75rem 0; font-weight:700; font-size:1rem;">3</button>
        <button class="btn-glass sci-key" data-val="**" style="padding:0.75rem 0; font-weight:700; font-size:1rem; color:var(--secondary);">^</button>
        <button class="btn-primary sci-key" data-val="=" style="padding:0.75rem 0; font-weight:800; font-size:1.1rem; grid-row:span 2; box-shadow: 0 4px 15px var(--primary-glow);" id="sci-equals-btn">=</button>

        <button class="btn-glass sci-key" data-val="0" style="padding:0.75rem 0; font-weight:700; font-size:1rem; grid-column:span 2;">0</button>
        <button class="btn-glass sci-key" data-val="." style="padding:0.75rem 0; font-weight:700; font-size:1rem;">.</button>
        <button class="btn-glass sci-key" data-val="," style="padding:0.75rem 0; font-weight:700; font-size:0.75rem; color:var(--text-muted);">,(arg)</button>
      </div>
    </div>
  `;

  const display = document.getElementById("sci-display");
  const history = document.getElementById("sci-history");
  let expr = "";

  function safe_eval(e) {
    /* Replace shortcuts for safe evaluation */
    const processed = e
      .replace(/sin\(/g, "Math.sin(")
      .replace(/cos\(/g, "Math.cos(")
      .replace(/tan\(/g, "Math.tan(")
      .replace(/log10\(/g, "Math.log10(")
      .replace(/Math\.log\(/g, "Math.log(");
    // eslint-disable-next-line no-eval
    return eval(processed);
  }

  container.querySelectorAll(".sci-key").forEach(k => {
    k.addEventListener("click", () => {
      const v = k.dataset.val;
      if (v === "C") { expr = ""; display.textContent = "0"; history.textContent = ""; }
      else if (v === "back") { expr = expr.slice(0, -1); display.textContent = expr || "0"; }
      else if (v === "=") {
        try {
          const result = safe_eval(expr);
          history.textContent = expr + " =";
          display.textContent = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
          expr = String(result);
        } catch { display.textContent = "Error"; expr = ""; }
      } else {
        expr += v;
        display.textContent = expr;
      }
    });
  });
}
