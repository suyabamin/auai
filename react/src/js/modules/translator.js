import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise Multi-language Translator view.
 * Providers (in fallback order):
 *   1. MyMemory (free, no key, 5000 chars/day anonymous)
 *   2. LibreTranslate.com (free public instance)
 *   3. Google Translate (unofficial singletext endpoint – no key needed)
 */
export function init() {
  var container = document.getElementById("translator");
  if (!container) return;

  // ── Language list ───────────────────────────────────────────────
  var languages = [
    ["af","Afrikaans"], ["sq","Albanian"], ["am","Amharic"], ["ar","Arabic"],
    ["hy","Armenian"], ["az","Azerbaijani"], ["eu","Basque"], ["be","Belarusian"],
    ["bn","Bengali"], ["bs","Bosnian"], ["bg","Bulgarian"], ["ca","Catalan"],
    ["ceb","Cebuano"], ["zh","Chinese (Simplified)"], ["zh-TW","Chinese (Traditional)"],
    ["co","Corsican"], ["hr","Croatian"], ["cs","Czech"], ["da","Danish"],
    ["nl","Dutch"], ["en","English"], ["eo","Esperanto"], ["et","Estonian"],
    ["fi","Finnish"], ["fr","French"], ["fy","Frisian"], ["gl","Galician"],
    ["ka","Georgian"], ["de","German"], ["el","Greek"], ["gu","Gujarati"],
    ["ht","Haitian Creole"], ["ha","Hausa"], ["he","Hebrew"], ["hi","Hindi"],
    ["hu","Hungarian"], ["id","Indonesian"], ["ga","Irish"], ["it","Italian"],
    ["ja","Japanese"], ["jv","Javanese"], ["kn","Kannada"], ["kk","Kazakh"],
    ["km","Khmer"], ["ko","Korean"], ["ku","Kurdish"], ["ky","Kyrgyz"],
    ["lo","Lao"], ["lv","Latvian"], ["lt","Lithuanian"], ["lb","Luxembourgish"],
    ["mk","Macedonian"], ["mg","Malagasy"], ["ms","Malay"], ["ml","Malayalam"],
    ["mt","Maltese"], ["mi","Maori"], ["mr","Marathi"], ["mn","Mongolian"],
    ["my","Myanmar (Burmese)"], ["ne","Nepali"], ["no","Norwegian"], ["or","Odia"],
    ["ps","Pashto"], ["fa","Persian"], ["pl","Polish"], ["pt","Portuguese"],
    ["pa","Punjabi"], ["ro","Romanian"], ["ru","Russian"], ["sm","Samoan"],
    ["gd","Scots Gaelic"], ["es","Spanish"], ["sr","Serbian"], ["st","Sesotho"], ["sn","Shona"],
    ["sd","Sindhi"], ["si","Sinhala"], ["sk","Slovak"], ["sl","Slovenian"],
    ["so","Somali"], ["su","Sundanese"], ["sw","Swahili"], ["sv","Swedish"],
    ["tg","Tajik"], ["ta","Tamil"], ["te","Telugu"], ["th","Thai"],
    ["tr","Turkish"], ["uk","Ukrainian"], ["ur","Urdu"], ["ug","Uyghur"],
    ["uz","Uzbek"], ["vi","Vietnamese"], ["cy","Welsh"], ["xh","Xhosa"],
    ["yi","Yiddish"], ["yo","Yoruba"], ["zu","Zulu"]
  ];

  var sourceLangOpts = '<option value="auto">Auto-Detect</option>'
    + languages.map(function(l) {
        return '<option value="' + l[0] + '">' + l[1] + "</option>";
      }).join("");

  var targetLangOpts = languages.map(function(l) {
      return '<option value="' + l[0] + '"' + (l[0] === "bn" ? " selected" : "") + ">" + l[1] + "</option>";
    }).join("");

  // ── UI ──────────────────────────────────────────────────────────
  container.innerHTML = "<style>"
    + ".trans-spinner{position:absolute;inset:0;background:rgba(0,0,0,0.35);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;font-size:1.1rem;font-weight:700;color:#fff;border-radius:14px;visibility:hidden;z-index:10;}"
    + ".trans-copy-badge{display:none;position:absolute;bottom:12px;right:12px;background:var(--success);color:#fff;font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:8px;pointer-events:none;z-index:5;}"
    + "@media(max-width:720px){.trans-layout{flex-direction:column!important;}.trans-mid{flex-direction:row!important;justify-content:center!important;align-items:center!important;width:100%!important;}}"
    + "#translator-source-lang,#translator-target-lang{color:#e2e8f0 !important;background:#1e2235 !important;border-color:rgba(255,255,255,0.15) !important;}"
    + "#translator-source-lang option,#translator-target-lang option{background:#1e2235;color:#e2e8f0;}"
    + "</style>"
    + '<div class="card-glass anim-slide-up" style="position:relative;">'
      + '<div class="module-header">'
        + '<h2 class="module-title">&#127760; Language Translator</h2>'
        + '<button class="btn-glass btn-back-dash">&#127968; Home</button>'
      + '</div>'

      // Provider note
      + '<div style="font-size:0.72rem;color:var(--text-muted);margin-bottom:1rem;padding:0.5rem 0.75rem;background:rgba(0,0,0,0.1);border-radius:8px;border:1px solid var(--glass-border);">'
        + '&#128161; Uses <strong>MyMemory</strong> (free, no key) with <strong>LibreTranslate</strong> &amp; <strong>Google</strong> as automatic fallbacks.'
      + '</div>'

      + '<div class="trans-layout" style="display:flex;gap:1rem;align-items:flex-start;">'

        // Source pane
        + '<div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">'
            + '<label style="font-size:0.85rem;font-weight:700;color:var(--text-secondary);">Source Language</label>'
            + '<select id="translator-source-lang" class="input-glass" style="width:155px;height:38px;font-size:0.8rem;">' + sourceLangOpts + '</select>'
          + '</div>'
          + '<textarea id="translator-input-text" class="input-glass" style="height:220px;resize:vertical;font-size:0.95rem;padding:1rem;" placeholder="Type or paste text to translate\u2026"></textarea>'
          + '<div style="display:flex;justify-content:space-between;align-items:center;">'
            + '<span style="font-size:0.72rem;color:var(--text-muted);"><span id="trans-char">0</span> chars / <span id="trans-word">0</span> words</span>'
            + '<span style="font-size:0.7rem;color:var(--text-muted);">Enter to translate</span>'
          + '</div>'
        + '</div>'

        // Middle controls
        + '<div class="trans-mid" style="width:110px;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0.75rem;padding-top:2.5rem;">'
          + '<button id="translator-swap-btn" class="btn-glass" title="Swap Languages" style="width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.3rem;">&#128260;</button>'
          + '<button id="translator-action-btn" class="btn-primary" style="width:100%;font-weight:700;min-height:44px;">Translate</button>'
          + '<button id="translator-clear-btn" class="btn-glass" style="width:100%;font-size:0.8rem;color:var(--danger);">&#128465; Clear</button>'
        + '</div>'

        // Output pane
        + '<div style="flex:1;display:flex;flex-direction:column;gap:0.5rem;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;">'
            + '<label style="font-size:0.85rem;font-weight:700;color:var(--text-secondary);">Target Language</label>'
            + '<select id="translator-target-lang" class="input-glass" style="width:155px;height:38px;font-size:0.8rem;">' + targetLangOpts + '</select>'
          + '</div>'
          + '<div style="position:relative;">'
            + '<textarea id="translator-output-text" class="input-glass" style="height:220px;width:100%;resize:vertical;font-size:0.95rem;padding:1rem;box-sizing:border-box;background:rgba(0,0,0,0.15);" readonly placeholder="Translation will appear here\u2026"></textarea>'
            + '<div class="trans-spinner" id="trans-spinner">&#8987; Translating\u2026</div>'
            + '<div class="trans-copy-badge" id="trans-copy-badge">&#10003; Copied!</div>'
          + '</div>'
          + '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">'
            + '<button id="translator-copy-btn" class="btn-glass" style="flex:1;font-size:0.8rem;min-height:38px;display:flex;align-items:center;justify-content:center;gap:6px;">&#128203; Copy Translation</button>'
            + '<button id="translator-speak-btn" class="btn-glass" style="flex:1;font-size:0.8rem;min-height:38px;display:flex;align-items:center;justify-content:center;gap:6px;">&#128266; Speak</button>'
          + '</div>'
          + '<div id="trans-status" style="font-size:0.73rem;color:var(--text-muted);text-align:center;min-height:1.2em;"></div>'
        + '</div>'
      + '</div>'

      // History
      + '<div style="margin-top:1.25rem;">'
        + '<div style="font-size:0.8rem;font-weight:700;color:var(--text-secondary);margin-bottom:0.5rem;display:flex;justify-content:space-between;align-items:center;">'
          + '<span>&#128220; Translation History</span>'
          + '<button id="trans-hist-clear" class="btn-glass" style="font-size:0.68rem;padding:2px 8px;color:var(--danger);">Clear</button>'
        + '</div>'
        + '<div id="trans-history-list" style="display:flex;flex-direction:column;gap:4px;max-height:150px;overflow-y:auto;"></div>'
      + '</div>'
    + '</div>';

  // ── DOM refs ─────────────────────────────────────────────────────
  var inputArea    = document.getElementById("translator-input-text");
  var outputArea   = document.getElementById("translator-output-text");
  var sourceSel    = document.getElementById("translator-source-lang");
  var targetSel    = document.getElementById("translator-target-lang");
  var swapBtn      = document.getElementById("translator-swap-btn");
  var actionBtn    = document.getElementById("translator-action-btn");
  var clearBtn     = document.getElementById("translator-clear-btn");
  var copyBtn      = document.getElementById("translator-copy-btn");
  var speakBtn     = document.getElementById("translator-speak-btn");
  var spinner      = document.getElementById("trans-spinner");
  var statusEl     = document.getElementById("trans-status");
  var charEl       = document.getElementById("trans-char");
  var wordEl       = document.getElementById("trans-word");
  var copyBadge    = document.getElementById("trans-copy-badge");
  var historyList  = document.getElementById("trans-history-list");
  var histClearBtn = document.getElementById("trans-hist-clear");

  var cache = {};

  // ── Stats ─────────────────────────────────────────────────────────
  function updateStats() {
    var val = inputArea.value;
    charEl.textContent = val.length;
    wordEl.textContent = val.trim() ? val.trim().split(/\s+/).length : 0;
  }
  inputArea.addEventListener("input", updateStats);
  updateStats();

  // ── Helper: Safe Fetch with Timeout ──────────────────────────────
  async function fetchWithTimeout(url, options, timeoutMs) {
    if (!options) options = {};
    if (typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function") {
      options.signal = AbortSignal.timeout(timeoutMs);
      return fetch(url, options);
    }
    var controller = new AbortController();
    var id = setTimeout(function() { controller.abort(); }, timeoutMs);
    options.signal = controller.signal;
    try {
      var res = await fetch(url, options);
      clearTimeout(id);
      return res;
    } catch(e) {
      clearTimeout(id);
      throw e;
    }
  }

  // ── Provider 1: MyMemory (most reliable free, no key) ─────────────
  async function translateMyMemory(text, source, target) {
    var srcCode = (source === "auto" || !source) ? "auto" : source;
    var url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text) + "&langpair=" + srcCode + "|" + target + "&de=assistant@app.local";
    var res = await fetchWithTimeout(url, {}, 10000);
    if (!res.ok) throw new Error("MyMemory HTTP " + res.status);
    var data = await res.json();
    if (data.responseStatus !== 200) throw new Error("MyMemory: " + data.responseMessage);
    var t = data.responseData && data.responseData.translatedText;
    if (!t || t === "PLEASE SELECT TWO DISTINCT LANGUAGES") throw new Error("MyMemory bad result");
    return { text: t, provider: "MyMemory" };
  }

  // ── Provider 2: LibreTranslate (public free instance) ─────────────
  async function translateLibre(text, source, target) {
    var src = (source === "auto" || !source) ? "auto" : source;
    var res = await fetchWithTimeout("https://translate.fedilab.app/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: src, target: target, format: "text" })
    }, 10000);
    if (!res.ok) throw new Error("Libre HTTP " + res.status);
    var data = await res.json();
    if (!data.translatedText) throw new Error("Libre no result");
    return { text: data.translatedText, provider: "LibreTranslate" };
  }

  // ── Provider 3: Google Translate (unofficial, no key) ─────────────
  async function translateGoogle(text, source, target) {
    var sl = (source === "auto" || !source) ? "auto" : source;
    var url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
      + sl + "&tl=" + target + "&dt=t&q=" + encodeURIComponent(text);
    var res = await fetchWithTimeout(url, {}, 12000);
    if (!res.ok) throw new Error("Google HTTP " + res.status);
    var data = await res.json();
    if (!data || !data[0]) throw new Error("Google bad response");
    var translated = data[0].filter(function(x) { return x && x[0]; }).map(function(x) { return x[0]; }).join("");
    if (!translated) throw new Error("Google empty result");
    return { text: translated, provider: "Google Translate" };
  }

  // ── Orchestration with cascade fallback ───────────────────────────
  async function translateWithFallback(text, source, target) {
    var cacheKey = text + "|" + source + "|" + target;
    if (cache[cacheKey]) return cache[cacheKey];

    var providers = [translateMyMemory, translateGoogle, translateLibre];
    var lastErr = null;

    for (var i = 0; i < providers.length; i++) {
      try {
        var result = await providers[i](text, source, target);
        cache[cacheKey] = result;
        return result;
      } catch (e) {
        lastErr = e;
        console.warn("Provider " + i + " failed:", e.message);
      }
    }
    throw lastErr || new Error("All providers failed");
  }

  // ── History ───────────────────────────────────────────────────────
  var HIST_KEY = "translator-history-v2";

  function loadHistory() {
    try { return JSON.parse(localStorage.getItem(HIST_KEY) || "[]"); }
    catch(e) { return []; }
  }

  function saveHistEntry(entry) {
    var hist = loadHistory();
    hist.unshift(entry);
    if (hist.length > 30) hist = hist.slice(0, 30);
    localStorage.setItem(HIST_KEY, JSON.stringify(hist));
    renderHistory();
  }

  function renderHistory() {
    var hist = loadHistory();
    if (!hist.length) {
      historyList.innerHTML = '<div style="font-size:0.78rem;color:var(--text-muted);font-style:italic;">No history yet.</div>';
      return;
    }
    historyList.innerHTML = hist.map(function(h, idx) {
      var srcPreview = h.source.length > 40 ? h.source.slice(0, 40) + "..." : h.source;
      var tgtPreview = h.translated.length > 40 ? h.translated.slice(0, 40) + "..." : h.translated;
      return '<div data-idx="' + idx + '" style="font-size:0.8rem;padding:0.45rem 0.75rem;border-radius:8px;cursor:pointer;'
        + 'background:rgba(255,255,255,0.03);border:1px solid var(--glass-border);display:flex;gap:0.5rem;align-items:center;" '
        + 'onmouseenter="this.style.background=\'rgba(99,102,241,0.12)\'" onmouseleave="this.style.background=\'rgba(255,255,255,0.03)\'">'
        + '<span style="flex:1;">' + srcPreview.replace(/</g,"&lt;") + ' &rarr; ' + tgtPreview.replace(/</g,"&lt;") + '</span>'
        + '<span style="font-size:0.65rem;color:var(--text-muted);white-space:nowrap;">[' + (h.provider || "?") + ']</span>'
        + '</div>';
    }).join("");

    historyList.querySelectorAll("div[data-idx]").forEach(function(el) {
      el.addEventListener("click", function() {
        var idx = parseInt(el.dataset.idx, 10);
        var h = loadHistory()[idx];
        if (!h) return;
        inputArea.value = h.source;
        outputArea.value = h.translated;
        // Set language selectors
        for (var j = 0; j < sourceSel.options.length; j++) {
          if (sourceSel.options[j].value === h.sourceLang) { sourceSel.selectedIndex = j; break; }
        }
        for (var k = 0; k < targetSel.options.length; k++) {
          if (targetSel.options[k].value === h.targetLang) { targetSel.selectedIndex = k; break; }
        }
        updateStats();
      });
    });
  }

  // ── Translate action ──────────────────────────────────────────────
  async function performTranslation() {
    var text = inputArea.value.trim();
    var source = sourceSel.value;
    var target = targetSel.value;
    if (!text) { outputArea.value = ""; statusEl.textContent = ""; return; }
    if (source !== "auto" && source === target) {
      outputArea.value = text;
      statusEl.textContent = "Source and target are the same language.";
      return;
    }

    actionBtn.disabled = true;
    spinner.style.visibility = "visible";
    statusEl.textContent = "Translating...";
    statusEl.style.color = "var(--text-muted)";

    try {
      var result = await translateWithFallback(text, source, target);
      outputArea.value = result.text;
      statusEl.textContent = "✓ Translated via " + result.provider;
      statusEl.style.color = "var(--success)";
      saveHistEntry({
        source: text,
        translated: result.text,
        sourceLang: source,
        targetLang: target,
        provider: result.provider,
        ts: Date.now()
      });
      // Background sync to app backend
      apiFetch("translator", { text: text, source: source, target: target, translated: result.text }).catch(function() {});
    } catch (err) {
      outputArea.value = "";
      statusEl.textContent = "⚠️ Translation failed. Check your connection and try again.";
      statusEl.style.color = "var(--danger)";
      console.error("All translation providers failed:", err);
    } finally {
      actionBtn.disabled = false;
      spinner.style.visibility = "hidden";
    }
  }

  // ── Button wiring ─────────────────────────────────────────────────
  actionBtn.addEventListener("click", performTranslation);

  // Translate on Ctrl+Enter or just Enter in the input textarea
  inputArea.addEventListener("keydown", function(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      performTranslation();
    }
  });

  swapBtn.addEventListener("click", function() {
    var src = sourceSel.value;
    var tgt = targetSel.value;
    // Swap language selectors
    if (src !== "auto") {
      for (var j = 0; j < sourceSel.options.length; j++) {
        if (sourceSel.options[j].value === tgt) { sourceSel.selectedIndex = j; break; }
      }
      for (var k = 0; k < targetSel.options.length; k++) {
        if (targetSel.options[k].value === src) { targetSel.selectedIndex = k; break; }
      }
    }
    // Swap text
    var tmp = inputArea.value;
    inputArea.value = outputArea.value;
    outputArea.value = tmp;
    updateStats();
  });

  clearBtn.addEventListener("click", function() {
    inputArea.value = "";
    outputArea.value = "";
    statusEl.textContent = "";
    updateStats();
    inputArea.focus();
  });

  copyBtn.addEventListener("click", function() {
    var txt = outputArea.value;
    if (!txt) return;
    var doCopy = function() {
      copyBadge.style.display = "block";
      setTimeout(function() { copyBadge.style.display = "none"; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(doCopy).catch(function() {
        outputArea.select(); document.execCommand("copy"); doCopy();
      });
    } else {
      outputArea.select(); document.execCommand("copy"); doCopy();
    }
  });

  speakBtn.addEventListener("click", function() {
    var txt = outputArea.value;
    if (!txt || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    var utt = new SpeechSynthesisUtterance(txt);
    utt.lang = targetSel.value;
    speechSynthesis.speak(utt);
    speakBtn.textContent = "&#128266; Speaking...";
    utt.onend = function() { speakBtn.innerHTML = "&#128266; Speak"; };
  });

  histClearBtn.addEventListener("click", function() {
    if (confirm("Clear all translation history?")) {
      localStorage.removeItem(HIST_KEY);
      renderHistory();
    }
  });

  // ── Init ──────────────────────────────────────────────────────────
  renderHistory();
}
