import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  LockKeyhole,
  Mail,
  UserRound,
  Zap,
} from "lucide-react";

function Auth() {
  const [activeTab, setActiveTab] = useState("login");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const isRegister = activeTab === "register";

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const { name, email, password, confirmPassword } = formData;

    if (!email || !password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (isRegister) {
      if (!name.trim()) {
        setError("Please enter your name.");
        return;
      }

      if (password.length < 6) {
        setError("Password must contain at least 6 characters.");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    // Temporary frontend-only authentication.
    // Real authentication will be implemented with Spring Boot.
    localStorage.setItem(
      "debatex_user",
      JSON.stringify({
        name: isRegister ? name : email.split("@")[0],
        email,
      })
    );

    navigate("/dashboard");
  };

  return (
    <main className="auth-page">

      <nav className="auth-navbar">
        <a href="/" className="brand">
          DEBATEX<span>.</span>
        </a>

        <div className="nav-status">
          <span className="status-dot"></span>
          THE DEBATE PLATFORM
        </div>
      </nav>

      <section className="auth-content">

        <div className="auth-heading">
          <span className="eyebrow">
            <Zap size={14} />
            THINK BEYOND THE OBVIOUS
          </span>

          <h1>
            EVERY ARGUMENT
            <br />
            <span>MATTERS.</span>
          </h1>

          <p>
            Challenge your thinking. Defend your ideas.
            <br />
            Enter the arena.
          </p>
        </div>

        <div className="auth-card">

          <div className="card-top">
            <span>WELCOME TO DEBATEX</span>
            <span className="card-number">01 / 06</span>
          </div>

          <div className="auth-tabs">
            <button
              className={!isRegister ? "active" : ""}
              onClick={() => {
                setActiveTab("login");
                setError("");
              }}
            >
              LOGIN
            </button>

            <button
              className={isRegister ? "active" : ""}
              onClick={() => {
                setActiveTab("register");
                setError("");
              }}
            >
              REGISTER
            </button>
          </div>

          <div className="form-heading">
            <h2>{isRegister ? "CREATE ACCOUNT" : "WELCOME BACK"}</h2>

            <p>
              {isRegister
                ? "Create your account and enter the arena."
                : "Sign in to continue your debate journey."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {isRegister && (
              <div className="input-group">
                <label>FULL NAME</label>

                <div className="input-wrapper">
                  <UserRound size={17} />

                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>EMAIL ADDRESS</label>

              <div className="input-wrapper">
                <Mail size={17} />

                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>PASSWORD</label>

              <div className="input-wrapper">
                <LockKeyhole size={17} />

                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {isRegister && (
              <div className="input-group">
                <label>CONFIRM PASSWORD</label>

                <div className="input-wrapper">
                  <LockKeyhole size={17} />

                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            {error && (
              <p className="form-error">{error}</p>
            )}

            <button type="submit" className="submit-button">
              {isRegister ? "CREATE ACCOUNT" : "ENTER THE ARENA"}

              <ArrowUpRight size={19} />
            </button>

          </form>

          <div className="auth-bottom">
            <span>BUILT FOR THINKERS.</span>
            <span>EST. 2026</span>
          </div>

        </div>

      </section>

      <footer className="auth-footer">
        <span>DEBATEX © 2026</span>
        <span>QUESTION EVERYTHING.</span>
      </footer>

    </main>
  );
}

export default Auth;