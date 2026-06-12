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

  // Track window size for responsive design
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
        {
          question: userMessage,
          language: language,
        }
      );
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: response.data.answer },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    }
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif" }}>

      {/* Background */}
      <div style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(135deg, #1a5276 0%, #2e86c1 50%, #1a5276 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? "14px" : "20px",
        padding: "20px",
        boxSizing: "border-box",
        overflowX: "hidden",
      }}>

        {/* Logo */}
        <img
          src="https://paf-iast.edu.pk/wp-content/uploads/2021/03/logo.png"
          alt="PAF-IAST Logo"
          style={{
            width: isMobile ? "120px" : "180px",
            filter: "brightness(0) invert(1)"
          }}
          onError={(e) => e.target.style.display = "none"}
        />

        {/* University Name */}
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{
            fontSize: isMobile ? "22px" : "28px",
            fontWeight: "bold",
            letterSpacing: "1px",
            textShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}>
            PAF-IAST
          </div>
          <div style={{
            fontSize: isMobile ? "12px" : "14px",
            opacity: 0.85,
            marginTop: "6px",
            maxWidth: "320px",
            lineHeight: "1.5",
            padding: "0 10px"
          }}>
            Pak-Austria Fachhochschule: Institute of Applied Sciences & Technology
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: "60px",
          height: "3px",
          background: "rgba(255,255,255,0.5)",
          borderRadius: "2px"
        }} />

        {/* Quick Links */}
        <div style={{
          display: "flex",
          gap: isMobile ? "8px" : "16px",
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "0 16px",
        }}>
          {["Admissions", "Programs", "Fee Structure", "Scholarships", "Contact"].map((link) => (
            <div key={link} style={{
              background: "rgba(255,255,255,0.15)",
              color: "white",
              padding: isMobile ? "6px 12px" : "8px 18px",
              borderRadius: "20px",
              fontSize: isMobile ? "11px" : "13px",
              cursor: "pointer",
              backdropFilter: "blur(4px)",
              border: "1px solid rgba(255,255,255,0.2)"
            }}>
              {link}
            </div>
          ))}
        </div>

        {/* Chat Hint */}
        <div style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: isMobile ? "12px" : "13px",
          marginTop: "6px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          textAlign: "center",
          padding: "0 20px"
        }}>
          <span>🎓</span>
          <span>Click the chat button to ask our AI Assistant anything!</span>
        </div>
      </div>

      {/* Chat Bubble Button — only show when chat is closed */}
      {!isOpen && (
        <div
          onClick={() => setIsOpen(true)}
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            width: isMobile ? "54px" : "60px",
            height: isMobile ? "54px" : "60px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1a5276, #2e86c1)",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
            fontSize: "24px",
            zIndex: 9999,
          }}
        >
          🎓
        </div>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div style={{
          position: "fixed",
          top: isMobile ? "0" : "auto",
          bottom: isMobile ? "0" : "90px",
          left: isMobile ? "0" : "auto",
          right: isMobile ? "0" : "24px",
          width: isMobile ? "100vw" : "370px",
          height: isMobile ? "100vh" : "520px",
          background: "white",
          borderRadius: isMobile ? "0" : "16px",
          boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          zIndex: 9999,
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg, #1a5276, #2e86c1)",
            color: "white",
            padding: "14px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ fontSize: "24px" }}>🎓</div>
              <div>
                <div style={{ fontWeight: "bold", fontSize: isMobile ? "14px" : "15px" }}>
                  PAF-IAST Assistant
                </div>
                <div style={{
                  fontSize: "11px",
                  opacity: 0.85,
                  maxWidth: isMobile ? "160px" : "200px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {selectedLang.greeting}
                </div>
              </div>
            </div>

            {/* Right side — Language + Close */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.4)",
                  borderRadius: "8px",
                  padding: "4px 6px",
                  fontSize: "11px",
                  cursor: "pointer",
                  outline: "none",
                  maxWidth: isMobile ? "70px" : "100px",
                }}
              >
                <option value="en" style={{ color: "black" }}>🇬🇧 EN</option>
                <option value="ur" style={{ color: "black" }}>🇵🇰 UR</option>
                <option value="zh" style={{ color: "black" }}>🇨🇳 ZH</option>
                <option value="ar" style={{ color: "black" }}>🇸🇦 AR</option>
                <option value="de" style={{ color: "black" }}>🇩🇪 DE</option>
              </select>

              {/* Close Button */}
              <div
                onClick={() => setIsOpen(false)}
                style={{
                  cursor: "pointer",
                  fontSize: "18px",
                  padding: "4px 6px",
                  opacity: 0.9,
                  lineHeight: 1,
                }}
              >
                ✕
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px",
            background: "#f5f8ff",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              }}>
                <div style={{
                  maxWidth: "80%",
                  padding: "10px 14px",
                  borderRadius: msg.sender === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
                  background: msg.sender === "user"
                    ? "linear-gradient(135deg, #1a5276, #2e86c1)"
                    : "white",
                  color: msg.sender === "user" ? "white" : "#333",
                  fontSize: isMobile ? "13px" : "14px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  wordBreak: "break-word",
                }}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  background: "white",
                  padding: "10px 16px",
                  borderRadius: "16px 16px 16px 4px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  fontSize: "18px",
                  letterSpacing: "2px",
                }}>
                  ●●●
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div style={{
            padding: "12px",
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
                padding: "10px 14px",
                borderRadius: "24px",
                border: "1px solid #ddd",
                outline: "none",
                fontSize: "14px",
                minWidth: 0,
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                background: loading ? "#ccc" : "linear-gradient(135deg, #1a5276, #2e86c1)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "42px",
                height: "42px",
                minWidth: "42px",
                cursor: loading ? "not-allowed" : "pointer",
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
      )}
    </div>
  );
}