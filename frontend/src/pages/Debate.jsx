import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  User,
  Send,
  Flag,
  Swords,
  Shield,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";
import "./Debate.css";

function Debate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef(null);

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

  const [messages, setMessages] = useState([]);
  const [argument, setArgument] = useState("");
  const [turn, setTurn] = useState(1);
  const [isThinking, setIsThinking] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [error, setError] = useState("");

  // Load Room and Messages from backend
  useEffect(() => {
    if (!roomCode) {
      navigate("/create-room", { replace: true });
      return;
    }

    // 1. Fetch Room details
    api.rooms.get(roomCode)
      .then((data) => {
        setRoom(data);
        sessionStorage.setItem("debatex_room", JSON.stringify(data));
        sessionStorage.setItem("debatex_roomCode", data.roomCode);

        // If not started yet, start it
        if (data.status === "CREATED") {
          return api.rooms.start(data.roomCode);
        }
        return data;
      })
      .then(() => {
        // 2. Fetch message history
        return api.messages.get(roomCode);
      })
      .then((messageList) => {
        if (Array.isArray(messageList)) {
          setMessages(messageList);
          const humanTurns = messageList.filter(
            (m) => m.senderType === "HUMAN"
          ).length;
          setTurn(humanTurns + 1);
        }
      })
      .catch((err) => {
        console.error("DEBATE ARENA INIT ERROR:", err);
        setError("Unable to load debate session. Please try again.");
      });
  }, [roomCode, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  const handleSend = async () => {
    const trimmedArgument = argument.trim();

    if (!trimmedArgument || isThinking || !room) return;

    setError("");
    setArgument("");
    setIsThinking(true);

    // Optimistically show human message while AI generates counterargument
    const optimisticHumanMsg = {
      id: Date.now(),
      senderType: "HUMAN",
      content: trimmedArgument,
      turnNumber: turn,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticHumanMsg]);

    try {
      await api.messages.send(room.roomCode, trimmedArgument);

      // Re-fetch clean synchronized message list from backend
      const fullList = await api.messages.get(room.roomCode);
      setMessages(fullList);

      const humanTurns = fullList.filter((m) => m.senderType === "HUMAN").length;
      setTurn(humanTurns + 1);
    } catch (err) {
      console.error("ARGUMENT SUBMISSION ERROR:", err);
      setError(err.message || "Failed to process argument. Please try again.");
      // Roll back optimistic message if submission failed
      const cleanList = await api.messages.get(room.roomCode).catch(() => messages);
      setMessages(cleanList);
    } finally {
      setIsThinking(false);
    }
  };

  const handleEndDebate = async () => {
    if (!room || isEnding) return;

    setIsEnding(true);
    setError("");

    try {
      // 1. End room on backend
      const updatedRoom = await api.rooms.end(room.roomCode);
      sessionStorage.setItem("debatex_room", JSON.stringify(updatedRoom));

      // 2. Trigger AI Judge Evaluation
      try {
        await api.evaluation.generate(room.roomCode);
      } catch (evalErr) {
        console.warn("Evaluation will load on results page:", evalErr);
      }

      navigate(`/results?code=${room.roomCode}`);
    } catch (err) {
      console.error("FAILED TO END DEBATE:", err);
      setError(err.message || "Unable to end debate. Please try again.");
      setIsEnding(false);
    }
  };

  if (!room) {
    return (
      <div className="debate-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#aaa" }}>CONNECTING TO DEBATE ARENA...</p>
      </div>
    );
  }

  const humanMessages = messages.filter((m) => m.senderType === "HUMAN");

  return (
    <div className="debate-page">
      <nav className="debate-navbar">
        <div
          className="debate-logo"
          onClick={() => navigate("/dashboard")}
        >
          DEBATE<span>X</span>
        </div>

        <div className="debate-live">
          <span className="debate-live-dot"></span>
          LIVE ARENA · {room.status}
        </div>

        <button
          className="debate-exit-btn"
          onClick={() => navigate(`/lobby?code=${room.roomCode}`)}
        >
          <ArrowLeft size={15} />
          Lobby
        </button>
      </nav>

      <main className="debate-main">
        <header className="debate-header">
          <div>
            <span className="debate-eyebrow">
              ROOM {room.roomCode} · PERSISTED IN POSTGRESQL
            </span>

            <h1>{room.topic}</h1>

            <p>
              {room.category} · {room.aiDifficulty} AI difficulty · Topic ID: {room.topicId}
            </p>
          </div>

          <div className="turn-indicator">
            <span>ROUND</span>
            <strong>{turn}</strong>
          </div>
        </header>

        {error && (
          <div style={{
            background: "rgba(233,54,69,0.12)",
            border: "1px solid var(--red)",
            padding: "14px 20px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#fff",
            fontSize: "14px"
          }}>
            <AlertCircle size={18} color="var(--red)" />
            <span>{error}</span>
          </div>
        )}

        <section className="debate-participants">
          <div className="participant">
            <div className="participant-icon human-icon">
              <User size={20} />
            </div>

            <div>
              <strong>YOU</strong>
              <span>Human debater</span>
            </div>
          </div>

          <Swords className="versus-icon" size={20} />

          <div className="participant">
            <div className="participant-icon ai-icon">
              <Bot size={20} />
            </div>

            <div>
              <strong>DEBATEX AI</strong>
              <span>{room.aiDifficulty} opponent</span>
            </div>
          </div>
        </section>

        <section className="debate-chat">
          <div className="chat-heading">
            <span>ARGUMENT EXCHANGE</span>
            <span>{messages.length} MESSAGES RECORDED</span>
          </div>

          {messages.length === 0 && (
            <div className="debate-empty">
              <div className="empty-icon">
                <Swords size={28} />
              </div>

              <h2>THE FLOOR IS YOURS.</h2>

              <p>
                Present your opening argument on the selected topic.
                The DebateX AI opponent will analyze your claims and deliver an intelligent counterargument.
              </p>
            </div>
          )}

          <div className="message-list">
            {messages.map((message) => {
              const isUser = message.senderType === "HUMAN";
              const isModerator = message.senderType === "MODERATOR";

              if (isModerator) {
                return (
                  <article
                    key={message.id}
                    className="message"
                    style={{
                      background: "#161616",
                      border: "1px solid #333",
                      borderLeft: "4px solid #ffaa00",
                      padding: "18px 22px",
                      margin: "16px 0",
                    }}
                  >
                    <div className="message-avatar" style={{ background: "rgba(255,170,0,0.1)", color: "#ffaa00" }}>
                      <Shield size={18} />
                    </div>

                    <div className="message-content">
                      <span className="message-sender" style={{ color: "#ffaa00", letterSpacing: "1px" }}>
                        AI MODERATOR · DEBATE STRUCTURE & RULES
                      </span>

                      <p style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                        {message.content}
                      </p>
                    </div>
                  </article>
                );
              }

              return (
                <article
                  key={message.id}
                  className={`message ${isUser ? "user-message" : "ai-message"}`}
                >
                  <div className="message-avatar">
                    {isUser ? <User size={17} /> : <Bot size={17} />}
                  </div>

                  <div className="message-content">
                    <span className="message-sender">
                      {isUser ? "YOU (HUMAN)" : `DEBATEX AI (${room.aiDifficulty.toUpperCase()})`}
                      {message.turnNumber ? ` · TURN ${message.turnNumber}` : ""}
                    </span>

                    <p style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                      {message.content}
                    </p>
                  </div>
                </article>
              );
            })}

            {isThinking && (
              <div className="thinking-indicator">
                <Bot size={17} />
                DEBATEX AI IS ANALYZING ARGUMENT & CRAFTING REBUTTAL...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </section>

        <section className="argument-input-area">
          <textarea
            value={argument}
            onChange={(event) => setArgument(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            placeholder="Present your argument or rebuttal (Enter to send, Shift+Enter for new line)..."
            rows={3}
            disabled={isThinking || isEnding}
          />

          <div className="input-footer">
            <span>
              ENTER TO SEND · SHIFT + ENTER FOR NEW LINE
            </span>

            <button
              className="send-argument-btn"
              onClick={handleSend}
              disabled={!argument.trim() || isThinking || isEnding}
            >
              {isThinking ? "PROCESSING..." : "SEND ARGUMENT"}
              <Send size={15} />
            </button>
          </div>
        </section>

        <button
          className="end-debate-btn"
          onClick={handleEndDebate}
          disabled={isThinking || isEnding || humanMessages.length === 0}
        >
          <Flag size={15} />
          {isEnding ? "ADJUDICATING & CONCLUDING..." : "CONCLUDE DEBATE & GET AI EVALUATION"}
        </button>
      </main>
    </div>
  );
}

export default Debate;
