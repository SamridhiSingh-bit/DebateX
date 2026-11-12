import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  Bot,
  User,
  Swords,
  MessageSquare,
  RotateCcw,
  LayoutDashboard,
  Shield,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Scale,
} from "lucide-react";
import api from "../services/api";
import "./Results.css";

function Results() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const codeFromUrl = searchParams.get("code");
  const roomCode = codeFromUrl || sessionStorage.getItem("debatex_roomCode") || "";

  const [room, setRoom] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEvaluation, setLoadingEvaluation] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roomCode) {
      navigate("/dashboard", { replace: true });
      return;
    }

    // 1. Fetch Room details
    api.rooms.get(roomCode)
      .then((roomData) => {
        setRoom(roomData);
        // 2. Fetch transcript messages
        return api.messages.get(roomCode);
      })
      .then((msgData) => {
        if (Array.isArray(msgData)) {
          setMessages(msgData);
        }

        // 3. Fetch or generate AI Evaluation
        setLoadingEvaluation(true);
        return api.evaluation.get(roomCode).catch(() => {
          // If not found yet, generate it
          return api.evaluation.generate(roomCode);
        });
      })
      .then((evalData) => {
        setEvaluation(evalData);
      })
      .catch((err) => {
        console.error("RESULTS PAGE LOAD ERROR:", err);
        setError("Unable to retrieve evaluation results: " + (err.message || ""));
      })
      .finally(() => {
        setLoading(false);
        setLoadingEvaluation(false);
      });
  }, [roomCode, navigate]);

  if (loading && !room) {
    return (
      <div className="results-page" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <p style={{ color: "#aaa", fontSize: "16px" }}>LOADING DEBATE RESULTS & AI EVALUATION...</p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="results-page" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>DEBATE SESSION NOT FOUND</h2>
        {error && <p role="alert">{error}</p>}
        <button
          className="results-primary-btn"
          onClick={() => navigate("/dashboard")}
          style={{ margin: "20px auto" }}
        >
          BACK TO DASHBOARD
        </button>
      </div>
    );
  }

  const userMessages = messages.filter((m) => m.senderType === "HUMAN");
  const aiMessages = messages.filter((m) => m.senderType === "AI");
  const debateRounds = Math.max(userMessages.length, aiMessages.length);

  const isHumanWinner = evaluation?.winner === "HUMAN";
  const isAiWinner = evaluation?.winner === "AI";

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
            OFFICIAL ADJUDICATION · ROOM {room.roomCode}
          </span>

          <h1>
            THE DEBATE IS <span>OVER.</span>
          </h1>

          <p>
            Your arguments have been evaluated against standard debate adjudication criteria.
            Review your AI Judge score and qualitative feedback below.
          </p>
        </header>

        {error && (
          <p className="results-error" role="alert">
            {error}
          </p>
        )}

        {/* TOPIC PANEL */}
        <section className="results-topic-panel">
          <div>
            <span className="results-label">DEBATE TOPIC</span>
            <h2>{room.topic}</h2>
            <p>{room.category} · Opponent: {room.aiDifficulty} AI</p>
          </div>

          <div className="results-room-code">
            <span>ROOM CODE</span>
            <strong>{room.roomCode}</strong>
          </div>
        </section>

        {/* QUICK STATS */}
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

        {/* AI JUDGE EVALUATION */}
        <section className="results-evaluation">
          <div className="evaluation-header">
            <div>
              <span className="results-label">
                ADJUDICATOR DECISION
              </span>
              <h2>AI JUDGE EVALUATION</h2>
            </div>

            <span className="evaluation-status" style={{
              background: isHumanWinner ? "rgba(46, 213, 115, 0.15)" : (isAiWinner ? "rgba(233, 54, 69, 0.15)" : "#222"),
              color: isHumanWinner ? "#2ed573" : (isAiWinner ? "var(--red)" : "#aaa")
            }}>
              {evaluation
                ? (isHumanWinner ? "VICTORY: HUMAN DEBATER" : (isAiWinner ? "VICTORY: DEBATEX AI" : "OUTCOME: TIE"))
                : (loadingEvaluation ? "ADJUDICATING..." : "EVALUATION READY")}
            </span>
          </div>

          {evaluation ? (
            <div style={{ marginTop: "25px" }}>
              {/* SCOREBOARD */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
                background: "#141414",
                border: "1px solid #333",
                padding: "25px",
                marginBottom: "30px",
                textAlign: "center"
              }}>
                <div>
                  <span style={{ fontSize: "11px", color: "#888", fontWeight: "700", letterSpacing: "1px" }}>
                    YOUR SCORE
                  </span>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "64px",
                    fontWeight: "900",
                    color: isHumanWinner ? "#2ed573" : "#fff",
                    lineHeight: "1",
                    margin: "10px 0 5px"
                  }}>
                    {evaluation.humanScore}<span style={{ fontSize: "24px", color: "#666" }}>/100</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>Human Debater</span>
                </div>

                <div style={{ borderLeft: "1px solid #292929" }}>
                  <span style={{ fontSize: "11px", color: "#888", fontWeight: "700", letterSpacing: "1px" }}>
                    AI OPPONENT SCORE
                  </span>
                  <div style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "64px",
                    fontWeight: "900",
                    color: isAiWinner ? "var(--red)" : "#aaa",
                    lineHeight: "1",
                    margin: "10px 0 5px"
                  }}>
                    {evaluation.aiScore}<span style={{ fontSize: "24px", color: "#666" }}>/100</span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#aaa" }}>DebateX AI ({room.aiDifficulty})</span>
                </div>
              </div>

              {/* 5 WEIGHTED CRITERIA BREAKDOWN */}
              <div style={{ marginBottom: "35px" }}>
                <span className="results-label" style={{ display: "block", marginBottom: "15px" }}>
                  WEIGHTED CRITERIA BREAKDOWN (TOTAL 100%)
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {/* Logical Reasoning 25% */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span>Logical Reasoning (25%)</span>
                      <strong style={{ color: "var(--red)" }}>{evaluation.logicalReasoningScore} / 25</strong>
                    </div>
                    <div style={{ height: "6px", background: "#252525", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(evaluation.logicalReasoningScore / 25) * 100}%`, height: "100%", background: "var(--red)" }}></div>
                    </div>
                  </div>

                  {/* Argument Strength 25% */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span>Argument Strength (25%)</span>
                      <strong style={{ color: "var(--red)" }}>{evaluation.argumentStrengthScore} / 25</strong>
                    </div>
                    <div style={{ height: "6px", background: "#252525", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(evaluation.argumentStrengthScore / 25) * 100}%`, height: "100%", background: "var(--red)" }}></div>
                    </div>
                  </div>

                  {/* Rebuttal Quality 20% */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span>Rebuttal Quality (20%)</span>
                      <strong style={{ color: "var(--red)" }}>{evaluation.rebuttalQualityScore} / 20</strong>
                    </div>
                    <div style={{ height: "6px", background: "#252525", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(evaluation.rebuttalQualityScore / 20) * 100}%`, height: "100%", background: "var(--red)" }}></div>
                    </div>
                  </div>

                  {/* Evidence & Examples 15% */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span>Evidence & Examples (15%)</span>
                      <strong style={{ color: "var(--red)" }}>{evaluation.evidenceScore} / 15</strong>
                    </div>
                    <div style={{ height: "6px", background: "#252525", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(evaluation.evidenceScore / 15) * 100}%`, height: "100%", background: "var(--red)" }}></div>
                    </div>
                  </div>

                  {/* Clarity & Coherence 15% */}
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", fontSize: "13px" }}>
                      <span>Clarity & Coherence (15%)</span>
                      <strong style={{ color: "var(--red)" }}>{evaluation.clarityScore} / 15</strong>
                    </div>
                    <div style={{ height: "6px", background: "#252525", borderRadius: "3px", overflow: "hidden" }}>
                      <div style={{ width: `${(evaluation.clarityScore / 15) * 100}%`, height: "100%", background: "var(--red)" }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* DETAILED QUALITATIVE FEEDBACK */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div style={{ background: "#141414", border: "1px solid #292929", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#2ed573", marginBottom: "10px" }}>
                    <CheckCircle size={18} />
                    <strong style={{ fontSize: "13px", letterSpacing: "1px" }}>STRONGEST ARGUMENT</strong>
                  </div>
                  <p style={{ fontSize: "13px", color: "#ddd", lineHeight: "1.6" }}>
                    {evaluation.strongestArgument}
                  </p>
                </div>

                <div style={{ background: "#141414", border: "1px solid #292929", padding: "20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffa502", marginBottom: "10px" }}>
                    <AlertTriangle size={18} />
                    <strong style={{ fontSize: "13px", letterSpacing: "1px" }}>WEAKEST ARGUMENT / VULNERABILITY</strong>
                  </div>
                  <p style={{ fontSize: "13px", color: "#ddd", lineHeight: "1.6" }}>
                    {evaluation.weakestArgument}
                  </p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
                <div style={{ background: "#141414", border: "1px solid #292929", padding: "20px" }}>
                  <span className="results-label" style={{ display: "block", marginBottom: "8px" }}>DEMONSTRATED STRENGTHS</span>
                  <p style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.6" }}>{evaluation.strengths}</p>
                </div>

                <div style={{ background: "#141414", border: "1px solid #292929", padding: "20px" }}>
                  <span className="results-label" style={{ display: "block", marginBottom: "8px" }}>AREAS FOR GROWTH</span>
                  <p style={{ fontSize: "13px", color: "#ccc", lineHeight: "1.6" }}>{evaluation.weaknesses}</p>
                </div>
              </div>

              <div style={{ background: "#141414", border: "1px solid #292929", padding: "20px", marginBottom: "25px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#00d2d3", marginBottom: "8px" }}>
                  <Lightbulb size={18} />
                  <strong style={{ fontSize: "13px", letterSpacing: "1px" }}>SUGGESTIONS FOR FUTURE DEBATES</strong>
                </div>
                <p style={{ fontSize: "13px", color: "#ddd", lineHeight: "1.6" }}>{evaluation.suggestions}</p>
              </div>

              {/* ADJUDICATOR SYNTHESIS */}
              <div style={{ background: "#191919", borderLeft: "4px solid var(--red)", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--red)", marginBottom: "8px" }}>
                  <Scale size={18} />
                  <strong style={{ fontSize: "13px", letterSpacing: "1px" }}>CHIEF ADJUDICATOR SYNTHESIS</strong>
                </div>
                <p style={{ fontSize: "14px", color: "#eee", lineHeight: "1.7", fontStyle: "italic" }}>
                  "{evaluation.judgeExplanation}"
                </p>
              </div>
            </div>
          ) : (
            <div className="evaluation-placeholder" style={{ padding: "40px" }}>
              <Trophy size={25} />
              <span>
                {loadingEvaluation ? "AI JUDGE IS ANALYZING DEBATE TRANSCRIPT..." : "EVALUATION WILL LOAD SHORTLY"}
              </span>
            </div>
          )}
        </section>

        {/* TRANSCRIPT */}
        <section className="transcript-section">
          <div className="transcript-heading">
            <div>
              <span className="results-label">
                COMPLETE LOG
              </span>
              <h2>DEBATE TRANSCRIPT</h2>
            </div>

            <span>{messages.length} MESSAGES RECORDED</span>
          </div>

          {messages.length === 0 ? (
            <p className="no-messages">
              No arguments were recorded in this session.
            </p>
          ) : (
            <div className="transcript-list">
              {messages.map((message, index) => {
                const isUser = message.senderType === "HUMAN";
                const isModerator = message.senderType === "MODERATOR";

                return (
                  <article
                    key={message.id ?? index}
                    className={`transcript-message ${
                      isModerator ? "" : (isUser ? "transcript-user" : "transcript-ai")
                    }`}
                    style={isModerator ? { background: "#161616", borderLeft: "4px solid #ffaa00" } : {}}
                  >
                    <div className="transcript-avatar">
                      {isModerator ? (
                        <Shield size={18} color="#ffaa00" />
                      ) : isUser ? (
                        <User size={18} />
                      ) : (
                        <Bot size={18} />
                      )}
                    </div>

                    <div className="transcript-content">
                      <span style={isModerator ? { color: "#ffaa00" } : {}}>
                        {isModerator
                          ? "AI MODERATOR"
                          : isUser
                          ? "YOU (HUMAN)"
                          : `DEBATEX AI (${room.aiDifficulty.toUpperCase()})`}
                        {message.turnNumber ? ` · TURN ${message.turnNumber}` : ""}
                      </span>
                      <p style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
                        {message.content}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ACTIONS */}
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
          DEBATEX · WHERE IDEAS MEET INTELLIGENCE.
        </p>
      </main>
    </div>
  );
}

export default Results;
