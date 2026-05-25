# MERN-ludo
A complete 'Ludo' game using the MERN stack

This project is a real-time, browser-based multiplayer Ludo game built as a full-stack web application. Up to four players can join a shared lobby, play on a classic 15×15 Ludo board, and communicate through an in-game live chat. All game state is synchronised between clients using Socket.IO.

---

To Run:
- Add your MONGO URI and PORT in config.env
- Install dependencies using npm install in client and server folders
- Start the backend and frontend using npm run dev

---

## Tech Stack

- **Frontend:** React.js (Vite), TypeScript, React Router DOM, Custom CSS
- **Backend:** Node.js, Express.js, TypeScript
- **Real-Time Communication:** Socket.IO (WebSockets)
- **Database & Persistence:** MongoDB & Mongoose ODM

---

## Key Features

- **Real-Time Multiplayer:** Full bidirectional synchronization via Socket.IO for 2–4 players with zero page polling.
- **Server-Authoritative Logic:** Crucial mechanics (dice rolling, movement validation, captures, and win checking) are handled strictly on the server to prevent cheating.
- **Turn Management:** Automatic 20-second turn countdown timer enforced server-side.
- **AI-Controlled Disconnects:** An AI bot takes over and makes random legal moves if a player disconnects, transferring control back instantly upon reconnection.
- **Persistent User Management:** Secure login/signup system where each new player starts with 100 coins. Auth states persist across page reloads using browser tokens/cookies.
- **Live Match History & Leaderboard:** Global standings filtered by coin balances with game-count tiebreakers, alongside individual historical match logs.
- **In-Game Chat & System Logs:** Live messaging capabilities paired with real-time system notifications for critical events (e.g., captures, finishes).

---
