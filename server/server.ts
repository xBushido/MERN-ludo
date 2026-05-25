import { Server } from "socket.io";
import http from "http";
import { app } from "./app.ts";
import { config } from "dotenv";
import mongoose from "mongoose";
import { canMove, getNewPos, hasValidMove } from "./utils/gameLogic.ts";
import User from "./models/user.ts";
import Game from "./models/game.ts";
import { coinsCalculator } from "./utils/coinsCalculator.ts";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: false,
  },
});

config({
  path: "./config.env",
});

mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

interface Player {
  socketId: string;
  username: string;
  color: string;
}

interface Room {
  gameId: string;
  players: Player[];
  status: "waiting" | "playing";
  host: string;
}

interface Token {
  id: string;
  color: string;
  position: number;
}

interface GamePlayer {
  username: string;
  color: string;
  socketid: string;
  tokens: Token[];
  finished: boolean;
  rank: number | null;
  disconnected: boolean
}

interface GameState {
  gameId: string;
  players: GamePlayer[];
  currentTurn: string;
  diceValue: number | null;
  isDiceRolled: boolean;
  status: "playing" | "finished";
  rankings: string[];
  timer: ReturnType<typeof setTimeout> | null;
}

const rooms: { [key: string]: Room } = {};
const COLORS = ["red", "blue", "green", "yellow"];
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];
const START_POS = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
};

const gameStates: { [key: string]: GameState } = {};
function initialState(gameId: string, players: Player[]): GameState {
  return {
    gameId: gameId,
    players: players.map((ply) => ({
      username: ply.username,
      color: ply.color,
      socketid: ply.socketId,
      tokens: [0, 1, 2, 3].map((i) => ({
        id: `${ply.color}-${i}`,
        color: ply.color,
        position: -1,
      })),
      finished: false,
      rank: null,
      disconnected: false
    })),
    currentTurn: "red",
    diceValue: null,
    isDiceRolled: false,
    status: "playing",
    rankings: [],
    timer: null,
  };
}

function changeTurn(state: GameState) {
  const activePlayers = state.players
    .filter((p) => !p.finished)
    .map((p) => p.color);
  const currIndex = activePlayers.indexOf(state.currentTurn);
  const nextIndex = (currIndex + 1) % activePlayers.length;
  state.currentTurn = activePlayers[nextIndex];
  state.diceValue = null;
  state.isDiceRolled = false;
}

function turnTimer(gameId: string) {
  const state = gameStates[gameId];
  let delay = 0;
  if (!state) return;

  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }
  const player = state.players.find((p) => p.color === state.currentTurn);
  if(player?.disconnected) {
    delay = 0
  }
  else delay = 20000;
  state.timer = setTimeout(() => {
    const diceValue = Math.floor(Math.random() * 6) + 1;
    const validToken = player?.tokens.filter((t) => canMove(t, diceValue));
    if (validToken && validToken.length > 0) {
      const randomToken =
        validToken[Math.floor(Math.random() * validToken.length)];
      randomToken.position = getNewPos(
        randomToken,
        diceValue,
        state.currentTurn,
      );
    }
    changeTurn(state);
    emitState(gameId);
  }, delay);
}

function emitState(gameId: string) {
  const state = gameStates[gameId];
  if (!state) return;
  const { timer, ...stateToSend } = state;
  io.to(gameId).emit("game:state", stateToSend);
}

io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  socket.on("room:join", ({ username }) => {
    let room = Object.values(rooms).find(
      (r) => r.status === "waiting" && r.players.length < 4,
    );
    if (room) {
      const existing = room.players.find((p) => p.username === username);
      if (existing) {
        existing.socketId = socket.id;
        socket.join(room.gameId);
        io.to(room.gameId).emit("room:update", {
          players: room.players,
          gameId: room.gameId,
          hostId: room.host,
        });
        return;
      }
    } else {
      const gameId = Math.random().toString(36).substring(2, 8);
      room = { gameId, players: [], status: "waiting", host: socket.id };
      rooms[gameId] = room;
    }
    const color = COLORS[room.players.length];
    room.players.push({ socketId: socket.id, username, color });
    socket.join(room.gameId);
    io.to(room.gameId).emit("room:update", {
      players: room.players,
      gameId: room.gameId,
      host: room.host,
    });
  });

  socket.on("room:leave", ({ username }) => {
    const room = Object.values(rooms).find((r) =>
      r.players.find((p) => p.username === username),
    );
    if (!room) return;
    room.players = room.players.filter((p) => p.username !== username);
    io.to(room.gameId).emit("room:update", {
      players: room.players,
      gameId: room.gameId,
      hostId: room.host,
    });
  });

  socket.on("room:start", async ({ gameId }) => {
    try {
      const room = rooms[gameId];

      if (!room || room.players.length < 2) return;
      if (room.host !== socket.id)
        return socket.emit("ERROR", {
          message: "Only host can start the game",
        });
      room.status = "playing";
      gameStates[gameId] = initialState(gameId, room.players);
      turnTimer(gameId);

      const { timer, ...stateToSend } = gameStates[gameId];
      io.to(gameId).emit("game:start", {
        gameId: gameId,
        state: stateToSend,
      });
    } catch (err) {
      console.log("room start error: ", err);
    }
  });

  socket.on("game:roll", ({ gameId }) => {
    const state = gameStates[gameId];
    if (!state) return;
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
    const player = state.players.find((p) => p.socketid === socket.id);
    if (!player || player.color !== state.currentTurn) return;
    if(player.disconnected) return;

    if (state.isDiceRolled) return;

    const diceValue = Math.floor(Math.random() * 6) + 1;
    state.diceValue = diceValue;
    state.isDiceRolled = true;

    if (!hasValidMove(player.tokens, diceValue)) {
      changeTurn(state);
      turnTimer(gameId);
    }
    emitState(gameId);
  });

  socket.on("game:move", async ({ gameId, tokenId }) => {
    const state = gameStates[gameId];
    if (!state) return;

    const player = state.players.find((p) => p.socketid === socket.id);
    if (!player || player.color !== state.currentTurn) return;
    if (!state.isDiceRolled) return;

    const token = player.tokens.find((t) => t.id === tokenId);
    if (!token || !canMove(token, state.diceValue!)) return;

    const newPos = getNewPos(token, state.diceValue!, player.color);
    token.position = newPos;

    if (newPos < 52 && !SAFE_POSITIONS.includes(newPos)) {
      state.players.forEach((opp) => {
        if (opp.color === player.color) return;
        opp.tokens.forEach((t) => {
          if (t.position === newPos) {
            t.position = -1;
            io.to(gameId).emit("game:capture", {
              capturedBy: player.color,
              captured: opp.color,
            });
          }
        });
      });
    }

    if (newPos === 57) {
      const allFinished = player.tokens.every((t) => t.position === 57);
      if (allFinished) {
        player.finished = true;
        player.rank = state.rankings.length + 1;
        state.rankings.push(player.color);
      }
    }

    const activePlayers = state.players.filter((p) => !p.finished);
    if (activePlayers.length <= 1) {
      state.status = "finished";
      if (activePlayers.length === 1) {
        activePlayers[0].finished = true;
        activePlayers[0].rank = state.players.length;
        state.rankings.push(activePlayers[0].color);
      }
      const { timer, ...stateToSend } = state;
      await Game.create({
        total_players: state.players.length,
        players: state.players.map((p) => ({
          username: p.username,
          color: p.color,
          rank: p.rank,
          coins_earned: coinsCalculator(p.rank!, state.players.length)
        })),
        status: "finished",
        started_at: new Date(),
        finished_at: new Date()
      });
      for(let p of state.players) {
        const coins = coinsCalculator(p.rank!, state.players.length);
        await User.findOneAndUpdate(
          {username: p.username},
          {$inc: {coins: coins, total_played: 1}}
        );
      }

      io.to(gameId).emit("game:over", {
        rankings: state.rankings,
        state: stateToSend,
      });
    } else {
      if (state.diceValue === 6) {
        state.isDiceRolled = false;
        state.diceValue = null;
        turnTimer(gameId);
      } else {
        changeTurn(state);
        turnTimer(gameId);
      }
    }
    emitState(gameId);
  });

  socket.on("game:rejoin", ({ gameId, username }) => {
    const state = gameStates[gameId];
    if (!state) return;

    const player = state.players.find((p) => p.username === username);
    if (!player) return;

    player.socketid = socket.id;
    player.disconnected = false;
    socket.join(gameId);
    emitState(gameId);
  });

  socket.on("disconnect", () => {
    for(let id in gameStates) {
      const state = gameStates[id];
      const player = state.players.find((p) => p.socketid === socket.id);
      if(player) {
        player.disconnected = true;
        emitState(id);
        break;
      }
    }
  })

  socket.on("game:chat", ({ gameId, username, text }) => {
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    io.to(gameId).emit("game:chat", {
      sender: username,
      message: text,
      time: time,
      type: "chat",
    });
  });
});

server.listen(8000, () => {
  console.log("Server is running on port 8000");
});
