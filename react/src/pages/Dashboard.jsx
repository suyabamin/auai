import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../js/utils/fetch.js";

// ==========================================
// 1. Clock & Date Widget
// ==========================================
function ClockWidget() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      let hrs = now.getHours();
      let mins = now.getMinutes();
      let secs = now.getSeconds();

      hrs = hrs < 10 ? `0${hrs}` : hrs;
      mins = mins < 10 ? `0${mins}` : mins;
      secs = secs < 10 ? `0${secs}` : secs;

      setTime(`${hrs}:${mins}:${secs}`);

      const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
      setDate(now.toLocaleDateString("en-US", options));
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card-glass" style={{ gridColumn: "span 4", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="widget-clock">
        <div id="dash-clock" className="clock-number">
          {time || "00:00:00"}
        </div>
        <div id="dash-date" className="clock-date">
          📅 {date || "--, ---, ----"}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. System Health Telemetry Widget
// ==========================================
function SystemHealthWidget() {
  const [batteryPct, setBatteryPct] = useState(100);
  const [batteryClass, setBatteryClass] = useState("circle-progress success");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [storagePct, setStoragePct] = useState(88);

  const circumference = 251.2;

  useEffect(() => {
    // Battery monitoring
    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        const updateBattery = () => {
          const pct = Math.round(battery.level * 100);
          setBatteryPct(pct);

          let bCls = "circle-progress";
          if (battery.level <= 0.2) {
            bCls += " danger";
          } else if (battery.level <= 0.5) {
            bCls += " warning";
          } else {
            bCls += " success";
          }
          setBatteryClass(bCls);
        };

        updateBattery();
        battery.addEventListener("levelchange", updateBattery);
        battery.addEventListener("chargingchange", updateBattery);

        return () => {
          battery.removeEventListener("levelchange", updateBattery);
          battery.removeEventListener("chargingchange", updateBattery);
        };
      });
    }

    // Network status
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    // Storage estimation
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((estimate) => {
        const used = estimate.usage || 0;
        const total = estimate.quota || 1;
        const percentUsed = Math.min(Math.round((used / total) * 100), 100);
        setStoragePct(percentUsed);
      });
    }

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const getOffset = (percent) => {
    return circumference - (percent / 100) * circumference;
  };

  return (
    <div className="card-glass" style={{ gridColumn: "span 4" }}>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "0.75rem" }}>System Health</h3>
      <div className="system-stats-grid">
        {/* Battery Circle */}
        <div>
          <div className="circle-chart">
            <svg className="circle-chart-svg" width="90" height="90">
              <circle className="circle-bg" cx="45" cy="45" r="40"></circle>
              <circle
                id="battery-progress"
                className={batteryClass}
                cx="45"
                cy="45"
                r="40"
                strokeDasharray={circumference}
                strokeDashoffset={getOffset(batteryPct)}
              ></circle>
            </svg>
            <span id="battery-text" className="circle-chart-text">
              {batteryPct}%
            </span>
          </div>
          <div className="system-stat-label">Battery</div>
        </div>

        {/* Network Circle */}
        <div>
          <div className="circle-chart">
            <svg className="circle-chart-svg" width="90" height="90">
              <circle className="circle-bg" cx="45" cy="45" r="40"></circle>
              <circle
                id="network-progress"
                className={`circle-progress ${isOnline ? "success" : "danger"}`}
                cx="45"
                cy="45"
                r="40"
                strokeDasharray={circumference}
                strokeDashoffset={isOnline ? 0 : circumference}
              ></circle>
            </svg>
            <span id="network-text" className="circle-chart-text">
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="system-stat-label">Network</div>
        </div>

        {/* Storage Circle */}
        <div>
          <div className="circle-chart">
            <svg className="circle-chart-svg" width="90" height="90">
              <circle className="circle-bg" cx="45" cy="45" r="40"></circle>
              <circle
                id="storage-progress"
                className="circle-progress warning"
                cx="45"
                cy="45"
                r="40"
                strokeDasharray={circumference}
                strokeDashoffset={getOffset(storagePct)}
              ></circle>
            </svg>
            <span id="storage-text" className="circle-chart-text">
              {storagePct}%
            </span>
          </div>
          <div className="system-stat-label">Storage</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. Quick AI Prompt Assistant
// ==========================================
function QuickAIAssistant() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const handleAsk = () => {
    if (!prompt.trim()) return;
    navigate("/aiChat", { state: { initialPrompt: prompt.trim() } });
    setPrompt("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleAsk();
  };

  return (
    <div className="card-glass" style={{ gridColumn: "span 8" }}>
      <h3 style={{ fontSize: "1rem", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>💬</span> Quick Ask Assistant
      </h3>
      <div className="ai-prompt-bar">
        <input
          id="dash-ai-input"
          className="input-glass"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask details, create tables, write script drafts..."
        />
        <button id="dash-ai-btn" className="btn-primary" onClick={handleAsk}>
          Ask
        </button>
      </div>
    </div>
  );
}

// ==========================================
// 4. Weather Widget — Live, Regional, Feature-Rich
// ==========================================

const WMO_CODES = {
  0: { label: "Clear Sky", icon: "☀️" },
  1: { label: "Mainly Clear", icon: "🌤️" },
  2: { label: "Partly Cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Foggy", icon: "🌫️" },
  48: { label: "Icy Fog", icon: "🌫️" },
  51: { label: "Light Drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy Drizzle", icon: "🌧️" },
  61: { label: "Light Rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy Rain", icon: "🌧️" },
  71: { label: "Light Snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy Snow", icon: "❄️" },
  80: { label: "Rain Showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌦️" },
  82: { label: "Heavy Showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  99: { label: "Hail Storm", icon: "⛈️" },
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function fetchWeatherByCoords(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,` +
    `weather_code,surface_pressure,visibility,uv_index` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  const data = await res.json();
  const addr = data.address || {};
  const city =
    addr.city || addr.town || addr.village || addr.county || addr.state || "Unknown";
  const country = addr.country_code ? addr.country_code.toUpperCase() : "";
  return { city, country };
}

async function searchCity(query) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`
  );
  const data = await res.json();
  return data.results || [];
}

function WeatherWidget() {
  const [state, setState] = useState({
    loading: true,
    error: null,
    city: "Detecting...",
    country: "",
    lat: null,
    lon: null,
    current: null,
    daily: null,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef(null);

  const loadWeather = async (lat, lon, city, country) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetchWeatherByCoords(lat, lon);
      setState({
        loading: false,
        error: null,
        city,
        country,
        lat,
        lon,
        current: data.current,
        daily: data.daily,
      });
      localStorage.setItem(
        "weather_cache",
        JSON.stringify({ lat, lon, city, country, ts: Date.now() })
      );
    } catch (e) {
      setState((s) => ({ ...s, loading: false, error: "Failed to load weather." }));
    }
  };

  useEffect(() => {
    const tryLoad = async () => {
      // 1. Try cache (either weather_cache or weather_page_cache)
      try {
        const cachedPage = JSON.parse(localStorage.getItem("weather_page_cache") || "null");
        if (cachedPage && Date.now() - cachedPage.ts < 10 * 60 * 1000) {
          loadWeather(cachedPage.lat, cachedPage.lon, cachedPage.locInfo.city, cachedPage.locInfo.countryCode);
          return;
        }
        const cached = JSON.parse(localStorage.getItem("weather_cache") || "null");
        if (cached && Date.now() - cached.ts < 10 * 60 * 1000) {
          loadWeather(cached.lat, cached.lon, cached.city, cached.country);
          return;
        }
      } catch (_) {}

      const loadIPFallback = async () => {
        try {
          const ipRes = await fetch("https://ipapi.co/json/");
          if (!ipRes.ok) throw new Error();
          const ipData = await ipRes.json();
          if (ipData && ipData.latitude && ipData.longitude) {
            loadWeather(ipData.latitude, ipData.longitude, ipData.city || "Your Area", ipData.country || "");
            return true;
          }
        } catch (_) {}
        return false;
      };

      // 2. Browser Geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const { latitude: lat, longitude: lon } = pos.coords;
            try {
              const { city, country } = await reverseGeocode(lat, lon);
              loadWeather(lat, lon, city, country);
            } catch (_) {
              loadWeather(lat, lon, "Your Location", "");
            }
          },
          async () => {
            const ok = await loadIPFallback();
            if (!ok) {
              loadWeather(23.8103, 90.4125, "Dhaka", "BD");
            }
          }
        );
      } else {
        const ok = await loadIPFallback();
        if (!ok) {
          loadWeather(23.8103, 90.4125, "Dhaka", "BD");
        }
      }
    };

    tryLoad();
    // eslint-disable-next-line
  }, []);

  // City search suggestions
  useEffect(() => {
    if (!searchQuery.trim()) { setSuggestions([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchCity(searchQuery);
        setSuggestions(results.slice(0, 5));
      } catch (_) { setSuggestions([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectCity = (r) => {
    setSuggestions([]);
    setSearchQuery("");
    setShowSearch(false);
    loadWeather(r.latitude, r.longitude, r.name, r.country_code ? r.country_code.toUpperCase() : "");
  };

  const { loading, error, city, country, current, daily } = state;
  const wmo = current ? (WMO_CODES[current.weather_code] || { label: "Unknown", icon: "🌡️" }) : null;

  return (
    <div className="card-glass weather-widget-card" style={{ gridColumn: "span 4" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
        <h3 style={{ fontSize: "1rem", display: "flex", alignItems: "center", gap: "6px" }}>
          🌦️ Weather
        </h3>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>
            {city}{country ? `, ${country}` : ""}
          </span>
          <button
            className="btn-glass"
            style={{ padding: "0.25rem 0.5rem", minHeight: "unset", fontSize: "0.75rem" }}
            title="Search city"
            onClick={() => setShowSearch((v) => !v)}
          >
            🔍
          </button>
        </div>
      </div>

      {/* City Search */}
      {showSearch && (
        <div style={{ position: "relative", marginBottom: "0.75rem" }} ref={searchRef}>
          <input
            className="input-glass"
            style={{ fontSize: "0.85rem", minHeight: "36px" }}
            placeholder="Search city or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          {searching && (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.3rem 0" }}>
              Searching...
            </div>
          )}
          {suggestions.length > 0 && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
              background: "var(--glass-bg)", border: "1px solid var(--glass-border)",
              borderRadius: "var(--border-radius-sm)", backdropFilter: "blur(16px)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.25)", marginTop: "2px",
            }}>
              {suggestions.map((r, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectCity(r)}
                  style={{
                    padding: "0.5rem 0.75rem", cursor: "pointer", fontSize: "0.82rem",
                    borderBottom: i < suggestions.length - 1 ? "1px solid var(--glass-border)" : "none",
                    color: "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  📍 {r.name}{r.admin1 ? `, ${r.admin1}` : ""}{r.country ? `, ${r.country}` : ""}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "1.5rem 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", animation: "spin 1s linear infinite", display: "inline-block" }}>🌀</div>
          <div style={{ fontSize: "0.82rem", marginTop: "0.5rem" }}>Fetching weather...</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ textAlign: "center", padding: "1rem", color: "var(--danger)", fontSize: "0.85rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Main Weather Display */}
      {!loading && !error && current && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "0.75rem" }}>
            <div style={{ fontSize: "3.5rem", lineHeight: 1 }}>{wmo.icon}</div>
            <div>
              <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
                {Math.round(current.temperature_2m)}°C
              </div>
              <div style={{ fontSize: "0.82rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                {wmo.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                Feels like {Math.round(current.apparent_temperature)}°C
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem",
            marginBottom: "0.75rem",
          }}>
            {[
              { icon: "💧", label: "Humidity", value: `${current.relative_humidity_2m}%` },
              { icon: "💨", label: "Wind", value: `${Math.round(current.wind_speed_10m)} km/h` },
              { icon: "🔆", label: "UV Index", value: current.uv_index != null ? current.uv_index : "—" },
              { icon: "🌡️", label: "Pressure", value: `${Math.round(current.surface_pressure)} hPa` },
            ].map((m) => (
              <div key={m.label} style={{
                background: "rgba(255,255,255,0.05)", borderRadius: "8px",
                padding: "0.35rem 0.5rem", display: "flex", alignItems: "center", gap: "6px",
              }}>
                <span style={{ fontSize: "0.9rem" }}>{m.icon}</span>
                <div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{m.label}</div>
                  <div style={{ fontSize: "0.8rem", fontWeight: 700 }}>{m.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 5-Day Forecast */}
          {daily && (
            <div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginBottom: "0.4rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                5-Day Forecast
              </div>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {daily.time.slice(0, 5).map((dateStr, i) => {
                  const day = new Date(dateStr + "T00:00:00");
                  const w = WMO_CODES[daily.weather_code[i]] || { icon: "🌡️" };
                  return (
                    <div key={i} style={{
                      flex: 1, textAlign: "center", background: "rgba(255,255,255,0.04)",
                      borderRadius: "8px", padding: "0.4rem 0.2rem",
                      border: i === 0 ? "1px solid var(--primary)" : "1px solid var(--glass-border)",
                    }}>
                      <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>
                        {i === 0 ? "Today" : WEEKDAYS[day.getDay()]}
                      </div>
                      <div style={{ fontSize: "1.1rem", margin: "2px 0" }}>{w.icon}</div>
                      <div style={{ fontSize: "0.68rem", fontWeight: 700 }}>
                        {Math.round(daily.temperature_2m_max[i])}°
                      </div>
                      <div style={{ fontSize: "0.63rem", color: "var(--text-muted)" }}>
                        {Math.round(daily.temperature_2m_min[i])}°
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ fontSize: "0.65rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "right" }}>
            📡 Open-Meteo • refreshes every 10 min
          </div>
        </>
      )}
    </div>
  );
}

// ==========================================
// 5. Quick Tasks Widget
// ==========================================
function QuickTasksWidget() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem("todos") || "[]");
    } catch (e) {}

    if (list.length === 0) {
      list = [
        { text: "Update dashboard design metrics", done: true, tag: "UI" },
        { text: "Connect Sheets CRUD API", done: false, tag: "Database" },
        { text: "Sync files to Google Drive", done: false, tag: "Storage" },
      ];
      localStorage.setItem("todos", JSON.stringify(list));
    }
    setTodos(list);
  }, []);

  const pending = todos.filter((t) => !t.done);

  return (
    <div className="card-glass" style={{ gridColumn: "span 4" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h3 style={{ fontSize: "1rem" }}>📋 Quick Tasks</h3>
        <span
          id="dash-todo-badge"
          className={`badge ${pending.length === 0 ? "badge-success" : "badge-warning"}`}
        >
          {pending.length} Pending
        </span>
      </div>
      <div id="dash-todo-items">
        {todos.slice(0, 3).map((t, idx) => (
          <div className="widget-list-item" key={idx}>
            <span
              className="widget-list-text"
              style={t.done ? { textDecoration: "line-through", opacity: 0.6 } : {}}
            >
              {t.text}
            </span>
            <span className={`badge ${t.done ? "badge-success" : "badge-primary"}`}>
              {t.tag || "Task"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. Sticky Note Widget
// ==========================================
function StickyNoteWidget() {
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [buttonText, setButtonText] = useState("Save to Notes Database");

  useEffect(() => {
    setContent(localStorage.getItem("temp_sticky_draft") || "");
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setContent(val);
    localStorage.setItem("temp_sticky_draft", val);
  };

  const handleSave = () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setSaving(true);
    setButtonText("Saving to Sheets...");

    apiFetch("saveNote", { note: trimmed })
      .then(() => {
        alert("Sticky Note submitted successfully to sheets database!");
        setContent("");
        localStorage.removeItem("temp_sticky_draft");
      })
      .catch((err) => {
        console.error("Failed to sync sticky note to Apps Script:", err);
        // Save to offline notes registry as backup fallback
        let offlineNotes = JSON.parse(localStorage.getItem("offline_notes") || "[]");
        offlineNotes.push({ content: trimmed, date: new Date().toISOString() });
        localStorage.setItem("offline_notes", JSON.stringify(offlineNotes));
        alert("Network offline. Sticky note saved to local cache browser database.");
      })
      .finally(() => {
        setSaving(false);
        setButtonText("Save to Notes Database");
      });
  };

  return (
    <div className="card-glass" style={{ gridColumn: "span 4" }}>
      <h3 style={{ fontSize: "1rem", marginBottom: "1rem" }}>📌 Sticky Note</h3>
      <textarea
        id="dash-sticky-note"
        className="input-glass"
        style={{ height: "70px", resize: "none", fontSize: "0.85rem", marginBottom: "0.5rem" }}
        placeholder="Save temporary thoughts/scratch logs..."
        value={content}
        onChange={handleInputChange}
      ></textarea>
      <button
        id="dash-save-note"
        className="btn-primary"
        style={{ padding: "0.35rem", fontSize: "0.8rem", width: "100%" }}
        disabled={saving}
        onClick={handleSave}
      >
        {buttonText}
      </button>
    </div>
  );
}

// ==========================================
// 7. Launcher Grid / Shortcut Links
// ==========================================
function LauncherGrid() {
  const navigate = useNavigate();

  const launchers = [
    { target: "weather", icon: "🌦️", title: "Weather" },
    { target: "aiChat", icon: "💬", title: "AI Chat" },
    { target: "voiceRecognition", icon: "🎤", title: "Voice Control" },
    { target: "speechRecognition", icon: "🔊", title: "Dictation" },
    { target: "translator", icon: "🌐", title: "Translator" },
    { target: "ocr", icon: "🔍", title: "OCR Extractor" },
    { target: "faceDetection", icon: "👤", title: "Face Recog" },
    { target: "todoList", icon: "✅", title: "To-do List" },
    { target: "notes", icon: "📝", title: "Notes Workspace" },
    { target: "expenseTracker", icon: "💰", title: "Expenses" },
    { target: "calendar", icon: "📅", title: "Calendar" },
    { target: "reminder", icon: "🔔", title: "Reminders" },
    { target: "pdfReader", icon: "📄", title: "PDF Reader" },
    { target: "calculator", icon: "➗", title: "Calculator" },
    { target: "qrGenerator", icon: "📱", title: "QR/Barcodes" },
    { target: "camera", icon: "📷", title: "Camera Hub" },
    { target: "musicPlayer", icon: "🎵", title: "Media Player" },
  ];

  return (
    <div className="launcher-grid">
      {launchers.map((item) => (
        <div
          key={item.target}
          className="launcher-card"
          data-target={item.target}
          onClick={() => navigate(`/${item.target}`)}
        >
          <span className="launcher-icon">{item.icon}</span>
          <span className="launcher-title">{item.title}</span>
        </div>
      ))}
    </div>
  );
}

// ==========================================
// Main Dashboard Page Component
// ==========================================
export default function Dashboard() {
  return (
    <div id="dashboard" className="app-section active">
      {/* Row 1: Welcome Banner & Clock Widget */}
      <div className="grid-12" style={{ marginBottom: "1.5rem" }}>
        <div className="card-glass welcome-card" style={{ gridColumn: "span 8" }}>
          <div className="welcome-emoji">⚡</div>
          <h2 id="welcome-msg" style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Good Day, Commander
          </h2>
          <p style={{ color: "var(--text-secondary)", maxWidth: "80%" }}>
            Welcome back to your workspace. All local micro-services are active. Ask me anything to begin.
          </p>
        </div>
        <ClockWidget />
      </div>

      {/* Row 2: Prompt Bar and System metrics */}
      <div className="grid-12" style={{ marginBottom: "1.5rem" }}>
        <QuickAIAssistant />
        <SystemHealthWidget />
      </div>

      {/* Row 3: Widgets Grid */}
      <div className="grid-12" style={{ marginBottom: "1.5rem" }}>
        <WeatherWidget />
        <QuickTasksWidget />
        <StickyNoteWidget />
      </div>

      {/* Row 4: Shortcuts Modules Launchers */}
      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: "2rem 0 1rem 0" }}>
        Launch Assistant Modules
      </h3>
      <LauncherGrid />
    </div>
  );
}
