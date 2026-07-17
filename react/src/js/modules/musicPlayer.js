import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Acoustic Media Player Hub.
 */
export function init() {
  const container = document.getElementById("musicPlayer");
  if (!container) return;

  const defaultPlaylist = [
    { title: "Deep Focus (Workspace Ambient)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", duration: "6:12" },
    { title: "Alpha Brainwaves (Relaxing Logs)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", duration: "5:02" },
    { title: "Cyber-Security Chill (Lo-Fi)", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", duration: "5:18" }
  ];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🎵 Acoustic Media Studio</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <!-- Player card left -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; align-items: center; gap: 1rem; border-right: 1px solid var(--glass-border); padding-right: 1rem;">
          
          <!-- Virtual Album Cover Art -->
          <div style="width: 160px; height: 160px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), var(--secondary)); display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 30px var(--primary-glow); position: relative; overflow: hidden; margin-top: 0.5rem;" id="music-album-art">
            <span style="font-size: 4rem;">🎵</span>
            <!-- Spinning disk effect -->
            <div id="music-spinning-disc" style="position: absolute; border: 4px dashed rgba(255,255,255,0.15); border-radius: 50%; width: 140px; height: 140px; display: none;"></div>
          </div>

          <div style="text-align: center; width: 100%;">
            <h4 id="music-track-title" style="font-size: 1.05rem; font-weight: 700; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">Deep Focus Ambient</h4>
            <p id="music-track-status" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">Status: Stopped</p>
          </div>

          <audio id="music-audio-element" style="display: none;"></audio>

          <!-- Timeline Slider -->
          <div style="width: 100%; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
              <span id="music-current-time">0:00</span>
              <span id="music-total-duration">0:00</span>
            </div>
            <input type="range" id="music-timeline" min="0" max="100" value="0" style="width: 100%; height: 5px; cursor: pointer; accent-color: var(--primary);" />
          </div>

          <!-- Playback controls -->
          <div style="display: flex; gap: 14px; align-items: center; justify-content: center;">
            <button id="music-prev-btn" class="btn-glass" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;">⏮️</button>
            <button id="music-play-btn" class="btn-primary" style="width: 52px; height: 52px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; box-shadow: 0 4px 15px var(--primary-glow);">▶️</button>
            <button id="music-next-btn" class="btn-glass" style="width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1rem;">⏭️</button>
          </div>

          <!-- Volume Slider -->
          <div style="display: flex; align-items: center; gap: 8px; width: 60%; font-size:0.8rem; color: var(--text-muted);">
            <span>🔈</span>
            <input type="range" id="music-volume" min="0" max="1" step="0.1" value="0.7" style="width:100px; accent-color: var(--primary);" />
            <span>🔊</span>
          </div>
        </div>

        <!-- Playlist & Upload Right -->
        <div style="grid-column: span 6; display: flex; flex-direction: column; gap: 1rem; padding-left: 0.75rem;">
          <h3 style="font-size: 1rem; color: var(--text-secondary); font-weight: 700;">Workspace Ambient Tracks</h3>
          
          <div id="music-playlist-deck" style="background: rgba(0,0,0,0.1); border-radius: 8px; border: 1px solid var(--glass-border); padding: 0.5rem; display: flex; flex-direction: column; gap: 6px; height: 180px; overflow-y: auto;">
            <!-- Render dynamic list -->
          </div>

          <!-- Upload user audio -->
          <div style="border-top: 1px solid var(--glass-border); padding-top: 1rem; display: flex; flex-direction: column; gap: 8px;">
            <h4 style="font-size: 0.85rem; font-weight: 700;">Upload & Stream Local Audio</h4>
            <div style="display: flex; gap: 8px;">
              <input type="file" id="music-upload-input" accept="audio/*" class="input-glass" style="font-size: 0.75rem; flex: 1; min-width: 0;" />
              <button id="music-upload-btn" class="btn-glass" style="font-size: 0.8rem;">Upload & Play</button>
            </div>
            <p style="font-size: 0.72rem; color: var(--text-muted);">Uploaded audio streams natively. File data is cached securely in workspace libraries.</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const audio = document.getElementById("music-audio-element");
  const playBtn = document.getElementById("music-play-btn");
  const prevBtn = document.getElementById("music-prev-btn");
  const nextBtn = document.getElementById("music-next-btn");
  const timeline = document.getElementById("music-timeline");
  const volumeSlider = document.getElementById("music-volume");
  
  const currentLbl = document.getElementById("music-current-time");
  const durationLbl = document.getElementById("music-total-duration");
  const trackTitle = document.getElementById("music-track-title");
  const trackStatus = document.getElementById("music-track-status");
  const spinningDisc = document.getElementById("music-spinning-disc");

  const playlistDeck = document.getElementById("music-playlist-deck");
  const fileInput = document.getElementById("music-upload-input");
  const uploadBtn = document.getElementById("music-upload-btn");

  let currentTrackIdx = 0;

  loadPlaylist();

  function loadPlaylist() {
    playlistDeck.innerHTML = "";
    defaultPlaylist.forEach((track, idx) => {
      const row = document.createElement("div");
      row.className = `widget-list-item ${idx === currentTrackIdx ? "active" : ""}`;
      row.style.background = idx === currentTrackIdx ? "var(--glass-bg-accent)" : "transparent";
      row.style.border = "1px solid " + (idx === currentTrackIdx ? "var(--primary)" : "transparent");
      row.style.padding = "6px 10px";
      row.style.borderRadius = "6px";
      row.style.cursor = "pointer";
      row.style.display = "flex";
      row.style.justifyContent = "space-between";
      row.style.alignItems = "center";

      row.innerHTML = `
        <div>
          <span style="font-size:0.8rem; font-weight:600; color: ${idx === currentTrackIdx ? "var(--primary)" : "var(--text-primary)"}">${track.title}</span>
        </div>
        <span style="font-size:0.75rem; color:var(--text-muted);">${track.duration}</span>
      `;

      row.addEventListener("click", () => {
        selectTrack(idx);
      });

      playlistDeck.appendChild(row);
    });

    // select first track initially
    if (!audio.src && defaultPlaylist.length > 0) {
      audio.src = defaultPlaylist[currentTrackIdx].url;
      trackTitle.textContent = defaultPlaylist[currentTrackIdx].title;
    }
  }

  function selectTrack(idx) {
    currentTrackIdx = idx;
    audio.src = defaultPlaylist[idx].url;
    trackTitle.textContent = defaultPlaylist[idx].title;
    audio.play()
      .then(() => {
        playBtn.textContent = "⏸️";
        trackStatus.textContent = "Status: Online Stream Playing";
        spinningDisc.style.display = "block";
        spinningDisc.style.animation = "floatElement 3s linear infinite";
      })
      .catch(e => console.warn(e));
    loadPlaylist();
  }

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      audio.play()
        .then(() => {
          playBtn.textContent = "⏸️";
          trackStatus.textContent = "Status: Stream Active";
          spinningDisc.style.display = "block";
          spinningDisc.style.animation = "floatElement 3s linear infinite";
        });
    } else {
      audio.pause();
      playBtn.textContent = "▶️";
      trackStatus.textContent = "Status: Paused";
      spinningDisc.style.animation = "none";
    }
  });

  prevBtn.addEventListener("click", () => {
    let nextIdx = currentTrackIdx - 1;
    if (nextIdx < 0) nextIdx = defaultPlaylist.length - 1;
    selectTrack(nextIdx);
  });

  nextBtn.addEventListener("click", () => {
    let nextIdx = currentTrackIdx + 1;
    if (nextIdx >= defaultPlaylist.length) nextIdx = 0;
    selectTrack(nextIdx);
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const progress = (audio.currentTime / audio.duration) * 100;
    timeline.value = progress;
    
    // update label minutes/seconds
    const curMin = Math.floor(audio.currentTime / 60);
    const curSec = Math.floor(audio.currentTime % 60);
    currentLbl.textContent = `${curMin}:${String(curSec).padStart(2,'0')}`;

    const durMin = Math.floor(audio.duration / 60);
    const durSec = Math.floor(audio.duration % 60);
    durationLbl.textContent = `${durMin}:${String(durSec).padStart(2,'0')}`;
  });

  timeline.addEventListener("input", () => {
    if (!audio.duration) return;
    const seekTime = (timeline.value / 100) * audio.duration;
    audio.currentTime = seekTime;
  });

  volumeSlider.addEventListener("input", () => {
    audio.volume = volumeSlider.value;
  });

  uploadBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) return;

    // Stream uploaded target locally directly
    const localUrl = URL.createObjectURL(file);
    defaultPlaylist.push({
      title: file.name,
      url: localUrl,
      duration: "Local File"
    });
    
    currentTrackIdx = defaultPlaylist.length - 1;
    selectTrack(currentTrackIdx);

    // Background upload registry sync
    const formData = new FormData();
    formData.append("audio", file);
    fetch(`${apiFetch.BASE_URL}/musicUpload`, {
      method: "POST",
      body: formData,
    }).catch(e => console.warn("Background upload error simulation:", e));
  });
}
