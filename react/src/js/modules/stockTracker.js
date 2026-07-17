import { apiFetch } from "../utils/fetch.js";

/**
 * Stock Tracker / Market Watchlist Module
 */
export function init() {
  const container = document.getElementById("stockTracker");
  if (!container) return;

  const defaultWatchlist = [
    { symbol: "AAPL", name: "Apple Inc.", price: 192.35, change: +1.82, pct: +0.95 },
    { symbol: "GOOGL", name: "Alphabet Inc.", price: 173.50, change: -0.45, pct: -0.26 },
    { symbol: "MSFT", name: "Microsoft Corp.", price: 415.20, change: +3.10, pct: +0.75 },
    { symbol: "AMZN", name: "Amazon.com Inc.", price: 187.68, change: +2.54, pct: +1.37 },
    { symbol: "META", name: "Meta Platforms", price: 521.10, change: -5.20, pct: -0.99 },
    { symbol: "NVDA", name: "NVIDIA Corp.", price: 875.40, change: +12.30, pct: +1.42 },
    { symbol: "TSLA", name: "Tesla Inc.", price: 248.50, change: -4.85, pct: -1.91 }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📈 Market Watchlist</h2>
        <div style="display:flex; gap:8px; align-items:center;">
          <span style="font-size:0.75rem; color:var(--text-muted);">Last refreshed: <span id="stock-refresh-time">Just now</span></span>
          <button id="stock-refresh-btn" class="btn-glass" style="font-size:0.8rem;">🔄 Refresh</button>
          <button class="btn-glass btn-back-dash">🏠 Home</button>
        </div>
      </div>

      <!-- Market Overview -->
      <div class="grid-12" style="margin-bottom:1.5rem; gap:10px;">
        <div class="card-glass" style="grid-column:span 4; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div style="font-size:0.75rem; color:var(--text-muted);">S&P 500</div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--success);">5,312.80 ▲</div>
          <div style="font-size:0.78rem; color:var(--success);">+0.42%</div>
        </div>
        <div class="card-glass" style="grid-column:span 4; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div style="font-size:0.75rem; color:var(--text-muted);">NASDAQ</div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--danger);">16,743.20 ▼</div>
          <div style="font-size:0.78rem; color:var(--danger);">-0.21%</div>
        </div>
        <div class="card-glass" style="grid-column:span 4; padding:1rem; text-align:center; background:rgba(0,0,0,0.2);">
          <div style="font-size:0.75rem; color:var(--text-muted);">Bitcoin (BTC)</div>
          <div style="font-size:1.4rem; font-weight:800; color:var(--warning);">$67,412.50</div>
          <div style="font-size:0.78rem; color:var(--success);">+2.14%</div>
        </div>
      </div>

      <!-- Add Stock Row -->
      <div style="display:flex; gap:10px; margin-bottom:1.25rem;">
        <input id="stock-add-input" class="input-glass" style="flex:1; font-size:0.9rem;" placeholder="Add symbol to watchlist (e.g. TSLA, BTC, SPY)" />
        <button id="stock-add-btn" class="btn-primary" style="min-width:100px; font-size:0.85rem;">+ Add</button>
      </div>

      <!-- Watchlist table -->
      <div style="overflow-x:auto;">
        <table style="width:100%; border-collapse:collapse; font-size:0.88rem;">
          <thead>
            <tr style="border-bottom:2px solid var(--glass-border); color:var(--text-muted); font-size:0.75rem; text-transform:uppercase; letter-spacing:0.5px;">
              <th style="text-align:left; padding:0.5rem 0.75rem;">Symbol</th>
              <th style="text-align:left; padding:0.5rem 0.75rem;">Company</th>
              <th style="text-align:right; padding:0.5rem 0.75rem;">Price</th>
              <th style="text-align:right; padding:0.5rem 0.75rem;">Change</th>
              <th style="text-align:right; padding:0.5rem 0.75rem;">%</th>
              <th style="text-align:right; padding:0.5rem 0.75rem;">Action</th>
            </tr>
          </thead>
          <tbody id="stock-table-body">
            <!-- Render dynamically -->
          </tbody>
        </table>
      </div>

      <p style="font-size:0.7rem; color:var(--text-muted); margin-top:1rem; text-align:center;">⚠️ Data shown is simulated. Integrate a live stock API (e.g. Alpha Vantage free tier) to get real-time prices.</p>
    </div>
  `;

  let watchlist = [...defaultWatchlist];

  function renderWatchlist() {
    const tbody = document.getElementById("stock-table-body");
    tbody.innerHTML = "";
    watchlist.forEach((stock, i) => {
      const positive = stock.change >= 0;
      const row = document.createElement("tr");
      row.style.borderBottom = "1px solid var(--glass-border)";
      row.innerHTML = `
        <td style="padding:0.75rem; font-weight:800; color:var(--primary);">${stock.symbol}</td>
        <td style="padding:0.75rem; color:var(--text-secondary); max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${stock.name}</td>
        <td style="padding:0.75rem; font-weight:700; text-align:right;">$${stock.price.toFixed(2)}</td>
        <td style="padding:0.75rem; text-align:right; color:${positive ? "var(--success)" : "var(--danger)"}; font-weight:600;">${positive ? "+" : ""}${stock.change.toFixed(2)}</td>
        <td style="padding:0.75rem; text-align:right;">
          <span class="badge" style="background:${positive ? "rgba(0,200,100,0.15)" : "rgba(255,60,60,0.15)"}; color:${positive ? "var(--success)" : "var(--danger)"}; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">
            ${positive ? "▲" : "▼"} ${Math.abs(stock.pct).toFixed(2)}%
          </span>
        </td>
        <td style="padding:0.75rem; text-align:right;">
          <button class="stock-remove-btn btn-glass" data-idx="${i}" style="font-size:0.72rem; padding:2px 8px; color:var(--danger);">Remove</button>
        </td>
      `;
      row.querySelector(".stock-remove-btn").addEventListener("click", () => {
        watchlist.splice(i, 1);
        renderWatchlist();
      });
      tbody.appendChild(row);
    });
  }

  document.getElementById("stock-add-btn").addEventListener("click", () => {
    const sym = document.getElementById("stock-add-input").value.trim().toUpperCase();
    if (!sym) return;
    // Add mock stock
    const mockPrice = (Math.random() * 400 + 50).toFixed(2);
    const mockChange = (Math.random() * 10 - 5).toFixed(2);
    watchlist.push({ symbol: sym, name: sym + " Corp.", price: parseFloat(mockPrice), change: parseFloat(mockChange), pct: (mockChange / mockPrice * 100) });
    document.getElementById("stock-add-input").value = "";
    renderWatchlist();
  });

  document.getElementById("stock-refresh-btn").addEventListener("click", () => {
    // Simulate price fluctuations
    watchlist = watchlist.map(s => {
      const delta = (Math.random() - 0.5) * 5;
      return { ...s, price: +(s.price + delta).toFixed(2), change: +delta.toFixed(2), pct: +(delta / s.price * 100).toFixed(2) };
    });
    renderWatchlist();
    document.getElementById("stock-refresh-time").textContent = new Date().toLocaleTimeString();
  });

  renderWatchlist();
}
