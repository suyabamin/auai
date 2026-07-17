/**
 * Speech Synthesis / Text-to-Speech Module
 */
export function init() {
  const container = document.getElementById("speechSynthesis");
  if (!container) return;

  const voices = window.speechSynthesis ? speechSynthesis.getVoices() : [];

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🔊 Text-to-Speech Engine</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12">
        <div style="grid-column:span 8; display:flex; flex-direction:column; gap:1rem;">
          <label style="font-size:0.8rem; color:var(--text-muted); font-weight:700;">Text to Speak Aloud</label>
          <textarea id="tts-input" class="input-glass" style="height:180px; resize:none; font-size:0.95rem; line-height:1.6; padding:1.25rem;" placeholder="Type or paste any text here and press Speak...">Welcome to Alpha AI Assistant. All systems are online and ready for your commands, Commander.</textarea>

          <!-- Controls Row -->
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
            <button id="tts-speak-btn" class="btn-primary" style="display:flex; align-items:center; gap:8px;"><span>🔊</span> Speak</button>
            <button id="tts-pause-btn" class="btn-glass" disabled>⏸️ Pause</button>
            <button id="tts-resume-btn" class="btn-glass" disabled>▶️ Resume</button>
            <button id="tts-stop-btn" class="btn-glass" style="color:var(--danger);" disabled>⏹️ Stop</button>
          </div>

          <!-- Progress indicator -->
          <div id="tts-status" style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Status: Ready</div>
        </div>

        <div style="grid-column:span 4; display:flex; flex-direction:column; gap:1rem; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:1rem; font-weight:700; color:var(--text-secondary);">Voice Settings</h3>

          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <label style="font-size:0.78rem; color:var(--text-muted);">Voice</label>
            <select id="tts-voice-select" class="input-glass">
              <option value="">System Default</option>
            </select>
          </div>

          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <label style="font-size:0.78rem; color:var(--text-muted);">Speed: <span id="tts-rate-val">1.0x</span></label>
            <input type="range" id="tts-rate" min="0.5" max="2" step="0.1" value="1" style="accent-color:var(--primary);" />
          </div>

          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <label style="font-size:0.78rem; color:var(--text-muted);">Pitch: <span id="tts-pitch-val">1.0</span></label>
            <input type="range" id="tts-pitch" min="0" max="2" step="0.1" value="1" style="accent-color:var(--primary);" />
          </div>

          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            <label style="font-size:0.78rem; color:var(--text-muted);">Volume: <span id="tts-vol-val">100%</span></label>
            <input type="range" id="tts-volume" min="0" max="1" step="0.05" value="1" style="accent-color:var(--primary);" />
          </div>

          <div style="margin-top:auto; padding:0.75rem; background:rgba(0,0,0,0.2); border-radius:8px; font-size:0.75rem; color:var(--text-muted);">
            ${window.speechSynthesis ? "✅ Speech Synthesis API is supported in this browser." : "❌ Speech Synthesis not supported. Please use Chrome or Edge."}
          </div>
        </div>
      </div>
    </div>
  `;

  if (!window.speechSynthesis) return;

  const speakBtn = document.getElementById("tts-speak-btn");
  const pauseBtn = document.getElementById("tts-pause-btn");
  const resumeBtn = document.getElementById("tts-resume-btn");
  const stopBtn = document.getElementById("tts-stop-btn");
  const textarea = document.getElementById("tts-input");
  const voiceSelect = document.getElementById("tts-voice-select");
  const rateSlider = document.getElementById("tts-rate");
  const pitchSlider = document.getElementById("tts-pitch");
  const volumeSlider = document.getElementById("tts-volume");
  const status = document.getElementById("tts-status");

  // Populate available voices
  function populateVoices() {
    const voiceList = speechSynthesis.getVoices();
    voiceSelect.innerHTML = `<option value="">System Default</option>`;
    voiceList.forEach((v, i) => {
      const opt = document.createElement("option");
      opt.value = i;
      opt.textContent = `${v.name} (${v.lang})`;
      voiceSelect.appendChild(opt);
    });
  }
  populateVoices();
  speechSynthesis.onvoiceschanged = populateVoices;

  // Sliders labels
  rateSlider.addEventListener("input", () => document.getElementById("tts-rate-val").textContent = rateSlider.value + "x");
  pitchSlider.addEventListener("input", () => document.getElementById("tts-pitch-val").textContent = pitchSlider.value);
  volumeSlider.addEventListener("input", () => document.getElementById("tts-vol-val").textContent = Math.round(volumeSlider.value * 100) + "%");

  speakBtn.addEventListener("click", () => {
    const text = textarea.value.trim();
    if (!text) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voiceList = speechSynthesis.getVoices();
    const selectedIdx = parseInt(voiceSelect.value);
    if (!isNaN(selectedIdx) && voiceList[selectedIdx]) utterance.voice = voiceList[selectedIdx];
    utterance.rate = parseFloat(rateSlider.value);
    utterance.pitch = parseFloat(pitchSlider.value);
    utterance.volume = parseFloat(volumeSlider.value);

    utterance.onstart = () => {
      status.textContent = "Status: Speaking...";
      status.style.color = "var(--primary)";
      speakBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
    };
    utterance.onend = () => {
      status.textContent = "Status: Completed";
      status.style.color = "var(--success)";
      speakBtn.disabled = false;
      pauseBtn.disabled = true;
      resumeBtn.disabled = true;
      stopBtn.disabled = true;
    };
    utterance.onerror = e => {
      status.textContent = "Status: Error — " + e.error;
      status.style.color = "var(--danger)";
      speakBtn.disabled = false;
    };

    speechSynthesis.speak(utterance);
  });

  pauseBtn.addEventListener("click", () => {
    speechSynthesis.pause();
    status.textContent = "Status: Paused";
    pauseBtn.disabled = true;
    resumeBtn.disabled = false;
  });

  resumeBtn.addEventListener("click", () => {
    speechSynthesis.resume();
    status.textContent = "Status: Resumed";
    pauseBtn.disabled = false;
    resumeBtn.disabled = true;
  });

  stopBtn.addEventListener("click", () => {
    speechSynthesis.cancel();
    status.textContent = "Status: Stopped";
    status.style.color = "var(--text-muted)";
    speakBtn.disabled = false;
    pauseBtn.disabled = true;
    resumeBtn.disabled = true;
    stopBtn.disabled = true;
  });
}
