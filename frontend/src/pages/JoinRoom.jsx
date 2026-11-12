import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, DoorOpen } from "lucide-react";
import api from "../services/api";

function JoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    const cleanCode = roomCode.trim().toUpperCase();

    if (!cleanCode) {
      setError("Please enter a room code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const room = await api.rooms.get(cleanCode);
      sessionStorage.setItem("debatex_room", JSON.stringify(room));
      sessionStorage.setItem("debatex_roomCode", room.roomCode);

      if (room.status === "COMPLETED") {
        navigate(`/results?code=${room.roomCode}`);
      } else if (room.status === "IN_PROGRESS") {
        navigate(`/debate?code=${room.roomCode}`);
      } else {
        navigate(`/lobby?code=${room.roomCode}`);
      }
    } catch (err) {
      setError(err.message || "Room not found. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="dashboard-page">
      <nav className="dashboard-navbar">
        <button className="back-button" onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={17} />
          BACK TO DASHBOARD
        </button>

        <a href="/dashboard" className="brand">
          DEBATEX<span>.</span>
        </a>

        <div className="nav-status">
          <span className="status-dot"></span>
          ENTER ROOM
        </div>
      </nav>

      <section className="dashboard-content" style={{ maxWidth: "600px", margin: "60px auto" }}>
        <div className="action-card" style={{ padding: "40px" }}>
          <div className="action-icon">
            <DoorOpen size={28} />
          </div>

          <span className="action-label">JOIN DEBATE</span>

          <h2 style={{ fontSize: "36px", marginBottom: "15px" }}>
            ENTER A ROOM<br />CODE.
          </h2>

          <p style={{ color: "#aaa", marginBottom: "25px", fontSize: "14px", lineHeight: "1.6" }}>
            Enter the 6-character room code to join an active debate arena or view completed results.
          </p>

          <form onSubmit={handleJoin}>
            <div className="input-group" style={{ marginBottom: "20px" }}>
              <input
                type="text"
                placeholder="e.g. A9B2K7"
                maxLength={8}
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value.toUpperCase());
                  setError("");
                }}
                style={{
                  width: "100%",
                  padding: "16px",
                  background: "#1c1c1c",
                  border: "1px solid #333",
                  color: "#fff",
                  fontSize: "20px",
                  fontWeight: "700",
                  letterSpacing: "4px",
                  textAlign: "center",
                  textTransform: "uppercase",
                  borderRadius: "4px",
                  outline: "none",
                }}
              />
            </div>

            {error && (
              <p style={{ color: "var(--red)", fontSize: "13px", marginBottom: "15px", textAlign: "center" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={loading || !roomCode.trim()}
              style={{
                width: "100%",
                padding: "16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                background: "var(--red)",
                color: "#fff",
                border: "none",
                fontWeight: "700",
                fontSize: "14px",
                letterSpacing: "1px",
                cursor: "pointer",
              }}
            >
              {loading ? "SEARCHING ROOM..." : "JOIN ARENA"}
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default JoinRoom;
