/**
 * Time Zone Viewer Module — Full UI with live clocks
 */
export function init() {
  const container = document.getElementById("time");
  if (!container) return;

  const ZONES = [
    { city: "Local Time", zone: null, flag: "🏠", continent: "Local" },
    { city: "Dhaka", zone: "Asia/Dhaka", flag: "🇧🇩", continent: "Asia" },
    { city: "London", zone: "Europe/London", flag: "🇬🇧", continent: "Europe" },
    { city: "New York", zone: "America/New_York", flag: "🇺🇸", continent: "Americas" },
    { city: "Los Angeles", zone: "America/Los_Angeles", flag: "🇺🇸", continent: "Americas" },
    { city: "Tokyo", zone: "Asia/Tokyo", flag: "🇯🇵", continent: "Asia" },
    { city: "Dubai", zone: "Asia/Dubai", flag: "🇦🇪", continent: "Asia" },
    { city: "Sydney", zone: "Australia/Sydney", flag: "🇦🇺", continent: "Oceania" },
    { city: "Paris", zone: "Europe/Paris", flag: "🇫🇷", continent: "Europe" },
    { city: "Moscow", zone: "Europe/Moscow", flag: "🇷🇺", continent: "Europe" },
    { city: "Singapore", zone: "Asia/Singapore", flag: "🇸🇬", continent: "Asia" },
    { city: "São Paulo", zone: "America/Sao_Paulo", flag: "🇧🇷", continent: "Americas" }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🌐 World Time Zone Viewer</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Big local time -->
      <div class="card-glass" style="background:rgba(0,0,0,0.25); padding:1.5rem; text-align:center; margin-bottom:1.5rem; border-color:var(--primary);">
        <div id="time-local-big" style="font-size:3.5rem; font-weight:800; color:var(--primary); font-family:monospace; text-shadow:0 0 20px var(--primary-glow); letter-spacing:4px;">00:00:00</div>
        <div id="time-local-date" style="font-size:1rem; color:var(--text-secondary); margin-top:6px;"></div>
        <div style="font-size:0.8rem; color:var(--text-muted); margin-top:4px;" id="time-local-zone"></div>
      </div>

      <!-- Search box -->
      <input id="tz-search" class="input-glass" style="width:100%; margin-bottom:1rem;" placeholder="Filter cities..." />

      <!-- World clock grid -->
      <div id="tz-grid" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:10px;">
        <!-- Rendered dynamically -->
      </div>
    </div>
  `;

  const localBig = document.getElementById("time-local-big");
  const localDate = document.getElementById("time-local-date");
  const localZone = document.getElementById("time-local-zone");
  const grid = document.getElementById("tz-grid");
  const searchEl = document.getElementById("tz-search");

  // Build cards
  ZONES.slice(1).forEach(z => {
    const card = document.createElement("div");
    card.className = "card-glass tz-card";
    card.dataset.city = z.city.toLowerCase();
    card.style.cssText = "padding:1rem; display:flex; flex-direction:column; gap:4px; background:rgba(0,0,0,0.15);";
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
        <span style="font-size:1.25rem;">${z.flag}</span>
        <span class="badge badge-primary" style="font-size:0.65rem;">${z.continent}</span>
      </div>
      <div style="font-size:0.8rem; font-weight:700;">${z.city}</div>
      <div id="tz-clock-${z.city.replace(/\s/g, "_")}" style="font-size:1.5rem; font-weight:800; color:var(--primary); font-family:monospace;">--:--</div>
      <div id="tz-date-${z.city.replace(/\s/g, "_")}" style="font-size:0.68rem; color:var(--text-muted);">—</div>
    `;
    grid.appendChild(card);
  });

  searchEl.addEventListener("input", () => {
    const q = searchEl.value.toLowerCase();
    document.querySelectorAll(".tz-card").forEach(c => {
      c.style.display = c.dataset.city.includes(q) ? "" : "none";
    });
  });

  function updateAll() {
    const now = new Date();
    localBig.textContent = now.toLocaleTimeString("en-US", { hour12: false });
    localDate.textContent = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    localZone.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;

    ZONES.slice(1).forEach(z => {
      const clockEl = document.getElementById(`tz-clock-${z.city.replace(/\s/g, "_")}`);
      const dateEl = document.getElementById(`tz-date-${z.city.replace(/\s/g, "_")}`);
      if (clockEl) clockEl.textContent = now.toLocaleTimeString("en-US", { timeZone: z.zone, hour12: false, hour:"2-digit", minute:"2-digit", second:"2-digit" });
      if (dateEl) dateEl.textContent = now.toLocaleDateString("en-US", { timeZone: z.zone, weekday:"short", month:"short", day:"numeric" });
    });
  }

  setInterval(updateAll, 1000);
  updateAll();
}
