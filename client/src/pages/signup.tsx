import { Link, useNavigate } from "react-router-dom";
import "../pages/styles.css";
import "../pages/signup.css";
import { useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Signup() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [dob, setDob] = useState(new Date());
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await axios.post("http://localhost:8000/auth/signup", {
        username: user,
        password: pass,
        confirmPassword: confirm,
        dob: dob,
      });
      setUser("");
      setPass("");
      setConfirm("");
      setDob(new Date());
      navigate("/login");
    } catch (err) {
      setErr(err.response?.data?.message || "Invalid Credentials");
    }
  }

  return (
    <div className="page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">🎲 LUDO</h1>
          <p className="auth-subtitle">Create Your Account</p>
        </div>
        <div className="auth-card">
          <h2>Sign Up</h2>
          <form id="signup-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                value={user}
                id="username"
                className="form-input"
                placeholder="Choose a username"
                required
                minLength={2}
                maxLength={20}
                onChange={(e) => {
                  setUser(e.target.value);
                }}
              />
              <span className="form-hint">
                Must be unique and 2-20 characters
              </span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="dob">
                Date of Birth
              </label>
              <div>
                <DatePicker
                  selected={dob}
                  onChange={(e) => setDob(e)}
                  className="form-input"
                  wrapperClassName="w-full"
                />
              </div>
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
                placeholder="Enter a strong password"
                required
                minLength={6}
                onChange={(e) => {
                  setPass(e.target.value);
                }}
              />
              <span className="form-hint">Minimum 6 characters</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-password">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirm}
                id="confirm-password"
                className="form-input"
                placeholder="Re-enter your password"
                required
                minLength={6}
                onChange={(e) => {
                  setConfirm(e.target.value);
                }}
              />
            </div>
            {err && <p>{err}</p>}
            <button type="submit" className="form-button">
              Create Account
            </button>
          </form>
          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link to={"/login"} className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
