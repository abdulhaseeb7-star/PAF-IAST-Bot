(function () {
  // ── Config ──────────────────────────────────────────
  const API_URL = "https://paf-iast-bot-production.up.railway.app";

  // ── Inject Google Font for Urdu ─────────────────────
  const fontLink = document.createElement("link");
  fontLink.rel = "stylesheet";
  fontLink.href = "https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu&display=swap";
  document.head.appendChild(fontLink);

  // ── Inject Styles ───────────────────────────────────
  const style = document.createElement("style");
  style.innerHTML = `
    #pafi-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 62px;
      height: 62px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a5276, #2e86c1);
      color: white;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      z-index: 999999;
      box-shadow: 0 4px 20px rgba(26,82,118,0.5);
      animation: pafi-pulse 2s infinite;
      font-family: Arial, sans-serif;
    }
    #pafi-bubble .pafi-icon { font-size: 24px; line-height: 1; }
    #pafi-bubble .pafi-label { font-size: 8px; font-weight: bold; margin-top: 2px; }
    @keyframes pafi-pulse {
      0% { box-shadow: 0 0 0 0 rgba(26,82,118,0.5); }
      70% { box-shadow: 0 0 0 12px rgba(26,82,118,0); }
      100% { box-shadow: 0 0 0 0 rgba(26,82,118,0); }
    }
    #pafi-window {
      position: fixed;
      bottom: 100px;
      right: 0px;
      width: 350px;
      height: 500px;
      max-height: calc(100vh - 120px);
      background: white;
      border-radius: 20px 0 0 20px;
      box-shadow: 0 8px 40px rgba(0,0,0,0.2);
      display: none;
      flex-direction: column;
      z-index: 999998;
      overflow: hidden;
      font-family: Arial, sans-serif;
    }
    #pafi-window.pafi-open { display: flex; }
    @media (max-width: 768px) {
      #pafi-window {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
        max-height: 100vh;
      }
    }
    #pafi-header {
      background: linear-gradient(135deg, #1a5276, #2e86c1);
      padding: 10px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    #pafi-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      min-width: 0;
    }
    .pafi-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      flex-shrink: 0;
    }
    .pafi-name {
      color: white;
      font-weight: bold;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .pafi-online {
      background: #27ae60;
      border-radius: 8px;
      padding: 1px 5px;
      font-size: 8px;
      font-weight: normal;
    }
    .pafi-subtitle {
      color: rgba(255,255,255,0.85);
      font-size: 10px;
    }
    #pafi-header-right {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-shrink: 0;
      margin-left: 8px;
    }
    #pafi-lang {
      background: rgba(255,255,255,0.2);
      color: white;
      border: 1px solid rgba(255,255,255,0.4);
      border-radius: 6px;
      padding: 4px 4px;
      font-size: 10px;
      cursor: pointer;
      outline: none;
      width: 62px;
    }
    #pafi-close {
      background: rgba(255,255,255,0.2);
      border: 1px solid rgba(255,255,255,0.4);
      border-radius: 6px;
      color: white;
      cursor: pointer;
      font-size: 14px;
      padding: 4px 8px;
      flex-shrink: 0;
      line-height: 1;
    }
    #pafi-messages {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      background: #f5f8ff;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    #pafi-messages::-webkit-scrollbar { width: 4px; }
    #pafi-messages::-webkit-scrollbar-thumb { background: #2e86c1; border-radius: 4px; }
    .pafi-msg-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .pafi-msg-row.user { align-items: flex-end; }
    .pafi-msg-row.bot { align-items: flex-start; }
    .pafi-msg-label {
      font-size: 10px;
      color: #888;
      padding-left: 2px;
    }
    .pafi-bubble-msg {
      max-width: 82%;
      padding: 10px 14px;
      font-size: 13px;
      line-height: 1.6;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      word-break: break-word;
      white-space: pre-wrap;
    }
    .pafi-bubble-msg.user {
      background: linear-gradient(135deg, #1a5276, #2e86c1);
      color: white;
      border-radius: 18px 18px 4px 18px;
    }
    .pafi-bubble-msg.bot {
      background: white;
      color: #333;
      border-radius: 18px 18px 18px 4px;
    }
    .pafi-bubble-msg.rtl {
      direction: rtl;
      text-align: right;
      font-family: 'Noto Nastaliq Urdu', Arial, sans-serif;
    }
    .pafi-time {
      font-size: 9px;
      color: #bbb;
      padding: 0 2px;
    }
    .pafi-typing {
      display: flex;
      align-items: center;
      gap: 8px;
      background: white;
      padding: 12px 16px;
      border-radius: 18px 18px 18px 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      width: fit-content;
    }
    .pafi-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #2e86c1;
      animation: pafi-bounce 1.2s infinite;
    }
    .pafi-dot:nth-child(2) { animation-delay: 0.2s; }
    .pafi-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pafi-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }
    .pafi-typing-text { font-size: 12px; color: #888; }
    #pafi-quick {
      margin-top: 4px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .pafi-quick-label {
      font-size: 11px;
      color: #888;
      text-align: center;
      margin-bottom: 4px;
    }
    .pafi-quick-btn {
      background: white;
      border: 1px solid #d0e8f7;
      border-radius: 12px;
      padding: 8px 12px;
      font-size: 12px;
      color: #1a5276;
      cursor: pointer;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      text-align: left;
      transition: all 0.2s;
    }
    .pafi-quick-btn:hover {
      background: #e8f4fd;
      border-color: #2e86c1;
    }
    #pafi-input-area {
      padding: 10px 12px;
      background: white;
      border-top: 1px solid #eee;
      display: flex;
      gap: 8px;
      align-items: center;
      flex-shrink: 0;
    }
    #pafi-input {
      flex: 1;
      padding: 10px 14px;
      border-radius: 24px;
      border: 1.5px solid #d0e8f7;
      outline: none;
      font-size: 13px;
      min-width: 0;
      font-family: Arial, sans-serif;
    }
    #pafi-send {
      background: linear-gradient(135deg, #1a5276, #2e86c1);
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      min-width: 40px;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    #pafi-send:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
    #pafi-footer {
      padding: 5px;
      background: white;
      text-align: center;
      font-size: 9px;
      color: #bbb;
      border-top: 1px solid #f5f5f5;
      flex-shrink: 0;
      font-family: Arial, sans-serif;
    }
  `;
  document.head.appendChild(style);

  // ── Language Config ──────────────────────────────────
  const LANGS = {
    en: {
      name: "🇬🇧 EN",
      placeholder: "Type your question here...",
      welcome: "👋 Hello! I'm PAFI, your PAF-IAST AI Assistant! I can help you with admissions, programs, fee structure, scholarships, and much more. How can I assist you today?",
      typing: "PAFI is thinking...",
      quick: [
        "What are the admission requirements?",
        "What is the fee structure?",
        "What BS programs are offered?",
        "What scholarships are available?",
        "How to contact PAF-IAST?",
      ],
    },
    ur: {
      name: "🇵🇰 UR",
      placeholder: "اپنا سوال یہاں لکھیں...",
      welcome: "👋 السلام علیکم! میں پافی ہوں، آپ کا PAF-IAST AI اسسٹنٹ! داخلہ، پروگرامز، فیس، اسکالرشپ — کچھ بھی پوچھیں!",
      typing: "پافی سوچ رہا ہے...",
      quick: [
        "داخلہ کی ضروریات کیا ہیں؟",
        "فیس کتنی ہے؟",
        "کون سے BS پروگرامز ہیں؟",
        "اسکالرشپ کیسے ملے گی؟",
        "PAF-IAST سے کیسے رابطہ کریں؟",
      ],
    },
    zh: {
      name: "🇨🇳 ZH",
      placeholder: "在这里输入您的问题...",
      welcome: "👋 你好！我是PAFI，您的PAF-IAST智能助手！关于招生、课程、费用、奖学金，请随时问我！",
      typing: "PAFI正在思考...",
      quick: [
        "入学要求是什么？",
        "学费是多少？",
        "提供哪些学士课程？",
        "有哪些奖学金？",
        "如何联系PAF-IAST？",
      ],
    },
    ar: {
      name: "🇸🇦 AR",
      placeholder: "اكتب سؤالك هنا...",
      welcome: "👋 مرحباً! أنا PAFI، مساعدك الذكي في PAF-IAST! اسألني عن القبول والبرامج والرسوم والمنح!",
      typing: "PAFI يفكر...",
      quick: [
        "ما هي متطلبات القبول؟",
        "ما هي الرسوم الدراسية؟",
        "ما هي البرامج المتاحة؟",
        "ما هي المنح الدراسية؟",
        "كيف أتواصل مع PAF-IAST؟",
      ],
    },
    de: {
      name: "🇩🇪 DE",
      placeholder: "Geben Sie Ihre Frage hier ein...",
      welcome: "👋 Hallo! Ich bin PAFI, Ihr PAF-IAST KI-Assistent! Fragen Sie mich zu Zulassung, Programmen, Gebühren und Stipendien!",
      typing: "PAFI denkt nach...",
      quick: [
        "Was sind die Zulassungsvoraussetzungen?",
        "Wie hoch sind die Studiengebühren?",
        "Welche Bachelor-Programme gibt es?",
        "Welche Stipendien gibt es?",
        "Wie kontaktiere ich PAF-IAST?",
      ],
    },
  };

  // ── State ────────────────────────────────────────────
  let language = "en";
  let loading = false;
  let messages = [];
  let showQuick = true;

  // ── Build HTML ───────────────────────────────────────
  // Chat Bubble
  const bubble = document.createElement("div");
  bubble.id = "pafi-bubble";
  bubble.innerHTML = `<div class="pafi-icon">🎓</div><div class="pafi-label">PAFI</div>`;
  document.body.appendChild(bubble);

  // Chat Window
  const win = document.createElement("div");
  win.id = "pafi-window";
  win.innerHTML = `
    <div id="pafi-header">
      <div id="pafi-header-left">
        <div class="pafi-avatar">🎓</div>
        <div>
          <div class="pafi-name">
            PAFI <span class="pafi-online">ONLINE</span>
          </div>
          <div class="pafi-subtitle">PAF-IAST AI Assistant</div>
        </div>
      </div>
      <div id="pafi-header-right">
        <select id="pafi-lang">
          <option value="en">🇬🇧 EN</option>
          <option value="ur">🇵🇰 UR</option>
          <option value="zh">🇨🇳 ZH</option>
          <option value="ar">🇸🇦 AR</option>
          <option value="de">🇩🇪 DE</option>
        </select>
        <button id="pafi-close">✕</button>
      </div>
    </div>
    <div id="pafi-messages"></div>
    <div id="pafi-input-area">
      <input id="pafi-input" type="text" placeholder="Type your question here..." />
      <button id="pafi-send">➤</button>
    </div>
    <div id="pafi-footer">Powered by PAF-IAST AI • paf-iast.edu.pk</div>
  `;
  document.body.appendChild(win);

  // ── Helper Functions ─────────────────────────────────
  const msgContainer = () => document.getElementById("pafi-messages");
  const inputEl = () => document.getElementById("pafi-input");
  const sendBtn = () => document.getElementById("pafi-send");

  function formatTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function isRTL() {
    return ["ur", "ar"].includes(language);
  }

  function scrollBottom() {
    const c = msgContainer();
    c.scrollTop = c.scrollHeight;
  }

  function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = `pafi-msg-row ${sender}`;

    const rtlClass = isRTL() ? " rtl" : "";

    row.innerHTML = `
      ${sender === "bot" ? '<div class="pafi-msg-label">🎓 PAFI</div>' : ""}
      <div class="pafi-bubble-msg ${sender}${rtlClass}">${text}</div>
      <div class="pafi-time">${formatTime()}</div>
    `;

    msgContainer().appendChild(row);
    scrollBottom();
    messages.push({ sender, text });
  }

  function showTyping() {
    const typing = document.createElement("div");
    typing.id = "pafi-typing-indicator";
    typing.className = "pafi-msg-row bot";
    typing.innerHTML = `
      <div class="pafi-msg-label">🎓 PAFI</div>
      <div class="pafi-typing">
        <div style="display:flex;gap:4px">
          <div class="pafi-dot"></div>
          <div class="pafi-dot"></div>
          <div class="pafi-dot"></div>
        </div>
        <span class="pafi-typing-text">${LANGS[language].typing}</span>
      </div>
    `;
    msgContainer().appendChild(typing);
    scrollBottom();
  }

  function hideTyping() {
    const t = document.getElementById("pafi-typing-indicator");
    if (t) t.remove();
  }

  function renderQuickQuestions() {
    if (!showQuick || messages.length > 1) return;
    const existing = document.getElementById("pafi-quick");
    if (existing) existing.remove();

    const quick = document.createElement("div");
    quick.id = "pafi-quick";
    quick.innerHTML = `<div class="pafi-quick-label">💡 Quick Questions:</div>`;

    LANGS[language].quick.forEach((q) => {
      const btn = document.createElement("button");
      btn.className = "pafi-quick-btn";
      btn.textContent = q;
      btn.onclick = () => sendMessage(q);
      quick.appendChild(btn);
    });

    msgContainer().appendChild(quick);
    scrollBottom();
  }

  function setWelcome() {
    msgContainer().innerHTML = "";
    messages = [];
    showQuick = true;
    addMessage(LANGS[language].welcome, "bot");
    renderQuickQuestions();
  }

  // ── Send Message ─────────────────────────────────────
  async function sendMessage(text) {
    const userMsg = (text || inputEl().value).trim();
    if (!userMsg || loading) return;

    inputEl().value = "";
    showQuick = false;
    const quickEl = document.getElementById("pafi-quick");
    if (quickEl) quickEl.remove();

    addMessage(userMsg, "user");
    loading = true;
    sendBtn().disabled = true;
    showTyping();

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg, language }),
      });
      const data = await res.json();
      hideTyping();
      addMessage(data.answer, "bot");
    } catch {
      hideTyping();
      addMessage(
        "I'm sorry, I'm having trouble connecting. Please contact PAF-IAST at info@paf-iast.edu.pk",
        "bot"
      );
    }

    loading = false;
    sendBtn().disabled = false;
    inputEl().focus();
  }

  // ── Event Listeners ──────────────────────────────────
  bubble.onclick = () => {
    win.classList.add("pafi-open");
    bubble.style.display = "none";
    inputEl().focus();
  };

  document.getElementById("pafi-close").onclick = () => {
    win.classList.remove("pafi-open");
    bubble.style.display = "flex";
  };

  document.getElementById("pafi-lang").onchange = (e) => {
    language = e.target.value;
    inputEl().placeholder = LANGS[language].placeholder;
    setWelcome();
  };

  document.getElementById("pafi-send").onclick = () => sendMessage();

  document.getElementById("pafi-input").onkeypress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // ── Initialize ───────────────────────────────────────
  setWelcome();

})();