import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "https://paf-iast-bot-production.up.railway.app";

const LANGUAGES = {
  en: {
    name: "🇬🇧 EN",
    placeholder: "Type your question here...",
    welcome: "👋 Hello! I'm PAFI, your PAF-IAST AI Assistant! I can help you with admissions, programs, fee structure, scholarships, and much more. How can I assist you today?",
    typing: "PAFI is thinking...",
    quickTitle: "💡 Quick Questions",
    historyTitle: "Recent Questions",
  },
  ur: {
    name: "🇵🇰 UR",
    placeholder: "اپنا سوال یہاں لکھیں...",
    welcome: "👋 السلام علیکم! میں پافی ہوں، آپ کا PAF-IAST AI اسسٹنٹ!",
    typing: "پافی سوچ رہا ہے...",
    quickTitle: "💡 فوری سوالات",
    historyTitle: "پچھلے سوالات",
  },
  zh: {
    name: "🇨🇳 ZH",
    placeholder: "在这里输入您的问题...",
    welcome: "👋 你好！我是PAFI，您的PAF-IAST智能助手！",
    typing: "PAFI正在思考...",
    quickTitle: "💡 快速问题",
    historyTitle: "最近的问题",
  },
  ar: {
    name: "🇸🇦 AR",
    placeholder: "اكتب سؤالك هنا...",
    welcome: "👋 مرحباً! أنا PAFI، مساعدك الذكي في PAF-IAST!",
    typing: "PAFI يفكر...",
    quickTitle: "💡 أسئلة سريعة",
    historyTitle: "الأسئلة الأخيرة",
  },
  de: {
    name: "🇩🇪 DE",
    placeholder: "Geben Sie Ihre Frage hier ein...",
    welcome: "👋 Hallo! Ich bin PAFI, Ihr PAF-IAST KI-Assistent!",
    typing: "PAFI denkt nach...",
    quickTitle: "💡 Schnellfragen",
    historyTitle: "Letzte Fragen",
  },
};

const QUICK_QUESTIONS = {
  en: [
    { icon: "💰", text: "What is the fee structure for BS programs?" },
    { icon: "📋", text: "What are the admission requirements?" },
    { icon: "🎓", text: "What BS programs are offered?" },
    { icon: "🏆", text: "What scholarships are available?" },
    { icon: "📅", text: "When does the admission open for Fall 2026?" },
    { icon: "📞", text: "How to contact PAF-IAST?" },
    { icon: "🏠", text: "Is hostel facility available?" },
    { icon: "🔬", text: "What research centers does PAF-IAST have?" },
    { icon: "🌍", text: "What international collaborations does PAF-IAST have?" },
    { icon: "✅", text: "Are PAF-IAST programs PEC accredited?" },
  ],
  ur: [
    { icon: "💰", text: "BS پروگرامز کی فیس کتنی ہے؟" },
    { icon: "📋", text: "داخلہ کی ضروریات کیا ہیں؟" },
    { icon: "🎓", text: "کون سے BS پروگرامز ہیں؟" },
    { icon: "🏆", text: "اسکالرشپ کیسے ملے گی؟" },
    { icon: "📅", text: "فال 2026 داخلہ کب شروع ہوگا؟" },
    { icon: "📞", text: "PAF-IAST سے رابطہ کیسے کریں؟" },
    { icon: "🏠", text: "ہاسٹل کی سہولت ہے؟" },
    { icon: "✅", text: "کیا PAF-IAST پروگرامز PEC سے منظور ہیں؟" },
  ],
  zh: [
    { icon: "💰", text: "学士课程的学费是多少？" },
    { icon: "📋", text: "入学要求是什么？" },
    { icon: "🎓", text: "提供哪些学士课程？" },
    { icon: "🏆", text: "有哪些奖学金？" },
    { icon: "📞", text: "如何联系PAF-IAST？" },
    { icon: "🏠", text: "有宿舍设施吗？" },
    { icon: "✅", text: "PAF-IAST课程获得认证了吗？" },
  ],
  ar: [
    { icon: "💰", text: "ما هي رسوم البرامج؟" },
    { icon: "📋", text: "ما هي متطلبات القبول؟" },
    { icon: "🎓", text: "ما هي البرامج المتاحة؟" },
    { icon: "🏆", text: "ما هي المنح الدراسية؟" },
    { icon: "📞", text: "كيف أتواصل مع PAF-IAST؟" },
    { icon: "✅", text: "هل البرامج معتمدة؟" },
  ],
  de: [
    { icon: "💰", text: "Wie hoch sind die Studiengebühren?" },
    { icon: "📋", text: "Was sind die Zulassungsvoraussetzungen?" },
    { icon: "🎓", text: "Welche Bachelor-Programme gibt es?" },
    { icon: "🏆", text: "Welche Stipendien gibt es?" },
    { icon: "📞", text: "Wie kontaktiere ich PAF-IAST?" },
    { icon: "✅", text: "Sind die Programme akkreditiert?" },
  ],
};

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    { sender: "bot", text: LANGUAGES.en.welcome, time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const isMobile = windowWidth < 768;
  const lang = LANGUAGES[language];
  const quickQs = QUICK_QUESTIONS[language] || QUICK_QUESTIONS.en;

  const handleLanguageChange = (l) => {
    setLanguage(l);
    setMessages([{ sender: "bot", text: LANGUAGES[l].welcome, time: new Date() }]);
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const sendMessage = async (text) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading) return;
    setInput("");
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage, time: new Date() },
    ]);
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/chat`, {
        question: userMessage,
        language,
      });
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.data.answer, time: new Date() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "I'm sorry, I'm having trouble connecting. Please try again or contact PAF-IAST at info@paf-iast.edu.pk",
          time: new Date(),
        },
      ]);
    }
    setLoading(false);
  };

  const renderText = (text) => ({
    __html: text
      .replace(
        /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:#1c1b3b;font-weight:bold;text-decoration:underline;">🔗 $1 ↗</a>'
      )
      .replace(
        /(https?:\/\/[^\s<)"']+)/g,
        '<a href="$1" target="_blank" rel="noopener noreferrer" style="color:#1c1b3b;font-weight:bold;text-decoration:underline;word-break:break-all;">$1 ↗</a>'
      )
      .replace(/\n/g, "<br/>")
  });

  return (
    <div>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(28,27,59,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(28,27,59,0); }
          100% { box-shadow: 0 0 0 0 rgba(28,27,59,0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.97); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .pafi-fullscreen { animation: fadeIn 0.2s ease; }
        .quick-btn:hover {
          background: #f0f0f8 !important;
          border-color: #1c1b3b !important;
          transform: translateX(3px);
        }
        .quick-btn { transition: all 0.15s ease; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: #1c1b3b; border-radius: 4px; }
        .msg-link a {
          color: #1c1b3b;
          font-weight: bold;
          text-decoration: underline;
        }
      `}</style>

      {/* ── Floating Bubble ── */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "65px",
            height: "65px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1c1b3b, #2c2b5e)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            animation: "pulse 2s infinite",
            zIndex: 10000,
            boxShadow: "0 4px 20px rgba(28,27,59,0.4)",
          }}
        >
          <div style={{ fontSize: "26px", lineHeight: 1 }}>🎓</div>
          <div style={{ fontSize: "8px", fontWeight: "bold", marginTop: "2px" }}>
            PAFI
          </div>
        </div>
      )}

      {/* ── Full Screen Chat ── */}
      {isOpen && (
        <div
          className="pafi-fullscreen"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#f0f0f8",
            zIndex: 99999,
            display: "flex",
            flexDirection: "column",
          }}
        >

          {/* ── Top Header Bar ── */}
          <div style={{
            background: "linear-gradient(135deg, #1c1b3b, #2c2b5e)",
            color: "white",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          }}>
            {/* Left — Logo + Name */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "42px",
                height: "42px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "22px",
              }}>
                🎓
              </div>
              <div>
                <div style={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  PAFI — PAF-IAST AI Assistant
                  <span style={{
                    background: "#27ae60",
                    borderRadius: "10px",
                    padding: "2px 8px",
                    fontSize: "10px",
                    fontWeight: "normal",
                  }}>
                    ONLINE
                  </span>
                </div>
                <div style={{ fontSize: "11px", opacity: 0.8 }}>
                  Powered by PAF-IAST AI • paf-iast.edu.pk
                </div>
              </div>
            </div>

            {/* Right — Language + Close */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  padding: "6px 10px",
                  fontSize: "12px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                {Object.entries(LANGUAGES).map(([code, l]) => (
                  <option key={code} value={code} style={{ color: "black" }}>
                    {l.name}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "6px 14px",
                  fontWeight: "bold",
                }}
              >
                ✕ Close
              </button>
            </div>
          </div>

          {/* ── Main Content ── */}
          <div style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            gap: "0",
          }}>

            {/* ── Left — Quick Questions Panel ── */}
            {!isMobile && (
              <div style={{
                width: "280px",
                flexShrink: 0,
                background: "white",
                borderRight: "1px solid #e0e0ee",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
                {/* Quick Questions Header */}
                <div style={{
                  padding: "16px",
                  borderBottom: "1px solid #e0e0ee",
                  background: "#f8f8fc",
                }}>
                  <div style={{
                    fontWeight: "bold",
                    color: "#1c1b3b",
                    fontSize: "13px",
                  }}>
                    {lang.quickTitle}
                  </div>
                  <div style={{
                    fontSize: "11px",
                    color: "#888",
                    marginTop: "2px",
                  }}>
                    Click any question to ask
                  </div>
                </div>

                {/* Quick Questions List */}
                <div style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "10px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}>
                  {quickQs.map((q, i) => (
                    <div
                      key={i}
                      className="quick-btn"
                      onClick={() => sendMessage(q.text)}
                      style={{
                        background: "white",
                        border: "1px solid #e0e0ee",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        fontSize: "12px",
                        color: "#1c1b3b",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "8px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                      }}
                    >
                      <span style={{ fontSize: "16px", flexShrink: 0 }}>
                        {q.icon}
                      </span>
                      <span style={{ lineHeight: "1.4" }}>{q.text}</span>
                    </div>
                  ))}
                </div>

                {/* Contact Footer */}
                <div style={{
                  padding: "12px 16px",
                  borderTop: "1px solid #e0e0ee",
                  background: "#f8f8fc",
                  fontSize: "11px",
                  color: "#666",
                }}>
                  <div style={{ fontWeight: "bold", color: "#1c1b3b", marginBottom: "4px" }}>
                    📞 Direct Contact:
                  </div>
                  <div>0995-111 723 278</div>
                  <div>info@paf-iast.edu.pk</div>
                </div>
              </div>
            )}

            {/* ── Right — Chat Area ── */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              background: "#f5f5fc",
            }}>

              {/* Messages */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: isMobile ? "16px" : "24px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxWidth: "800px",
                width: "100%",
                margin: "0 auto",
              }}>

                {messages.map((msg, i) => (
                  <div key={i} style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                    gap: "4px",
                  }}>
                    {msg.sender === "bot" && (
                      <div style={{
                        fontSize: "11px",
                        color: "#888",
                        paddingLeft: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}>
                        🎓 PAFI
                      </div>
                    )}
                    {msg.sender === "user" && (
                      <div style={{
                        fontSize: "11px",
                        color: "#888",
                        paddingRight: "4px",
                      }}>
                        You
                      </div>
                    )}
                    <div style={{
                      maxWidth: isMobile ? "88%" : "70%",
                      padding: "12px 16px",
                      borderRadius: msg.sender === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                      background: msg.sender === "user"
                        ? "linear-gradient(135deg, #1c1b3b, #2c2b5e)"
                        : "white",
                      color: msg.sender === "user" ? "white" : "#333",
                      fontSize: isMobile ? "13px" : "14px",
                      lineHeight: "1.7",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                      wordBreak: "break-word",
                    }}>
                      <div
                        className="msg-link"
                        dangerouslySetInnerHTML={renderText(msg.text)}
                      />
                    </div>
                    <div style={{
                      fontSize: "10px",
                      color: "#bbb",
                      paddingLeft: msg.sender === "bot" ? "4px" : "0",
                      paddingRight: msg.sender === "user" ? "4px" : "0",
                    }}>
                      {formatTime(msg.time)}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {loading && (
                  <div style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: "4px",
                  }}>
                    <div style={{ fontSize: "11px", color: "#888", paddingLeft: "4px" }}>
                      🎓 PAFI
                    </div>
                    <div style={{
                      background: "white",
                      padding: "12px 18px",
                      borderRadius: "18px 18px 18px 4px",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {[0, 1, 2].map((i) => (
                          <div key={i} style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#1c1b3b",
                            animation: `bounce 1.2s ${i * 0.2}s infinite`,
                          }} />
                        ))}
                      </div>
                      <span style={{ fontSize: "13px", color: "#888" }}>
                        {lang.typing}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mobile Quick Questions */}
                {isMobile && messages.length <= 1 && (
                  <div style={{ marginTop: "8px" }}>
                    <div style={{
                      fontSize: "12px",
                      color: "#888",
                      marginBottom: "10px",
                      textAlign: "center",
                    }}>
                      {lang.quickTitle}
                    </div>
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}>
                      {quickQs.slice(0, 5).map((q, i) => (
                        <div
                          key={i}
                          className="quick-btn"
                          onClick={() => sendMessage(q.text)}
                          style={{
                            background: "white",
                            border: "1px solid #e0e0ee",
                            borderRadius: "10px",
                            padding: "10px 12px",
                            fontSize: "13px",
                            color: "#1c1b3b",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <span>{q.icon}</span>
                          <span>{q.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ── Input Area ── */}
              <div style={{
                padding: isMobile ? "12px" : "16px 32px",
                background: "white",
                borderTop: "1px solid #e0e0ee",
                display: "flex",
                gap: "10px",
                alignItems: "center",
                maxWidth: "800px",
                width: "100%",
                margin: "0 auto",
                boxSizing: "border-box",
              }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={lang.placeholder}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px 18px",
                    borderRadius: "30px",
                    border: "1.5px solid #d0d0e8",
                    outline: "none",
                    fontSize: "14px",
                    minWidth: 0,
                    background: loading ? "#f9f9f9" : "white",
                    direction: ["ur", "ar"].includes(language) ? "rtl" : "ltr",
                  }}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim()}
                  style={{
                    background: loading || !input.trim()
                      ? "#ccc"
                      : "linear-gradient(135deg, #1c1b3b, #2c2b5e)",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "46px",
                    height: "46px",
                    minWidth: "46px",
                    cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                    fontSize: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ➤
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}