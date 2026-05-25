import "../pages/styles.css";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="page">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="auth-title">🎲 LUDO</h1>
          </div>
          <div className="auth-card">
            <h2>Welcome !</h2>
            <button className="form-button" onClick={() => navigate("/login")}>
              Login
            </button>
            <button className="form-button" onClick={() => navigate("/signup")}>
              Signup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
