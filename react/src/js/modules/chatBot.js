import { apiFetch } from "../utils/fetch.js";

/**
 * ChatBot Builder — Auto-Responder Configuration Module
 */
export function init() {
  const container = document.getElementById("chatBot");
  if (!container) return;

  container.innerHTML = `
    <div class="card-glass anim-slide-up">
      <div class="module-header">
        <h2 class="module-title">🤖 Auto ChatBot Builder</h2>
        <button class="btn-glass btn-back-dash">🏠 Home</button>
      </div>

      <div class="grid-12" style="gap:1.5rem;">
        <!-- Live Chat Preview left -->
        <div style="grid-column:span 7; display:flex; flex-direction:column; gap:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Live Bot Preview</h3>

          <div class="card-glass" style="background:rgba(0,0,0,0.2); height:300px; overflow-y:auto; padding:1rem; display:flex; flex-direction:column; gap:10px;" id="bot-chat-window">
            <div style="display:flex; justify-content:flex-start;">
              <div style="background:rgba(255,255,255,0.06); border:1px solid var(--glass-border); border-radius:12px 12px 12px 2px; padding:0.6rem 1rem; max-width:75%; font-size:0.88rem; line-height:1.5;">
                <b style="font-size:0.7rem; color:var(--primary); text-transform:uppercase; display:block; margin-bottom:3px;">Alpha Bot</b>
                Hello! I'm your AI assistant. How can I help you today?
              </div>
            </div>
          </div>

          <div style="display:flex; gap:8px;">
            <input id="bot-user-input" class="input-glass" style="flex:1;" placeholder="Test the bot here..." />
            <button id="bot-send-btn" class="btn-primary">Send</button>
          </div>
        </div>

        <!-- Rules Builder right -->
        <div style="grid-column:span 5; display:flex; flex-direction:column; gap:1rem; border-left:1px solid var(--glass-border); padding-left:1rem;">
          <h3 style="font-size:0.95rem; font-weight:700; color:var(--text-secondary);">Add Response Rule</h3>

          <div style="display:flex; flex-direction:column; gap:6px;">
            <input id="bot-keyword-in" class="input-glass" style="font-size:0.85rem;" placeholder='Trigger keyword (e.g. "hours")' />
            <textarea id="bot-reply-in" class="input-glass" style="height:70px; resize:none; font-size:0.85rem;" placeholder='Bot reply (e.g. "We are open 9am–5pm")'></textarea>
            <button id="bot-add-rule-btn" class="btn-primary" style="font-size:0.85rem;">+ Add Rule</button>
          </div>

          <h4 style="font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-top:0.5rem;">Active Rules</h4>
          <div id="bot-rules-list" style="display:flex; flex-direction:column; gap:6px; max-height:180px; overflow-y:auto;"></div>
        </div>
      </div>
    </div>
  `;

  const chatWindow = document.getElementById("bot-chat-window");
  const userInput = document.getElementById("bot-user-input");
  const sendBtn = document.getElementById("bot-send-btn");
  const keywordIn = document.getElementById("bot-keyword-in");
  const replyIn = document.getElementById("bot-reply-in");
  const addRuleBtn = document.getElementById("bot-add-rule-btn");
  const rulesList = document.getElementById("bot-rules-list");

  let rules = JSON.parse(localStorage.getItem("chatbot_rules") || "[]");
  if (rules.length === 0) {
    rules = [
      { keyword: "hello", reply: "Hi there! Great to see you!" },
      { keyword: "hours", reply: "We are open Monday–Friday, 9am to 5pm." },
      { keyword: "price", reply: "Pricing starts from $29/month. Visit our pricing page for details." },
      { keyword: "help", reply: "I can answer questions about our products, hours, and pricing!" }
    ];
    localStorage.setItem("chatbot_rules", JSON.stringify(rules));
  }

  function renderRules() {
    rulesList.innerHTML = "";
    if (rules.length === 0) {
      rulesList.innerHTML = `<p style="color:var(--text-muted); font-size:0.78rem; text-align:center;">No rules added yet.</p>`;
      return;
    }
    rules.forEach((r, i) => {
      const row = document.createElement("div");
      row.className = "card-glass";
      row.style.cssText = "padding:0.5rem 0.75rem; display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.15); font-size:0.78rem; gap:6px;";
      row.innerHTML = `
        <div style="overflow:hidden;">
          <b style="color:var(--primary);">"${r.keyword}"</b>
          <span style="color:var(--text-muted); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${r.reply.substring(0, 40)}...</span>
        </div>
        <button class="btn-glass rule-del" data-idx="${i}" style="font-size:0.7rem; padding:2px 6px; color:var(--danger); flex-shrink:0;">×</button>
      `;
      row.querySelector(".rule-del").addEventListener("click", () => {
        rules.splice(i, 1);
        localStorage.setItem("chatbot_rules", JSON.stringify(rules));
        renderRules();
      });
      rulesList.appendChild(row);
    });
  }

  addRuleBtn.addEventListener("click", () => {
    const kw = keywordIn.value.trim().toLowerCase();
    const rp = replyIn.value.trim();
    if (!kw || !rp) return;
    rules.push({ keyword: kw, reply: rp });
    localStorage.setItem("chatbot_rules", JSON.stringify(rules));
    keywordIn.value = ""; replyIn.value = "";
    renderRules();
  });

  function getBotReply(msg) {
    const lower = msg.toLowerCase();
    const matched = rules.find(r => lower.includes(r.keyword.toLowerCase()));
    if (matched) return matched.reply;

    // Fallback generic replies
    const fallbacks = [
      "That's an interesting question! Let me check my database...",
      "I don't have a specific answer for that, but I'm learning!",
      "Could you rephrase that? I want to help accurately.",
      "Our team will get back to you on that topic soon."
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  function addMessage(text, fromUser) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.justifyContent = fromUser ? "flex-end" : "flex-start";
    wrapper.innerHTML = fromUser
      ? `<div style="background:var(--primary); color:white; border-radius:12px 12px 2px 12px; padding:0.6rem 1rem; max-width:75%; font-size:0.88rem; line-height:1.5; box-shadow:0 4px 12px var(--primary-glow);">${text}</div>`
      : `<div style="background:rgba(255,255,255,0.06); border:1px solid var(--glass-border); border-radius:12px 12px 12px 2px; padding:0.6rem 1rem; max-width:75%; font-size:0.88rem; line-height:1.5;"><b style="font-size:0.7rem; color:var(--primary); text-transform:uppercase; display:block; margin-bottom:3px;">Alpha Bot</b>${text}</div>`;
    chatWindow.appendChild(wrapper);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }

  function handleSend() {
    const msg = userInput.value.trim();
    if (!msg) return;
    addMessage(msg, true);
    userInput.value = "";
    setTimeout(() => addMessage(getBotReply(msg), false), 600);
    apiFetch("chatMessage", { message: msg }).catch(() => {});
  }

  sendBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keydown", e => { if (e.key === "Enter") handleSend(); });

  renderRules();
}
