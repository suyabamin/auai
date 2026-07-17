import { apiFetch } from "../utils/fetch.js";

/**
 * Video Player Module — Full UI
 */
export function init() {
  const container = document.getElementById("videoPlayer");
  if (!container) return;

  const SAMPLE_VIDEOS = [
    { title: "Big Buck Bunny (Short Film)", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", thumb: "https://peach.blender.org/wp-content/uploads/bbb-splash.png" },
    { title: "Elephant Dream", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", thumb: "https://orange.blender.org/wp-content/uploads/siggraph/elephantsdream-spee.jpg" },
    { title: "Subaru Outback Ad", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", thumb: "" },
    { title: "Tesla Model S", url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", thumb: "" }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🎥 Video Studio Player</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12" style="gap:1rem;">
        <!-- Video player left -->
        <div style="grid-column:span 8; display:flex; flex-direction:column; gap:1rem;">
          <!-- Video element -->
          <div style="background:#000; border-radius:var(--border-radius-md); overflow:hidden; aspect-ratio:16/9; position:relative; border:2px solid var(--glass-border);">
            <video id="vp-video" style="width:100%; height:100%; display:block;" controls preload="metadata">
              <source id="vp-source" src="" />
              Your browser does not support HTML5 video.
            </video>
            <div id="vp-placeholder" style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; pointer-events:none; background:rgba(0,0,0,0.4);">
              <span style="font-size:3rem;">🎬</span>
              <span style="color:white; opacity:0.7; margin-top:0.5rem; font-size:0.9rem;">Select a video to play</span>
            </div>
          </div>

          <!-- Now playing label -->
          <div>
            <h3 id="vp-title-lbl" style="font-size:1rem; font-weight:700;">Select a Sample Video</h3>
            <p id="vp-desc-lbl" style="font-size:0.8rem; color:var(--text-muted);">Built-in HTML5 video player with loop, speed, and URL support.</p>
          </div>

          <!-- Extra Controls -->
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
            <label style="font-size:0.8rem; color:var(--text-muted);">Speed:</label>
            <select id="vp-speed" class="input-glass" style="min-width:80px; font-size:0.8rem; padding:0.3rem 0.5rem;">
              <option value="0.5">0.5x</option>
              <option value="1" selected>1.0x (Normal)</option>
              <option value="1.5">1.5x</option>
              <option value="2">2.0x</option>
            </select>
            <label style="font-size:0.8rem; color:var(--text-muted); margin-left:8px;">Loop:</label>
            <input type="checkbox" id="vp-loop" style="width:16px; height:16px; cursor:pointer; accent-color:var(--primary);" />
            <button id="vp-fullscreen-btn" class="btn-glass" style="margin-left:auto; font-size:0.85rem; padding:0.3rem 0.6rem;">⛶ Fullscreen</button>
          </div>

          <!-- Custom URL input -->
          <div style="display:flex; gap:8px; border-top:1px solid var(--glass-border); padding-top:0.75rem;">
            <input id="vp-url-input" class="input-glass" style="flex:1; font-size:0.85rem;" placeholder="Paste a direct video URL to play (.mp4, .webm)..." />
            <button id="vp-load-url-btn" class="btn-glass" style="font-size:0.85rem; padding:0.4rem 0.75rem;">Load URL</button>
          </div>
        </div>

        <!-- Playlist right -->
        <div style="grid-column:span 4; display:flex; flex-direction:column; gap:0.75rem; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Sample Library</h3>
          <div id="vp-playlist" style="display:flex; flex-direction:column; gap:8px; overflow-y:auto; max-height:380px;">
            <!-- Render dynamically -->
          </div>

          <!-- Upload file -->
          <div style="border-top:1px solid var(--glass-border); padding-top:0.75rem; display:flex; flex-direction:column; gap:6px;">
            <label style="font-size:0.78rem; color:var(--text-muted); font-weight:600;">Upload Local Video</label>
            <input type="file" id="vp-upload" accept="video/*" class="input-glass" style="font-size:0.75rem;" />
          </div>
        </div>
      </div>
    </div>
  `;

  const video = document.getElementById("vp-video");
  const sourceEl = document.getElementById("vp-source");
  const placeholder = document.getElementById("vp-placeholder");
  const titleLbl = document.getElementById("vp-title-lbl");
  const descLbl = document.getElementById("vp-desc-lbl");
  const speedSel = document.getElementById("vp-speed");
  const loopChk = document.getElementById("vp-loop");
  const playlistEl = document.getElementById("vp-playlist");
  const urlInput = document.getElementById("vp-url-input");
  const loadUrlBtn = document.getElementById("vp-load-url-btn");
  const fsBtn = document.getElementById("vp-fullscreen-btn");
  const uploadInput = document.getElementById("vp-upload");

  function loadVideo(url, title) {
    video.src = url;
    video.load();
    video.play().catch(e => console.warn("Autoplay blocked:", e));
    titleLbl.textContent = title;
    descLbl.textContent = url.length > 60 ? url.substring(0, 60) + "..." : url;
    placeholder.style.display = "none";
  }

  function renderPlaylist() {
    playlistEl.innerHTML = "";
    SAMPLE_VIDEOS.forEach((v, i) => {
      const card = document.createElement("div");
      card.className = "card-glass";
      card.style.cssText = "padding:0.75rem; cursor:pointer; display:flex; align-items:center; gap:10px; background:rgba(0,0,0,0.15);";
      card.innerHTML = `
        <span style="font-size:1.5rem; flex-shrink:0;">🎬</span>
        <div style="overflow:hidden;">
          <h5 style="font-size:0.8rem; font-weight:700; margin:0; white-space:nowrap; text-overflow:ellipsis; overflow:hidden;">${v.title}</h5>
          <span style="font-size:0.68rem; color:var(--text-muted);">Sample · Free (Blender)</span>
        </div>
      `;
      card.addEventListener("click", () => loadVideo(v.url, v.title));
      playlistEl.appendChild(card);
    });
  }

  speedSel.addEventListener("change", () => { video.playbackRate = parseFloat(speedSel.value); });
  loopChk.addEventListener("change", () => { video.loop = loopChk.checked; });

  loadUrlBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (!url) return;
    loadVideo(url, "Custom URL Video");
    SAMPLE_VIDEOS.push({ title: "Custom URL Video", url });
    renderPlaylist();
  });

  fsBtn.addEventListener("click", () => {
    if (video.requestFullscreen) video.requestFullscreen();
    else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
  });

  uploadInput.addEventListener("change", () => {
    const file = uploadInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    loadVideo(url, file.name);
    SAMPLE_VIDEOS.push({ title: file.name, url });
    renderPlaylist();
  });

  renderPlaylist();
}
