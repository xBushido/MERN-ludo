import { Link, useNavigate } from "react-router-dom";
import { useNavbar } from "../hooks/useNavbar";
import { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";
import "./leaderboard.css";

interface User {
  _id: string;
  username: string;
  total_played: number;
  coins: number;
  global_rank: number
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const { username, coins } = useNavbar();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    axios.get("http://localhost:8000/stats/leaderboard").then((res) => {
        const rankedUsers = res.data.map((user: User, index: number) => ({
            ...user,
            global_rank: index
        }));
      setUsers(rankedUsers);
    });
  }, []);

  const filteredUsers = users.filter((user) => {
    const safeUser = String(user.username || "").toLowerCase();
    const safeQuery = String(searchQuery || "").toLowerCase();
    return safeUser.includes(safeQuery);
  });

  const getRankDisplay = (index: number) => {
    if (index === 0) return "🥇 1st";
    if (index === 1) return "🥈 2nd";
    if (index === 2) return "🥉 3rd";
    return `${index + 1}th`;
  };

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
            <button className="dropdown-btn">{username} ▼</button>
            <div className="dropdown-menu">
              <Link to={"/update-profile"} className="dropdown-item">
                Update Profile
              </Link>
              <button
                className="dropdown-item logout-btn"
                onClick={() => {
                  localStorage.clear();
                  navigate("/");
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <div className="leaderboard-container">
        <div className="leaderboard-header">
          <div className="header-top">
            <h2>Global Leaderboard</h2>
            <Link to={"/home"} className="back-link">
              ← Back to Home
            </Link>
          </div>
          <div className="search-section">
            <input
              type="text"
              id="search-input"
              value={searchQuery}
              className="search-input"
              placeholder="Search by username..."
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="leaderboard-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th className="rank-col">Rank</th>
                <th className="name-col">Username</th>
                <th className="games-col">Games Played</th>
                <th className="coins-col">Coins</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr 
                  key={user._id} 
                  className={user.global_rank === 0 ? "highlight" : ""}
                >
                  <td className="rank">{getRankDisplay(user.global_rank)}</td>
                  <td className="username">{user.username}</td>
                  <td className="games">{user.total_played}</td>
                  <td className="coins">{user.coins}</td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", padding: "2rem" }}>
                    No players found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <button className="page-btn prev">← Previous</button>
          <span className="page-info">Page 1 of 5</span>
          <button className="page-btn next">Next →</button>
        </div>
      </div>
    </div>
  );
}
