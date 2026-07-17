import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise interactive Calendar view.
 */
export function init() {
  const container = document.getElementById("calendar");
  if (!container) return;

  const today = new Date();
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">📅 Interactive Work Calendar</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Calendar Grid Month Pane -->
        <div style="grid-column: span 8;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
            <button id="cal-prev-btn" class="btn-glass" style="padding: 0.35rem 0.75rem;">← Prev</button>
            <h3 id="cal-month-title" style="font-size: 1.25rem; font-weight: 700;">Month Year</h3>
            <button id="cal-next-btn" class="btn-glass" style="padding: 0.35rem 0.75rem;">Next →</button>
          </div>

          <!-- Weekday Labels -->
          <div style="display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; font-weight: 700; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>

          <!-- Days Grid -->
          <div id="cal-days-grid" style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; min-height: 250px;">
            <!-- Rendered dynamically -->
          </div>
        </div>

        <!-- Events List details -->
        <div style="grid-column: span 4; border-left: 1px solid var(--glass-border); padding-left: 1rem; display: flex; flex-direction: column; gap: 1rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Add Event</h3>
          
          <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.85rem;">
            <input type="text" id="event-title" class="input-glass" placeholder="Event Description..." />
            <input type="date" id="event-date" class="input-glass" />
            <select id="event-tag" class="input-glass">
              <option value="Meeting">💼 Meeting</option>
              <option value="Milestone">🎯 Milestone</option>
              <option value="Personal">🔑 Personal</option>
              <option value="Workspace">⚙️ System Registry</option>
            </select>
            <button id="event-save-btn" class="btn-primary" style="width: 100%;">Create Event</button>
          </div>

          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700; margin-top: 0.5rem;">Schedules</h3>
          <div id="cal-events-list" style="display: flex; flex-direction: column; gap: 6px; max-height: 180px; overflow-y: auto;">
            <!-- Render lists -->
            <p style="color: var(--text-muted); font-size: 0.8rem;">No events logged on calendar.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const prevBtn = document.getElementById("cal-prev-btn");
  const nextBtn = document.getElementById("cal-next-btn");
  const monthTitle = document.getElementById("cal-month-title");
  const daysGrid = document.getElementById("cal-days-grid");
  
  const evTitle = document.getElementById("event-title");
  const evDate = document.getElementById("event-date");
  const evTag = document.getElementById("event-tag");
  const evSave = document.getElementById("event-save-btn");
  const evListContainer = document.getElementById("cal-events-list");

  let localEvents = [];

  // load calendar mock data
  loadCalendarData();

  function loadCalendarData() {
    try {
      localEvents = JSON.parse(localStorage.getItem("cal_events") || "[]");
    } catch(e){}
    if (localExpenses.length === 0) {
      localEvents = [
        { id: 1, title: "Review system dashboard mockup details", date: `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-15`, tag: "Meeting" },
        { id: 2, title: "Integrate third-party API sheets database", date: `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-20`, tag: "Workspace" }
      ];
      localStorage.setItem("cal_events", JSON.stringify(localEvents));
    }
    renderCalendar();
  }

  function renderCalendar() {
    monthTitle.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    daysGrid.innerHTML = "";

    // Math algorithms for month grids
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate();

    // fill preceding empty block cells
    for (let x = firstDayIndex; x > 0; x--) {
      const cell = document.createElement("div");
      cell.style.opacity = "0.2";
      daysGrid.appendChild(cell);
    }

    // fill actual month days
    for (let i = 1; i <= lastDay; i++) {
      const cell = document.createElement("div");
      cell.className = "card-glass";
      cell.style.padding = "5px";
      cell.style.textAlign = "center";
      cell.style.minHeight = "44px";
      cell.style.display = "flex";
      cell.style.flexDirection = "column";
      cell.style.justifyContent = "space-between";
      cell.style.alignItems = "center";
      cell.style.fontSize = "0.85rem";
      cell.style.fontWeight = "600";
      cell.style.position = "relative";
      cell.style.cursor = "pointer";

      // Today styles configurations
      const isToday = i === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
      if (isToday) {
        cell.style.borderColor = "var(--primary)";
        cell.style.background = "var(--primary-glow)";
      }

      cell.innerHTML = `<span>${i}</span>`;

      // Check events on this day
      const checkDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const dayEvents = localEvents.filter(e => e.date === checkDateStr);
      if (dayEvents.length > 0) {
        const dot = document.createElement("span");
        dot.style.cssText = "width: 6px; height: 6px; border-radius: 50%; background: var(--secondary); display: block; filter: drop-shadow(0 0 4px var(--secondary)); margin-bottom: 2px;";
        cell.appendChild(dot);
        cell.title = dayEvents.map(e => e.title).join(", ");
      }

      cell.addEventListener("click", () => {
        evDate.value = checkDateStr;
        evTitle.focus();
      });

      daysGrid.appendChild(cell);
    }

    renderEventsList();
  }

  function renderEventsList() {
    evListContainer.innerHTML = "";

    if (localEvents.length === 0) {
      evListContainer.innerHTML = `<p style="color: var(--text-muted); font-size: 0.8rem; text-align: center; margin-top:20px;">No events configured</p>`;
      return;
    }

    // Sort by date closest
    const sorted = [...localEvents].sort((a,b) => new Date(a.date) - new Date(b.date));

    sorted.forEach(ev => {
      const card = document.createElement("div");
      card.className = "widget-list-item anim-slide-up";
      card.style.background = "var(--glass-bg-accent)";
      card.style.padding = "0.5rem 0.75rem";
      card.style.borderRadius = "8px";
      card.style.border = "1px solid var(--glass-border)";
      card.style.display = "flex";
      card.style.flexDirection = "column";
      card.style.gap = "4px";

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h5 style="font-size:0.8rem; font-weight:700;">${ev.title}</h5>
          <span style="font-size:0.65rem;" class="badge badge-primary">${ev.tag || "Event"}</span>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.7rem; color:var(--text-muted);">
          <span>${ev.date}</span>
          <button class="ev-del-btn" style="background:none; border:none; cursor:pointer; color:var(--danger)">🗑️</button>
        </div>
      `;

      card.querySelector(".ev-del-btn").addEventListener("click", () => deleteEvent(ev.id));
      evListContainer.appendChild(card);
    });
  }

  function deleteEvent(id) {
    if (confirm("Delete this calendar event?")) {
      localEvents = localEvents.filter(e => e.id !== id);
      localStorage.setItem("cal_events", JSON.stringify(localEvents));
      renderCalendar();
      
      apiFetch("deleteCalendarEvent", { id })
        .catch(err => console.error(err));
    }
  }

  evSave.addEventListener("click", () => {
    const titleVal = evTitle.value.trim();
    const dateVal = evDate.value;
    const tagVal = evTag.value;

    if (!titleVal || !dateVal) return;

    const mockId = Date.now();
    localEvents.push({ id: mockId, title: titleVal, date: dateVal, tag: tagVal });
    localStorage.setItem("cal_events", JSON.stringify(localEvents));
    renderCalendar();

    evTitle.value = "";
    evDate.value = "";

    apiFetch("addCalendarEvent", { title: titleVal, date: dateVal, tag: tagVal })
      .catch(err => console.error(err));
  });

  prevBtn.addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  nextBtn.addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });
}
