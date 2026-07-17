import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise OCR Image Text Extractor module.
 * Uses Tesseract.js v7 — createWorker(lang, oem, options) API.
 * Features: smart text cleaning, progress bar, 57 languages, copy badge, download.
 */
export function init() {
  var container = document.getElementById("ocr");
  if (!container) return;

  // ── Language list (Tesseract lang codes) ──────────────────────────
  var OCR_LANGS = [
    ["afr","Afrikaans"], ["ara","Arabic"], ["bel","Belarusian"], ["ben","Bengali"],
    ["bul","Bulgarian"], ["cat","Catalan"], ["ces","Czech"], ["chi_sim","Chinese (Simplified)"],
    ["chi_tra","Chinese (Traditional)"], ["chr","Cherokee"], ["dan","Danish"],
    ["deu","German"], ["ell","Greek"], ["eng","English"], ["enm","English (Middle)"],
    ["epo","Esperanto"], ["fin","Finnish"], ["fra","French"], ["frk","Frankish"],
    ["heb","Hebrew"], ["hin","Hindi"], ["hrv","Croatian"], ["hun","Hungarian"],
    ["ind","Indonesian"], ["ita","Italian"], ["jpn","Japanese"], ["kan","Kannada"],
    ["kor","Korean"], ["lat","Latin"], ["lav","Latvian"], ["lit","Lithuanian"],
    ["mal","Malayalam"], ["mar","Marathi"], ["mkd","Macedonian"], ["mlt","Maltese"],
    ["msa","Malay"], ["nep","Nepali"], ["nld","Dutch"], ["nor","Norwegian"],
    ["pol","Polish"], ["por","Portuguese"], ["ron","Romanian"], ["rus","Russian"],
    ["slk","Slovak"], ["slv","Slovenian"], ["spa","Spanish"], ["sqi","Albanian"],
    ["srp","Serbian"], ["swe","Swedish"], ["tam","Tamil"],
    ["tel","Telugu"], ["tgl","Filipino"], ["tha","Thai"], ["tur","Turkish"],
    ["ukr","Ukrainian"], ["urd","Urdu"], ["vie","Vietnamese"]
  ];

  var langOptions = OCR_LANGS.map(function(l) {
    return '<option value="' + l[0] + '"' + (l[0] === "eng" ? " selected" : "") + ">" + l[1] + "</option>";
  }).join("");

  // ── UI ──────────────────────────────────────────────────────────────
  container.innerHTML = "<style>"
    + ".ocr-spinner{position:absolute;inset:0;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:#fff;border-radius:14px;visibility:hidden;z-index:10;gap:0.75rem;}"
    + ".ocr-copy-badge{display:none;position:absolute;top:-32px;left:50%;transform:translateX(-50%);background:var(--success);color:#fff;font-size:0.72rem;font-weight:700;padding:4px 10px;border-radius:8px;pointer-events:none;white-space:nowrap;}"
    + "#ocr-dropzone{border:2px dashed var(--glass-border);border-radius:12px;min-height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:border-color 0.2s,background 0.2s;background:rgba(255,255,255,0.02);}"
    + "#ocr-dropzone.drag-over{border-color:var(--primary);background:rgba(99,102,241,0.08);}"
    + "#ocr-lang-select,#ocr-preprocess{color:#e2e8f0 !important;background:#1e2235 !important;border-color:rgba(255,255,255,0.15) !important;}"
    + "#ocr-lang-select option,#ocr-preprocess option{background:#1e2235;color:#e2e8f0;}"
    + ".ocr-progress-bar{width:75%;height:6px;background:rgba(255,255,255,0.12);border-radius:4px;overflow:hidden;}"
    + ".ocr-progress-bar-inner{height:100%;background:var(--primary);transition:width 0.25s;border-radius:4px;}"
    + "@media(max-width:700px){.ocr-layout{flex-direction:column!important;}}"
    + "</style>"

    + '<div class="card-glass anim-slide-up" style="position:relative;">'
      + '<div class="module-header">'
        + '<h2 class="module-title">&#128269; OCR Image Text Extractor</h2>'
        + '<button class="btn-glass btn-back-dash">&#127968; Home</button>'
      + '</div>'

      + '<div class="ocr-layout" style="display:flex;gap:1rem;align-items:flex-start;">'

        // ── Left panel ──────────────────────────────────────────────
        + '<div style="flex:1;display:flex;flex-direction:column;gap:0.75rem;">'

          // Dropzone
          + '<div id="ocr-dropzone">'
            + '<span style="font-size:2.4rem;margin-bottom:0.5rem;">&#128444;&#65039;</span>'
            + '<span style="font-weight:700;font-size:0.9rem;">Drag &amp; drop or click to browse</span>'
            + '<span style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">PNG, JPG, WEBP, BMP, GIF &mdash; max 10MB</span>'
            + '<input type="file" id="ocr-file-input" accept="image/*" style="display:none;">'
          + '</div>'

          // Preview
          + '<div id="ocr-preview-wrap" style="display:none;position:relative;border:1px solid var(--glass-border);border-radius:10px;padding:8px;background:rgba(0,0,0,0.1);max-height:220px;overflow:hidden;align-items:center;justify-content:center;">'
            + '<img id="ocr-preview" style="max-height:200px;max-width:100%;border-radius:6px;object-fit:contain;">'
            + '<button id="ocr-remove-btn" style="position:absolute;right:8px;top:8px;background:var(--danger);color:#fff;border:none;border-radius:4px;padding:3px 8px;font-size:0.75rem;cursor:pointer;">&#215; Remove</button>'
          + '</div>'

          // Options
          + '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;">'
            + '<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:140px;">'
              + '<label style="font-size:0.7rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">OCR Language</label>'
              + '<select id="ocr-lang-select" class="input-glass" style="height:38px;font-size:0.82rem;">' + langOptions + '</select>'
            + '</div>'
            + '<div style="display:flex;flex-direction:column;gap:3px;flex:1;min-width:140px;">'
              + '<label style="font-size:0.7rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;">Preprocessing</label>'
              + '<select id="ocr-preprocess" class="input-glass" style="height:38px;font-size:0.82rem;">'
                + '<option value="none">None (original)</option>'
                + '<option value="grayscale" selected>Grayscale + Contrast</option>'
                + '<option value="threshold">Threshold (B&W)</option>'
              + '</select>'
            + '</div>'
          + '</div>'

          // Action row
          + '<div style="display:flex;gap:0.5rem;">'
            + '<button id="ocr-paste-btn" class="btn-glass" style="flex:1;font-size:0.82rem;min-height:38px;">&#128203; Paste</button>'
            + '<button id="ocr-extract-btn" class="btn-primary" style="flex:2;font-weight:700;min-height:38px;" disabled>&#128269; Extract Text</button>'
          + '</div>'

          // Tip
          + '<div style="font-size:0.7rem;color:var(--text-muted);line-height:1.5;padding:0.4rem 0.6rem;background:rgba(0,0,0,0.08);border-radius:8px;border:1px solid var(--glass-border);">'
            + '&#128161; <strong>Tips:</strong> For documents &rarr; use Grayscale. For handwriting &rarr; use Threshold. For diagrams/charts &rarr; try None or Threshold.'
          + '</div>'
        + '</div>'

        // ── Right panel ─────────────────────────────────────────────
        + '<div style="flex:1;display:flex;flex-direction:column;gap:0.75rem;">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:0.3rem;">'
            + '<h3 style="font-size:1rem;color:var(--text-secondary);font-weight:700;margin:0;">Extracted Output</h3>'
            + '<div style="display:flex;gap:0.35rem;flex-wrap:wrap;align-items:center;">'
              + '<button id="ocr-toggle-clean" class="btn-glass" style="font-size:0.75rem;padding:0.25rem 0.6rem;color:var(--primary);">&#10024; Clean</button>'
              + '<div style="position:relative;">'
                + '<button id="ocr-copy-btn" class="btn-glass" style="font-size:0.75rem;padding:0.25rem 0.6rem;">&#128203; Copy</button>'
                + '<div class="ocr-copy-badge" id="ocr-copy-badge">&#10003; Copied!</div>'
              + '</div>'
              + '<button id="ocr-download-btn" class="btn-glass" style="font-size:0.75rem;padding:0.25rem 0.6rem;">&#128190; Save</button>'
              + '<button id="ocr-clear-btn" class="btn-glass" style="font-size:0.75rem;padding:0.25rem 0.6rem;color:var(--danger);">&#128465;</button>'
            + '</div>'
          + '</div>'

          + '<textarea id="ocr-output" class="input-glass" style="width:100%;height:300px;resize:vertical;font-size:0.9rem;line-height:1.7;padding:1rem;box-sizing:border-box;" placeholder="Extracted text will appear here. Use the ✨ Clean button to remove noise from diagram/chart images..." spellcheck="false"></textarea>'

          + '<div id="ocr-stats" style="display:flex;flex-wrap:wrap;gap:0.4rem;"></div>'
        + '</div>'
      + '</div>'

      // Spinner
      + '<div class="ocr-spinner" id="ocr-spinner">'
        + '<span id="ocr-spinner-label">&#8987; Loading...</span>'
        + '<div class="ocr-progress-bar"><div class="ocr-progress-bar-inner" id="ocr-progress-inner" style="width:0%;"></div></div>'
        + '<span id="ocr-progress-pct" style="font-size:0.8rem;opacity:0.75;">0%</span>'
      + '</div>'
    + '</div>';

  // ── DOM Refs ──────────────────────────────────────────────────────
  var dropzone      = document.getElementById("ocr-dropzone");
  var fileInput     = document.getElementById("ocr-file-input");
  var previewWrap   = document.getElementById("ocr-preview-wrap");
  var preview       = document.getElementById("ocr-preview");
  var removeBtn     = document.getElementById("ocr-remove-btn");
  var extractBtn    = document.getElementById("ocr-extract-btn");
  var pasteBtn      = document.getElementById("ocr-paste-btn");
  var outputTA      = document.getElementById("ocr-output");
  var copyBtn       = document.getElementById("ocr-copy-btn");
  var copyBadge     = document.getElementById("ocr-copy-badge");
  var downloadBtn   = document.getElementById("ocr-download-btn");
  var clearBtn      = document.getElementById("ocr-clear-btn");
  var toggleClean   = document.getElementById("ocr-toggle-clean");
  var langSel       = document.getElementById("ocr-lang-select");
  var preprocessSel = document.getElementById("ocr-preprocess");
  var spinner       = document.getElementById("ocr-spinner");
  var spinnerLabel  = document.getElementById("ocr-spinner-label");
  var progressInner = document.getElementById("ocr-progress-inner");
  var progressPct   = document.getElementById("ocr-progress-pct");
  var statsDiv      = document.getElementById("ocr-stats");

  var currentFile = null;
  var ocrWorker   = null;
  var currentLang = null;
  var rawOcrText  = "";    // stores original Tesseract output
  var cleanMode   = true;  // default: show cleaned output

  // ── Smart Text Cleaner ────────────────────────────────────────────
  // Removes noise artifacts common in OCR of diagrams, charts, and
  // scanned images — keeps real text lines.
  function cleanOcrText(raw) {
    var lines = raw.split("\n");
    var result = [];
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      // Count meaningful characters (letters, digits, unicode letters)
      var meaningful = (line.match(/[\p{L}\p{N}]/gu) || (line.match(/[a-zA-Z0-9\u00C0-\uFFFF]/g) || [])).length;
      var total = line.length;
      // Skip if mostly noise characters
      if (meaningful === 0) continue;
      // Skip very short isolated lines (1-3 chars of punctuation/symbol only)
      if (total <= 3 && meaningful === 0) continue;
      // Skip lines of only repeated special chars: ----, ====, |||, etc.
      if (/^[\-=|_~`*#+@<>^]{2,}$/.test(line)) continue;
      // Skip lines where less than 25% are real characters (noise)
      if (total > 4 && meaningful / total < 0.25) continue;
      result.push(line);
    }
    return result.join("\n").replace(/\n{3,}/g, "\n\n").trim();
  }

  // ── Toggle Clean/Raw ──────────────────────────────────────────────
  function applyOutputMode() {
    if (!rawOcrText) return;
    var cleaned = cleanOcrText(rawOcrText);
    outputTA.value = cleanMode ? cleaned : rawOcrText;
    if (toggleClean) {
      toggleClean.innerHTML = cleanMode ? "&#128260; Raw" : "&#10024; Clean";
      toggleClean.style.color = cleanMode ? "var(--text-muted)" : "var(--primary)";
      toggleClean.title = cleanMode ? "Show raw OCR output" : "Show cleaned output";
    }
  }

  toggleClean.addEventListener("click", function() {
    cleanMode = !cleanMode;
    applyOutputMode();
  });

  // ── File handling ─────────────────────────────────────────────────
  dropzone.addEventListener("click", function() { fileInput.click(); });
  dropzone.addEventListener("dragover", function(e) {
    e.preventDefault(); dropzone.classList.add("drag-over");
  });
  dropzone.addEventListener("dragleave", function() { dropzone.classList.remove("drag-over"); });
  dropzone.addEventListener("drop", function(e) {
    e.preventDefault(); dropzone.classList.remove("drag-over");
    var f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  });
  fileInput.addEventListener("change", function() {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });
  pasteBtn.addEventListener("click", async function() {
    try {
      var items = await navigator.clipboard.read();
      for (var item of items) {
        for (var type of item.types) {
          if (type.startsWith("image/")) {
            var blob = await item.getType(type);
            handleFile(new File([blob], "pasted.png", { type: type }));
            return;
          }
        }
      }
      alert("No image on clipboard. Copy an image first.");
    } catch(e) {
      alert("Clipboard access denied. Please use file upload.");
    }
  });

  function handleFile(file) {
    if (file.size > 10 * 1024 * 1024) {
      alert("Image too large (max 10MB).");
      return;
    }
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      dropzone.style.display = "none";
      previewWrap.style.display = "flex";
      extractBtn.disabled = false;
      rawOcrText = "";
      outputTA.value = "";
      statsDiv.innerHTML = "";
    };
    reader.readAsDataURL(file);
  }

  removeBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    currentFile = null;
    fileInput.value = "";
    preview.src = "";
    previewWrap.style.display = "none";
    dropzone.style.display = "flex";
    extractBtn.disabled = true;
    rawOcrText = "";
    outputTA.value = "";
    statsDiv.innerHTML = "";
  });

  // ── Image Preprocessing ───────────────────────────────────────────
  function preprocessImage(imgEl, mode) {
    var maxDim = 2000;
    var canvas = document.createElement("canvas");
    var w = imgEl.naturalWidth || imgEl.width;
    var h = imgEl.naturalHeight || imgEl.height;
    if (w > maxDim || h > maxDim) {
      var scale = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * scale);
      h = Math.round(h * scale);
    }
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(imgEl, 0, 0, w, h);
    if (mode === "none") return canvas;
    var imgData = ctx.getImageData(0, 0, w, h);
    var d = imgData.data;
    for (var i = 0; i < d.length; i += 4) {
      var lum = 0.299 * d[i] + 0.587 * d[i+1] + 0.114 * d[i+2];
      var v;
      if (mode === "threshold") {
        v = lum > 140 ? 255 : 0;
      } else {
        var c = ((lum / 255 - 0.5) * 1.4 + 0.5) * 255;
        v = Math.max(0, Math.min(255, Math.round(c)));
      }
      d[i] = d[i+1] = d[i+2] = v;
      // keep alpha
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  // ── OCR Worker (Tesseract.js v7) ──────────────────────────────────
  async function getWorker(lang) {
    if (ocrWorker && currentLang === lang) return ocrWorker;
    if (ocrWorker) { try { await ocrWorker.terminate(); } catch(e) {} ocrWorker = null; }
    var { createWorker } = await import("tesseract.js");
    ocrWorker = await createWorker(lang, 1, {
      logger: function(m) {
        if (m.status === "recognizing text") {
          var pct = Math.round((m.progress || 0) * 100);
          progressInner.style.width = pct + "%";
          progressPct.textContent = pct + "%";
        } else if (m.status) {
          spinnerLabel.textContent = m.status.replace(/_/g," ") + "...";
        }
      }
    });
    currentLang = lang;
    return ocrWorker;
  }

  // ── Extract ───────────────────────────────────────────────────────
  extractBtn.addEventListener("click", async function() {
    if (!currentFile) return;
    extractBtn.disabled = true;
    extractBtn.textContent = "Extracting...";
    spinner.style.visibility = "visible";
    spinnerLabel.textContent = "Loading OCR engine...";
    progressInner.style.width = "0%";
    progressPct.textContent = "0%";
    rawOcrText = "";
    outputTA.value = "";
    statsDiv.innerHTML = "";
    var lang = langSel.value;
    var mode = preprocessSel.value;
    var startTime = performance.now();
    try {
      var img = new Image();
      var imgReady = new Promise(function(res, rej) { img.onload = res; img.onerror = rej; });
      img.src = preview.src;
      await imgReady;
      var canvas = preprocessImage(img, mode);
      spinnerLabel.textContent = "Downloading language model...";
      var worker = await getWorker(lang);
      spinnerLabel.textContent = "Recognizing text...";
      var result = await worker.recognize(canvas);
      var data = result.data;
      rawOcrText = (data.text || "").trim();
      applyOutputMode();
      var duration = ((performance.now() - startTime) / 1000).toFixed(2);
      var confidence = data.confidence !== undefined ? data.confidence.toFixed(1) : "N/A";
      var displayed = outputTA.value;
      var wordCount = displayed.trim() ? displayed.trim().split(/\s+/).length : 0;
      var charCount = displayed.length;
      var lineCount = displayed ? displayed.split("\n").length : 0;
      var langLabel = OCR_LANGS.find(function(l) { return l[0] === lang; });
      statsDiv.innerHTML = [
        ["&#128270; Confidence", confidence + "%"],
        ["&#9201; Time", duration + "s"],
        ["&#127760; Language", langLabel ? langLabel[1] : lang],
        ["&#128221; Words", wordCount],
        ["&#128295; Chars", charCount],
        ["&#8801; Lines", lineCount]
      ].map(function(s) {
        return '<span style="font-size:0.72rem;color:var(--text-muted);background:rgba(255,255,255,0.04);border:1px solid var(--glass-border);border-radius:6px;padding:3px 8px;">'
          + s[0] + ': <strong style="color:var(--text-primary);">' + s[1] + "</strong></span>";
      }).join("");
      apiFetch("ocr", { lang: lang, words: wordCount, chars: charCount }).catch(function() {});
    } catch(err) {
      console.error("OCR error:", err);
      outputTA.value = "OCR failed: " + (err && err.message ? err.message : String(err))
        + "\n\nTry: different preprocessing mode, a cleaner image, or refresh the page.";
    } finally {
      extractBtn.disabled = false;
      extractBtn.innerHTML = "&#128269; Extract Text";
      spinner.style.visibility = "hidden";
    }
  });

  // ── Copy ──────────────────────────────────────────────────────────
  copyBtn.addEventListener("click", function() {
    var text = outputTA.value;
    if (!text) return;
    var showBadge = function() {
      copyBadge.style.display = "block";
      setTimeout(function() { copyBadge.style.display = "none"; }, 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(showBadge).catch(function() {
        outputTA.select(); document.execCommand("copy"); showBadge();
      });
    } else {
      outputTA.select(); document.execCommand("copy"); showBadge();
    }
  });

  // ── Download ──────────────────────────────────────────────────────
  downloadBtn.addEventListener("click", function() {
    var text = outputTA.value;
    if (!text) return;
    var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "ocr_output_" + new Date().toISOString().slice(0, 10) + ".txt";
    a.click();
    URL.revokeObjectURL(url);
  });

  // ── Clear ─────────────────────────────────────────────────────────
  clearBtn.addEventListener("click", function() {
    rawOcrText = "";
    outputTA.value = "";
    statsDiv.innerHTML = "";
  });

  // ── Cleanup ───────────────────────────────────────────────────────
  window.addEventListener("beforeunload", function() {
    if (ocrWorker) { try { ocrWorker.terminate(); } catch(e) {} ocrWorker = null; }
  });
}
