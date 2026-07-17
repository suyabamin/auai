import { apiFetch } from "../utils/fetch.js";

/**
 * Live Map – interactive map with real‑time location tracking.
 * Uses Leaflet (loaded from CDN) and the browser Geolocation API.
 * No Google Maps API is required.
 */
export function init() {
  const container = document.getElementById("liveMap");
  if (!container) return;

  // ---------------------------------------------------------------------
  // Load Leaflet CSS & JS from CDN (only once)
  // ---------------------------------------------------------------------
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  const loadLeaflet = () => {
    return new Promise((resolve, reject) => {
      if (window.L && typeof window.L.map === "function") {
        resolve(window.L);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => resolve(window.L);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  };

  // ---------------------------------------------------------------------
  // UI markup – map container and control panel
  // ---------------------------------------------------------------------
  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="height:100%; display:flex; flex-direction:column;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:0.5rem; border-bottom:1px solid var(--glass-border);">
        <h2 class="module-title" style="margin:0; font-size:1.2rem;">🗺️ Live Map</h2>
        <div>
          <button id="map-zoom-in" class="btn-glass" title="Zoom In">+</button>
          <button id="map-zoom-out" class="btn-glass" title="Zoom Out">‑</button>
          <button id="map-locate" class="btn-glass" title="Locate Me">📍</button>
          <button id="map-fullscreen" class="btn-glass" title="Fullscreen">⛶</button>
          <button id="map-reset" class="btn-glass" title="Reset View">⟲</button>
        </div>
      </div>
      <div id="live-map" style="flex:1; min-height:300px;"></div>
      <div id="live-info" style="padding:0.5rem; font-size:0.85rem; background:rgba(0,0,0,0.05);">
        <span id="lat"></span> | <span id="lng"></span> | <span id="alt"></span> | <span id="spd"></span> | <span id="hdg"></span>
      </div>
      <div style="display:flex; gap:0.5rem; padding:0.5rem; border-top:1px solid var(--glass-border);">
        <button id="track-start" class="btn-primary">Start Tracking</button>
        <button id="track-pause" class="btn-glass" disabled>Pause</button>
        <button id="track-resume" class="btn-glass" disabled>Resume</button>
        <button id="track-stop" class="btn-glass" disabled>Stop</button>
        <button id="track-clear" class="btn-glass" disabled>Clear Route</button>
      </div>
    </div>`;

  // ---------------------------------------------------------------------
  // Initialise Leaflet map after library is ready
  // ---------------------------------------------------------------------
  loadLeaflet()
    .then(L => {
      const map = L.map("live-map").setView([0, 0], 2);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Marker, accuracy circle and polyline for the travelled path
      let marker = null;
      let accuracyCircle = null;
      const path = [];
      const polyline = L.polyline(path, { color: "var(--primary)" }).addTo(map);

      // UI element references
      const latEl = document.getElementById("lat");
      const lngEl = document.getElementById("lng");
      const altEl = document.getElementById("alt");
      const spdEl = document.getElementById("spd");
      const hdgEl = document.getElementById("hdg");
      const startBtn = document.getElementById("track-start");
      const pauseBtn = document.getElementById("track-pause");
      const resumeBtn = document.getElementById("track-resume");
      const stopBtn = document.getElementById("track-stop");
      const clearBtn = document.getElementById("track-clear");
      const zoomInBtn = document.getElementById("map-zoom-in");
      const zoomOutBtn = document.getElementById("map-zoom-out");
      const locateBtn = document.getElementById("map-locate");
      const resetBtn = document.getElementById("map-reset");
      const fullscreenBtn = document.getElementById("map-fullscreen");

      let watchId = null;
      let isPaused = false;

      const updateInfo = pos => {
        const { latitude, longitude, altitude, speed, heading, accuracy, timestamp } = pos.coords;
        latEl.textContent = `Lat: ${latitude.toFixed(6)}`;
        lngEl.textContent = `Lng: ${longitude.toFixed(6)}`;
        altEl.textContent = altitude !== null ? `Alt: ${altitude.toFixed(1)}m` : "Alt: —";
        spdEl.textContent = speed !== null ? `Spd: ${speed.toFixed(1)}m/s` : "Spd: —";
        hdgEl.textContent = heading !== null ? `Hdg: ${heading.toFixed(0)}°` : "Hdg: —";
        // Update marker & accuracy
        if (!marker) {
          marker = L.marker([latitude, longitude]).addTo(map);
        } else {
          marker.setLatLng([latitude, longitude]);
        }
        if (!accuracyCircle) {
          accuracyCircle = L.circle([latitude, longitude], { radius: accuracy }).addTo(map);
        } else {
          accuracyCircle.setLatLng([latitude, longitude]).setRadius(accuracy);
        }
        // Add to path if tracking is active
        if (watchId !== null && !isPaused) {
          path.push([latitude, longitude]);
          polyline.setLatLngs(path);
        }
        // Keep map centred on current location
        map.setView([latitude, longitude]);
      };

      const handleError = err => {
        let msg = "Location error";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            msg = "Permission denied. Please allow location access.";
            break;
          case err.POSITION_UNAVAILABLE:
            msg = "Location unavailable.";
            break;
          case err.TIMEOUT:
            msg = "Location request timed out.";
            break;
        }
        alert(msg);
      };

      // -----------------------------------------------------------------
      // Control button handlers
      // -----------------------------------------------------------------
      startBtn.onclick = () => {
        if (watchId !== null) return; // already tracking
        watchId = navigator.geolocation.watchPosition(updateInfo, handleError, {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 10000,
        });
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        stopBtn.disabled = false;
        clearBtn.disabled = false;
      };

      pauseBtn.onclick = () => {
        isPaused = true;
        pauseBtn.disabled = true;
        resumeBtn.disabled = false;
      };

      resumeBtn.onclick = () => {
        isPaused = false;
        resumeBtn.disabled = true;
        pauseBtn.disabled = false;
      };

      stopBtn.onclick = () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          watchId = null;
        }
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        resumeBtn.disabled = true;
        stopBtn.disabled = true;
      };

      clearBtn.onclick = () => {
        path.length = 0;
        polyline.setLatLngs([]);
        clearBtn.disabled = true;
      };

      zoomInBtn.onclick = () => map.zoomIn();
      zoomOutBtn.onclick = () => map.zoomOut();
      locateBtn.onclick = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(pos => {
            const { latitude, longitude } = pos.coords;
            map.setView([latitude, longitude], 15);
          }, handleError);
        }
      };
      resetBtn.onclick = () => {
        map.setView([0, 0], 2);
        if (marker) marker.setLatLng([0, 0]);
        if (accuracyCircle) accuracyCircle.setLatLng([0, 0]);
      };
      fullscreenBtn.onclick = () => {
        const mapDiv = document.getElementById("live-map");
        if (mapDiv.requestFullscreen) {
          mapDiv.requestFullscreen();
        }
      };
    })
    .catch(err => {
      console.error("Failed to load Leaflet:", err);
    });
}
