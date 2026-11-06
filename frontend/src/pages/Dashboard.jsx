
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, LogOut, Plus, DoorOpen } from "lucide-react";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(
    localStorage.getItem("debatex_user") || "{}"
  );

  const handleLogout = () => {
    localStorage.removeItem("debatex_user");
    navigate("/");
  };

  return (
    <main className="dashboard-page">

      <nav className="dashboard-navbar">
        <a href="/dashboard" className="brand">
          DEBATEX<span>.</span>
        </a>

        <div className="dashboard-user">
          <span>WELCOME, {user.name?.toUpperCase()}</span>

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
              Create your own debate room and prepare
              to challenge an AI opponent.
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
              Have a room code? Enter an existing
              debate session and join the arena.
            </p>

            <button
              className="action-button"
              onClick={() => navigate("/join-room")}
            >
              JOIN ROOM <ArrowUpRight size={18} />
            </button>
          </div>

        </div>

        <div className="dashboard-note">
          <span className="status-dot"></span>
          YOUR OPPONENT WILL ALWAYS BE AI.
        </div>

      </section>

    </main>
  );
}

export default Dashboard;
