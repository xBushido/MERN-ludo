import { useNavbar } from "../hooks/useNavbar";
import { Link } from "react-router-dom";
import "./styles.css";
import "./history.css";
import { useEffect, useState } from "react";
import axios from "axios";

interface GamePlayer {
  username: string;
  rank: number;
  coins_earned: number;
}

interface GameRecord {
  _id: string;
  total_players: number;
  players: GamePlayer[];
  finished_at: string;
}

export default function History() {
  const { username, coins } = useNavbar();
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    axios
      .get(`http://localhost:8000/stats/history/${storedUsername}`)
      .then((res) => {
        setHistory(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch history:", err);
        setLoading(false);
      });
  }, [username]);

  const formatGameString = (game: GameRecord) => {
    const sortedPlayers = [...game.players].sort((a, b) => (a.rank - b.rank));
    let names: string[] = [];
    for (let i = 0; i < 4; i++) {
      if (i < sortedPlayers.length) {
        names.push(
          sortedPlayers[i].username === username
            ? "You"
            : sortedPlayers[i].username,
        );
      } else {
        names.push("-");
      }
    }
    return `${game.total_players} players: ${names.join(", ")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const getPositionDetails = (rank: number) => {
    switch (rank) {
      case 1:
        return { text: "1st Place 🥇", className: "position-1st" };
      case 2:
        return { text: "2nd Place 🥈", className: "position-2nd" };
      case 3:
        return { text: "3rd Place 🥉", className: "position-3rd" };
      case 4:
        return { text: "4th Place", className: "position-4th" };
      default:
        return { text: "DNF", className: "" };
    }
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
              <Link
                to={"/"}
                className="dropdown-item logout-btn"
                onClick={() => localStorage.clear()}
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="history-container">
        <div className="history-header">
          <div className="header-top">
            <h2>Game History</h2>
            <Link to={"/home"} className="back-link">
              ← Back to Home
            </Link>
          </div>
          <p className="header-subtitle">Review all your past matches</p>
        </div>

        <div className="history-list">
          {loading ? (
            <div
              style={{ textAlign: "center", padding: "2rem", color: "white" }}
            >
              Loading history...
            </div>
          ) : history.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                color: "white",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "8px",
              }}
            >
              No games played yet.
            </div>
          ) : (
            history.map((game) => {
              const myStats = game.players.find((p) => p.username === username);
              const rankDetails = getPositionDetails(myStats?.rank || 0);

              return (
                <div key={game._id} className="history-item">
                  <div className="game-header">
                    <span className="game-id">Game #{game._id}</span>
                    <span className="game-date">
                      {formatDate(game.finished_at)}
                    </span>
                  </div>
                  <div className="game-details">
                    <div className="detail-row">
                      <span className="label">Players:</span>
                      <span className="value">{formatGameString(game)}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Finish Position:</span>
                      <span className={`value ${rankDetails.className}`}>
                        {rankDetails.text}
                      </span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Coins Earned:</span>
                      <span className="coins">
                        +{myStats?.coins_earned || 0}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
