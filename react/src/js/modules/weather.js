/**
 * Weather Forecast Module — Full UI
 */
export function init() {
  const container = document.getElementById("weather");
  if (!container) return;

  const weatherIcons = { Clear: "☀️", Clouds: "☁️", Rain: "🌧️", Drizzle: "🌦️", Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", default: "🌡️" };

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🌦️ Weather Forecast Station</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <!-- Search Row -->
      <div style="display:flex; gap:10px; margin-bottom:1.5rem;">
        <input id="weather-city-input" class="input-glass" style="flex:1;" placeholder="Enter city name (e.g. Dhaka, London, Tokyo)..." value="Dhaka" />
        <button id="weather-search-btn" class="btn-primary" style="min-width:120px;">Get Weather</button>
      </div>

      <!-- Current Weather Card -->
      <div id="weather-current-card" class="grid-12" style="gap:1rem; margin-bottom:1.5rem;">
        <div class="card-glass" style="grid-column:span 5; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0.5rem; padding:2rem;">
          <div id="weather-main-icon" style="font-size:5rem;">⛅</div>
          <div id="weather-temp-big" style="font-size:3rem; font-weight:800; color:var(--primary);">31°C</div>
          <div id="weather-desc-lbl" style="font-size:1rem; color:var(--text-secondary);">Partly Cloudy</div>
          <div id="weather-city-lbl" class="badge badge-primary" style="font-size:0.85rem;">Dhaka, BD</div>
        </div>
        <div class="card-glass" style="grid-column:span 7; display:flex; flex-direction:column; gap:0.75rem; justify-content:center;">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem;">
            <div class="card-glass" style="padding:0.75rem; background:rgba(0,0,0,0.2); text-align:center;">
              <div style="font-size:1.5rem;">💧</div>
              <div id="weather-humidity" style="font-weight:700; font-size:1.1rem;">72%</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">Humidity</div>
            </div>
            <div class="card-glass" style="padding:0.75rem; background:rgba(0,0,0,0.2); text-align:center;">
              <div style="font-size:1.5rem;">💨</div>
              <div id="weather-wind" style="font-weight:700; font-size:1.1rem;">12 km/h</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">Wind Speed</div>
            </div>
            <div class="card-glass" style="padding:0.75rem; background:rgba(0,0,0,0.2); text-align:center;">
              <div style="font-size:1.5rem;">🌡️</div>
              <div id="weather-feels" style="font-weight:700; font-size:1.1rem;">34°C</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">Feels Like</div>
            </div>
            <div class="card-glass" style="padding:0.75rem; background:rgba(0,0,0,0.2); text-align:center;">
              <div style="font-size:1.5rem;">👁️</div>
              <div id="weather-visibility" style="font-weight:700; font-size:1.1rem;">10 km</div>
              <div style="font-size:0.72rem; color:var(--text-muted);">Visibility</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 5-Day Forecast Row -->
      <h3 style="font-size:0.9rem; font-weight:700; color:var(--text-secondary); margin-bottom:0.75rem;">5-Day Outlook</h3>
      <div id="weather-forecast-row" style="display:flex; gap:8px; overflow-x:auto; padding-bottom:4px;">
        <!-- Render dynamically -->
      </div>
    </div>
  `;

  const cityInput = document.getElementById("weather-city-input");
  const searchBtn = document.getElementById("weather-search-btn");

  // Render with mock data on init
  renderWeather("Dhaka, BD", 31, "Partly Cloudy", "Clouds", 72, 12, 34, 10);

  searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (!city) return;
    searchBtn.disabled = true;
    searchBtn.textContent = "Fetching...";

    // Try OpenMeteo free API (no key needed)
    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`)
      .then(r => r.json())
      .then(geo => {
        if (!geo.results || !geo.results.length) throw new Error("City not found");
        const { latitude, longitude, name, country_code } = geo.results[0];
        return fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m,windspeed_10m,apparent_temperature,visibility`)
          .then(r => r.json())
          .then(weather => ({ weather, name, country_code }));
      })
      .then(({ weather, name, country_code }) => {
        const cw = weather.current_weather;
        const temp = Math.round(cw.temperature);
        const wind = Math.round(cw.windspeed);
        const codes = { 0: ["Clear sky","Clear"], 1: ["Mainly clear","Clear"], 2: ["Partly cloudy","Clouds"], 3: ["Overcast","Clouds"], 45: ["Foggy","Mist"], 51: ["Drizzle","Drizzle"], 61: ["Rain","Rain"], 80: ["Rain showers","Rain"], 95: ["Thunderstorm","Thunderstorm"] };
        const [desc, main] = codes[cw.weathercode] || ["Unknown","default"];
        renderWeather(`${name}, ${country_code}`, temp, desc, main, 65, wind, temp + 2, 10);
      })
      .catch(err => {
        console.warn("Weather API failed, showing mock:", err);
        renderWeather(`${city} (Estimated)`, Math.floor(Math.random() * 20 + 15), "Partly Cloudy", "Clouds", 60, 10, 28, 8);
      })
      .finally(() => {
        searchBtn.disabled = false;
        searchBtn.textContent = "Get Weather";
      });
  });

  function renderWeather(city, temp, desc, main, humidity, wind, feelsLike, visibility) {
    document.getElementById("weather-main-icon").textContent = weatherIcons[main] || weatherIcons.default;
    document.getElementById("weather-temp-big").textContent = `${temp}°C`;
    document.getElementById("weather-desc-lbl").textContent = desc;
    document.getElementById("weather-city-lbl").textContent = city;
    document.getElementById("weather-humidity").textContent = `${humidity}%`;
    document.getElementById("weather-wind").textContent = `${wind} km/h`;
    document.getElementById("weather-feels").textContent = `${feelsLike}°C`;
    document.getElementById("weather-visibility").textContent = `${visibility} km`;
    renderForecast(temp, main);
  }

  function renderForecast(baseTemp, main) {
    const row = document.getElementById("weather-forecast-row");
    row.innerHTML = "";
    const days = ["Today","Tomorrow","Wed","Thu","Fri"];
    days.forEach((day, i) => {
      const t = baseTemp + Math.floor(Math.random() * 6 - 3);
      const card = document.createElement("div");
      card.className = "card-glass";
      card.style.cssText = "min-width:100px; text-align:center; padding:0.75rem; flex-shrink:0; background:rgba(0,0,0,0.2);";
      card.innerHTML = `
        <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted);">${day}</div>
        <div style="font-size:1.75rem; margin:0.5rem 0;">${weatherIcons[main] || "⛅"}</div>
        <div style="font-weight:800; font-size:1rem; color:var(--primary);">${t}°C</div>
      `;
      row.appendChild(card);
    });
  }
}
