/**
 * Initialise Scientific Calculator module.
 */
export function init() {
  const container = document.getElementById("calculator");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width: 440px; margin: 0 auto;">
      <div class="module-header" style="margin-bottom: 1rem;">
        <h2 class="module-title">🧮 Calculator Suite</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Calculator Display Screen -->
      <div class="card-glass" style="background: rgba(0, 0, 0, 0.35); border-color: var(--glass-border); padding: 1rem; border-radius: 8px; margin-bottom: 1rem; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; min-height: 80px; overflow: hidden;">
        <div id="calc-history" style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace; white-space: nowrap; overflow-x: auto; max-width: 100%;"></div>
        <div id="calc-display" style="font-size: 1.8rem; font-weight: bold; color: var(--primary); font-family: monospace; text-shadow: 0 0 10px var(--primary-glow); white-space: nowrap; overflow-x: auto; max-width: 100%; margin-top: 4px;">0</div>
      </div>

      <!-- Button Grid layout -->
      <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px;">
        <!-- Scientific Row -->
        <button class="btn-glass calc-key" data-val="sin" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">sin</button>
        <button class="btn-glass calc-key" data-val="cos" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">cos</button>
        <button class="btn-glass calc-key" data-val="tan" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">tan</button>
        <button class="btn-glass calc-key" data-val="pi" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">π</button>
        <button class="btn-glass calc-key" data-val="sqrt" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">√</button>

        <!-- Scientific/Control Row -->
        <button class="btn-glass calc-key" data-val="pow" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">^</button>
        <button class="btn-glass calc-key" data-val="log" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">log</button>
        <button class="btn-glass calc-key" data-val="ln" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700;">ln</button>
        <button class="btn-glass calc-key" data-val="C" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700; color: var(--danger);">C</button>
        <button class="btn-glass calc-key" data-val="back" style="padding: 0.5rem 0; font-size: 0.78rem; font-weight: 700; color: var(--warning);">⌫</button>

        <!-- Row 1 -->
        <button class="btn-glass calc-key" data-val="7" style="padding: 0.8rem 0; font-weight: 700;">7</button>
        <button class="btn-glass calc-key" data-val="8" style="padding: 0.8rem 0; font-weight: 700;">8</button>
        <button class="btn-glass calc-key" data-val="9" style="padding: 0.8rem 0; font-weight: 700;">9</button>
        <button class="btn-glass calc-key" data-val="(" style="padding: 0.8rem 0; font-weight: 700; color: var(--secondary);">(</button>
        <button class="btn-glass calc-key" data-val=")" style="padding: 0.8rem 0; font-weight: 700; color: var(--secondary);">)</button>

        <!-- Row 2 -->
        <button class="btn-glass calc-key" data-val="4" style="padding: 0.8rem 0; font-weight: 700;">4</button>
        <button class="btn-glass calc-key" data-val="5" style="padding: 0.8rem 0; font-weight: 700;">5</button>
        <button class="btn-glass calc-key" data-val="6" style="padding: 0.8rem 0; font-weight: 700;">6</button>
        <button class="btn-glass calc-key" data-val="*" style="padding: 0.8rem 0; font-weight: 700; color: var(--secondary);">×</button>
        <button class="btn-glass calc-key" data-val="/" style="padding: 0.8rem 0; font-weight: 700; color: var(--secondary);">÷</button>

        <!-- Row 3 -->
        <button class="btn-glass calc-key" data-val="1" style="padding: 0.8rem 0; font-weight: 700;">1</button>
        <button class="btn-glass calc-key" data-val="2" style="padding: 0.8rem 0; font-weight: 700;">2</button>
        <button class="btn-glass calc-key" data-val="3" style="padding: 0.8rem 0; font-weight: 700;">3</button>
        <button class="btn-glass calc-key" data-val="+" style="padding: 0.8rem 0; font-weight: 700; color: var(--secondary);">+</button>
        <button class="btn-glass calc-key" data-val="-" style="padding: 0.8rem 0; font-weight: 700; color: var(--secondary);">-</button>

        <!-- Row 4 -->
        <button class="btn-glass calc-key" data-val="0" style="padding: 0.8rem 0; font-weight: 700; grid-column: span 2;">0</button>
        <button class="btn-glass calc-key" data-val="." style="padding: 0.8rem 0; font-weight: 700;">.</button>
        <button class="btn-primary calc-key" data-val="=" style="padding: 0.8rem 0; font-weight: 800; grid-column: span 2; box-shadow: 0 4px 15px var(--primary-glow);">=</button>
      </div>
    </div>
  `;

  const display = document.getElementById("calc-display");
  const history = document.getElementById("calc-history");
  const keys = container.querySelectorAll(".calc-key");

  let expr = "";
  let evaluationDone = false;

  keys.forEach(k => {
    k.addEventListener("click", () => {
      const val = k.getAttribute("data-val");

      if (val === "C") {
        expr = "";
        display.textContent = "0";
        history.textContent = "";
        evaluationDone = false;
      } else if (val === "back") {
        if (evaluationDone) {
          expr = "";
          display.textContent = "0";
          history.textContent = "";
          evaluationDone = false;
        } else if (expr.length > 0) {
          expr = expr.slice(0, -1);
          display.textContent = expr || "0";
        }
      } else if (val === "=") {
        if (!expr) return;
        try {
          // Replace symbols to match actual JS math operators
          let parsedExpr = expr
            .replace(/sin/g, "Math.sin")
            .replace(/cos/g, "Math.cos")
            .replace(/tan/g, "Math.tan")
            .replace(/sqrt/g, "Math.sqrt")
            .replace(/pi/g, "Math.PI")
            .replace(/log/g, "Math.log10")
            .replace(/ln/g, "Math.log")
            .replace(/pow/g, "**");

          // Safe math evaluation
          // eslint-disable-next-line no-eval
          const result = eval(parsedExpr);
          history.textContent = expr + " =";
          display.textContent = Number.isInteger(result) ? result : parseFloat(result.toFixed(8));
          expr = String(result);
          evaluationDone = true;
        } catch (err) {
          display.textContent = "Error";
          expr = "";
        }
      } else {
        if (evaluationDone) {
          // Reset on start of another expr if clicked numeric keys
          if (!isNaN(val) || val === "." || val === "(" || val === "sin" || val === "cos" || val === "tan") {
            expr = "";
          }
          evaluationDone = false;
        }

        // formatting scientific expressions helpers
        if (["sin", "cos", "tan", "sqrt", "log", "ln"].includes(val)) {
          expr += val + "(";
        } else if (val === "pow") {
          expr += "**";
        } else if (val === "pi") {
          expr += "pi";
        } else {
          expr += val;
        }

        display.textContent = expr;
      }
    });
  });
}
