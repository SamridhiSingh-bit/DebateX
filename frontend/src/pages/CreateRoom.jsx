import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Search, Check, AlertCircle } from "lucide-react";

import topics from "../../../topics/topics.json";
import api from "../services/api";
import "./CreateRoom.css";

const AI_DIFFICULTIES = [
  {
    name: "Beginner",
    description: "A supportive opponent with straightforward arguments.",
  },
  {
    name: "Intermediate",
    description: "A balanced opponent with stronger counterarguments.",
  },
  {
    name: "Expert",
    description: "A challenging opponent with deep, nuanced arguments.",
  },
];

function CreateRoom() {
  const navigate = useNavigate();

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("Expert");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [showBonus, setShowBonus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = useMemo(() => {
    return [...new Set(topics.map((topic) => topic.category))];
  }, []);

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesCategory =
        selectedCategory === "All" ||
        topic.category === selectedCategory;

      const matchesSearch = topic.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCollection =
        showBonus || topic.collection === "main";

      return (
        topic.enabled &&
        matchesCategory &&
        matchesSearch &&
        matchesCollection
      );
    });
  }, [selectedCategory, search, showBonus]);

  const handleCreateRoom = async () => {
    if (!selectedTopic || loading) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        topicId: selectedTopic.id,
        topic: selectedTopic.title,
        category: selectedTopic.category,
        topicDifficulty: selectedTopic.difficulty,
        aiDifficulty: selectedDifficulty,
      };

      const room = await api.rooms.create(payload);

      sessionStorage.setItem("debatex_room", JSON.stringify(room));
      sessionStorage.setItem("debatex_roomCode", room.roomCode);

      navigate(`/lobby?code=${room.roomCode}`);
    } catch (err) {
      console.error("Failed to create room:", err);
      setError(err.message || "Failed to create debate room. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="create-room-page">
      <nav className="create-room-navbar">
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={17} />
          BACK TO DASHBOARD
        </button>

        <a href="/dashboard" className="brand">
          DEBATEX<span>.</span>
        </a>

        <span className="step-indicator">01 / ROOM SETUP</span>
      </nav>

      <section className="create-room-content">
        <span className="eyebrow">
          <span className="status-dot"></span>
          CONFIGURE YOUR SESSION
        </span>

        <h1>
          BUILD YOUR
          <br />
          <span>ARENA.</span>
        </h1>

        <p className="create-room-description">
          Choose a topic from our 108 curated debate subjects. Set your challenge level.
          <br />
          Prepare to defend your position against AI.
        </p>

        {error && (
          <div style={{
            background: "rgba(233,54,69,0.1)",
            border: "1px solid var(--red)",
            padding: "16px 20px",
            marginBottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#fff"
          }}>
            <AlertCircle size={20} color="var(--red)" />
            <span>{error}</span>
          </div>
        )}

        <div className="setup-section">
          <div className="section-heading">
            <div>
              <span className="section-number">01 / TOPIC</span>
              <h2>CHOOSE YOUR DEBATE.</h2>
            </div>

            <span className="topic-count">
              {filteredTopics.length} TOPICS
            </span>
          </div>

          <div className="topic-filters">
            <div className="topic-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search debate topics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">ALL CATEGORIES</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <label className="bonus-toggle">
            <input
              type="checkbox"
              checked={showBonus}
              onChange={(e) => setShowBonus(e.target.checked)}
            />
            Include bonus topics
          </label>

          <div className="topic-grid">
            {filteredTopics.map((topic) => {
              const isSelected = selectedTopic?.id === topic.id;

              return (
                <button
                  key={topic.id}
                  type="button"
                  className={`topic-card ${isSelected ? "selected" : ""}`}
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="topic-card-top">
                    <span>{topic.id}</span>
                    {isSelected && <Check size={18} />}
                  </div>

                  <h3>{topic.title}</h3>

                  <div className="topic-card-bottom">
                    <span>{topic.difficulty.toUpperCase()}</span>
                    <span>{topic.collection.toUpperCase()}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredTopics.length === 0 && (
            <p className="no-topics">
              No topics found. Try another search or category.
            </p>
          )}
        </div>

        <div className="setup-section">
          <div className="section-heading">
            <div>
              <span className="section-number">02 / OPPONENT</span>
              <h2>SELECT AI DIFFICULTY.</h2>
            </div>
          </div>

          <div className="difficulty-grid">
            {AI_DIFFICULTIES.map((level) => (
              <button
                key={level.name}
                type="button"
                className={`difficulty-card ${
                  selectedDifficulty === level.name ? "selected" : ""
                }`}
                onClick={() => setSelectedDifficulty(level.name)}
              >
                <div className="difficulty-card-top">
                  <h3>{level.name.toUpperCase()}</h3>
                  {selectedDifficulty === level.name && (
                    <Check size={18} />
                  )}
                </div>

                <p>{level.description}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="room-summary">
          <div>
            <span className="section-number">YOUR CONFIGURATION</span>

            <h3>
              {selectedTopic
                ? selectedTopic.title
                : "NO TOPIC SELECTED"}
            </h3>

            <p>AI opponent: {selectedDifficulty} (Expert is Default)</p>
          </div>

          <button
            className="create-room-submit"
            disabled={!selectedTopic || loading}
            onClick={handleCreateRoom}
          >
            {loading ? "CREATING ROOM..." : "CREATE ROOM"} <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default CreateRoom;
