import React, { useState, useEffect, useRef, useCallback } from "react";

// ─── WMO Weather code map ───────────────────────────────────────────────────
const WMO = {
  0:  { label: "Clear Sky",       icon: "☀️",  bg: "#f59e0b" },
  1:  { label: "Mainly Clear",    icon: "🌤️", bg: "#f59e0b" },
  2:  { label: "Partly Cloudy",   icon: "⛅",  bg: "#6366f1" },
  3:  { label: "Overcast",        icon: "☁️",  bg: "#64748b" },
  45: { label: "Foggy",           icon: "🌫️", bg: "#94a3b8" },
  48: { label: "Rime Fog",        icon: "🌫️", bg: "#94a3b8" },
  51: { label: "Light Drizzle",   icon: "🌦️", bg: "#38bdf8" },
  53: { label: "Drizzle",         icon: "🌦️", bg: "#0ea5e9" },
  55: { label: "Heavy Drizzle",   icon: "🌧️", bg: "#0284c7" },
  61: { label: "Light Rain",      icon: "🌧️", bg: "#0369a1" },
  63: { label: "Rain",            icon: "🌧️", bg: "#0369a1" },
  65: { label: "Heavy Rain",      icon: "🌧️", bg: "#075985" },
  71: { label: "Light Snow",      icon: "🌨️", bg: "#93c5fd" },
  73: { label: "Snow",            icon: "❄️",  bg: "#60a5fa" },
  75: { label: "Heavy Snow",      icon: "❄️",  bg: "#3b82f6" },
  77: { label: "Snow Grains",     icon: "🌨️", bg: "#60a5fa" },
  80: { label: "Rain Showers",    icon: "🌦️", bg: "#0891b2" },
  81: { label: "Showers",         icon: "🌦️", bg: "#0e7490" },
  82: { label: "Heavy Showers",   icon: "⛈️",  bg: "#155e75" },
  85: { label: "Snow Showers",    icon: "🌨️", bg: "#7dd3fc" },
  95: { label: "Thunderstorm",    icon: "⛈️",  bg: "#1e1b4b" },
  96: { label: "Thunderstorm + Hail", icon: "⛈️", bg: "#1e1b4b" },
  99: { label: "Severe Hail Storm",   icon: "⛈️", bg: "#1e1b4b" },
};
const WMO_DEFAULT = { label: "Unknown", icon: "🌡️", bg: "#6366f1" };

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const UV_LABEL = (uv) => {
  if (uv <= 2) return { text: "Low", color: "#22c55e" };
  if (uv <= 5) return { text: "Moderate", color: "#eab308" };
  if (uv <= 7) return { text: "High", color: "#f97316" };
  if (uv <= 10) return { text: "Very High", color: "#ef4444" };
  return { text: "Extreme", color: "#a855f7" };
};

const AQI_LABEL = (aqi) => {
  const labels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
  const colors = ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444"];
  const i = Math.min(Math.max((aqi || 1) - 1, 0), 4);
  return { text: labels[i], color: colors[i] };
};

// ─── API helpers ────────────────────────────────────────────────────────────
async function fetchWeather(lat, lon) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
    `wind_speed_10m,wind_direction_10m,weather_code,surface_pressure,` +
    `visibility,uv_index,precipitation,cloud_cover,is_day` +
    `&hourly=temperature_2m,precipitation_probability,weather_code,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,` +
    `precipitation_sum,wind_speed_10m_max,uv_index_max,sunrise,sunset` +
    `&air_quality=european_aqi` +
    `&timezone=auto&forecast_days=7`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Weather fetch failed");
  return res.json();
}

async function reverseGeocode(lat, lon) {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`,
    { headers: { "Accept-Language": "en" } }
  );
  const d = await res.json();
  const a = d.address || {};
  return {
    city: a.city || a.town || a.village || a.county || a.state || "Unknown",
    country: a.country || "",
    countryCode: a.country_code ? a.country_code.toUpperCase() : "",
    state: a.state || "",
  };
}

async function geoSearch(query) {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`
  );
  const d = await res.json();
  return d.results || [];
}

// ─── Wind direction helper ───────────────────────────────────────────────────
function windDir(deg) {
  const dirs = ["N","NE","E","SE","S","SW","W","NW"];
  return dirs[Math.round(deg / 45) % 8];
}

// ─── Mini bar chart for hourly temps ────────────────────────────────────────
function HourlyChart({ hourly }) {
  if (!hourly) return null;
  const now = new Date();
  const nowH = now.getHours();
  // show next 24 hours from current hour
  const times  = hourly.time.slice(nowH, nowH + 24);
  const temps  = hourly.temperature_2m.slice(nowH, nowH + 24);
  const probs  = hourly.precipitation_probability.slice(nowH, nowH + 24);
  const codes  = hourly.weather_code.slice(nowH, nowH + 24);

  const minT = Math.min(...temps);
  const maxT = Math.max(...temps);
  const range = maxT - minT || 1;

  return (
    <div style={{ overflowX: "auto", paddingBottom: "0.5rem" }}>
      <div style={{ display: "flex", gap: "0", minWidth: `${times.length * 56}px` }}>
        {times.map((t, i) => {
          const hour = new Date(t).getHours();
          const heightPct = ((temps[i] - minT) / range) * 55 + 20;
          const wmo = WMO[codes[i]] || WMO_DEFAULT;
          return (
            <div key={i} style={{
              flex: "0 0 56px", display: "flex", flexDirection: "column",
              alignItems: "center", gap: "4px", padding: "0.5rem 0.25rem",
              borderRadius: "10px",
              background: i === 0 ? "rgba(99,102,241,0.15)" : "transparent",
              border: i === 0 ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
            }}>
              <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontWeight: 600 }}>
                {hour === 0 ? "12a" : hour < 12 ? `${hour}a` : hour === 12 ? "12p" : `${hour - 12}p`}
              </span>
              <span style={{ fontSize: "0.95rem" }}>{wmo.icon}</span>
              {/* Bar */}
              <div style={{
                width: "8px", height: `${heightPct}px`, borderRadius: "4px",
                background: `linear-gradient(to top, #6366f1, #818cf8)`,
                minHeight: "8px", flexShrink: 0,
              }} />
              <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>{Math.round(temps[i])}°</span>
              {probs[i] > 0 && (
                <span style={{ fontSize: "0.6rem", color: "#38bdf8" }}>💧{probs[i]}%</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Stat tile ───────────────────────────────────────────────────────────────
function StatTile({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.05)", borderRadius: "14px",
      padding: "0.85rem 1rem", display: "flex", flexDirection: "column", gap: "4px",
      border: "1px solid var(--glass-border)",
      transition: "transform 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-3px)"}
    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
    >
      <div style={{ fontSize: "1.4rem" }}>{icon}</div>
      <div style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      <div style={{ fontSize: "1.15rem", fontWeight: 800, color: color || "var(--text-primary)" }}>{value}</div>
      {sub && <div style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>{sub}</div>}
    </div>
  );
}

// ─── Main Weather Page ───────────────────────────────────────────────────────
export default function WeatherPage() {
  const [loc, setLoc]             = useState(null);   // { lat, lon, city, country, countryCode, state }
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [searchQ, setSearchQ]     = useState("");
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [unit, setUnit]           = useState("C");    // "C" | "F"
  const [pinnedCities, setPinnedCities] = useState([]);
  const searchTimeout             = useRef(null);

  const toF = (c) => Math.round(c * 9/5 + 32);
  const showTemp = (c) => unit === "C" ? `${Math.round(c)}°C` : `${toF(c)}°F`;

  // Load weather for coords
  const loadWeather = useCallback(async (lat, lon, locInfo) => {
    setLoading(true);
    setError(null);
    try {
      const d = await fetchWeather(lat, lon);
      setData(d);
      setLoc({ lat, lon, ...locInfo });
      localStorage.setItem("weather_page_cache", JSON.stringify({ lat, lon, locInfo, ts: Date.now() }));
    } catch {
      setError("Failed to load weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // IP Geolocation helper
  const loadIPGeolocation = useCallback(async () => {
    try {
      const ipRes = await fetch("https://ipapi.co/json/");
      if (!ipRes.ok) throw new Error();
      const ipData = await ipRes.json();
      if (ipData && ipData.latitude && ipData.longitude) {
        await loadWeather(ipData.latitude, ipData.longitude, {
          city: ipData.city || "Your Area",
          country: ipData.country_name || "",
          countryCode: ipData.country || "",
          state: ipData.region || "",
        });
        return true;
      }
    } catch (_) {}
    return false;
  }, [loadWeather]);

  // Boot: cache → geolocation → IP API fallback → default (Dhaka copy)
  useEffect(() => {
    const tryLoad = async () => {
      // 1. Try cached weather first
      try {
        const c = JSON.parse(localStorage.getItem("weather_page_cache") || "null");
        if (c && Date.now() - c.ts < 10 * 60 * 1000) {
          await loadWeather(c.lat, c.lon, c.locInfo);
          return;
        }
      } catch {}

      // 2. Try browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async ({ coords: { latitude: lat, longitude: lon } }) => {
            try {
              const locInfo = await reverseGeocode(lat, lon);
              await loadWeather(lat, lon, locInfo);
            } catch {
              await loadWeather(lat, lon, { city: "Your Location", country: "", countryCode: "", state: "" });
            }
          },
          async () => {
            // Geolocation blocked or failed: fallback to IP
            const ok = await loadIPGeolocation();
            if (!ok) {
              await loadWeather(23.8103, 90.4125, { city: "Dhaka", country: "Bangladesh", countryCode: "BD", state: "Dhaka Division" });
            }
          }
        );
      } else {
        const ok = await loadIPGeolocation();
        if (!ok) {
          await loadWeather(23.8103, 90.4125, { city: "Dhaka", country: "Bangladesh", countryCode: "BD", state: "Dhaka Division" });
        }
      }
    };

    tryLoad();
  }, [loadWeather, loadIPGeolocation]);

  // Load pinned cities list
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("pinned_weather_cities") || "[]");
      setPinnedCities(saved);
    } catch (_) {}
  }, []);

  // Search debounce
  useEffect(() => {
    if (!searchQ.trim()) { setResults([]); return; }
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try { setResults((await geoSearch(searchQ)).slice(0, 6)); }
      catch { setResults([]); }
      setSearching(false);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQ]);

  const pickCity = async (r) => {
    setSearchQ("");
    setResults([]);
    await loadWeather(r.latitude, r.longitude, {
      city: r.name,
      country: r.country || "",
      countryCode: r.country_code ? r.country_code.toUpperCase() : "",
      state: r.admin1 || "",
    });
  };

  // Pin & Unpin Location
  const isPinned = loc && pinnedCities.some((c) => Math.abs(c.lat - loc.lat) < 0.01 && Math.abs(c.lon - loc.lon) < 0.01);
  
  const togglePin = () => {
    if (!loc) return;
    let updated;
    if (isPinned) {
      updated = pinnedCities.filter((c) => !(Math.abs(c.lat - loc.lat) < 0.01 && Math.abs(c.lon - loc.lon) < 0.01));
    } else {
      updated = [
        ...pinnedCities,
        {
          lat: loc.lat,
          lon: loc.lon,
          city: loc.city,
          country: loc.country,
          countryCode: loc.countryCode,
          state: loc.state,
        },
      ];
    }
    setPinnedCities(updated);
    localStorage.setItem("pinned_weather_cities", JSON.stringify(updated));
  };

  const cur    = data?.current;
  const daily  = data?.daily;
  const hourly = data?.hourly;
  const wmo    = cur ? (WMO[cur.weather_code] || WMO_DEFAULT) : WMO_DEFAULT;
  const isDay  = cur?.is_day !== 0;

  // Sunrise / sunset for today
  const sunrise = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "—";
  const sunset  = daily?.sunset?.[0]  ? new Date(daily.sunset[0]).toLocaleTimeString("en-US",  { hour: "2-digit", minute: "2-digit" }) : "—";

  // Sky gradient based on condition & is_day
  const skyGradient = !cur
    ? "linear-gradient(160deg, #1e1b4b 0%, #312e81 100%)"
    : isDay
      ? cur.weather_code <= 1
        ? "linear-gradient(160deg, #0369a1 0%, #38bdf8 50%, #fde68a 100%)"
        : cur.weather_code <= 3
          ? "linear-gradient(160deg, #1e3a5f 0%, #4a7fa5 100%)"
          : cur.weather_code >= 95
            ? "linear-gradient(160deg, #0f0c29 0%, #302b63 50%, #24243e 100%)"
            : "linear-gradient(160deg, #1a3a4f 0%, #2d6387 100%)"
      : "linear-gradient(160deg, #0f0c29 0%, #1a1a2e 50%, #16213e 100%)";

  return (
    <div id="weather" className="app-section active" style={{ animation: "slideInUp 0.4s ease" }}>
      {/* ── Page Header ── */}
      <div className="module-header" style={{ marginBottom: "1rem" }}>
        <div className="module-title">🌦️ Weather Center</div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Unit Toggle */}
          <div style={{
            display: "flex", background: "rgba(255,255,255,0.06)", borderRadius: "8px",
            border: "1px solid var(--glass-border)", overflow: "hidden",
          }}>
            {["C", "F"].map(u => (
              <button key={u} onClick={() => setUnit(u)} style={{
                padding: "0.35rem 0.75rem", border: "none", cursor: "pointer",
                fontSize: "0.8rem", fontWeight: 700, fontFamily: "var(--font-sans)",
                background: unit === u ? "var(--primary)" : "transparent",
                color: unit === u ? "#fff" : "var(--text-muted)",
                transition: "all 0.2s",
              }}>°{u}</button>
            ))}
          </div>
          {/* Refresh */}
          <button className="btn-glass" onClick={() => loc && loadWeather(loc.lat, loc.lon, loc)} disabled={loading}>
            {loading ? "⏳" : "🔄"} Refresh
          </button>
        </div>
      </div>

      {/* ── Search Bar & Saved Cities Row ── */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.25rem" }}>
        {/* Search */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>🔍</span>
            <input
              id="weather-city-search"
              className="input-glass"
              style={{ minHeight: "44px" }}
              placeholder="Type to search any city worldwide..."
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            {searching && <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>Searching...</span>}
          </div>
          {results.length > 0 && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 200,
              background: "rgba(15, 12, 41, 0.95)", backdropFilter: "blur(20px)",
              border: "1px solid var(--glass-border)", borderRadius: "12px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            }}>
              {results.map((r, i) => (
                <div
                  key={i}
                  onClick={() => pickCity(r)}
                  style={{
                    padding: "0.75rem 1rem", cursor: "pointer", display: "flex",
                    justifyContent: "space-between", alignItems: "center",
                    borderBottom: i < results.length - 1 ? "1px solid var(--glass-border)" : "none",
                    minHeight: "44px",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(99,102,241,0.15)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <span style={{ fontSize: "0.88rem" }}>
                    📍 <strong>{r.name}</strong>{r.admin1 ? `, ${r.admin1}` : ""}
                  </span>
                  <span style={{ fontSize: "0.76rem", color: "var(--text-muted)" }}>
                    {r.country}{r.country_code ? ` (${r.country_code.toUpperCase()})` : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pinned Cities Panel */}
        {pinnedCities.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 700, textTransform: "uppercase" }}>
              ⭐ Saved Locations:
            </span>
            {pinnedCities.map((c, i) => {
              const active = loc && Math.abs(c.lat - loc.lat) < 0.01 && Math.abs(c.lon - loc.lon) < 0.01;
              return (
                <button
                  key={i}
                  onClick={() => loadWeather(c.lat, c.lon, c)}
                  className="btn-glass"
                  style={{
                    padding: "0.35rem 0.75rem",
                    minHeight: "36px",
                    borderRadius: "20px",
                    background: active ? "var(--primary)" : "rgba(255,255,255,0.06)",
                    borderColor: active ? "var(--primary)" : "var(--glass-border)",
                    color: "#fff",
                    fontSize: "0.8rem",
                  }}
                >
                  📍 {c.city}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "4rem 0", gap: "1rem" }}>
          <div style={{ fontSize: "4rem", animation: "spin 2s linear infinite" }}>🌍</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Fetching live weather data...</p>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="card-glass" style={{ textAlign: "center", padding: "3rem", color: "var(--danger)" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Main Content Layout ── */}
      {!loading && !error && cur && loc && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

          {/* ── Hero Card ── */}
          <div style={{
            borderRadius: "20px", padding: "1.5rem", background: skyGradient,
            border: "1px solid rgba(255,255,255,0.15)", position: "relative", overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
            animation: "fadeIn 0.5s ease",
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", top: "-40px", right: "-40px", width: "180px", height: "180px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", bottom: "-60px", left: "20px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
              {/* Left: location + temp */}
              <div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", fontWeight: 600, letterSpacing: "0.05em" }}>
                    {isDay ? "☀️ DAYTIME" : "🌙 NIGHTTIME"} • LIVE
                  </span>
                  {/* Pin/Unpin icon Button */}
                  <button
                    onClick={togglePin}
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "none",
                      color: "#fff",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                  >
                    {isPinned ? "⭐ Saved" : "☆ Save Location"}
                  </button>
                </div>
                <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, color: "#fff", lineHeight: 1.1 }}>
                  {loc.city}
                </h2>
                <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>
                  {loc.state ? `${loc.state}, ` : ""}{loc.country}
                  {loc.countryCode && (
                    <span style={{ marginLeft: "6px", background: "rgba(255,255,255,0.15)", padding: "1px 6px", borderRadius: "4px", fontSize: "0.72rem" }}>
                      {loc.countryCode}
                    </span>
                  )}
                </p>
                <div style={{ marginTop: "1rem", display: "flex", alignItems: "flex-end", gap: "1rem" }}>
                  <div style={{ fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                    {showTemp(cur.temperature_2m)}
                  </div>
                  <div style={{ paddingBottom: "0.5rem" }}>
                    <div style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.8)" }}>{wmo.label}</div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)" }}>
                      Feels like {showTemp(cur.apparent_temperature)}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.55)", marginTop: "2px" }}>
                      {daily && `H: ${showTemp(daily.temperature_2m_max[0])}  L: ${showTemp(daily.temperature_2m_min[0])}`}
                    </div>
                  </div>
                </div>
              </div>
              {/* Right: big icon */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontSize: "clamp(4rem, 10vw, 7rem)", animation: "floatElement 4s ease-in-out infinite", filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.3))" }}>
                  {wmo.icon}
                </div>
              </div>
            </div>

            {/* Bottom row quick stats */}
            <div style={{
              marginTop: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap",
              borderTop: "1px solid rgba(255,255,255,0.12)", paddingTop: "1rem",
              justifyContent: "space-between",
            }}>
              {[
                { label: "Humidity",   value: `${cur.relative_humidity_2m}%`,     icon: "💧" },
                { label: "Wind",       value: `${Math.round(cur.wind_speed_10m)} km/h ${windDir(cur.wind_direction_10m)}`, icon: "💨" },
                { label: "Pressure",   value: `${Math.round(cur.surface_pressure)} hPa`, icon: "🔽" },
                { label: "Cloud Cover",value: `${cur.cloud_cover}%`,              icon: "☁️" },
                { label: "Sunrise",    value: sunrise,                            icon: "🌅" },
                { label: "Sunset",     value: sunset,                             icon: "🌇" },
              ].map(s => (
                <div key={s.label} style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "100px", flex: "1 1 auto" }}>
                  <span style={{ fontSize: "0.68rem", color: "rgba(255,255,255,0.5)", fontWeight: 600, textTransform: "uppercase" }}>{s.icon} {s.label}</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Grid Row 2: UV + AQI + Visibility + Precipitation ── */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "0.75rem"
          }}>
            {(() => {
              const uv    = UV_LABEL(cur.uv_index);
              const precip = cur.precipitation;
              return [
                {
                  icon: "🔆", label: "UV Index",
                  value: cur.uv_index != null ? cur.uv_index : "—",
                  sub: uv.text, color: uv.color,
                },
                {
                  icon: "🌧️", label: "Precipitation",
                  value: `${precip ?? 0} mm`,
                  sub: "Last hour",
                },
                {
                  icon: "👁️", label: "Visibility",
                  value: cur.visibility != null ? `${(cur.visibility / 1000).toFixed(1)} km` : "—",
                  sub: cur.visibility > 10000 ? "Clear" : cur.visibility > 4000 ? "Good" : "Reduced",
                },
                {
                  icon: "🌡️", label: "Dew Point",
                  value: `${Math.round(cur.temperature_2m - ((100 - cur.relative_humidity_2m) / 5))}°${unit}`,
                  sub: "Estimated",
                },
              ];
            })().map(t => <StatTile key={t.label} {...t} />)}
          </div>

          {/* ── Hourly Forecast ── */}
          <div className="card-glass" style={{ padding: "1.25rem 1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>⏱️ Hourly Forecast (Next 24h)</h3>
            <HourlyChart hourly={hourly} />
          </div>

          {/* ── 7-Day Forecast ── */}
          <div className="card-glass" style={{ padding: "1.25rem 1rem" }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "1rem" }}>📅 7-Day Forecast</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {daily && daily.time.map((dateStr, i) => {
                const d   = new Date(dateStr + "T00:00:00");
                const w   = WMO[daily.weather_code[i]] || WMO_DEFAULT;
                const uv  = UV_LABEL(daily.uv_index_max?.[i] || 0);
                const isToday = i === 0;
                return (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "10px",
                    background: isToday ? "rgba(99,102,241,0.12)" : "rgba(255,255,255,0.03)",
                    border: isToday ? "1px solid rgba(99,102,241,0.3)" : "1px solid transparent",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: "130px", flex: "1 1 auto" }}>
                      <span style={{ width: "48px", fontSize: "0.85rem", fontWeight: isToday ? 700 : 500, color: isToday ? "var(--primary)" : "var(--text-primary)" }}>
                        {isToday ? "Today" : WEEKDAYS_SHORT[d.getDay()]}
                      </span>
                      <span style={{ fontSize: "1.3rem" }}>{w.icon}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{w.label}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexWrap: "wrap", justifySelf: "flex-end" }}>
                      {/* Precip */}
                      <span style={{ fontSize: "0.78rem", color: "#38bdf8", minWidth: "55px", textAlign: "right" }}>
                        💧 {daily.precipitation_sum[i]?.toFixed(1) ?? "0"} mm
                      </span>
                      {/* Wind */}
                      <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", minWidth: "75px" }}>
                        💨 {Math.round(daily.wind_speed_10m_max[i])} km/h
                      </span>
                      {/* UV */}
                      <span style={{ fontSize: "0.75rem", color: uv.color, fontWeight: 700, minWidth: "45px" }}>
                        UV {daily.uv_index_max[i]?.toFixed(1) ?? "—"}
                      </span>
                      {/* Temp range */}
                      <div style={{ display: "flex", gap: "0.5rem", minWidth: "70px", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "0.9rem", fontWeight: 800 }}>{showTemp(daily.temperature_2m_max[i])}</span>
                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{showTemp(daily.temperature_2m_min[i])}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Coordinates + Source ── */}
          <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textAlign: "center", padding: "0.5rem 0" }}>
            📡 Data: <strong>Open-Meteo</strong> (free, no key) •
            🗺️ Geocoding: <strong>Nominatim / OSM</strong> •
            📍 {loc.lat?.toFixed(4)}°N, {loc.lon?.toFixed(4)}°E •
            🕒 Auto-updates every 10 min
          </div>
        </div>
      )}
    </div>
  );
}
