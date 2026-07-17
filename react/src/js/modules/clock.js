/**
 * Clock Module — Analog + World Time Zones UI
 */
export function init() {
  const container = document.getElementById("clock");
  if (!container) return;

  const ZONES = [
    { city: "Dhaka", zone: "Asia/Dhaka", flag: "🇧🇩" },
    { city: "London", zone: "Europe/London", flag: "🇬🇧" },
    { city: "New York", zone: "America/New_York", flag: "🇺🇸" },
    { city: "Los Angeles", zone: "America/Los_Angeles", flag: "🇺🇸" },
    { city: "Dubai", zone: "Asia/Dubai", flag: "🇦🇪" },
    { city: "Tokyo", zone: "Asia/Tokyo", flag: "🇯🇵" },
    { city: "Sydney", zone: "Australia/Sydney", flag: "🇦🇺" },
    { city: "Paris", zone: "Europe/Paris", flag: "🇫🇷" }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🕰️ World Clock & Time Zones</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12" style="gap:2rem;">
        <!-- Analog Clock Canvas left -->
        <div style="grid-column:span 5; display:flex; flex-direction:column; align-items:center; gap:1rem;">
          <canvas id="analog-clock-canvas" width="260" height="260" style="border-radius:50%; box-shadow:0 0 30px var(--primary-glow);"></canvas>
          <div style="text-align:center;">
            <div id="clock-digital-display" style="font-size:2.5rem; font-weight:800; color:var(--primary); font-family:monospace; text-shadow:0 0 15px var(--primary-glow);">00:00:00</div>
            <div id="clock-date-display" style="font-size:0.9rem; color:var(--text-secondary); margin-top:4px;"></div>
          </div>
        </div>

        <!-- World time zones grid right -->
        <div style="grid-column:span 7; display:flex; flex-direction:column; gap:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">World Time Zones</h3>
          <div id="world-clock-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
            <!-- Render dynamically -->
          </div>
        </div>
      </div>
    </div>
  `;

  const canvas = document.getElementById("analog-clock-canvas");
  const ctx = canvas.getContext("2d");
  const digitalDisplay = document.getElementById("clock-digital-display");
  const dateDisplay = document.getElementById("clock-date-display");
  const worldGrid = document.getElementById("world-clock-grid");

  // Build world zone cards
  ZONES.forEach(z => {
    const card = document.createElement("div");
    card.className = "card-glass";
    card.style.cssText = "padding:0.75rem; background:rgba(0,0,0,0.2); display:flex; justify-content:space-between; align-items:center;";
    card.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.25rem;">${z.flag}</span>
        <div>
          <div style="font-size:0.8rem; font-weight:700;">${z.city}</div>
          <div style="font-size:0.65rem; color:var(--text-muted);">${z.zone.replace(/_/g, " ")}</div>
        </div>
      </div>
      <div id="tz-${z.city.replace(/\s/g, "_")}" style="font-size:0.95rem; font-weight:800; color:var(--primary); font-family:monospace;">--:--:--</div>
    `;
    worldGrid.appendChild(card);
  });

  function drawAnalogClock() {
    const now = new Date();
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(cx, cy) - 8;

    ctx.clearRect(0, 0, w, h);

    // Background circle
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0, "rgba(10,10,30,0.95)");
    grad.addColorStop(1, "rgba(5,5,20,0.98)");
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "hsla(228, 85%, 60%, 0.5)";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hour markers
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      const isMain = i % 3 === 0;
      const x1 = cx + Math.cos(angle) * (radius - (isMain ? 18 : 10));
      const y1 = cy + Math.sin(angle) * (radius - (isMain ? 18 : 10));
      const x2 = cx + Math.cos(angle) * (radius - 3);
      const y2 = cy + Math.sin(angle) * (radius - 3);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = isMain ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)";
      ctx.lineWidth = isMain ? 3 : 1.5;
      ctx.stroke();
    }

    const hours = now.getHours() % 12 + now.getMinutes() / 60;
    const minutes = now.getMinutes() + now.getSeconds() / 60;
    const seconds = now.getSeconds() + now.getMilliseconds() / 1000;

    function drawHand(angle, length, width, color, glow = false) {
      const x = cx + Math.cos(angle - Math.PI / 2) * length;
      const y = cy + Math.sin(angle - Math.PI / 2) * length;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      if (glow) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 12;
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    drawHand((hours / 12) * Math.PI * 2, radius * 0.55, 5, "rgba(255,255,255,0.9)");
    drawHand((minutes / 60) * Math.PI * 2, radius * 0.78, 3.5, "rgba(200,220,255,0.9)");
    drawHand((seconds / 60) * Math.PI * 2, radius * 0.88, 1.5, "hsla(228, 100%, 70%, 1)", true);

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "hsla(228, 85%, 70%, 1)";
    ctx.fill();
  }

  function updateTimes() {
    const now = new Date();
    digitalDisplay.textContent = now.toLocaleTimeString("en-US", { hour12: false });
    dateDisplay.textContent = now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

    ZONES.forEach(z => {
      const el = document.getElementById(`tz-${z.city.replace(/\s/g, "_")}`);
      if (el) {
        el.textContent = new Date().toLocaleTimeString("en-US", { timeZone: z.zone, hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
      }
    });

    drawAnalogClock();
  }

  setInterval(updateTimes, 1000);
  updateTimes();
}
