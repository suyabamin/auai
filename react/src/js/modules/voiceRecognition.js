import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Voice Recognition & Voice control suite.
 */
export function init() {
  const container = document.getElementById("voiceRecognition");
  if (!container) return;

  const isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  container.innerHTML = `
    <style>
      @keyframes floatElement {
        0% { transform: scaleY(1); }
        50% { transform: scaleY(1.8); }
        100% { transform: scaleY(1); }
      }
      .badge-primary {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: var(--primary);
        color: #fff;
        border-radius: 0.25rem;
        font-size: 0.75rem;
      }
      .badge-success {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        background: var(--success);
        color: #fff;
        border-radius: 0.25rem;
        font-size: 0.75rem;
      }
      @media (max-width: 600px) {
        .voice-recognition-card {
          max-width: 100% !important;
        }
      }
      .mic-disabled {
        opacity: 0.6;
        cursor: not-allowed !important;
        filter: grayscale(1);
        background: rgba(255,255,255,0.1) !important;
        box-shadow: none !important;
      }
    </style>
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🎤 Voice Command Studio</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 0; gap: 1.5rem;">
        <!-- Glowing Microphone Button -->
        <button id="voice-mic-btn" class="topbar-action-btn ${isSupported ? 'anim-pulse' : 'mic-disabled'}" style="width: 100px; height: 100px; font-size: 3rem; background: var(--primary); color: white; border-radius: 50%; cursor: pointer; border: none; box-shadow: 0 8px 30px var(--primary-glow); display: flex; align-items: center; justify-content: center;">
          🎙️
        </button>
        
        <div id="voice-status-text" style="font-weight: 600; color: var(--text-secondary); font-size: 1.1rem; text-align: center; max-width: 90%;">
          ${isSupported ? 'Click the microphone to start speaking' : '⚠️ Native Speech recognition not supported in this browser'}
        </div>

        <!-- Custom Waveform Visualizer simulation -->
        <div id="waveform-visualizer" style="display: flex; align-items: center; gap: 6px; height: 40px; margin: 0.5rem 0; width: 220px; justify-content: center; opacity: 0.15;">
          <span style="display: inline-block; width: 4px; height: 10px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 25px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 40px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 18px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 32px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
          <span style="display: inline-block; width: 4px; height: 12px; background: var(--primary); border-radius: 10px; transition: var(--transition-fast);"></span>
        </div>

        <!-- Voice transcripts preview -->
        <div class="card-glass" style="width: 100%; max-width: 600px; min-height: 120px; background: rgba(0,0,0,0.1); border-color: var(--glass-border); padding: 1rem; border-radius: 12px;">
          <h3 style="font-size: 0.85rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; letter-spacing: 1px;">Live Transcript Output</h3>
          <p id="voice-transcript-output" style="font-size: 1rem; line-height: 1.5; color: var(--text-primary);">
            <i>Your spoken words will appear here...</i>
          </p>
        </div>

        <!-- Simulated Input Console -->
        <div class="card-glass" style="width: 100%; max-width: 600px; padding: 1.25rem; background: rgba(255,255,255,0.02); border-color: var(--glass-border); border-radius: 12px; margin-top: 0.5rem;">
          <h3 style="font-size: 0.85rem; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.75rem; font-weight: 700; letter-spacing: 0.5px;">💎 Voice Command Simulator</h3>
          <p style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            Type a command below or click a preset badge shortcut to run simulated voice interaction:
          </p>
          <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 1rem;">
            <input id="voice-sim-input" class="input-glass" style="flex: 1; min-height: 44px; font-size: 0.9rem;" placeholder="e.g. Get weather for Tokyo..." />
            <button id="voice-sim-btn" class="btn-primary" style="padding: 0.5rem 1.25rem; min-height: 44px; font-weight: 700; white-space: nowrap;">Simulate</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Presets (Click To Run):</span>
            <div style="display: flex; flex-wrap: wrap; gap: 6px;" id="sim-presets-list">
              <button class="btn-glass sim-preset" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 12px; cursor: pointer;" data-cmd="Open Chat">💬 Open Chat</button>
              <button class="btn-glass sim-preset" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 12px; cursor: pointer;" data-cmd="Get weather for Miami">🌦️ Weather for Miami</button>
              <button class="btn-glass sim-preset" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 12px; cursor: pointer;" data-cmd="Create task Complete security audit">✅ Create task "Complete security audit"</button>
              <button class="btn-glass sim-preset" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 12px; cursor: pointer;" data-cmd="Dark Mode">🌙 Dark Mode</button>
              <button class="btn-glass sim-preset" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 12px; cursor: pointer;" data-cmd="Light Mode">☀️ Light Mode</button>
              <button class="btn-glass sim-preset" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 12px; cursor: pointer;" data-cmd="Open Notes">📝 Open Notes Workspace</button>
              <button class="btn-glass sim-preset" style="padding: 4px 10px; font-size: 0.76rem; border-radius: 12px; cursor: pointer;" data-cmd="Open Calculator">➗ Open Calculator</button>
            </div>
          </div>
        </div>

        <!-- Voice commands list helper display -->
        <div style="width: 100%; max-width: 600px; margin-top: 0.5rem;">
          <h3 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--text-secondary);">Supported Commands Reference:</h3>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            <span class="badge badge-primary">"Open Chat" / "Open Assistant"</span>
            <span class="badge badge-primary">"Get weather for [City]" / "Weather in [City]"</span>
            <span class="badge badge-primary">"Dark Mode" / "Toggle DarkTheme"</span>
            <span class="badge badge-primary">"Light Mode" / "Toggle LightTheme"</span>
            <span class="badge badge-primary">"Create task [Task Name]" / "Add task [Task Name]"</span>
            <span class="badge badge-primary">"Open Notes" / "Open Workspace"</span>
            <span class="badge badge-primary">"Open Calculator" / "Calculator"</span>
            <span class="badge badge-primary">"Go Home" / "Open Dashboard"</span>
          </div>
        </div>
      </div>
    </div>
  `;

  const btn = document.getElementById("voice-mic-btn");
  const statusText = document.getElementById("voice-status-text");
  const transcriptOutput = document.getElementById("voice-transcript-output");
  const waveform = document.getElementById("waveform-visualizer");
  const simInput = document.getElementById("voice-sim-input");
  const simBtn = document.getElementById("voice-sim-btn");
  const presetBtns = document.querySelectorAll(".sim-preset");

  let isListening = false;
  let recognition = null;

  if (isSupported) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    btn.addEventListener("click", () => {
      if (isListening) {
        recognition.stop();
      } else {
        try {
          recognition.start();
        } catch(e) {}
      }
    });

    recognition.onstart = () => {
      isListening = true;
      statusText.textContent = "Listening carefully... speak now";
      statusText.style.color = "var(--primary)";
      transcriptOutput.innerHTML = "<i>Analyzing audio input...</i>";
      waveform.style.opacity = "1";
      btn.style.boxShadow = "0 8px 30px var(--secondary-glow)";
      
      const bars = waveform.querySelectorAll("span");
      bars.forEach((bar, idx) => {
        bar.style.animation = `floatElement ${0.5 + idx * 0.15}s ease-in-out infinite`;
      });
    };

    recognition.onend = () => {
      isListening = false;
      statusText.textContent = "Click the microphone to start speaking";
      statusText.style.color = "var(--text-secondary)";
      waveform.style.opacity = "0.15";
      btn.style.boxShadow = "0 8px 30px var(--primary-glow)";
      
      const bars = waveform.querySelectorAll("span");
      bars.forEach(bar => {
        bar.style.animation = "none";
      });
    };

    recognition.onresult = event => {
      const transcript = event.results[0][0].transcript;
      transcriptOutput.textContent = `"${transcript}"`;
      
      executeVoiceCommand(transcript);

      // Sync with apps script
      apiFetch("voiceRecognition", { transcript })
        .catch(err => console.error("voiceRecognition appsScript sync error:", err));
    };

    recognition.onerror = event => {
      console.error("Speech recognition error", event.error);
      statusText.textContent = `Error: ${event.error}`;
      statusText.style.color = "var(--danger)";
      isListening = false;
    };
  }

  // Simulation Logic
  const handleSimulate = (text) => {
    if (!text.trim()) return;
    transcriptOutput.innerHTML = `<i>Processing simulated command: "${text}"</i>`;
    waveform.style.opacity = "1";
    const bars = waveform.querySelectorAll("span");
    bars.forEach((bar, idx) => {
      bar.style.animation = `floatElement ${0.3 + idx * 0.1}s ease-in-out infinite`;
    });

    setTimeout(() => {
      waveform.style.opacity = "0.15";
      bars.forEach(bar => {
        bar.style.animation = "none";
      });
      transcriptOutput.textContent = `"${text}" (Simulated)`;
      executeVoiceCommand(text);

      apiFetch("voiceRecognition", { transcript: text })
        .catch(err => console.error("voiceRecognition appsScript sync error:", err));
    }, 600);
  };

  simBtn.addEventListener("click", () => {
    handleSimulate(simInput.value);
    simInput.value = "";
  });

  simInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      simBtn.click();
    }
  });

  presetBtns.forEach(p => {
    p.addEventListener("click", () => {
      handleSimulate(p.dataset.cmd);
    });
  });
}

/**
 * Advanced voice command processor parser & executor.
 */
function executeVoiceCommand(text) {
  const query = text.toLowerCase().trim();
  const output = document.getElementById("voice-transcript-output");

  const showSuccess = (msg) => {
    if (output) {
      output.innerHTML = `"${text}" <br><br> <span class="badge badge-success">${msg}</span>`;
    }
  };

  const showError = (msg) => {
    if (output) {
      output.innerHTML = `"${text}" <br><br> <span class="badge" style="background:var(--danger); color:#fff;">${msg}</span>`;
    }
  };

  // Navigations
  if (query.includes("open chat") || query.includes("go to chat") || query.includes("assistant") || query.includes("chatbot")) {
    showSuccess("✓ Opening Chatbot Workspace...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("aiChat"));
    }, 500);
  } 
  else if (query.includes("open notes") || query.includes("notes workspace") || query.includes("open workspace")) {
    showSuccess("✓ Opening Notes Workspace...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("notes"));
    }, 500);
  }
  else if (query.includes("open calculator") || query.includes("calculator")) {
    showSuccess("✓ Opening Advanced Calculator...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("calculator"));
    }, 500);
  }
  else if (query.includes("open task") || query.includes("open todo") || query.includes("show task") || query.includes("checklists")) {
    showSuccess("✓ Opening Tasks & To-dos...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("todoList"));
    }, 500);
  }
  else if (query.includes("open calendar") || query.includes("calendar events")) {
    showSuccess("✓ Opening Calendar Events...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("calendar"));
    }, 500);
  }
  else if (query.includes("open translator") || query.includes("translation")) {
    showSuccess("✓ Opening Translator...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("translator"));
    }, 500);
  }
  else if (query.includes("open dictation")) {
    showSuccess("✓ Opening Dictation studio...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("speechRecognition"));
    }, 500);
  }
  else if (query.includes("open camera")) {
    showSuccess("✓ Opening Camera Hub...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("camera"));
    }, 500);
  }
  // Theme configuration via the global Topbar theme toggle button
  else if (query.includes("dark mode") || query.includes("toggle dark")) {
    const themeBtn = document.getElementById("theme-toggle");
    const isDark = document.documentElement.classList.contains("dark");
    if (themeBtn && !isDark) {
      themeBtn.click();
      showSuccess("✓ Switched to Dark Mode Theme");
    } else {
      showSuccess("✓ Dark Mode is already active");
    }
  } 
  else if (query.includes("light mode") || query.includes("toggle light")) {
    const themeBtn = document.getElementById("theme-toggle");
    const isDark = document.documentElement.classList.contains("dark");
    if (themeBtn && isDark) {
      themeBtn.click();
      showSuccess("✓ Switched to Light Mode Theme");
    } else {
      showSuccess("✓ Light Mode is already active");
    }
  } 
  else if (query.includes("home") || query.includes("go home") || query.includes("dashboard")) {
    showSuccess("✓ Returning to Dashboard...");
    setTimeout(() => {
      import("../main.js").then(m => m.navigateTo("dashboard"));
    }, 500);
  }
  
  // Real Action: Create Task
  else if (query.startsWith("create task ") || query.startsWith("add task ") || query.includes("create task") || query.includes("add task")) {
    let taskDesc = "";
    if (query.startsWith("create task ")) {
      taskDesc = text.substring("create task ".length).trim();
    } else if (query.startsWith("add task ")) {
      taskDesc = text.substring("add task ".length).trim();
    } else {
      // generic extraction
      taskDesc = text.replace(/create task/gi, "").replace(/add task/gi, "").trim();
    }

    if (!taskDesc) {
      showError("⚠️ Task description cannot be hollow");
      return;
    }

    try {
      const tag = "Tasks";
      const localTasks = JSON.parse(localStorage.getItem("todos") || "[]");
      const mockId = Date.now().toString();
      localTasks.push({ id: mockId, text: taskDesc, tag, done: false });
      localStorage.setItem("todos", JSON.stringify(localTasks));
      
      showSuccess(`✓ Task Created: "${taskDesc}"`);

      apiFetch("addTodo", { text: taskDesc, tag })
        .catch(err => console.warn("Background sync failed:", err));
    } catch(e) {
      showError("⚠️ Failed to write task to storage");
    }
  }

  // Real Action: Get Weather
  else if (query.includes("weather")) {
    let cityInput = query;
    cityInput = cityInput.replace("get weather for", "");
    cityInput = cityInput.replace("weather for", "");
    cityInput = cityInput.replace("weather in", "");
    cityInput = cityInput.replace("weather", "");
    cityInput = cityInput.trim();

    if (!cityInput) {
      showSuccess("✓ Navigating to Weather Center...");
      setTimeout(() => {
        import("../main.js").then(m => m.navigateTo("weather"));
      }, 500);
      return;
    }

    if (output) {
      output.innerHTML = `"${text}" <br><br> <span class="badge" style="background:#eab308; color:#000;">🔍 Resolving coordinates for "${cityInput}"...</span>`;
    }

    fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1&language=en&format=json`)
      .then(res => res.json())
      .then(data => {
        if (data.results && data.results[0]) {
          const r = data.results[0];
          const locInfo = {
            city: r.name,
            country: r.country || "",
            countryCode: r.country_code ? r.country_code.toUpperCase() : "",
            state: r.admin1 || ""
          };
          
          // Write to synced weather caches!
          localStorage.setItem("weather_page_cache", JSON.stringify({
            lat: r.latitude,
            lon: r.longitude,
            locInfo,
            ts: Date.now()
          }));
          localStorage.setItem("weather_cache", JSON.stringify({
            lat: r.latitude,
            lon: r.longitude,
            city: r.name,
            country: r.country_code ? r.country_code.toUpperCase() : "",
            ts: Date.now()
          }));

          showSuccess(`✓ Found <b>${r.name}</b> (${r.country || ""}). Navigating...`);
          setTimeout(() => {
            import("../main.js").then(m => m.navigateTo("weather"));
          }, 800);
        } else {
          showError(`⚠️ Could not find city "${cityInput}"`);
        }
      })
      .catch(() => {
        showSuccess(`⚠️ Network error. Redirecting to Weather Center...`);
        setTimeout(() => {
          import("../main.js").then(m => m.navigateTo("weather"));
        }, 800);
      });
  }

  // Fallback
  else {
    if (output) {
      output.innerHTML = `"${text}" <br><br> <span class="badge badge-success">✓ Command sent to AI backend</span>`;
    }
  }
}
