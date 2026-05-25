import { useLocation, useNavigate, useParams } from "react-router-dom";
import "../pages/styles.css";
import "../pages/game.css";
import { useEffect, useState } from "react";
import socket from "../socket";
import type { GamePlayer, GameState, Token } from "../types";

export default function Game() {
  const { game_id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [gameState, setGameState] = useState<GameState | null>(
    location.state.initialState || null,
  );
  const [messages, setMessages] = useState<
    { sender: string; message: string; time: string; type: string }[]
  >([]);
  const [chat, setChat] = useState("");
  const [rollHistory, setRollHistory] = useState<number[]>([]);
  const username = localStorage.getItem("username");

  useEffect(() => {
    socket.emit("game:rejoin", { gameId: game_id, username });
    socket.off("game:state");
    socket.off("game:over");
    socket.off("game:chat");

    socket.on("game:state", (state: GameState) => {
      setGameState(state);
      if (state.diceValue) {
        setRollHistory((prev) => [state.diceValue, ...prev].slice(0, 5));
      }
    });

    socket.on("game:over", ({ state }: { state: GameState }) => {
      setGameState(state);
    });

    socket.on("game:chat", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("game:state");
      socket.off("game:over");
      socket.off("game:chat");
    };
  }, [game_id, username]);

  function rollDice() {
    socket.emit("game:roll", { gameId: game_id });
  }
  function moveToken(tokenId: string) {
    socket.emit("game:move", { gameId: game_id, tokenId: tokenId });
  }
  function getTokensOnSquare(pos: number): Token[] {
    return gameState.players.flatMap((p) =>
      p.tokens.filter((t) => t.position === pos),
    );
  }
  function renderToken(token: Token) {
    const clickable =
      isMyTurn && gameState.isDiceRolled && token.color === myPlayer.color;
    return (
      <div
        key={token.id}
        className={`token token--${token.color === "yellow" ? "yel" : token.color}`}
        style={{
          cursor: clickable ? "pointer" : "default",
          outline: clickable ? "2px solid gold" : "none",
        }}
        onClick={() => clickable && moveToken(token.id)}
      >
        {token.id.toUpperCase()}
        <span className="token-tip">{token.id}</span>
      </div>
    );
  }
  function renderSquares(pos: number, extra: string = "") {
    const tokens = getTokensOnSquare(pos);
    return (
      <div key={pos} className={`sq ${extra}`}>
        {tokens.map((t) => renderToken(t))}
      </div>
    );
  }
  function renderHomeYard(color: string) {
    const player = gameState.players.find((p) => p.color === color);
    const homeTokens = player?.tokens.filter((t) => t.position === -1) || [];
    return (
      <div className="yard">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="token-slot">
            {homeTokens[i] && renderToken(homeTokens[i])}
          </div>
        ))}
      </div>
    );
  }
  function getPlayerStats(player: GamePlayer) {
    const finished = player.tokens.filter((t) => t.position === 57).length;
    const home = player.tokens.filter((t) => t.position === -1).length;
    const onBoard = 4 - home - finished;
    const progress = (onBoard / 4) * 100;

    return { finished, home, onBoard, progress };
  }
  function sendMessage() {
    if (!chat.trim()) return;
    socket.emit("game:chat", {
      gameId: game_id,
      username: username,
      text: chat,
    });
    setChat("");
  }

  if (!gameState) return <div>Loading...</div>;
  const myPlayer = gameState.players.find((p) => p.username === username);
  const isMyTurn = gameState.currentTurn === myPlayer.color;

  return (
    <div>
      <div className="page">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="topbar-info">
            <div>
              <span>Room: </span>
              <strong>#{game_id}</strong>
            </div>
            <div>
              <span>Mode: </span>
              <strong>Classic ({gameState.players.length} players)</strong>
            </div>
          </div>
          <div className="timer">
            {gameState.currentTurn.toUpperCase()}'S TURN
          </div>
          <div className="flex-row gap-8px">
            <button
              className="btn btn-danger"
              onClick={() => navigate("/home")}
            >
              ✕ Leave Game
            </button>
          </div>
        </div>

        <div className="layout">
          {/* LEFT SIDEBAR */}
          <aside>
            <div className="panel">
              <div className="panel-hd">
                {isMyTurn
                  ? "Your Turn - Roll Dice"
                  : `${gameState.currentTurn}'s Turn`}
              </div>
              <div className="panel-bd">
                <div className="die-number">{gameState.diceValue ?? "-"}</div>
                <button
                  className="roll-btn"
                  onClick={rollDice}
                  disabled={!isMyTurn || gameState.isDiceRolled}
                >
                  {isMyTurn && !gameState.isDiceRolled ? "Roll" : "Waiting..."}
                </button>
                <div className="roll-hist">
                  Recent:{" "}
                  {rollHistory.map((r, i) => (
                    <span key={i} className="rp">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel">
              <div className="panel-hd">Players</div>
              <div className="panel-bd">
                {gameState.players.map((player) => {
                  const stats = getPlayerStats(player);
                  const isActive = gameState.currentTurn === player.color;
                  const isMe = player.username === username;
                  return (
                    <div
                      key={player.color}
                      className={`player-card ${isActive ? "active" : ""} ${player.finished ? "out" : ""}`}
                    >
                      {isActive && (
                        <span className="active-badge">Your Turn</span>
                      )}
                      <div className="p-name">
                        <div className={`p-dot dot-${player.color}`} />
                        {isMe
                          ? `You (${player.color})`
                          : `${player.username} (${player.color})`}
                      </div>
                      <div className="p-stats">
                        On board: {stats.onBoard} &nbsp;|&nbsp; Home:{" "}
                        {stats.home} &nbsp;|&nbsp; Fin: {stats.finished}
                      </div>
                      <div className="prog-wrap">
                        <div
                          className={`prog-fill bg-${player.color}`}
                          style={{ width: `${stats.progress}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* BOARD AREA */}
          <div className="board-area">
            <div className="ludo-board">
              {/* TOP ROW */}
              <div className="board-row board-row--top">
                <div className="home home--red">{renderHomeYard("red")}</div>

                {/* Top Arm (3 cols x 6 rows) - Moving from top outer edge down to center */}
                <div className="track-col track-col--top">
                  {/* Row 1 (Outer Edge) */}
                  {renderSquares(11)}
                  {renderSquares(12)}
                  {renderSquares(13, "sq--start-blue")}
                  {/* Row 2 */}
                  {renderSquares(10)}
                  <div className="sq sq--home-blue">
                    {gameState.players
                      .find((p) => p.color === "blue")
                      ?.tokens.filter((t) => t.position === 53)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(14)}
                  {/* Row 3 */}
                  {renderSquares(9)}
                  <div className="sq sq--home-blue">
                    {gameState.players
                      .find((p) => p.color === "blue")
                      ?.tokens.filter((t) => t.position === 54)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(15)}
                  {/* Row 4 */}
                  {renderSquares(8, "sq--safe")}
                  <div className="sq sq--home-blue">
                    {gameState.players
                      .find((p) => p.color === "blue")
                      ?.tokens.filter((t) => t.position === 55)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(16)}
                  {/* Row 5 */}
                  {renderSquares(7)}
                  <div className="sq sq--home-blue">
                    {gameState.players
                      .find((p) => p.color === "blue")
                      ?.tokens.filter((t) => t.position === 56)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(17)}
                  {/* Row 6 (Inner Edge) */}
                  {renderSquares(6)}
                  <div className="sq sq--home-blue">
                    {gameState.players
                      .find((p) => p.color === "blue")
                      ?.tokens.filter((t) => t.position === 57)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(18)}
                </div>

                <div className="home home--blue">{renderHomeYard("blue")}</div>
              </div>

              {/* MID ROW */}
              <div className="board-row board-row--mid">
                {/* Left Arm (6 cols x 3 rows) - Moving from left outer edge rightward to center */}
                <div className="track-col track-col--left">
                  {/* Row A (Top: moves left to right) */}
                  {renderSquares(0, "sq--start-red")}
                  {renderSquares(1)}
                  {renderSquares(2)}
                  {renderSquares(3)}
                  {renderSquares(4)}
                  {renderSquares(5)}
                  {/* Row B (Mid: Red home stretch) */}
                  {renderSquares(51)}
                  <div className="sq sq--home-red">
                    {gameState.players
                      .find((p) => p.color === "red")
                      ?.tokens.filter((t) => t.position === 53)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-red">
                    {gameState.players
                      .find((p) => p.color === "red")
                      ?.tokens.filter((t) => t.position === 54)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-red">
                    {gameState.players
                      .find((p) => p.color === "red")
                      ?.tokens.filter((t) => t.position === 55)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-red">
                    {gameState.players
                      .find((p) => p.color === "red")
                      ?.tokens.filter((t) => t.position === 56)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-red">
                    {gameState.players
                      .find((p) => p.color === "red")
                      ?.tokens.filter((t) => t.position === 57)
                      .map((t) => renderToken(t))}
                  </div>
                  {/* Row C (Bot: moves right to left) */}
                  {renderSquares(50)}
                  {renderSquares(49)}
                  {renderSquares(48)}
                  {renderSquares(47, "sq--safe")}
                  {renderSquares(46)}
                  {renderSquares(45)}
                </div>

                <div className="centre">
                  <div className="tri tri--top" />
                  <div className="tri tri--right" />
                  <div className="tri tri--bot" />
                  <div className="tri tri--left" />
                  <span className="centre-star">★</span>
                </div>

                {/* Right Arm (6 cols x 3 rows) - Moving from center rightward to outer edge */}
                <div className="track-col track-col--right">
                  {/* Row A (Top: moves left to right) */}
                  {renderSquares(19)}
                  {renderSquares(20)}
                  {renderSquares(21, "sq--safe")}
                  {renderSquares(22)}
                  {renderSquares(23)}
                  {renderSquares(24)}
                  {/* Row B (Mid: Yellow home stretch) */}
                  <div className="sq sq--home-yellow">
                    {gameState.players
                      .find((p) => p.color === "yellow")
                      ?.tokens.filter((t) => t.position === 57)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-yellow">
                    {gameState.players
                      .find((p) => p.color === "yellow")
                      ?.tokens.filter((t) => t.position === 56)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-yellow">
                    {gameState.players
                      .find((p) => p.color === "yellow")
                      ?.tokens.filter((t) => t.position === 55)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-yellow">
                    {gameState.players
                      .find((p) => p.color === "yellow")
                      ?.tokens.filter((t) => t.position === 54)
                      .map((t) => renderToken(t))}
                  </div>
                  <div className="sq sq--home-yellow">
                    {gameState.players
                      .find((p) => p.color === "yellow")
                      ?.tokens.filter((t) => t.position === 53)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(25)}
                  {/* Row C (Bot: moves right to left) */}
                  {renderSquares(31)}
                  {renderSquares(30)}
                  {renderSquares(29)}
                  {renderSquares(28)}
                  {renderSquares(27)}
                  {renderSquares(26, "sq--start-yellow")}
                </div>
              </div>

              {/* BOTTOM ROW */}
              <div className="board-row board-row--bot">
                <div className="home home--green">
                  {renderHomeYard("green")}
                </div>

                {/* Bottom Arm (3 cols x 6 rows) - Moving from center down to bottom outer edge */}
                <div className="track-col track-col--bot">
                  {/* Row 1 (Inner Edge) */}
                  {renderSquares(44)}
                  <div className="sq sq--home-green">
                    {gameState.players
                      .find((p) => p.color === "green")
                      ?.tokens.filter((t) => t.position === 57)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(32)}
                  {/* Row 2 */}
                  {renderSquares(43)}
                  <div className="sq sq--home-green">
                    {gameState.players
                      .find((p) => p.color === "green")
                      ?.tokens.filter((t) => t.position === 56)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(33)}
                  {/* Row 3 */}
                  {renderSquares(42)}
                  <div className="sq sq--home-green">
                    {gameState.players
                      .find((p) => p.color === "green")
                      ?.tokens.filter((t) => t.position === 55)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(34, "sq--safe")}
                  {/* Row 4 */}
                  {renderSquares(41)}
                  <div className="sq sq--home-green">
                    {gameState.players
                      .find((p) => p.color === "green")
                      ?.tokens.filter((t) => t.position === 54)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(35)}
                  {/* Row 5 */}
                  {renderSquares(40)}
                  <div className="sq sq--home-green">
                    {gameState.players
                      .find((p) => p.color === "green")
                      ?.tokens.filter((t) => t.position === 53)
                      .map((t) => renderToken(t))}
                  </div>
                  {renderSquares(36)}
                  {/* Row 6 (Outer Edge) */}
                  {renderSquares(39, "sq--start-green")}
                  {renderSquares(38)}
                  {renderSquares(37)}
                </div>

                <div className="home home--yellow">
                  {renderHomeYard("yellow")}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside>
            <div className="panel">
              <div className="panel-hd">Live Chat</div>
              <div className="chat-window">
                <div className="chat-messages">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`chat-msg ${msg.type === "system" ? "sys" : msg.sender === username ? "mine" : ""}`}
                    >
                      {msg.type !== "system" && (
                        <div
                          className={`msg-meta ${msg.sender === username ? "flex-end-justify" : ""}`}
                        >
                          <span className="msg-sender">
                            {msg.sender === username ? "You" : msg.sender}
                          </span>
                          <span className="msg-time">{msg.time}</span>
                        </div>
                      )}
                      <div className="msg-bubble">{msg.message}</div>
                    </div>
                  ))}
                </div>
                <div className="chat-input-row">
                  <input
                    type="text"
                    value={chat}
                    onChange={(e) => setChat(e.target.value)}
                    placeholder="Type a message…"
                  />
                  <button onClick={sendMessage}>Send</button>
                </div>
              </div>
            </div>

            {/* Victory Overlay */}
            {gameState.status === "finished" && (
              <div className="victory-overlay" style={{ display: "flex" }}>
                <div className="victory-card">
                  <div className="vc-trophy">🏆</div>
                  <h2>Game Over!</h2>
                  <div className="vc-winner">
                    Winner: {gameState.rankings[0]}
                  </div>
                  <div className="vc-stats">
                    {gameState.rankings.map((color, i) => (
                      <div key={color}>
                        {i + 1}. {color}
                      </div>
                    ))}
                  </div>
                  <div className="vc-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => navigate("/newgame/lobby")}
                    >
                      Play Again
                    </button>
                    <button
                      className="btn btn-muted"
                      onClick={() => navigate("/home")}
                    >
                      Main Menu
                    </button>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
