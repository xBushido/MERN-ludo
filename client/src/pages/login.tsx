import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../pages/styles.css";
import "../pages/login.css";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/auth/login', {username: user, password: pass});
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("username", res.data.username);
      setUser("");
      setPass("");
      navigate("/home");
    }
    catch(err) {
      setErr(err.response?.data?.message || "Invalid Credentials");
    }
  }

  return (
    <div className="page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🎲 LUDO</h1>
          <p className="auth-subtitle">Welcome Back</p>
        </div>
        <div className="auth-card">
          <h2>Login</h2>
          <form id="login-form"  onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                value={user}
                id="username"
                className="form-input"
                placeholder="Enter your username"
                required
                minLength={2}
                maxLength={20}
                onChange={(e) => setUser(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                value={pass}
                id="password"
                className="form-input"
                placeholder="Enter your password"
                required
                minLength={6}
                onChange={(e) => setPass(e.target.value)}
              />
            </div>
            {err && <p>{err}</p>}
            <button type="submit" className="form-button">
              Login
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Don't have an account?{" "}
              <Link to={"/signup"} className="auth-link">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
