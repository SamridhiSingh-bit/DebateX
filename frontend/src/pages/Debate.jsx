
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Bot,
  User,
  Send,
  Flag,
  Swords,
} from "lucide-react";

import "./Debate.css";

function Debate() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [room] = useState(() => {
    const savedRoom = sessionStorage.getItem("debatex_room");

    if (!savedRoom) return null;

    try {
      return JSON.parse(savedRoom);
    } catch (error) {
      console.error("ROOM PARSING ERROR:", error);
      return null;
    }
  });
  const [messages, setMessages] = useState([]);
  const [argument, setArgument] = useState("");
  const [turn, setTurn] = useState(1);
  const [isThinking, setIsThinking] = useState(false);

  useEffect(() => {
    if (!room) {
      console.error("ROOM DATA NOT FOUND!");
      sessionStorage.removeItem("debatex_room");
      navigate("/create-room", { replace: true });
    }
  }, [navigate, room]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  const generateMockResponse = (userArgument) => {
    return `That is an interesting position. However, let's examine your argument more closely.

You argued: "${userArgument}"

A strong counterpoint is that the issue also needs to be evaluated from the perspective of practical consequences, individual rights, and the wider impact on society.

How would you respond to that?`;
  };

  const handleSend = () => {
    const trimmedArgument = argument.trim();

    if (!trimmedArgument || isThinking) return;

    const userMessage = {
      id: Date.now(),
      sender: "user",
      text: trimmedArgument,
    };

    setMessages((previous) => [...previous, userMessage]);
    setArgument("");
    setIsThinking(true);

    // Temporary mock AI response.
    // This will later be replaced with a Spring Boot API call.
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        sender: "ai",
        text: generateMockResponse(trimmedArgument),
      };

      setMessages((previous) => [...previous, aiMessage]);
      setTurn((previous) => previous + 1);
      setIsThinking(false);
    }, 1200);
  };

  const handleEndDebate = () => {
    if (!room) return;

    const updatedRoom = {
      ...room,
      status: "completed",
      messages,
      totalTurns: turn,
    };

    sessionStorage.setItem(
      "debatex_room",
      JSON.stringify(updatedRoom)
    );

    navigate("/results");
  };

  if (!room) return null;

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
          LIVE DEBATE
        </div>

        <button
          className="debate-exit-btn"
          onClick={() => navigate("/lobby")}
        >
          <ArrowLeft size={15} />
          Lobby
        </button>
      </nav>

      <main className="debate-main">
        <header className="debate-header">
          <div>
            <span className="debate-eyebrow">
              ROOM {room.roomCode}
            </span>

            <h1>{room.topic}</h1>

            <p>
              {room.category} · {room.aiDifficulty} AI difficulty
            </p>
          </div>

          <div className="turn-indicator">
            <span>TURN</span>
            <strong>{turn}</strong>
          </div>
        </header>

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
            <span>{messages.length} MESSAGES</span>
          </div>

          {messages.length === 0 && (
            <div className="debate-empty">
              <div className="empty-icon">
                <Swords size={28} />
              </div>

              <h2>THE FLOOR IS YOURS.</h2>

              <p>
                Present your opening argument on the selected
                topic. The AI opponent will respond with a
                counterargument.
              </p>
            </div>
          )}

          <div className="message-list">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`message ${
                  message.sender === "user"
                    ? "user-message"
                    : "ai-message"
                }`}
              >
                <div className="message-avatar">
                  {message.sender === "user" ? (
                    <User size={17} />
                  ) : (
                    <Bot size={17} />
                  )}
                </div>

                <div className="message-content">
                  <span className="message-sender">
                    {message.sender === "user"
                      ? "YOU"
                      : "DEBATEX AI"}
                  </span>

                  <p>{message.text}</p>
                </div>
              </article>
            ))}

            {isThinking && (
              <div className="thinking-indicator">
                <Bot size={17} />
                DEBATEX AI IS THINKING...
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
            placeholder="Present your argument..."
            rows={3}
            disabled={isThinking}
          />

          <div className="input-footer">
            <span>
              ENTER TO SEND · SHIFT + ENTER FOR NEW LINE
            </span>

            <button
              className="send-argument-btn"
              onClick={handleSend}
              disabled={!argument.trim() || isThinking}
            >
              SEND ARGUMENT
              <Send size={15} />
            </button>
          </div>
        </section>

        <button
          className="end-debate-btn"
          onClick={handleEndDebate}
          disabled={isThinking || messages.length === 0}
        >
          <Flag size={15} />
          END DEBATE
        </button>
      </main>
    </div>
  );
}

export default Debate;
