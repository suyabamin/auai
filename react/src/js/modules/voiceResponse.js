import { apiFetch } from "../utils/fetch.js";

/**
 * Voice Response / TTS Module — Full UI
 */
export function init() {
  const container = document.getElementById("voiceResponse");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="max-width:560px; margin:0 auto;">
      <div class="module-header">
        <h2 class="module-title">🗣️ Voice Response Engine</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div style="display:flex; flex-direction:column; gap:1.25rem;">
        <!-- Quick phrases -->
        <div>
          <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Quick Phrases</label>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;" id="vr-phrases">
            <button class="btn-glass vr-phrase" style="font-size:0.78rem;" data-text="Good morning Commander, systems are online.">🌅 Morning</button>
            <button class="btn-glass vr-phrase" style="font-size:0.78rem;" data-text="All tasks have been completed successfully.">✅ Done</button>
            <button class="btn-glass vr-phrase" style="font-size:0.78rem;" data-text="Warning! System alert detected. Please review.">⚠️ Alert</button>
            <button class="btn-glass vr-phrase" style="font-size:0.78rem;" data-text="Welcome back. Your assistant is ready for commands.">👋 Welcome</button>
          </div>
        </div>

        <!-- Text input -->
        <div>
          <label style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">Custom Text to Speak</label>
          <textarea id="vr-input" class="input-glass" style="height:120px; resize:none; font-size:0.95rem; line-height:1.6; margin-top:6px; padding:1rem;" placeholder="Type text to be spoken aloud..."></textarea>
        </div>

        <!-- Voice selector -->
        <div style="display:flex; gap:10px; flex-wrap:wrap;">
          <div style="flex:1; display:flex; flex-direction:column; gap:4px; min-width:160px;">
            <label style="font-size:0.78rem; color:var(--text-muted);">Voice</label>
            <select id="vr-voice-sel" class="input-glass"></select>
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; min-width:120px;">
            <label style="font-size:0.78rem; color:var(--text-muted);">Speed: <span id="vr-rate-lbl">1x</span></label>
            <input type="range" id="vr-rate" min="0.5" max="2" step="0.1" value="1" style="accent-color:var(--primary);" />
          </div>
          <div style="display:flex; flex-direction:column; gap:4px; min-width:120px;">
            <label style="font-size:0.78rem; color:var(--text-muted);">Volume: <span id="vr-vol-lbl">100%</span></label>
            <input type="range" id="vr-volume" min="0" max="1" step="0.05" value="1" style="accent-color:var(--primary);" />
          </div>
        </div>

        <!-- Control Buttons -->
        <div style="display:flex; gap:10px;">
          <button id="vr-speak-btn" class="btn-primary" style="flex:1; font-size:1rem; font-weight:700; display:flex; align-items:center; justify-content:center; gap:8px;"><span>🔊</span> Speak</button>
          <button id="vr-stop-btn" class="btn-glass" style="color:var(--danger); font-size:0.9rem;" disabled>⏹️ Stop</button>
        </div>

        <div id="vr-status" style="font-size:0.82rem; color:var(--text-muted); text-align:center; font-weight:600;">Status: idle</div>

        <p style="font-size:0.72rem; color:var(--text-muted); text-align:center; margin:0;">
          ${window.speechSynthesis ? "✅ Web Speech Synthesis API is active." : "❌ Speech Synthesis is not supported in this browser."}
        </p>
      </div>
    </div>
  `;

  if (!window.speechSynthesis) return;

  const inputEl = document.getElementById("vr-input");
  const voiceSel = document.getElementById("vr-voice-sel");
  const rateSlider = document.getElementById("vr-rate");
  const volSlider = document.getElementById("vr-volume");
  const speakBtn = document.getElementById("vr-speak-btn");
  const stopBtn = document.getElementById("vr-stop-btn");
  const statusEl = document.getElementById("vr-status");
  const rateLbl = document.getElementById("vr-rate-lbl");
  const volLbl = document.getElementById("vr-vol-lbl");

  function loadVoices() {
    voiceSel.innerHTML = `<option value="">Default Voice</option>`;
    speechSynthesis.getVoices().forEach((v, i) => {
      const o = document.createElement("option");
      o.value = i; o.textContent = `${v.name} (${v.lang})`;
      voiceSel.appendChild(o);
    });
  }
  loadVoices();
  if (speechSynthesis.onvoiceschanged !== undefined) speechSynthesis.onvoiceschanged = loadVoices;

  rateSlider.addEventListener("input", () => { rateLbl.textContent = rateSlider.value + "x"; });
  volSlider.addEventListener("input", () => { volLbl.textContent = Math.round(volSlider.value * 100) + "%"; });

  document.querySelectorAll(".vr-phrase").forEach(btn => {
    btn.addEventListener("click", () => { inputEl.value = btn.dataset.text; });
  });

  speakBtn.addEventListener("click", () => {
    const text = inputEl.value.trim();
    if (!text) return;
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    const idx = parseInt(voiceSel.value);
    if (!isNaN(idx) && voices[idx]) utt.voice = voices[idx];
    utt.rate = parseFloat(rateSlider.value);
    utt.volume = parseFloat(volSlider.value);
    utt.onstart = () => { statusEl.textContent = "Status: Speaking..."; statusEl.style.color = "var(--primary)"; stopBtn.disabled = false; speakBtn.disabled = true; };
    utt.onend = () => { statusEl.textContent = "Status: Complete"; statusEl.style.color = "var(--success)"; stopBtn.disabled = true; speakBtn.disabled = false; };
    utt.onerror = () => { statusEl.textContent = "Status: Error"; statusEl.style.color = "var(--danger)"; speakBtn.disabled = false; };
    speechSynthesis.speak(utt);
    apiFetch("voiceResponse", { text }).catch(() => {});
  });

  stopBtn.addEventListener("click", () => {
    speechSynthesis.cancel();
    statusEl.textContent = "Status: Stopped"; statusEl.style.color = "var(--text-muted)";
    stopBtn.disabled = true; speakBtn.disabled = false;
  });
}
