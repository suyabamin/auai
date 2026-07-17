import { apiFetch } from "../utils/fetch.js";
import { navigateTo } from "../main.js";

/**
 * Initialise the Dashboard UI modules and widgets.
 */
export function init() {
  initClock();
  initSystemStats();
  initQuickAI();
  initStickyNote();
  initWeatherWidget();
  loadQuickTasksSummary();
}

/**
 * Smart clock and Gregorian calendar loop
 */
function initClock() {
  const clockEl = document.getElementById("dash-clock");
  const dateEl = document.getElementById("dash-date");

  if (!clockEl || !dateEl) return;

  function updateClock() {
    const now = new Date();
    
    // Time string
    let hrs = now.getHours();
    let mins = now.getMinutes();
    let secs = now.getSeconds();
    
    hrs = hrs < 10 ? `0${hrs}` : hrs;
    mins = mins < 10 ? `0${mins}` : mins;
    secs = secs < 10 ? `0${secs}` : secs;
    
    clockEl.textContent = `${hrs}:${mins}:${secs}`;
    
    // Date string
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateEl.textContent = now.toLocaleDateString('en-US', options);
  }

  // Initial call and set interval
  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * Device telemetry monitoring (Battery, Internet, Memory)
 */
function initSystemStats() {
  const batteryProgress = document.getElementById("battery-progress");
  const batteryText = document.getElementById("battery-text");
  const networkProgress = document.getElementById("network-progress");
  const networkText = document.getElementById("network-text");
  const storageProgress = document.getElementById("storage-progress");
  const storageText = document.getElementById("storage-text");

  const circumference = 251.2;

  // 1. Monitor Battery Status
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      function updateBatteryInfo() {
        const pct = Math.round(battery.level * 100);
        if (batteryText) batteryText.textContent = `${pct}%`;
        
        if (batteryProgress) {
          const offset = circumference - (battery.level * circumference);
          batteryProgress.style.strokeDashoffset = offset;
          
          // Apply battery colors based on level
          batteryProgress.className.baseVal = "circle-progress";
          if (battery.level <= 0.2) {
            batteryProgress.classList.add("danger");
          } else if (battery.level <= 0.5) {
            batteryProgress.classList.add("warning");
          } else {
            batteryProgress.classList.add("success");
          }
        }
      }

      updateBatteryInfo();
      battery.addEventListener("levelchange", updateBatteryInfo);
      battery.addEventListener("chargingchange", updateBatteryInfo);
    });
  } else {
    if (batteryText) batteryText.textContent = "100%";
    if (batteryProgress) batteryProgress.style.strokeDashoffset = 0;
  }

  // 2. Monitor Connection Status
  function updateNetworkStatus() {
    const isOnline = navigator.onLine;
    if (networkText) networkText.textContent = isOnline ? "Online" : "Offline";
    if (networkProgress) {
      if (isOnline) {
        networkProgress.style.strokeDashoffset = 0;
        networkProgress.className.baseVal = "circle-progress success";
      } else {
        networkProgress.style.strokeDashoffset = circumference;
        networkProgress.className.baseVal = "circle-progress danger";
      }
    }
  }

  window.addEventListener("online", updateNetworkStatus);
  window.addEventListener("offline", updateNetworkStatus);
  updateNetworkStatus();

  // 3. Monitor Storage stats (Estimated)
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
      const used = estimate.usage || 0;
      const total = estimate.quota || 1;
      const percentUsed = Math.min(Math.round((used / total) * 100), 100);
      
      if (storageText) storageText.textContent = `${percentUsed}%`;
      if (storageProgress) {
        const offset = circumference - ((percentUsed / 100) * circumference);
        storageProgress.style.strokeDashoffset = offset;
      }
    });
  }
}

/**
 * Ties Quick Ask Box directly to the modular AI conversational chat system
 */
function initQuickAI() {
  const dashInput = document.getElementById("dash-ai-input");
  const dashBtn = document.getElementById("dash-ai-btn");

  if (!dashInput || !dashBtn) return;

  function redirectToChat() {
    const prompt = dashInput.value.trim();
    if (!prompt) return;

    // Put prompt in the main AI Chat module input buffer
    const chatInput = document.getElementById("chat-input");
    if (chatInput) {
      chatInput.value = prompt;
    }

    // Switch view to chat section
    navigateTo("aiChat");
    dashInput.value = "";

    // Trigger standard send from the chat controller module
    setTimeout(() => {
      const sendBtn = document.getElementById("chat-send");
      if (sendBtn) sendBtn.click();
    }, 200);
  }

  dashInput.addEventListener("keydown", e => {
    if (e.key === "Enter") redirectToChat();
  });
  
  dashBtn.addEventListener("click", redirectToChat);
}

/**
 * Sticky notes widget logic
 */
function initStickyNote() {
  const noteArea = document.getElementById("dash-sticky-note");
  const saveBtn = document.getElementById("dash-save-note");

  if (!noteArea || !saveBtn) return;

  // Restore saved offline draft if any
  const draft = localStorage.getItem("temp_sticky_draft") || "";
  noteArea.value = draft;

  noteArea.addEventListener("input", () => {
    localStorage.setItem("temp_sticky_draft", noteArea.value);
  });

  saveBtn.addEventListener("click", () => {
    const content = noteArea.value.trim();
    if (!content) return;

    saveBtn.disabled = true;
    saveBtn.textContent = "Saving to Sheets...";

    // POST action to Apps Script Webapp endpoint 
    apiFetch("saveNote", { note: content })
      .then(res => {
        alert("Sticky Note submitted successfully to sheets database!");
        noteArea.value = "";
        localStorage.removeItem("temp_sticky_draft");
      })
      .catch(err => {
        console.error("Failed to sync sticky note to Apps Script:", err);
        // Save to offline notes registry as backup fallback
        let offlineNotes = JSON.parse(localStorage.getItem("offline_notes") || "[]");
        offlineNotes.push({ content, date: new Date().toISOString() });
        localStorage.setItem("offline_notes", JSON.stringify(offlineNotes));
        alert("Network offline. Sticky note saved to local cache browser database.");
      })
      .finally(() => {
        saveBtn.disabled = false;
        saveBtn.textContent = "Save to Notes Database";
      });
  });
}

/**
 * Dynamic Weather micro-service connector
 */
function initWeatherWidget() {
  const weatherTemp = document.getElementById("dash-weather-temp");
  const weatherDesc = document.getElementById("dash-weather-desc");
  const weatherCity = document.getElementById("dash-weather-city");

  // Attempt local storage cache retrieval or set default parameters
  const cacheKey = "cached_weather_summary";
  const cachedVal = localStorage.getItem(cacheKey);

  if (cachedVal) {
    try {
      const data = JSON.parse(cachedVal);
      applyWeatherData(data);
    } catch(e) {}
  }

  // Attempt live loading update
  apiFetch("dashboard")
    .then(data => {
      if (data && data.weather) {
        localStorage.setItem(cacheKey, JSON.stringify(data.weather));
        applyWeatherData(data.weather);
      }
    })
    .catch(err => {
      console.warn("Unable to fetch live dashboard weather data update:", err);
    });

  function applyWeatherData(w) {
    if (weatherTemp) weatherTemp.textContent = `${w.temperature || 31}°C`;
    if (weatherDesc) weatherDesc.textContent = w.description || "Sunny intervals";
    if (weatherCity) weatherCity.textContent = w.city || "Dhaka, BD";
  }
}

/**
 * Tasks count metrics loading summary
 */
function loadQuickTasksSummary() {
  const badge = document.getElementById("dash-todo-badge");
  const itemsContainer = document.getElementById("dash-todo-items");

  // Fetch to-dos from localStorage or show defaults
  let todos = [];
  try {
    todos = JSON.parse(localStorage.getItem("todos") || "[]");
  } catch(e){}

  if (todos.length === 0) {
    // Standard mock list if empty
    todos = [
      { text: "Update dashboard design metrics", done: true, tag: "UI" },
      { text: "Connect Sheets CRUD API", done: false, tag: "Database" },
      { text: "Sync files to Google Drive", done: false, tag: "Storage" }
    ];
    localStorage.setItem("todos", JSON.stringify(todos));
  }

  const pending = todos.filter(t => !t.done);
  if (badge) {
    badge.textContent = `${pending.length} Pending`;
    if (pending.length === 0) {
      badge.className = "badge badge-success";
    } else {
      badge.className = "badge badge-warning";
    }
  }

  if (itemsContainer) {
    itemsContainer.innerHTML = todos
      .slice(0, 3) // show maximum 3 preview tasks
      .map(t => `
        <div class="widget-list-item">
          <span class="widget-list-text" style="${t.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">
            ${t.text}
          </span>
          <span class="badge ${t.done ? 'badge-success' : 'badge-primary'}">${t.tag || 'Task'}</span>
        </div>
      `)
      .join("");
  }
}
