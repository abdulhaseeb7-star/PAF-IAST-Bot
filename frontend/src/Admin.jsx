import { useState } from "react";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [logs, setLogs] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  const API = "https://paf-iast-bot-production.up.railway.app";

  const handleLogin = async () => {
    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (data.success) {
        setLoggedIn(true);
        setError("");
      } else {
        setError("❌ Wrong password. Try again.");
      }
    } catch {
      setError("❌ Could not connect to server.");
    }
  };

  const steps = [
    { id: 1, label: "Web Scraper", desc: "Scraping 20 PAF-IAST pages", icon: "🕷️" },
    { id: 2, label: "PDF Scraper", desc: "Extracting 13 PDFs", icon: "📄" },
    { id: 3, label: "Knowledge Base", desc: "Rebuilding 776 vectors", icon: "🧠" },
  ];

  const addLog = (msg, type = "info") => {
    const time = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { msg, type, time }]);
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setDone(false);
    setLogs([]);
    setProgress(0);
    setCurrentStep("Starting...");

    addLog("🚀 Starting bot update process...", "info");
    addLog("📡 Connecting to Railway backend...", "info");

    try {
      const response = await fetch(`${API}/admin/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        addLog("❌ Server returned error. Check Railway logs.", "error");
        setUpdating(false);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let stepCount = 0;

      addLog("✅ Connected to server successfully!", "success");

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        const text = decoder.decode(value);
        const lines = text.split("\n").filter((l) => l.startsWith("data: "));

        for (const line of lines) {
          const msg = line.replace("data: ", "").trim();
          if (!msg) continue;

          if (msg === "DONE") {
            setProgress(100);
            setCurrentStep("Complete!");
            setDone(true);
            setUpdating(false);
            addLog("🎉 All steps completed successfully!", "success");
            addLog("✅ Bot is now updated with latest PAF-IAST data!", "success");
          } else {
            // Update progress based on message content
            if (msg.includes("scraper.py") || msg.includes("Web Scraper")) {
              stepCount = 1;
              setProgress(10);
              setCurrentStep("Running Web Scraper...");
            } else if (msg.includes("pdf_scraper") || msg.includes("PDF")) {
              stepCount = 2;
              setProgress(40);
              setCurrentStep("Running PDF Scraper...");
            } else if (msg.includes("knowledge_base") || msg.includes("Knowledge")) {
              stepCount = 3;
              setProgress(70);
              setCurrentStep("Rebuilding Knowledge Base...");
            } else if (msg.includes("✅")) {
              setProgress(Math.min((stepCount / 3) * 100, 95));
            }

            const type = msg.includes("❌") ? "error"
                       : msg.includes("✅") ? "success"
                       : msg.includes("⏳") ? "warning"
                       : "info";
            addLog(msg, type);
          }
        }
      }
    } catch (err) {
      addLog(`❌ Connection error: ${err.message}`, "error");
      addLog("💡 Tip: Check if Railway backend is running", "warning");
      setUpdating(false);
    }
  };

  const logColor = (type) => {
    if (type === "error") return "#ff6b6b";
    if (type === "success") return "#51cf66";
    if (type === "warning") return "#ffd43b";
    return "#a0c4ff";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a5276, #2e86c1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif",
      padding: "20px",
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "36px",
        width: "100%",
        maxWidth: "520px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px" }}>🎓</div>
          <h2 style={{ color: "#1a5276", margin: "10px 0 4px", fontSize: "22px" }}>
            PAF-IAST Bot Admin
          </h2>
          <p style={{ color: "#888", fontSize: "13px", margin: 0 }}>
            Manage and update your chatbot knowledge base
          </p>
        </div>

        {!loggedIn ? (
          // LOGIN
          <div>
            <p style={{ color: "#555", fontSize: "13px", marginBottom: "10px" }}>
              🔒 Enter admin password to continue
            </p>
            <input
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ddd",
                fontSize: "14px",
                marginBottom: "12px",
                boxSizing: "border-box",
                outline: "none",
              }}
            />
            {error && (
              <p style={{ color: "red", fontSize: "13px", marginBottom: "10px" }}>
                {error}
              </p>
            )}
            <button
              onClick={handleLogin}
              style={{
                width: "100%",
                padding: "12px",
                background: "linear-gradient(135deg, #1a5276, #2e86c1)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Login →
            </button>
          </div>

        ) : (

          // ADMIN PANEL
          <div>
            <p style={{ color: "green", fontSize: "13px", marginBottom: "20px" }}>
              ✅ Logged in successfully!
            </p>

            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "24px",
            }}>
              {[
                { label: "Web Pages", value: "20" },
                { label: "PDFs", value: "13" },
                { label: "Chunks", value: "776" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "#f0f7ff",
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center",
                }}>
                  <div style={{ fontSize: "22px", fontWeight: "bold", color: "#1a5276" }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Steps */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}>
              {steps.map((step, i) => {
                const isActive = currentStep.toLowerCase().includes(step.label.toLowerCase().split(" ")[0].toLowerCase());
                const isDone = progress >= ((i + 1) / steps.length) * 100;
                return (
                  <div key={step.id} style={{
                    flex: 1,
                    textAlign: "center",
                    padding: "10px 4px",
                    borderRadius: "8px",
                    background: isDone ? "#d4edda" : isActive ? "#fff3cd" : "#f8f9fa",
                    margin: "0 4px",
                    border: `1px solid ${isDone ? "#c3e6cb" : isActive ? "#ffc107" : "#dee2e6"}`,
                    transition: "all 0.3s",
                  }}>
                    <div style={{ fontSize: "20px" }}>{step.icon}</div>
                    <div style={{ fontSize: "10px", fontWeight: "bold", color: "#333", marginTop: "4px" }}>
                      {step.label}
                    </div>
                    <div style={{ fontSize: "9px", color: "#888" }}>{step.desc}</div>
                    <div style={{ fontSize: "11px", marginTop: "4px" }}>
                      {isDone ? "✅" : isActive ? "⏳" : "⬜"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            {(updating || done) && (
              <div style={{ marginBottom: "16px" }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  color: "#555",
                  marginBottom: "6px",
                }}>
                  <span>{currentStep}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div style={{
                  width: "100%",
                  height: "10px",
                  background: "#eee",
                  borderRadius: "10px",
                  overflow: "hidden",
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: "100%",
                    background: "linear-gradient(135deg, #1a5276, #2e86c1)",
                    borderRadius: "10px",
                    transition: "width 0.5s ease",
                  }} />
                </div>
              </div>
            )}

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              disabled={updating}
              style={{
                width: "100%",
                padding: "14px",
                background: updating ? "#ccc" : "linear-gradient(135deg, #1a5276, #2e86c1)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: updating ? "not-allowed" : "pointer",
                fontWeight: "bold",
                marginBottom: "16px",
              }}
            >
              {updating ? `⏳ ${currentStep}` : "🔄 Update Bot"}
            </button>

            {/* Live Logs */}
            {logs.length > 0 && (
              <div>
                <div style={{
                  fontSize: "12px",
                  color: "#555",
                  marginBottom: "6px",
                  fontWeight: "bold",
                }}>
                  📋 Live Logs:
                </div>
                <div style={{
                  background: "#1a1a2e",
                  borderRadius: "8px",
                  padding: "12px",
                  maxHeight: "220px",
                  overflowY: "auto",
                }}>
                  {logs.map((log, i) => (
                    <div key={i} style={{
                      color: logColor(log.type),
                      fontSize: "12px",
                      marginBottom: "4px",
                      fontFamily: "monospace",
                      display: "flex",
                      gap: "8px",
                    }}>
                      <span style={{ opacity: 0.5, flexShrink: 0 }}>{log.time}</span>
                      <span>{log.msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success */}
            {done && (
              <div style={{
                marginTop: "16px",
                padding: "14px",
                background: "#d4edda",
                borderRadius: "8px",
                color: "#155724",
                fontSize: "14px",
                textAlign: "center",
                fontWeight: "bold",
              }}>
                🎉 Bot updated successfully with latest PAF-IAST data!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}