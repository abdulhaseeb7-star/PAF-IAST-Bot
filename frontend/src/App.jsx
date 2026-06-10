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
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
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
      const response = await axios.post("http://localhost:8000/chat", {
        question: userMessage,
      });
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

      {/* PAF-IAST Website as Background */}
      <iframe
        src="https://paf-iast.edu.pk"
        style={{
          width: "100vw",
          height: "100vh",
          border: "none",
          display: "block",
        }}
        title="PAF-IAST Website"
      />

      {/* Chat Bubble Button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          width: "60px",
          height: "60px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #1a5276, #2e86c1)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
          fontSize: "26px",
          zIndex: 9999,
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.target.style.transform = "scale(1.0)")}
      >
        {isOpen ? "✕" : "🎓"}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "100px",
            right: "30px",
            width: "370px",
            height: "500px",
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            zIndex: 9998,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: "linear-gradient(135deg, #1a5276, #2e86c1)",
              color: "white",
              padding: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div style={{ fontSize: "28px" }}>🎓</div>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "15px" }}>
                PAF-IAST Assistant
              </div>
              <div style={{ fontSize: "12px", opacity: 0.85 }}>
                Ask me anything about PAF-IAST
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#f5f8ff",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "10px 14px",
                    borderRadius:
                      msg.sender === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.sender === "user"
                        ? "linear-gradient(135deg, #1a5276, #2e86c1)"
                        : "white",
                    color: msg.sender === "user" ? "white" : "#333",
                    fontSize: "14px",
                    lineHeight: "1.5",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    background: "white",
                    padding: "10px 16px",
                    borderRadius: "16px 16px 16px 4px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    fontSize: "20px",
                    letterSpacing: "2px",
                  }}
                >
                  ●●●
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div
            style={{
              padding: "12px",
              background: "white",
              borderTop: "1px solid #eee",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about admissions, fees..."
              style={{
                flex: 1,
                padding: "10px 14px",
                borderRadius: "24px",
                border: "1px solid #ddd",
                outline: "none",
                fontSize: "14px",
              }}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #1a5276, #2e86c1)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "42px",
                height: "42px",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
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