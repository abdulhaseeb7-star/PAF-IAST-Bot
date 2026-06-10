import { useState } from "react";
import axios from "axios";

export default function Admin() {
  const [password, setPassword] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [logs, setLogs] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8000/admin/login", {
        password,
      });
      if (res.data.success) {
        setLoggedIn(true);
        setError("");
      } else {
        setError("❌ Wrong password. Try again.");
      }
    } catch {
      setError("❌ Could not connect to server.");
    }
  };

  const handleUpdate = async () => {
    setUpdating(true);
    setDone(false);
    setLogs(["🚀 Starting bot update..."]);

    const response = await fetch("http://localhost:8000/admin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done: streamDone, value } = await reader.read();
      if (streamDone) break;

      const text = decoder.decode(value);
      const lines = text.split("\n").filter((l) => l.startsWith("data: "));

      for (const line of lines) {
        const msg = line.replace("data: ", "").trim();
        if (msg === "DONE") {
          setDone(true);
          setUpdating(false);
        } else {
          setLogs((prev) => [...prev, msg]);
        }
      }
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a5276, #2e86c1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Arial, sans-serif"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        width: "480px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.2)"
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "40px" }}>🎓</div>
          <h2 style={{ color: "#1a5276", margin: "10px 0 5px" }}>
            PAF-IAST Bot Admin
          </h2>
          <p style={{ color: "#888", fontSize: "14px", margin: 0 }}>
            Manage and update your chatbot
          </p>
        </div>

        {/* Login Form */}
        {!loggedIn ? (
          <div>
            <p style={{ color: "#555", marginBottom: "10px", fontSize: "14px" }}>
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
                boxSizing: "border-box"
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
                fontWeight: "bold"
              }}
            >
              Login →
            </button>
          </div>

        ) : (

          // Admin Panel
          <div>
            <p style={{ color: "green", fontSize: "14px", marginBottom: "20px" }}>
              ✅ Logged in successfully!
            </p>

            {/* Stats */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "10px",
              marginBottom: "24px"
            }}>
              {[
                { label: "Pages", value: "20" },
                { label: "PDFs", value: "13" },
                { label: "Chunks", value: "776" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  background: "#f0f7ff",
                  borderRadius: "10px",
                  padding: "12px",
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: "22px",
                    fontWeight: "bold",
                    color: "#1a5276"
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ fontSize: "12px", color: "#888" }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Update Button */}
            <button
              onClick={handleUpdate}
              disabled={updating}
              style={{
                width: "100%",
                padding: "14px",
                background: updating
                  ? "#ccc"
                  : "linear-gradient(135deg, #1a5276, #2e86c1)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "15px",
                cursor: updating ? "not-allowed" : "pointer",
                fontWeight: "bold",
                marginBottom: "16px"
              }}
            >
              {updating ? "⏳ Updating Bot..." : "🔄 Update Bot"}
            </button>

            {/* Live Logs */}
            {logs.length > 0 && (
              <div style={{
                background: "#1a1a2e",
                borderRadius: "8px",
                padding: "16px",
                maxHeight: "200px",
                overflowY: "auto"
              }}>
                {logs.map((log, i) => (
                  <div key={i} style={{
                    color: log.includes("❌") ? "#ff6b6b" :
                           log.includes("✅") ? "#51cf66" :
                           log.includes("🎉") ? "#ffd43b" : "#a0c4ff",
                    fontSize: "13px",
                    marginBottom: "4px",
                    fontFamily: "monospace"
                  }}>
                    {log}
                  </div>
                ))}
              </div>
            )}

            {/* Success Message */}
            {done && (
              <div style={{
                marginTop: "16px",
                padding: "12px",
                background: "#d4edda",
                borderRadius: "8px",
                color: "#155724",
                fontSize: "14px",
                textAlign: "center"
              }}>
                🎉 Bot successfully updated with latest PAF-IAST data!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}