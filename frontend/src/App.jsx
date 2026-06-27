import { useState, useRef, useEffect } from "react";
import axios from "axios";

export default function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Hi! I'm PAF-IAST Assistant. Ask me anything about admissions, programs, fees, or scholarships!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState("en");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;

  const languages = {
    en: {
      greeting: "Ask me anything about PAF-IAST",
      placeholder: "Ask about admissions, fees...",
      welcome: "👋 Hi! I'm PAF-IAST Assistant. Ask me anything about admissions, programs, fees, or scholarships!",
    },
    ur: {
      greeting: "پی اے ایف آئی اے ایس ٹی کے بارے میں پوچھیں",
      placeholder: "داخلہ، فیس کے بارے میں پوچھیں...",
      welcome: "👋 السلام علیکم! میں PAF-IAST اسسٹنٹ ہوں۔ داخلہ، پروگرامز، فیس یا اسکالرشپ کے بارے میں پوچھیں!",
    },
    zh: {
      greeting: "询问有关PAF-IAST的任何问题",
      placeholder: "询问招生、费用...",
      welcome: "👋 你好！我是PAF-IAST助手。请询问有关招生、课程、费用或奖学金的任何问题！",
    },
    ar: {
      greeting: "اسأل عن أي شيء يتعلق بـ PAF-IAST",
      placeholder: "اسأل عن القبول والرسوم...",
      welcome: "👋 مرحباً! أنا مساعد PAF-IAST. اسأل عن القبول والبرامج والرسوم أو المنح الدراسية!",
    },
    de: {
      greeting: "Fragen Sie alles über PAF-IAST",
      placeholder: "Fragen zu Zulassung, Gebühren...",
      welcome: "👋 Hallo! Ich bin der PAF-IAST Assistent. Fragen Sie mich alles über Zulassung, Programme, Gebühren oder Stipendien!",
    },
  };

  const selectedLang = languages[language];

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setMessages([{ sender: "bot", text: languages[lang].welcome }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post(
        "https://paf-iast-bot-production.up.railway.app/chat",
        { question: userMessage, language: language }
      );
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.data.answer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, I'm having trouble connecting. Please try again." },
      ]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Chat window size — floating on both mobile and desktop
  const chatStyle = {
    position: "fixed",
    bottom: "90px",
    right: "24px",
    width: isMobile ? "calc(100vw - 32px)" : "350px",
    height: isMobile ? "60vh" : "500px",
    maxWidth: "100vw",
    background: "white",
    borderRadius: "16px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.25)",
    display: "flex",
    flexDirection: "column",
    zIndex: 9999,
    overflow: "hidden",
  };

  return (
    <div>
      {/* Floating Chat Bubble Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: isMobile ? "52px" : "60px",
          height: isMobile ? "52px" : "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a5276, #2e86c1)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
          fontSize: isMobile ? "22px" : "26px",
          zIndex: 10000,
        }}
      >
        {isOpen ? "✕" : "🎓"}
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div style={chatStyle}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1a5276, #2e86c1)",
            color: "white",
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ fontSize: "22px" }}>🎓</div>
              <div>
                <div style={{
                  fontWeight: "bold",
                  fontSize: isMobile ? "13px" : "15px"
                }}>
                  PAF-IAST Assistant
                </div>
                <div style={{
                  fontSize: "10px",
                  opacity: 0.85,
                  maxWidth: isMobile ? "140px" : "180px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}>
                  {selectedLang.greeting}
                </div>
              </div>
            </div>

            {/* Language + Close */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "6px",
                  padding: "3px 5px",
                  fontSize: "10px",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="en" style={{ color: "black" }}>🇬🇧 EN</option>
                <option value="ur" style={{ color: "black" }}>🇵🇰 UR</option>
                <option value="zh" style={{ color: "black" }}>🇨🇳 ZH</option>
                <option value="ar" style={{ color: "black" }}>🇸🇦 AR</option>
                <option value="de" style={{ color: "black" }}>🇩🇪 DE</option>
              </select>

              <div
                onClick={() => setIsOpen(false)}
                style={{
                  cursor: "pointer",
                  fontSize: "16px",
                  padding: "2px 6px",
                  opacity: 0.9,
                }}
              >
                ✕
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "12px",
            background: "#f5f8ff",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "9px 13px",
                  borderRadius: msg.sender === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background: msg.sender === "user"
                    ? "linear-gradient(135deg, #1a5276, #2e86c1)"
                    : "white",
                  color: msg.sender === "user" ? "white" : "#333",
                  fontSize: isMobile ? "12px" : "14px",
                  lineHeight: "1.6",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  wordBreak: "break-word",
                  textAlign: "left",
                  whiteSpace: "pre-wrap",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "white",
                  padding: "10px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                  fontSize: "16px",
                  letterSpacing: "2px",
                }}>
                  ●●●
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{
            padding: "10px 12px",
            background: "white",
            borderTop: "1px solid #eee",
            display: "flex",
            gap: "8px",
            flexShrink: 0,
            boxSizing: "border-box",
            width: "100%",
          }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedLang.placeholder}
              style={{
                flex: 1,
                padding: "9px 14px",
                borderRadius: "24px",
                border: "1px solid #ddd",
                outline: "none",
                fontSize: isMobile ? "13px" : "14px",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                background: loading
                  ? "#ccc"
                  : "linear-gradient(135deg, #1a5276, #2e86c1)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                minWidth: "40px",
                cursor: loading ? "not-allowed" : "pointer",
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
        </div>
      )}
    </div>
  );
}