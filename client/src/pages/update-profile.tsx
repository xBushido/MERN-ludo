import { useEffect, useState } from "react";
import "./styles.css";
import "./update-profile.css";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavbar } from "../hooks/useNavbar";

export default function UpdateProfile() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [saveduser, setSaveduser] = useState("");
  const [dob, setDob] = useState(new Date());
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");
  const {coins, totalPlayed, memberSince} = useNavbar();

  useEffect(() => {
    const storedUserName = localStorage.getItem("username");
    axios.get(`http://localhost:8000/auth/profile/${storedUserName}`)
        .then((res) => {
            setUsername(res.data.username);
            setSaveduser(res.data.username);
            setDob(new Date(res.data.dob));
        });
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await axios.put("http://localhost:8000/auth/update-profile", {
        username: localStorage.getItem("username"),
        newUsername: username,
        dob: dob,
        currentPassword: currPass,
        newPassword: newPass,
        confirmPassword: confirm,
      });
      setSaveduser(username);
      setUsername("");
      localStorage.setItem("username", username);
      setDob(new Date());
      setCurrPass("");
      setNewPass("");
      setConfirm("");
      navigate("/home");
    } catch (err) {
      setErr(err.response?.data?.message || "Invalid Credentials");
    }
  }

  return (
    <div className="page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <Link to={"/home"} className="navbar-title">
            🎲 LUDO
          </Link>
        </div>
        <div className="navbar-right">
          <div className="coin-display">
            <span className="coin-icon">💰</span>
            <span className="coin-amount">{coins} Coins</span>
          </div>
          <div className="user-dropdown">
            <button className="dropdown-btn">{saveduser} ▼</button>
            <div className="dropdown-menu">
              <Link to={"/home"} className="dropdown-item">
                Home
              </Link>
              <Link to={"/"} className="dropdown-item logout-btn">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="profile-container">
        <div className="profile-header">
          <h2>Update Profile</h2>
          <p>Edit your account information</p>
        </div>
        <div className="profile-card">
          <form id="update-profile-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="username">
                Username
              </label>
              <input
                type="text"
                value={username}
                id="username"
                className="form-input"
                placeholder="Your username"
                required
                minLength={2}
                maxLength={20}
                onChange={(e) => setUsername(e.target.value)}
              />
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
            <div className="form-divider">
              <span>Change Password</span>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="current-password">
                Current Password
              </label>
              <input
                type="password"
                value={currPass}
                id="current-password"
                className="form-input"
                placeholder="Enter your current password"
                minLength={6}
                onChange={(e) => setCurrPass(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-password">
                New Password
              </label>
              <input
                type="password"
                value={newPass}
                id="new-password"
                className="form-input"
                placeholder="Enter a new password"
                minLength={6}
                onChange={(e) => setNewPass(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm-new-password">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirm}
                id="confirm-new-password"
                className="form-input"
                placeholder="Re-enter your new password"
                minLength={6}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>
            <div className="form-actions">
              {err && <p>{err}</p>}
              <button type="submit" className="btn-save">
                Save Changes
              </button>
              <Link to={"/home"} className="btn-cancel">
                Cancel
              </Link>
            </div>
          </form>
        </div>
        <div className="profile-info">
          <h3>Account Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Member Since</span>
              <span className="info-value">{memberSince || "..."}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Games</span>
              <span className="info-value">{totalPlayed}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Coin Balance</span>
              <span className="info-value">{coins}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
