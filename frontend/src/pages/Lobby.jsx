import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Swords,
  Bot,
  User,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";
import "./Lobby.css";

function Lobby() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const codeFromUrl = searchParams.get("code");
  const roomCode = codeFromUrl || sessionStorage.getItem("debatex_roomCode") || "";

  const [room, setRoom] = useState(() => {
    const savedRoom = sessionStorage.getItem("debatex_room");
    if (!savedRoom) return null;
    try {
      return JSON.parse(savedRoom);
    } catch {
      return null;
    }
  });

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomCode) {
      navigate("/create-room", { replace: true });
      return;
    }

    api.rooms.get(roomCode)
      .then((data) => {
        setRoom(data);
        sessionStorage.setItem("debatex_room", JSON.stringify(data));
        sessionStorage.setItem("debatex_roomCode", data.roomCode);
      })
      .catch((err) => {
        console.error("LOBBY FETCH ERROR:", err);
        setError("Unable to load room. Please check the room code.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [codeFromUrl, navigate, roomCode]);

  const handleCopyCode = async () => {
    if (!room) return;

    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("Unable to copy automatically. Room code: " + room.roomCode);
    }
  };

  const handleStartDebate = async () => {
    if (!room || starting) return;

    setStarting(true);
    setError("");

    try {
      const updated = await api.rooms.start(room.roomCode);
      sessionStorage.setItem("debatex_room", JSON.stringify(updated));
      sessionStorage.setItem("debatex_roomCode", updated.roomCode);
      navigate(`/debate?code=${updated.roomCode}`);
    } catch (err) {
      console.error("Failed to start debate:", err);
      // If already in progress, navigate to arena
      if (room.status === "IN_PROGRESS") {
        navigate(`/debate?code=${room.roomCode}`);
      } else {
        setError(err.message || "Failed to start debate arena.");
      }
    } finally {
      setStarting(false);
    }
  };

  if (loading && !room) {
    return (
      <div className="lobby-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#aaa", fontSize: "18px" }}>LOADING ARENA CONFIGURATION...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="lobby-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2 style={{ marginBottom: "20px" }}>ROOM NOT FOUND</h2>
        <p style={{ color: "var(--red)", marginBottom: "30px" }}>{error || "The requested room does not exist."}</p>
        <button className="start-debate-btn" onClick={() => navigate("/dashboard")} style={{ margin: "auto" }}>
          RETURN TO DASHBOARD
        </button>
      </div>
    );
  }

  return (
    <div className="lobby-page">
      <nav className="lobby-navbar">
        <div
          className="lobby-logo"
          onClick={() => navigate("/dashboard")}
        >
          DEBATE<span>X</span>
        </div>

        <button
          className="lobby-back"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={16} />
          Dashboard
        </button>
      </nav>

      <main className="lobby-content">
        <div className="lobby-heading">
          <span className="lobby-eyebrow">
            <span className="live-dot"></span>
            ROOM {room.status}
          </span>

          <h1>
            YOUR ARENA IS <span>READY.</span>
          </h1>

          <p>
            Everything is set. Review your debate configuration
            before entering the arena against the AI opponent.
          </p>
        </div>

        {error && (
          <div style={{
            background: "rgba(233,54,69,0.1)",
            border: "1px solid var(--red)",
            padding: "16px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#fff"
          }}>
            <AlertCircle size={18} color="var(--red)" />
            <span>{error}</span>
          </div>
        )}

        <section className="room-code-panel">
          <div>
            <span className="panel-label">YOUR ROOM CODE</span>
            <h2>{room.roomCode}</h2>
            <p>Keep this code for your session. Persistent across devices.</p>
          </div>

          <button
            className="copy-code-btn"
            onClick={handleCopyCode}
          >
            {copied ? <Check size={17} /> : <Copy size={17} />}
            {copied ? "COPIED" : "COPY CODE"}
          </button>
        </section>

        <section className="lobby-config">
          <div className="config-header">
            <span>DEBATE CONFIGURATION</span>
            <span className="config-status">
              <ShieldCheck size={15} />
              PERSISTED IN DATABASE
            </span>
          </div>

          <div className="config-row">
            <div className="config-icon">
              <Swords size={22} />
            </div>

            <div className="config-details">
              <span>DEBATE TOPIC</span>
              <h3>{room.topic}</h3>
              <p>{room.category} · Topic ID: {room.topicId}</p>
            </div>
          </div>

          <div className="config-divider"></div>

          <div className="config-row">
            <div className="config-icon">
              <Bot size={22} />
            </div>

            <div className="config-details">
              <span>AI OPPONENT</span>
              <h3>DebateX AI</h3>
              <p>{room.aiDifficulty} difficulty</p>
            </div>

            <span className="expert-tag">
              {room.aiDifficulty ? room.aiDifficulty.toUpperCase() : "EXPERT"}
            </span>
          </div>

          <div className="config-divider"></div>

          <div className="config-row">
            <div className="config-icon">
              <User size={22} />
            </div>

            <div className="config-details">
              <span>YOUR ROLE</span>
              <h3>Human Debater</h3>
              <p>You will argue against the AI opponent.</p>
            </div>
          </div>
        </section>

        <section className="format-panel">
          <div className="format-icon">
            <ShieldCheck size={20} />
          </div>

          <div>
            <h3>STRUCTURED DEBATE</h3>
            <p>
              An AI moderator will manage rules, format, and turn structure,
              while an AI judge evaluates logic, strength, rebuttals, evidence, and clarity.
            </p>
          </div>
        </section>

        <button
          className="start-debate-btn"
          disabled={starting}
          onClick={handleStartDebate}
        >
          {starting ? "INITIALIZING ARENA..." : "ENTER THE ARENA"}
          <ArrowRight size={19} />
        </button>

        <p className="lobby-footer">
          HUMAN VS AI. ARGUMENTS OVER NOISE.
        </p>
      </main>
    </div>
  );
}

export default Lobby;
