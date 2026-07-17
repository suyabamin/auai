import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Dictation (Continuous Speech Recognition) module.
 * Features: 21-language selector, voice punctuation, word/char/line stats,
 * session history, keyboard shortcut Alt+D, responsive layout, copy badge.
 */
export function init() {
  var container = document.getElementById("speechRecognition");
  if (!container) return;

  var isSupported = ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);

  // Language options
  var LANGUAGES = [
    ["en-US","English (US)"], ["en-GB","English (UK)"], ["bn-BD","Bengali (BD)"],
    ["bn-IN","Bengali (IN)"], ["zh-CN","Chinese (Simplified)"], ["zh-TW","Chinese (Traditional)"],
    ["ar-SA","Arabic"], ["fr-FR","French"], ["de-DE","German"], ["hi-IN","Hindi"],
    ["id-ID","Indonesian"], ["it-IT","Italian"], ["ja-JP","Japanese"], ["ko-KR","Korean"],
    ["ms-MY","Malay"], ["pt-BR","Portuguese (BR)"], ["ru-RU","Russian"], ["es-ES","Spanish"],
    ["tr-TR","Turkish"], ["ur-PK","Urdu"], ["vi-VN","Vietnamese"]
  ];

  var langOptions = LANGUAGES.map(function(l) {
    return '<option value="' + l[0] + '"' + (l[0] === "en-US" ? " selected" : "") + ">" + l[1] + "</option>";
  }).join("");

  var punchBtns = [",",".",  "!","?","...","  ;",":","—","\n"].map(function(p) {
    var attr = p === "\n" ? "\\n" : p;
    var label = p === "\n" ? "&#8629;" : p;
    return '<button class="btn-glass dict-punct" data-punct="' + attr + '" style="padding:2px 7px;font-size:0.78rem;min-height:30px;">' + label + "</button>";
  }).join("");

  // CSS
  var css = "<style>"
    + "#dictation-textarea::placeholder{color:var(--text-muted);}"
    + "@keyframes dictPulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.5;transform:scale(1.4);}}"
    + ".dict-dot-listening{animation:dictPulse 1s ease-in-out infinite;}"
    + ".dict-history-item{font-size:0.82rem;padding:0.5rem 0.75rem;border-radius:8px;background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);cursor:pointer;display:flex;justify-content:space-between;align-items:flex-start;gap:0.5rem;transition:background 0.15s;}"
    + ".dict-history-item:hover{background:rgba(99,102,241,0.12);}"
    + "@media(max-width:640px){.dict-main-grid{flex-direction:column!important;}.dict-controls-col{width:100%!important;}#dictation-textarea{height:220px!important;}}"
    + "#dictation-lang{color:#e2e8f0 !important;background:#1e2235 !important;border-color:rgba(255,255,255,0.15) !important;}"
    + "#dictation-lang option{background:#1e2235;color:#e2e8f0;}"
    + "</style>";

  // Unsupported browser HTML
  if (!isSupported) {
    container.innerHTML = css
      + '<div class="card-glass anim-slide-up">'
      + '<div class="module-header">'
      + '<h2 class="module-title">&#127893;&#65039; Speech-to-Text Dictation</h2>'
      + '<button class="btn-glass btn-back-dash">&#127968; Home</button>'
      + '</div>'
      + '<div style="padding:2rem;text-align:center;color:var(--danger);">'
      + '<div style="font-size:3rem;margin-bottom:1rem;">&#9888;&#65039;</div>'
      + '<p style="font-weight:700;">Speech Recognition is not supported in this browser.</p>'
      + '<p style="color:var(--text-muted);margin-top:0.5rem;font-size:0.88rem;">Please use Google Chrome, Microsoft Edge, or a Chromium-based browser.</p>'
      + '</div></div>';
    return;
  }

  // Full UI
  container.innerHTML = css
    + '<div class="card-glass anim-slide-up">'
      + '<div class="module-header">'
        + '<h2 class="module-title">&#127893;&#65039; Speech-to-Text Dictation</h2>'
        + '<button class="btn-glass btn-back-dash">&#127968; Home</button>'
      + '</div>'

      // Toolbar
      + '<div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;margin-bottom:1.25rem;">'
        + '<select id="dictation-lang" class="input-glass" style="min-width:180px;height:44px;flex:1;">' + langOptions + '</select>'
        + '<div style="display:flex;align-items:center;gap:8px;font-size:0.85rem;font-weight:600;color:var(--text-secondary);padding:0 0.5rem;">'
          + '<span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:#64748b;" id="dictation-dot"></span>'
          + '<span id="dictation-status-label">Ready</span>'
        + '</div>'
        + '<span style="font-size:0.72rem;color:var(--text-muted);white-space:nowrap;">&#9000;&#65039; Alt+D to start/stop</span>'
      + '</div>'

      // Main layout
      + '<div class="dict-main-grid" style="display:flex;gap:1rem;align-items:flex-start;">'

        // Controls column
        + '<div class="dict-controls-col" style="width:200px;flex-shrink:0;display:flex;flex-direction:column;gap:0.65rem;">'
          + '<button id="dictation-start-btn" class="btn-primary" style="display:flex;align-items:center;justify-content:center;gap:8px;font-weight:700;width:100%;min-height:44px;">&#127901;&#65039; Start</button>'
          + '<button id="dictation-stop-btn" class="btn-glass" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:44px;" disabled>&#9209;&#65039; Stop</button>'
          + '<div style="height:1px;background:var(--glass-border);margin:0.25rem 0;"></div>'
          + '<button id="dictation-copy-btn" class="btn-glass" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:44px;">&#128203; Copy</button>'
          + '<button id="dictation-download-btn" class="btn-glass" style="display:flex;align-items:center;justify-content:center;gap:8px;width:100%;min-height:44px;">&#128190; Save .txt</button>'
          + '<button id="dictation-clear-btn" class="btn-glass" style="display:flex;align-items:center;justify-content:center;gap:8px;color:var(--danger);width:100%;min-height:44px;">&#128465;&#65039; Clear</button>'
          + '<div style="height:1px;background:var(--glass-border);margin:0.25rem 0;"></div>'
          + '<div style="display:flex;flex-direction:column;gap:4px;padding:0.5rem 0;">'
            + '<span style="font-size:0.78rem;color:var(--text-muted);font-weight:600;">Words: <strong id="dict-word-count">0</strong></span>'
            + '<span style="font-size:0.78rem;color:var(--text-muted);font-weight:600;">Chars: <strong id="dict-char-count">0</strong></span>'
            + '<span style="font-size:0.78rem;color:var(--text-muted);font-weight:600;">Lines: <strong id="dict-line-count">0</strong></span>'
          + '</div>'
          + '<div style="margin-top:0.25rem;">'
            + '<div style="font-size:0.72rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;margin-bottom:0.4rem;">Quick Punctuation</div>'
            + '<div style="display:flex;flex-wrap:wrap;gap:4px;">' + punchBtns + '</div>'
          + '</div>'
        + '</div>'

        // Right: Textarea + tips + history
        + '<div style="flex:1;display:flex;flex-direction:column;gap:0.75rem;min-width:0;">'
          + '<div style="position:relative;">'
            + '<textarea id="dictation-textarea" class="input-glass" style="width:100%;height:290px;resize:vertical;font-size:0.97rem;line-height:1.7;padding:1rem;box-sizing:border-box;" placeholder="Click Start or press Alt+D, then speak. Your words appear here in real-time. Say comma, period, new line for punctuation..." spellcheck="true"></textarea>'
            + '<div id="dictation-copy-badge" style="display:none;position:absolute;bottom:12px;right:12px;background:var(--success);color:#fff;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:8px;pointer-events:none;">&#10003; Copied!</div>'
          + '</div>'
          + '<div style="font-size:0.73rem;color:var(--text-muted);line-height:1.5;padding:0.5rem 0.75rem;background:rgba(0,0,0,0.08);border-radius:8px;border:1px solid var(--glass-border);">'
            + '&#128161; <strong>Voice punctuation:</strong> Say <em>comma</em> &rarr; , &nbsp; <em>period / full stop</em> &rarr; . &nbsp; <em>exclamation</em> &rarr; ! &nbsp; <em>question mark</em> &rarr; ? &nbsp; <em>new line</em> &rarr; &#8629;'
          + '</div>'
          + '<div>'
            + '<div style="font-size:0.8rem;color:var(--text-secondary);font-weight:700;margin-bottom:0.4rem;display:flex;justify-content:space-between;align-items:center;">'
              + '<span>&#128220; Session History</span>'
              + '<button id="dict-history-clear" class="btn-glass" style="font-size:0.68rem;padding:2px 8px;color:var(--danger);">Clear History</button>'
            + '</div>'
            + '<div id="dict-history-list" style="display:flex;flex-direction:column;gap:4px;max-height:140px;overflow-y:auto;">'
              + '<div style="font-size:0.78rem;color:var(--text-muted);font-style:italic;">No saved sessions yet. Transcripts are auto-saved when you stop.</div>'
            + '</div>'
          + '</div>'
        + '</div>'
      + '</div>'
    + '</div>';

  // DOM refs
  var startBtn       = document.getElementById("dictation-start-btn");
  var stopBtn        = document.getElementById("dictation-stop-btn");
  var copyBtn        = document.getElementById("dictation-copy-btn");
  var downloadBtn    = document.getElementById("dictation-download-btn");
  var clearBtn       = document.getElementById("dictation-clear-btn");
  var textarea       = document.getElementById("dictation-textarea");
  var dot            = document.getElementById("dictation-dot");
  var statusLabel    = document.getElementById("dictation-status-label");
  var langSel        = document.getElementById("dictation-lang");
  var wordCount      = document.getElementById("dict-word-count");
  var charCount      = document.getElementById("dict-char-count");
  var lineCount      = document.getElementById("dict-line-count");
  var copyBadge      = document.getElementById("dictation-copy-badge");
  var historyList    = document.getElementById("dict-history-list");
  var historyClearBtn= document.getElementById("dict-history-clear");

  var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null;
  var isListening = false;
  var finalTranscript = "";

  function buildRecognition() {
    if (recognition) { try { recognition.abort(); } catch(e) {} }
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = langSel.value;

    recognition.onstart = function() {
      isListening = true;
      startBtn.disabled = true;
      stopBtn.disabled = false;
      dot.style.background = "var(--danger)";
      dot.style.boxShadow = "0 0 8px var(--danger)";
      dot.classList.add("dict-dot-listening");
      statusLabel.textContent = "Listening...";
      statusLabel.style.color = "var(--danger)";
    };

    recognition.onend = function() {
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      dot.style.background = "var(--success)";
      dot.style.boxShadow = "none";
      dot.classList.remove("dict-dot-listening");
      statusLabel.textContent = "Stopped";
      statusLabel.style.color = "var(--success)";
      if (finalTranscript.trim()) {
        saveSession(finalTranscript.trim());
        apiFetch("speechRecognition", { transcript: finalTranscript.trim() }).catch(function() {});
      }
    };

    recognition.onerror = function(event) {
      var ignorable = ["no-speech", "aborted"];
      if (ignorable.indexOf(event.error) === -1) {
        statusLabel.textContent = "Error: " + event.error;
        statusLabel.style.color = "var(--danger)";
      }
      isListening = false;
      startBtn.disabled = false;
      stopBtn.disabled = true;
      dot.style.background = "#64748b";
      dot.style.boxShadow = "none";
      dot.classList.remove("dict-dot-listening");
    };

    recognition.onresult = function(event) {
      var interimTranscript = "";
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var raw = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += processPunctuation(raw) + " ";
        } else {
          interimTranscript += raw;
        }
      }
      textarea.value = finalTranscript + interimTranscript;
      textarea.scrollTop = textarea.scrollHeight;
      updateStats();
    };
  }

  function processPunctuation(text) {
    return text
      .replace(/\b(comma)\b/gi, ",")
      .replace(/\b(period|full stop)\b/gi, ".")
      .replace(/\b(exclamation mark|exclamation)\b/gi, "!")
      .replace(/\b(question mark)\b/gi, "?")
      .replace(/\b(new line|newline|next line)\b/gi, "\n")
      .replace(/\b(semicolon)\b/gi, ";")
      .replace(/\b(colon)\b/gi, ":")
      .replace(/\b(dash|hyphen)\b/gi, "-")
      .replace(/\b(ellipsis|dot dot dot)\b/gi, "...")
      .replace(/\b(open parenthesis)\b/gi, "(")
      .replace(/\b(close parenthesis)\b/gi, ")");
  }

  function updateStats() {
    var val = textarea.value;
    var words = val.trim() ? val.trim().split(/\s+/).length : 0;
    wordCount.textContent = words;
    charCount.textContent = val.length;
    lineCount.textContent = val ? val.split("\n").length : 0;
  }

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem("dictation_history") || "[]"); }
    catch(e) { return []; }
  }

  function saveHistory(arr) {
    localStorage.setItem("dictation_history", JSON.stringify(arr));
  }

  function saveSession(text) {
    var history = loadHistory();
    history.unshift({ text: text, ts: Date.now() });
    if (history.length > 10) history = history.slice(0, 10);
    saveHistory(history);
    renderHistory();
  }

  function renderHistory() {
    var history = loadHistory();
    if (!history.length) {
      historyList.innerHTML = '<div style="font-size:0.78rem;color:var(--text-muted);font-style:italic;">No saved sessions yet. Transcripts are auto-saved when you stop.</div>';
      return;
    }
    historyList.innerHTML = history.map(function(s, i) {
      var d = new Date(s.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      var preview = s.text.length > 80 ? s.text.slice(0, 80) + "..." : s.text;
      return '<div class="dict-history-item" data-idx="' + i + '">'
        + '<span style="flex:1;">' + preview.replace(/</g,"&lt;").replace(/>/g,"&gt;") + '</span>'
        + '<span style="font-size:0.68rem;color:var(--text-muted);white-space:nowrap;flex-shrink:0;">' + d + '</span>'
        + '</div>';
    }).join("");

    historyList.querySelectorAll(".dict-history-item").forEach(function(el) {
      el.addEventListener("click", function() {
        var idx = parseInt(el.dataset.idx, 10);
        var h = loadHistory();
        if (h[idx]) {
          textarea.value = h[idx].text;
          finalTranscript = h[idx].text + " ";
          updateStats();
        }
      });
    });
  }

  // Button handlers
  startBtn.addEventListener("click", function() {
    buildRecognition();
    finalTranscript = textarea.value.endsWith(" ") ? textarea.value : (textarea.value + (textarea.value ? " " : ""));
    try { recognition.start(); } catch(e) {}
  });

  stopBtn.addEventListener("click", function() {
    try { recognition.stop(); } catch(e) {}
  });

  copyBtn.addEventListener("click", function() {
    var text = textarea.value;
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        copyBadge.style.display = "block";
        setTimeout(function() { copyBadge.style.display = "none"; }, 1800);
      }).catch(function() {
        textarea.select(); document.execCommand("copy");
        copyBadge.style.display = "block";
        setTimeout(function() { copyBadge.style.display = "none"; }, 1800);
      });
    } else {
      textarea.select(); document.execCommand("copy");
      copyBadge.style.display = "block";
      setTimeout(function() { copyBadge.style.display = "none"; }, 1800);
    }
  });

  downloadBtn.addEventListener("click", function() {
    var text = textarea.value;
    if (!text) return;
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "dictation_" + new Date().toISOString().slice(0, 19).replace(/:/g, "-") + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener("click", function() {
    if (confirm("Clear the current transcription?")) {
      finalTranscript = "";
      textarea.value = "";
      updateStats();
    }
  });

  historyClearBtn.addEventListener("click", function() {
    if (confirm("Clear all session history?")) {
      saveHistory([]);
      renderHistory();
    }
  });

  // Quick punctuation insert buttons
  container.querySelectorAll(".dict-punct").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var p = btn.dataset.punct === "\\n" ? "\n" : btn.dataset.punct;
      var pos = textarea.selectionStart;
      var before = textarea.value.slice(0, pos);
      var after = textarea.value.slice(pos);
      textarea.value = before + p + after;
      textarea.selectionStart = textarea.selectionEnd = pos + p.length;
      textarea.focus();
      finalTranscript = textarea.value;
      updateStats();
    });
  });

  // Direct edits
  textarea.addEventListener("input", function() {
    finalTranscript = textarea.value;
    updateStats();
  });

  // Language change: if listening, stop so user can restart with new lang
  langSel.addEventListener("change", function() {
    if (isListening) { try { recognition.stop(); } catch(e) {} }
  });

  // Keyboard shortcut Alt+D
  document.addEventListener("keydown", function handleDictKey(e) {
    if (e.altKey && e.key.toLowerCase() === "d") {
      e.preventDefault();
      if (isListening) { stopBtn.click(); } else { startBtn.click(); }
    }
  });

  // Initialize
  buildRecognition();
  renderHistory();
  updateStats();
}
