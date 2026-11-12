
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Bot,
  User,
  Swords,
  MessageSquare,
  RotateCcw,
  LayoutDashboard,
} from "lucide-react";

import "./Results.css";

function Results() {
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);

  useEffect(() => {
    const savedRoom = sessionStorage.getItem("debatex_room");

    if (!savedRoom) {
      navigate("/dashboard", { replace: true });
      return;
    }

    try {
      const parsedRoom = JSON.parse(savedRoom);
      setRoom(parsedRoom);
    } catch (error) {
      console.error("Unable to load debate results:", error);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  if (!room) return null;

  const messages = room.messages || [];

  const userMessages = messages.filter(
    (message) => message.sender === "user"
  );

  const aiMessages = messages.filter(
    (message) => message.sender === "ai"
  );

  const debateRounds = Math.min(
    userMessages.length,
    aiMessages.length
  );

  return (
    <div className="results-page">
      <nav className="results-navbar">
        <div
          className="results-logo"
          onClick={() => navigate("/dashboard")}
        >
          DEBATE<span>X</span>
        </div>

        <button
          className="results-dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          <LayoutDashboard size={16} />
          DASHBOARD
        </button>
      </nav>

      <main className="results-main">
        <header className="results-heading">
          <div className="results-trophy">
            <Trophy size={30} />
          </div>

          <span className="results-eyebrow">
            DEBATE SESSION COMPLETED
          </span>

          <h1>
            THE DEBATE IS <span>OVER.</span>
          </h1>

          <p>
            Your arguments have been recorded. Here's a summary
            of your debate session.
          </p>
        </header>

        <section className="results-topic-panel">
          <div>
            <span className="results-label">DEBATE TOPIC</span>
            <h2>{room.topic}</h2>
            <p>{room.category}</p>
          </div>

          <div className="results-room-code">
            <span>ROOM CODE</span>
            <strong>{room.roomCode}</strong>
          </div>
        </section>

        <section className="results-stats">
          <div className="result-stat-card">
            <div className="result-stat-icon">
              <MessageSquare size={21} />
            </div>
            <span>TOTAL MESSAGES</span>
            <strong>{messages.length}</strong>
          </div>

          <div className="result-stat-card">
            <div className="result-stat-icon">
              <User size={21} />
            </div>
            <span>YOUR ARGUMENTS</span>
            <strong>{userMessages.length}</strong>
          </div>

          <div className="result-stat-card">
            <div className="result-stat-icon">
              <Bot size={21} />
            </div>
            <span>AI RESPONSES</span>
            <strong>{aiMessages.length}</strong>
          </div>

          <div className="result-stat-card">
            <div className="result-stat-icon">
              <Swords size={21} />
            </div>
            <span>COMPLETED ROUNDS</span>
            <strong>{debateRounds}</strong>
          </div>
        </section>

        <section className="results-evaluation">
          <div className="evaluation-header">
            <div>
              <span className="results-label">
                PERFORMANCE REVIEW
              </span>
              <h2>AI JUDGE EVALUATION</h2>
            </div>

            <span className="evaluation-status">
              COMING NEXT
            </span>
          </div>

          <p>
            Your debate transcript is ready. The AI Judge will
            evaluate your arguments for logical reasoning,
            relevance, evidence, and rebuttal quality once
            evaluation is integrated.
          </p>

          <div className="evaluation-placeholder">
            <Trophy size={25} />
            <span>
              YOUR DEBATE SCORE WILL APPEAR HERE
            </span>
          </div>
        </section>

        <section className="transcript-section">
          <div className="transcript-heading">
            <div>
              <span className="results-label">
                SESSION RECORD
              </span>
              <h2>DEBATE TRANSCRIPT</h2>
            </div>

            <span>{messages.length} MESSAGES</span>
          </div>

          {messages.length === 0 ? (
            <p className="no-messages">
              No arguments were recorded in this session.
            </p>
          ) : (
            <div className="transcript-list">
              {messages.map((message, index) => (
                <article
                  key={message.id ?? index}
                  className={`transcript-message ${
                    message.sender === "user"
                      ? "transcript-user"
                      : "transcript-ai"
                  }`}
                >
                  <div className="transcript-avatar">
                    {message.sender === "user" ? (
                      <User size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>

                  <div className="transcript-content">
                    <span>
                      {message.sender === "user"
                        ? "YOU"
                        : "DEBATEX AI"}
                    </span>
                    <p>{message.text}</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="results-actions">
          <button
            className="results-primary-btn"
            onClick={() => navigate("/create-room")}
          >
            <RotateCcw size={17} />
            START A NEW DEBATE
          </button>

          <button
            className="results-secondary-btn"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft size={17} />
            BACK TO DASHBOARD
          </button>
        </div>

        <p className="results-footer">
          DEBATEX · ARGUMENTS OVER NOISE.
        </p>
      </main>
    </div>
  );
}

export default Results;
