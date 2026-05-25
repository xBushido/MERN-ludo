import { Link } from "react-router-dom";
import "../pages/styles.css";
import "../pages/home.css";
import { useNavbar } from "../hooks/useNavbar";
import { useEffect, useState } from "react";
import axios from "axios";

export default function Home() {
  const { username, coins, totalPlayed } = useNavbar();
  const [wins, setWins] = useState(0);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    axios.get(`http://localhost:8000/stats/wins/${storedUsername}`)
      .then((res) => {
        setWins(res.data.wins);
      })
      .catch((err) => {
        console.error("Failed to fetch wins: ", err);
      })
  }, []);

  return (
    <div className="page">
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
              <Link to={"/"} className="dropdown-item logout-btn" onClick={() => localStorage.clear()}>
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Welcome, {username}</h2>
          <p>Choose an option below to continue</p>
        </div>
        <div className="dashboard-grid">
          {/* Play Card */}
          <div className="dashboard-card play-card">
            <div className="card-icon">🎮</div>
            <h3>Play Game</h3>
            <p>Join a lobby and play with other players</p>
            <Link to={"/newgame/lobby"} className="card-button">
              Start Playing
            </Link>
          </div>
          {/* Leaderboard Card */}
          <div className="dashboard-card leaderboard-card">
            <div className="card-icon">🏆</div>
            <h3>Leaderboard</h3>
            <p>Check global rankings and player stats</p>
            <Link to={"/leaderboard"} className="card-button">
              View Rankings
            </Link>
          </div>
          {/* History Card */}
          <div className="dashboard-card history-card">
            <div className="card-icon">📊</div>
            <h3>Game History</h3>
            <p>Review your past matches and results</p>
            <Link to={"/history"} className="card-button">
              View History
            </Link>
          </div>
        </div>
        <div className="stats-section">
          <h3>Your Stats</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Games</span>
              <span className="stat-value">{totalPlayed !== undefined ? totalPlayed : "-"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Wins</span>
              <span className="stat-value">{wins}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Win Rate</span>
              <span className="stat-value">{totalPlayed && totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) + "%" : "0%"}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Coins</span>
              <span className="stat-value">{coins}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
