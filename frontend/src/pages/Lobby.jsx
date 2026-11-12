
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Copy,
  Check,
  Swords,
  Bot,
  User,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

import "./Lobby.css";

function Lobby() {
  const navigate = useNavigate();

  const [room] = useState(() => {
    const savedRoom = sessionStorage.getItem("debatex_room");

    if (!savedRoom) return null;

    try {
      return JSON.parse(savedRoom);
    } catch (error) {
      console.error("LOBBY - ROOM PARSING ERROR:", error);
      return null;
    }
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!room) {
      console.error("LOBBY - ROOM DATA NOT FOUND");
      sessionStorage.removeItem("debatex_room");
      navigate("/create-room", { replace: true });
    }
  }, [navigate, room]);

  const handleCopyCode = async () => {
    if (!room) return;

    try {
      await navigator.clipboard.writeText(room.roomCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Unable to copy. Please copy the room code manually.");
    }
  };

  const handleStartDebate = () => {
    console.log("ENTER ARENA CLICKED");

    const savedRoom = sessionStorage.getItem("debatex_room");

    console.log("SAVED ROOM:", savedRoom);

    if (!savedRoom) {
      alert("Room data is missing!");
      return;
    }

    try {
      const parsedRoom = JSON.parse(savedRoom);

      const updatedRoom = {
        ...parsedRoom,
        status: "in_progress",
      };

      sessionStorage.setItem(
        "debatex_room",
        JSON.stringify(updatedRoom)
      );

      console.log("ROOM UPDATED:", updatedRoom);
      console.log("NAVIGATING TO /debate");

      navigate("/debate");
    } catch (error) {
      console.error("LOBBY - START DEBATE ERROR:", error);
      alert("Unable to start debate. Check the browser console.");
    }
  };

  if (!room) {
    return null;
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
            ROOM CREATED
          </span>

          <h1>
            YOUR ARENA IS <span>READY.</span>
          </h1>

          <p>
            Everything is set. Review your debate configuration
            before entering the arena.
          </p>
        </div>

        <section className="room-code-panel">
          <div>
            <span className="panel-label">YOUR ROOM CODE</span>
            <h2>{room.roomCode}</h2>
            <p>Keep this code for your session.</p>
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
              CONFIRMED
            </span>
          </div>

          <div className="config-row">
            <div className="config-icon">
              <Swords size={22} />
            </div>

            <div className="config-details">
              <span>DEBATE TOPIC</span>
              <h3>{room.topic}</h3>
              <p>{room.category}</p>
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
              {room.aiDifficulty.toUpperCase()}
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
              <p>You will argue against the AI.</p>
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
              An AI moderator will guide the discussion,
              while an AI judge will evaluate your arguments.
            </p>
          </div>
        </section>

        <button
          className="start-debate-btn"
          onClick={handleStartDebate}
        >
          ENTER THE ARENA
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
