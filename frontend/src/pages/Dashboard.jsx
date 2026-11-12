import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, Plus, DoorOpen, History, Clock } from "lucide-react";
import api from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("debatex_user") || "{}");
    } catch {
      return {};
    }
  });

  const [recentRooms, setRecentRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    // Refresh user profile
    api.auth.me()
      .then((data) => {
        setUser(data);
        localStorage.setItem("debatex_user", JSON.stringify(data));
      })
      .catch(() => {
        // Fall back to stored user or proceed
      });

    // Load user's recent rooms
    api.rooms.list()
      .then((rooms) => {
        if (Array.isArray(rooms)) {
          setRecentRooms(rooms.slice(0, 4));
        }
      })
      .catch((err) => {
        console.warn("Unable to load recent rooms:", err);
      })
      .finally(() => {
        setLoadingRooms(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("debatex_token");
    localStorage.removeItem("debatex_user");
    sessionStorage.removeItem("debatex_room");
    sessionStorage.removeItem("debatex_roomCode");
    navigate("/");
  };

  const handleResumeRoom = (room) => {
    sessionStorage.setItem("debatex_room", JSON.stringify(room));
    sessionStorage.setItem("debatex_roomCode", room.roomCode);

    if (room.status === "COMPLETED") {
      navigate(`/results?code=${room.roomCode}`);
    } else if (room.status === "IN_PROGRESS") {
      navigate(`/debate?code=${room.roomCode}`);
    } else {
      navigate(`/lobby?code=${room.roomCode}`);
    }
  };

  return (
    <main className="dashboard-page">
      <nav className="dashboard-navbar">
        <a href="/dashboard" className="brand">
          DEBATEX<span>.</span>
        </a>

        <div className="dashboard-user">
          <span>WELCOME, {user.name ? user.name.toUpperCase() : "DEBATER"}</span>

          <button onClick={handleLogout} className="logout-button">
            <LogOut size={16} />
            LOGOUT
          </button>
        </div>
      </nav>

      <section className="dashboard-content">
        <span className="eyebrow">
          <span className="status-dot"></span>
          YOUR DEBATE SPACE
        </span>

        <h1>
          THE ARENA
          <span>.</span>
        </h1>

        <p className="dashboard-description">
          Every great argument begins with a question.
          <br />
          Are you ready to defend yours?
        </p>

        <div className="dashboard-actions">
          {/* CREATE ROOM */}
          <div className="action-card">
            <div className="action-icon">
              <Plus size={25} />
            </div>

            <span className="action-label">01 / CREATE</span>

            <h2>START A<br />NEW DEBATE.</h2>

            <p>
              Create your own debate room, select from 108 curated topics, and prepare to challenge an AI opponent.
            </p>

            <button
              className="action-button"
              onClick={() => navigate("/create-room")}
            >
              CREATE ROOM <ArrowUpRight size={18} />
            </button>
          </div>

          {/* JOIN ROOM */}
          <div className="action-card">
            <div className="action-icon">
              <DoorOpen size={25} />
            </div>

            <span className="action-label">02 / JOIN</span>

            <h2>ENTER A<br />ROOM.</h2>

            <p>
              Have a room code? Enter an existing debate session and join the arena.
            </p>

            <button
              className="action-button"
              onClick={() => navigate("/join-room")}
            >
              JOIN ROOM <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        {/* RECENT SESSIONS */}
        {recentRooms.length > 0 && (
          <div style={{ marginTop: "50px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <History size={18} color="var(--red)" />
              <span className="eyebrow" style={{ margin: 0 }}>YOUR RECENT DEBATE SESSIONS</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
              {recentRooms.map((room) => (
                <div
                  key={room.roomCode}
                  onClick={() => handleResumeRoom(room)}
                  style={{
                    background: "#141414",
                    border: "1px solid #292929",
                    padding: "20px",
                    cursor: "pointer",
                    transition: "border-color 0.2s, transform 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--red)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#292929";
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--red)", letterSpacing: "1px" }}>
                      ROOM {room.roomCode}
                    </span>
                    <span style={{
                      fontSize: "10px",
                      padding: "2px 6px",
                      background: room.status === "COMPLETED" ? "#222" : "rgba(233,54,69,0.15)",
                      color: room.status === "COMPLETED" ? "#aaa" : "var(--red)",
                      fontWeight: "700",
                    }}>
                      {room.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px", lineHeight: "1.3" }}>
                    {room.topic}
                  </h3>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#888" }}>
                    <span>{room.aiDifficulty} AI</span>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={12} />
                      {new Date(room.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {loadingRooms && recentRooms.length === 0 && (
          <p className="dashboard-note">LOADING RECENT DEBATES...</p>
        )}

        <div className="dashboard-note">
          <span className="status-dot"></span>
          YOUR OPPONENT WILL ALWAYS BE AI · 108 CURATED DEBATE TOPICS
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
