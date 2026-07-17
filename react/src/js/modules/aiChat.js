import { apiFetch } from "../utils/fetch.js";

/**
 * Initialise AI Chatbot Workspace - Advanced Modern Redesign
 */
export function init() {
  const container = document.getElementById("aiChat");
  if (!container) return;

  // Add modular layout styling directly
  if (!document.getElementById("ai-chat-custom-styles")) {
    const style = document.createElement("style");
    style.id = "ai-chat-custom-styles";
    style.innerHTML = `
      .chat-workspace-grid {
        display: grid;
        grid-template-columns: 260px 1fr;
        gap: 1.25rem;
        flex: 1;
        min-height: 0;
      }
      .chat-history-sidebar {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        height: 100%;
        border-right: 1px solid var(--glass-border);
        padding-right: 1rem;
        transition: width 0.3s ease, opacity 0.3s ease;
      }
      .chat-history-sidebar.collapsed {
        display: none;
      }
      .chat-workspace-grid.sidebar-collapsed {
        grid-template-columns: 1fr;
      }
      .chat-main-pane {
        display: flex;
        flex-direction: column;
        flex: 1;
        position: relative;
        overflow-y: auto;
      }
      .chat-history-list {
        flex: 1;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding-right: 4px;
      }
      .chat-history-item {
        padding: 0.65rem 0.85rem;
        border-radius: 8px;
        background: rgba(255,255,255,0.02);
        border: 1px solid transparent;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.82rem;
        color: var(--text-secondary);
        transition: var(--transition-fast);
      }
      .chat-history-item:hover {
        background: rgba(255,255,255,0.08);
        border-color: var(--glass-border);
        color: var(--text-primary);
      }
      .chat-history-item.active {
        background: var(--primary-glow);
        border-color: var(--primary);
        color: var(--text-primary);
        font-weight: 600;
      }
      .chat-history-item .del-session-btn {
        opacity: 0;
        transition: opacity 0.2s ease;
        background: none;
        border: none;
        color: var(--danger);
        cursor: pointer;
        font-size: 0.85rem;
        padding: 2px;
      }
      .chat-history-item:hover .del-session-btn {
        opacity: 1;
      }
      .chat-workspace-empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        flex: 1;
        text-align: center;
        padding: 2rem;
      }
      .prompt-suggestion-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
        width: 100%;
        max-width: 600px;
        margin-top: 1.5rem;
      }
      .prompt-suggestion-card {
        padding: 1rem;
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--glass-border);
        border-radius: 10px;
        text-align: left;
        cursor: pointer;
        transition: var(--transition-smooth);
      }
      .prompt-suggestion-card:hover {
        background: var(--primary-glow);
        border-color: var(--primary);
        transform: translateY(-2px);
      }
      .typing-indicator-dots {
        display: flex;
        gap: 4px;
        align-items: center;
        padding: 6px 10px;
      }
      .typing-indicator-dot {
        width: 6px;
        height: 6px;
        background: var(--text-muted);
        border-radius: 50%;
        animation: typingBounce 1.4s infinite ease-in-out both;
      }
      .typing-indicator-dot:nth-child(1) { animation-delay: -0.32s; }
      .typing-indicator-dot:nth-child(2) { animation-delay: -0.16s; }
      .typing-indicator-dot:nth-child(3) { animation-delay: 0s; }
      @keyframes typingBounce {
        0%, 80%, 100% { transform: scale(0.2); opacity: 0.4; }
        40% { transform: scale(1.0); opacity: 1; }
      }
      
      /* Mobile responsiveness wrapper */
      @media(max-width: 768px) {
        .chat-workspace-grid {
          grid-template-columns: 1fr;
        }
        .chat-history-sidebar {
          display: none;
        }
        #chat-prompt-textarea {
          font-size: 1rem;
        }
        #chat-prompt-send-btn {
          padding: 0.5rem 0.8rem;
          font-size: 0.9rem;
        }
      }
    `;
    document.head.appendChild(style);
  }

  // Initial layout markup
  container.innerHTML = `
    <div class="card-glass anim-slide-up" style="display: flex; flex-direction: column; overflow: auto; height: 100vh; padding: 1.25rem;">
      <!-- Module header -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.8rem; border-bottom: 1px solid var(--glass-border); margin-bottom: 1rem; flex-shrink:0;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <h2 class="module-title" style="margin: 0; font-size: 1.25rem;">💬 AI Conversational Core</h2>
          <span class="badge badge-success" style="font-size: 0.68rem; padding: 2px 8px;">V2.0 PRO</span>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <!-- Model selector pill button -->
          <select id="chat-model-selector" class="input-glass" style="font-size: 0.75rem; padding: 0.25rem 0.5rem; width: auto; height: 30px; margin-right: 4px;">
            <option value="gpt4o">💡 GPT-4o-Mini</option>
            <option value="claude35">🎭 Claude 3.5 Sonnet</option>
            <option value="gemini15">⚡ Gemini 1.5 Pro</option>
          </select>
          <button id="chat-clear-workspace-btn" class="btn-glass" style="font-size: 0.72rem; padding: 0.35rem 0.75rem; height: 30px;">Clear Thread</button>
          <button class="btn-glass btn-back-dash" style="font-size: 0.72rem; padding: 0.35rem 0.75rem; height: 30px;">🏠 Home</button>
        </div>
      </div>

      <!-- Main Columns Grid -->
      <div class="chat-workspace-grid">
        <!-- Sidebar Col -->
        <div class="chat-history-sidebar">
          <div style="display:flex; gap:0.5rem; margin-bottom:0.5rem;">
            <button id="chat-new-btn" class="btn-primary" style="font-size: 0.8rem; padding: 0.5rem; flex:1; border-radius: 8px; font-weight: 700; display:flex; align-items:center; justify-content:center; gap:6px;">
              <span>+</span> New Conversation
            </button>
            <button id="chat-toggle-sidebar-btn" class="btn-primary" title="Toggle sidebar" style="font-size: 0.8rem; padding: 0.5rem; width: 2.5rem; border-radius: 8px; display:flex; align-items:center; justify-content:center;">☰</button>
          </div>
          <div class="chat-history-list" id="chat-session-list">
            <!-- Populated dynamically -->
          </div>
        </div>

        <!-- Dialog Pane -->
        <div class="chat-main-pane">
          <!-- Messages container -->
          <div id="chat-messages-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem; padding-right: 6px; margin-bottom: 1rem;">
            <!-- Render empty workspace welcome screen or conversation bubbles -->
          </div>

          <!-- Typing indicator notification -->
          <div id="chat-typing-status" style="display: none; align-items: center; gap: 8px; font-size: 0.8rem; color: var(--text-muted); padding-left: 0.5rem; margin-bottom: 0.5rem;">
            <div class="typing-indicator-dots">
              <span class="typing-indicator-dot"></span>
              <span class="typing-indicator-dot"></span>
              <span class="typing-indicator-dot"></span>
            </div>
            <span id="chat-assistant-typing-label">AI is writing...</span>
          </div>

          <!-- Bottom Textarea Panel -->
          <div class="card-glass" style="padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.15); border-radius: 12px; flex-shrink: 0;">
            <div style="display: flex; gap: 10px; align-items: flex-end;">
              <textarea id="chat-prompt-textarea" class="input-glass" style="flex: 1; min-height: 80px; max-height: 200px; resize: none; font-size: 0.95rem; line-height: 1.5; padding: 0.6rem 0.8rem; border: none; background: transparent;" placeholder="Ask AI Assistant anything... (Enter to send, Shift+Enter for newline)" aria-label="Chat input"></textarea>
              <button id="chat-prompt-send-btn" class="btn-primary" style="padding: 0.5rem 1rem; border-radius: 8px; height: 38px; display: flex; align-items: center; font-weight: 700;" aria-label="Send message">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Constants & references
  const promptInput = document.getElementById("chat-prompt-textarea");
  const sendBtn = document.getElementById("chat-prompt-send-btn");
  const messageBox = document.getElementById("chat-messages-container");
  const modelSelect = document.getElementById("chat-model-selector");
  const clearBtn = document.getElementById("chat-clear-workspace-btn");
  const sessionList = document.getElementById("chat-session-list");
  const newChatBtn = document.getElementById("chat-new-btn");
  const typingStatus = document.getElementById("chat-typing-status");
  const assistantTypingLabel = document.getElementById("chat-assistant-typing-label");
  // Sidebar toggle elements
  const toggleBtn = document.getElementById("chat-toggle-sidebar-btn");
  const sidebar = document.querySelector(".chat-history-sidebar");
  const workspaceGrid = document.querySelector(".chat-workspace-grid");

  // Attach toggle handler if elements exist
  if (toggleBtn && sidebar && workspaceGrid) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      workspaceGrid.classList.toggle("sidebar-collapsed");
    });
  }

  // State Management
  let conversations = JSON.parse(localStorage.getItem("ai_chat_history") || "[]");
  let activeSessionId = localStorage.getItem("ai_chat_active_id") || "";

  // Auto-resize search input textarea
  promptInput.addEventListener("input", function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight - 10) + 'px';
  });

  // Suggestion card prompts database trigger
  const SUGGESTIONS = [
    { title: "💡 Explain Concept", desc: "quantum computing like I'm 5", prompt: "Explain quantum computing like I'm 5 years old" },
    { title: "💻 Code Snippet", desc: "efficient JS debounce helper", prompt: "Write an highly efficient, clean Javascript debounce helper function, with sample usage code." },
    { title: "🚀 Business Pitch", desc: "unique SaaS product ideas", prompt: "Brainstorm 3 unique, developer-centric micro-SaaS startup ideas for 2026." },
    { title: "📊 Work Outline", desc: "weekly report email template", prompt: "Write a professional weekly status report template for project managers." }
  ];

  function getModelIcon(model) {
    if (model === "claude35") return "🎭";
    if (model === "gemini15") return "⚡";
    return "💡";
  }

  function getModelLabel(model) {
    if (model === "claude35") return "Claude 3.5 Sonnet";
    if (model === "gemini15") return "Gemini 1.5 Pro";
    return "GPT-4o-Mini";
  }

  // Parse custom Markdown elements for text
  function parseMarkdown(text) {
    let html = text;
    // Escape HTML tags to prevent XSS
    html = html.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // Code blocks wrapper parsing (```lang code ```)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    html = html.replace(codeBlockRegex, (match, lang, code) => {
      const language = lang || 'code';
      const trimmedCode = code.trim();
      return `
        <div class="code-terminal" style="background:#0b0b0f; border:1px solid var(--glass-border); border-radius:8px; margin:0.8rem 0; overflow:hidden; font-family:'Courier New', Courier, monospace;">
          <div style="background:rgba(255,255,255,0.05); padding:6px 12px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.08); font-size:0.75rem; color:var(--text-muted);">
            <span style="font-weight:700; color:var(--primary);">${language.toUpperCase()}</span>
            <button onclick="navigator.clipboard.writeText(this.nextElementSibling.textContent); this.textContent='Copied!'; setTimeout(()=>this.textContent='Copy', 1500);" style="background:none; border:none; color:var(--text-muted); cursor:pointer; font-weight:600; font-size:0.72rem;">Copy</button>
            <span style="display:none;">${trimmedCode}</span>
          </div>
          <pre style="padding:12px; margin:0; font-size:0.85rem; color:#e4e4e7; overflow-x:auto; line-height:1.4;"><code style="background:none; padding:0; color:inherit;">${trimmedCode}</code></pre>
        </div>
      `;
    });

    // Inline elements (`code`)
    html = html.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.08); padding:2px 6px; border-radius:4px; font-family:monospace; font-size:0.88rem; color:var(--primary);">$1</code>');

    // Bold tags (**bold**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--text-primary); font-weight:700;">$1</strong>');

    // bullet points
    html = html.replace(/^\*\s(.*)$/gm, '<li style="margin-left:1.2rem; margin-top:2px; font-size:0.92rem; color:var(--text-secondary);">$1</li>');

    // Add breaks for matching newlines outside code
    const parts = html.split(/(<div class="code-terminal"[\s\S]*?<\/div>)/);
    for (let i = 0; i < parts.length; i++) {
      if (!parts[i].startsWith('<div class="code-terminal"')) {
        parts[i] = parts[i].replace(/\n/g, '<br>');
      }
    }
    return parts.join('');
  }

  // Load user dashboard prompt buffer initially if redirected from main dashboard module
  const quickChatInput = document.getElementById("chat-input");
  if (quickChatInput && quickChatInput.value.trim()) {
    const rawVal = quickChatInput.value.trim();
    promptInput.value = rawVal;
    quickChatInput.value = "";
  }

  function initHistory() {
    if (conversations.length === 0) {
      const defaultId = "sess_" + Date.now();
      conversations.push({
        id: defaultId,
        title: "Default Chat",
        model: "gpt4o",
        messages: []
      });
      activeSessionId = defaultId;
      saveState();
    }
    renderSessionList();
    loadSession(activeSessionId);
  }

  function saveState() {
    localStorage.setItem("ai_chat_history", JSON.stringify(conversations));
    localStorage.setItem("ai_chat_active_id", activeSessionId);
  }

  function renderSessionList() {
    sessionList.innerHTML = "";
    conversations.forEach(sess => {
      const item = document.createElement("div");
      item.className = `chat-history-item ${sess.id === activeSessionId ? 'active' : ''}`;
      item.innerHTML = `
        <div style="display:flex; align-items:center; gap:6px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1;">
          <span style="font-size:0.9rem;">${getModelIcon(sess.model)}</span>
          <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${sess.title}</span>
        </div>
        <button class="del-session-btn" title="Delete conversation" data-id="${sess.id}">🗑️</button>
      `;
      
      // Click event navigation
      item.addEventListener("click", (e) => {
        if (e.target.classList.contains("del-session-btn")) return;
        selectSession(sess.id);
      });
      
      // Delete listener
      const delBtn = item.querySelector(".del-session-btn");
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteSession(sess.id);
      });

      sessionList.appendChild(item);
    });
  }

  function selectSession(id) {
    activeSessionId = id;
    saveState();
    renderSessionList();
    loadSession(activeSessionId);
  }

  function deleteSession(id) {
    conversations = conversations.filter(c => c.id !== id);
    if (activeSessionId === id) {
      activeSessionId = conversations.length > 0 ? conversations[0].id : "";
    }
    saveState();
    initHistory();
  }

  function addNewConversation() {
    const id = "sess_" + Date.now();
    conversations.unshift({
      id: id,
      title: "New Conversation",
      model: modelSelect.value,
      messages: []
    });
    activeSessionId = id;
    saveState();
    renderSessionList();
    loadSession(activeSessionId);
    promptInput.focus();
  }

  function loadSession(id) {
    const sess = conversations.find(c => c.id === id);
    if (!sess) return;
    
    // sync model dropdown
    modelSelect.value = sess.model;

    if (sess.messages.length === 0) {
      renderWelcomeArea();
    } else {
      renderConversationsPack(sess.messages);
    }
  }

  function renderWelcomeArea() {
    messageBox.innerHTML = `
      <div class="chat-workspace-empty">
        <div style="font-size:3.5rem; filter: drop-shadow(0 0 15px var(--primary-glow)); margin-bottom: 0.5rem; animation: pulseDot 2s infinite;">🤖</div>
        <h3 style="font-size:1.6rem; font-weight:800; margin-bottom:0.5rem;">Alpha Conversational AI Core</h3>
        <p style="color:var(--text-secondary); max-width:480px; font-size:0.9rem; line-height:1.5; margin-bottom:1.5rem;">
          Deploy cognitive prompts, ask programming code structure solutions, or query weather statistics dynamically. Direct Sheets integration is online.
        </p>
        <div style="font-size:0.75rem; color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:1px; width:100%; max-width:600px; text-align:left; margin-bottom:0.5rem;">
          ⚡ Try asking
        </div>
        <div class="prompt-suggestion-grid">
          ${SUGGESTIONS.map((s, i) => `
            <div class="prompt-suggestion-card" data-idx="${i}">
              <div style="font-weight:750; font-size:0.85rem; color:var(--primary); margin-bottom:4px;">${s.title}</div>
              <div style="font-size:0.78rem; color:var(--text-secondary); line-height:1.3;">${s.desc}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    // Bind click suggestions cards
    document.querySelectorAll(".prompt-suggestion-grid .prompt-suggestion-card").forEach(card => {
      card.addEventListener("click", () => {
        const idx = card.dataset.idx;
        const suggestion = SUGGESTIONS[idx];
        promptInput.value = suggestion.prompt;
        dispatchSend();
      });
    });
  }

  function renderConversationsPack(msgs) {
    messageBox.innerHTML = "";
    msgs.forEach((m, idx) => {
      const bubble = document.createElement("div");
      bubble.style.cssText = "display:flex; gap:12px; margin-bottom:0.25rem; width:100%; align-items:flex-start;";
      
      const isUser = m.role === "user";
      
      if (isUser) {
        bubble.style.justifyContent = "flex-end";
        bubble.innerHTML = `
          <div style="display:flex; flex-direction:column; align-items:flex-end; max-width:80%;">
            <div style="background: var(--primary); color: white; border-radius: 16px 16px 2px 16px; padding: 0.75rem 1.1rem; font-size: 0.95rem; line-height: 1.5; box-shadow: 0 4px 15px var(--primary-glow);">
              ${m.content}
            </div>
            <span style="font-size:0.65rem; color:var(--text-muted); margin-top:4px;">You</span>
          </div>
        `;
      } else {
        bubble.style.justifyContent = "flex-start";
        
        // Auto parse code tags format
        const cleanHTML = parseMarkdown(m.content);
        
        bubble.innerHTML = `
          <div style="display:flex; gap:10px; max-width:85%; align-items:flex-start;">
            <div style="background:var(--primary); color:white; font-size:1.1rem; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 0 10px var(--primary-glow);">
              🤖
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-start; flex:1;">
              <div class="card-glass" style="padding: 0.85rem 1.25rem; border-radius: 2px 16px 16px 16px; width: 100%; background: rgba(255,255,255,0.03); font-size: 0.95rem; line-height: 1.55; color: var(--text-primary); border-color: var(--glass-border);">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.05); padding-bottom:4px; margin-bottom:6px; font-size:0.72rem; color:var(--text-muted); font-weight:700;">
                  <span>${getModelLabel(m.modelKey || 'gpt4o').toUpperCase()} CORE</span>
                  <div style="display:flex; gap:6px;">
                    <button class="speak-msg-btn btn-glass" style="font-size:0.65rem; padding:2px 6px; background:none; border:none;" data-text="${encodeURIComponent(m.content)}">🔊 Listen</button>
                    <button class="copy-msg-btn btn-glass" style="font-size:0.65rem; padding:2px 6px; background:none; border:none;">📋 Copy</button>
                  </div>
                </div>
                <div>${cleanHTML}</div>
              </div>
              <span style="font-size:0.65rem; color:var(--text-muted); margin-top:4px; margin-left:4px;">Assistant</span>
            </div>
          </div>
        `;

        // Bind copy text button
        bubble.querySelector(".copy-msg-btn").addEventListener("click", function() {
          navigator.clipboard.writeText(m.content);
          this.textContent = "Copied!";
          setTimeout(() => { this.textContent = "📋 Copy"; }, 1500);
        });

        // Bind TTS listen button redirect voice Synthesis
        bubble.querySelector(".speak-msg-btn").addEventListener("click", function() {
          const txt = decodeURIComponent(this.dataset.text);
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const speech = new SpeechSynthesisUtterance(txt);
            speech.rate = 1.0;
            window.speechSynthesis.speak(speech);
          } else {
            alert("TTS synthesis unsupported in current browser API.");
          }
        });
      }
      messageBox.appendChild(bubble);
    });
    messageBox.scrollTop = messageBox.scrollHeight;
  }

  function dispatchSend() {
    const text = promptInput.value.trim();
    if (!text) return;

    // Disable send button and show loading state
    sendBtn.disabled = true;
    const originalBtnLabel = sendBtn.textContent;
    sendBtn.textContent = "Sending...";

    promptInput.value = "";
    promptInput.style.height = "auto";

    const activeModel = modelSelect.value;
    const sess = conversations.find(c => c.id === activeSessionId);
    if (!sess) {
      // Re-enable button before exit
      sendBtn.disabled = false;
      sendBtn.textContent = originalBtnLabel;
      return;
    }

    // Set first message as the title if new conversation
    if (sess.messages.length === 0) {
      sess.title = text.length > 22 ? text.substring(0, 22) + "..." : text;
    }

    // Push user's prompt
    sess.messages.push({ role: "user", content: text, modelKey: activeModel });
    saveState();
    renderSessionList();
    renderConversationsPack(sess.messages);

    // Show custom typing indicator
    typingStatus.style.display = "flex";
    assistantTypingLabel.textContent = `${getModelLabel(activeModel)} is computing responses...`;
    messageBox.scrollTop = messageBox.scrollHeight;

    // Fetch response with Apps Script fallback
    apiFetch("aiChat", { prompt: text, model: activeModel })
      .then(res => {
        typingStatus.style.display = "none";
        sess.messages.push({ role: "assistant", content: res.reply || "Unable to formulate a reply.", modelKey: activeModel });
        saveState();
        renderConversationsPack(sess.messages);
        // Re‑enable send button after successful response
        sendBtn.disabled = false;
        sendBtn.textContent = originalBtnLabel;
      })
      .catch(err => {
        console.warn("AI remote connection failed. Dispensing simulated local logic:", err);
        
        setTimeout(() => {
          typingStatus.style.display = "none";
          const query = text.toLowerCase();
          let reply = "Your request was processed locally. Configure the Apps Script URL inside `fetch.js` to enable external LLM APIs.\n\nHere's what I computed based on your system database:";

          if (query.includes("weather")) {
            reply += "\n* Live weather data updates indicate Dhaka is at 31°C with Sunny Intervals.\n* Humidity index: 65%\n* Wind force: 12 km/h";
          } else if (query.includes("time") || query.includes("clock")) {
            reply += `\n* Current active time: **${new Date().toLocaleTimeString()}**\n* All local dashboard world clocks are synced dynamically.`;
          } else if (query.includes("todo") || query.includes("task")) {
            reply += "\n* Tasks tracker data list has been cached offline inside browser LocalStorage.\n* Navigate to settings under productivity to save permanent items.";
          } else if (query.includes("debounce") || query.includes("javascript") || query.includes("code")) {
            reply = "I've generated a clean ES6 debounce mechanism locally for you:\n\n```js\n// Debouncing utility method\nfunction debounce(callback, wait = 300) {\n  let ref;\n  return (...params) => {\n    clearTimeout(ref);\n    ref = setTimeout(() => callback.apply(this, params), wait);\n  };\n}\n```\nYou can import this directly into any modular file setup.";
          } else if (query.includes("startup") || query.includes("saas")) {
            reply = "Here are 3 unique micro-SaaS developer ideas for 2026:\n\n1. **Tailwind glassmorphism UI builders** with dynamic color scheme selectors.\n2. **Google Apps Script sheets metrics bridge tools** for offline storage setups.\n3. **Local-first biometric authentication APIs** using standard camera scanners.";
          } else {
            reply += `\n* I've logged your intent: "${text}".\n* Standard conversational logic outputs are fully active. Ready to build custom forms.`;
          }

          sess.messages.push({ role: "assistant", content: reply, modelKey: activeModel });
          saveState();
          renderConversationsPack(sess.messages);
          // Re‑enable send button after local fallback response
          sendBtn.disabled = false;
          sendBtn.textContent = originalBtnLabel;
        }, 900);
      });
  }

  // Bind trigger buttons handlers
  sendBtn.addEventListener("click", dispatchSend);
  promptInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      dispatchSend();
    }
  });

  clearBtn.addEventListener("click", () => {
    const sess = conversations.find(c => c.id === activeSessionId);
    if (sess) {
      sess.messages = [];
      sess.title = "Cleared Chat";
      saveState();
      renderSessionList();
      loadSession(activeSessionId);
    }
  });

  newChatBtn.addEventListener("click", addNewConversation);
  
  // Model select change commits to state
  modelSelect.addEventListener("change", () => {
    const sess = conversations.find(c => c.id === activeSessionId);
    if (sess) {
      sess.model = modelSelect.value;
      saveState();
      renderSessionList();
    }
  });

  // Jumpstart history modules
  initHistory();
}
