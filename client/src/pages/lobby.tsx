import "../pages/styles.css";
import "../pages/lobby.css";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../socket";

interface Player {
  socketId: string;
  username: string;
  color: string;
}

export default function Lobby() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [gameId, setGameId] = useState("");
  const [hostId, setHostId] = useState(""); 
  const username = localStorage.getItem("username");

  useEffect(() => {
    socket.emit("room:join", { username });
    socket.on("room:update", ({ players, gameId, hostId }) => {
      setPlayers(players);
      setGameId(gameId);
      if (hostId) setHostId(hostId); 
    });

    socket.on("game:start", ({ gameId, state }) => {
      navigate(`/newgame/${gameId}`, { state: { initialState: state } });
    });
    socket.on("ERROR", (error) => {
      alert(error.message);
    });

    return () => {
      socket.off("room:update");
      socket.off("game:start");
      socket.off("ERROR");
    };
  }, [navigate, username]);

  function startGame() {
    socket.emit("room:start", { gameId });
  }

  function goBack() {
    socket.emit("room:leave", { username });
    navigate("/home");
  }
  const isHost = socket.id === hostId;

  return (
    <div className="page">
      <div className="lobby-container">
        <div className="lobby-header">
          <h1 className="lobby-title">🎲 LUDO</h1>
          <p className="lobby-subtitle">Classic Board Game Experience</p>
        </div>
        <div className="lobby-card">
          <h2>Game Lobby</h2>
          <div className="players-grid">
            {[0, 1, 2, 3].map((index) => (
              <div
                key={index}
                className={`player-slot ${players[index] ? "filled" : "empty"}`}
              >
                <div className="player-slot-label">Player {index + 1}</div>
                <div className="player-slot-name">
                  {players[index] ? players[index].username : "Waiting..."}
                </div>
                <div
                  className={`player-slot-color ${
                    players[index] ? players[index].color : "none"
                  }`}
                />
              </div>
            ))}
            
            {/* 4. Conditionally render the button based on isHost */}
            {isHost ? (
              <button
                className="start-button"
                id="start-btn"
                onClick={startGame}
                disabled={players.length < 2}
              >
                {players.length < 2
                  ? "Waiting for Players..."
                  : `Start Game (${players.length}/4 Players)`}
              </button>
            ) : (
              <div style={{ textAlign: "center", margin: "1rem 0", fontWeight: "bold" }}>
                Waiting for the host to start the game...
              </div>
            )}

            <div className="lobby-footer">
              <Link to={"/home"} className="back-button" onClick={goBack}>
                Go Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}