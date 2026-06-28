import { useState, useRef, useEffect } from "react";
import axios from "axios";

const API_URL = "https://paf-iast-bot-production.up.railway.app";

const LANGUAGES = {
  en: {
    name: "🇬🇧 EN",
    greeting: "Ask me anything about PAF-IAST",
    placeholder: "Type your question here...",
    welcome: "👋 Hello! I'm PAFI, your PAF-IAST AI Assistant! I can help you with admissions, programs, fee structure, scholarships, and much more. How can I assist you today?",
    typing: "PAFI is thinking...",
  },
  ur: {
    name: "🇵🇰 UR",
    greeting: "پافی — آپ کا PAF-IAST اسسٹنٹ",
    placeholder: "اپنا سوال یہاں لکھیں...",
    welcome: "👋 السلام علیکم! میں پافی ہوں، آپ کا PAF-IAST AI اسسٹنٹ! داخلہ، پروگرامز، فیس، اسکالرشپ — کچھ بھی پوچھیں!",
    typing: "پافی سوچ رہا ہے...",
  },
  zh: {
    name: "🇨🇳 ZH",
    greeting: "PAFI — 您的PAF-IAST智能助手",
    placeholder: "在这里输入您的问题...",
    welcome: "👋 你好！我是PAFI，您的PAF-IAST智能助手！关于招生、课程、费用、奖学金，请随时问我！",
    typing: "PAFI正在思考...",
  },
  ar: {
    name: "🇸🇦 AR",
    greeting: "PAFI — مساعدك الذكي في PAF-IAST",
    placeholder: "اكتب سؤالك هنا...",
    welcome: "👋 مرحباً! أنا PAFI، مساعدك الذكي في PAF-IAST! اسألني عن القبول والبرامج والرسوم والمنح!",
    typing: "PAFI يفكر...",
  },
  de: {
    name: "🇩🇪 DE",
    greeting: "PAFI — Ihr PAF-IAST KI-Assistent",
    placeholder: "Geben Sie Ihre Frage hier ein...",
    welcome: "👋 Hallo! Ich bin PAFI, Ihr PAF-IAST KI-Assistent! Fragen Sie mich zu Zulassung, Programmen, Gebühren und Stipendien!",
    typing: "PAFI denkt nach...",
  },
};

const QUICK_QUESTIONS = [
  "What are the admission requirements?",
  "What is the fee structure?",
  "What BS programs are offered?",
  "What scholarships are available?",
  "How to contact PAF-IAST?",
];

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [messages, setMessages] = useState([
    { sender: "bot", text: LANGUAGES.en.welcome, time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [showQuickQ, setShowQuickQ] = useState(true);
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

  const handleLanguageChange = (l) => {
    setLanguage(l);
    setMessages([{ sender: "bot", text: LANGUAGES[l].welcome, time: new Date() }]);
    setShowQuickQ(true);
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const sendMessage = async (text) => {
    const userMessage = (text || input).trim();
    if (!userMessage || loading) return;

    setInput("");
    setShowQuickQ(false);
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
          text: "I'm sorry, I'm having trouble connecting right now. Please try again or contact PAF-IAST at info@paf-iast.edu.pk",
          time: new Date(),
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(26,82,118,0.5); }
          70% { box-shadow: 0 0 0 12px rgba(26,82,118,0); }
          100% { box-shadow: 0 0 0 0 rgba(26,82,118,0); }
        }
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        .msg-text { white-space: pre-wrap; word-break: break-word; }
        .quick-btn:hover { background: #e8f4fd !important; border-color: #2e86c1 !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #2e86c1; border-radius: 4px; }
      `}</style>

      {/* ── Chat Bubble Button ── */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: "62px",
            height: "62px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a5276, #2e86c1)",
            color: "white",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            animation: "pulse 2s infinite",
            zIndex: 10000,
          }}
        >
          <div style={{ fontSize: "24px", lineHeight: 1 }}>🎓</div>
          <div style={{ fontSize: "8px", fontWeight: "bold", marginTop: "2px" }}>PAFI</div>
        </div>
      )}

      {/* ── Chat Window ── */}
      {isOpen && (
        <div style={{
          position: "fixed",
          bottom: isMobile ? "0" : "90px",
          right: "0",
          width: isMobile ? "100vw" : "370px",
          height: isMobile ? "100vh" : "560px",
          background: "white",
          borderRadius: isMobile ? "0" : "20px",
          boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          overflow: "hidden",
        }}>

          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(135deg, #1a5276, #2e86c1)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
            width: "100%",
          }}>
            {/* Left */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              minWidth: 0,
              flex: 1,
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                flexShrink: 0,
              }}>
                🎓
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}>
                  PAFI
                  <span style={{
                    background: "#27ae60",
                    borderRadius: "8px",
                    padding: "1px 5px",
                    fontSize: "8px",
                    fontWeight: "normal",
                  }}>
                    ONLINE
                  </span>
                </div>
                <div style={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: "10px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  PAF-IAST AI Assistant
                </div>
              </div>
            </div>

            {/* Right */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexShrink: 0,
              marginLeft: "8px",
            }}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "6px",
                  padding: "4px 4px",
                  fontSize: "10px",
                  cursor: "pointer",
                  outline: "none",
                  width: "62px",
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
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "6px",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "14px",
                  padding: "4px 8px",
                  flexShrink: 0,
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>
          </div>

          {/* ── Messages ── */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "14px",
            background: "#f5f8ff",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                flexDirection: "column",
                alignItems: msg.sender === "user" ? "flex-end" : "flex-start",
                gap: "2px",
              }}>
                {msg.sender === "bot" && (
                  <div style={{ fontSize: "10px", color: "#888", paddingLeft: "2px" }}>
                    🎓 PAFI
                  </div>
                )}
                <div style={{
                  maxWidth: "82%",
                  padding: "10px 14px",
                  borderRadius: msg.sender === "user"
                    ? "18px 18px 4px 18px"
                    : "18px 18px 18px 4px",
                  background: msg.sender === "user"
                    ? "linear-gradient(135deg, #1a5276, #2e86c1)"
                    : "white",
                  color: msg.sender === "user" ? "white" : "#333",
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: "1.6",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}>
                  <div className="msg-text">{msg.text}</div>
                </div>
                <div style={{
                  fontSize: "9px",
                  color: "#bbb",
                  paddingLeft: msg.sender === "bot" ? "2px" : "0",
                  paddingRight: msg.sender === "user" ? "2px" : "0",
                }}>
                  {formatTime(msg.time)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "2px",
              }}>
                <div style={{ fontSize: "10px", color: "#888", paddingLeft: "2px" }}>
                  🎓 PAFI
                </div>
                <div style={{
                  background: "white",
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}>
                  <div style={{ display: "flex", gap: "4px" }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background: "#2e86c1",
                        animation: `bounce 1.2s ${i * 0.2}s infinite`,
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    {lang.typing}
                  </span>
                </div>
              </div>
            )}

            {/* Quick Questions */}
            {showQuickQ && messages.length <= 1 && (
              <div style={{ marginTop: "4px" }}>
                <div style={{
                  fontSize: "11px",
                  color: "#888",
                  marginBottom: "8px",
                  textAlign: "center",
                }}>
                  💡 Quick Questions:
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {QUICK_QUESTIONS.map((q, i) => (
                    <div
                      key={i}
                      className="quick-btn"
                      onClick={() => sendMessage(q)}
                      style={{
                        background: "white",
                        border: "1px solid #d0e8f7",
                        borderRadius: "12px",
                        padding: "8px 12px",
                        fontSize: "12px",
                        color: "#1a5276",
                        cursor: "pointer",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                      }}
                    >
                      {q}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input ── */}
          <div style={{
            padding: "10px 12px",
            background: "white",
            borderTop: "1px solid #eee",
            display: "flex",
            gap: "8px",
            alignItems: "center",
            flexShrink: 0,
            width: "100%",
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
                padding: "10px 14px",
                borderRadius: "24px",
                border: "1.5px solid #d0e8f7",
                outline: "none",
                fontSize: "13px",
                minWidth: 0,
                background: loading ? "#f9f9f9" : "white",
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{
                background: loading || !input.trim()
                  ? "#ccc"
                  : "linear-gradient(135deg, #1a5276, #2e86c1)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                minWidth: "40px",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                fontSize: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              ➤
            </button>
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "5px",
            background: "white",
            textAlign: "center",
            fontSize: "9px",
            color: "#bbb",
            borderTop: "1px solid #f5f5f5",
            flexShrink: 0,
          }}>
            Powered by PAF-IAST AI • paf-iast.edu.pk
          </div>

        </div>
      )}
    </div>
  );
}