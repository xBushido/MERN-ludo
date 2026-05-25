import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

import Landing from './pages/landing'
import Login from './pages/login'
import Signup from './pages/signup'
import Home from './pages/home'
import UpdateProfile from './pages/update-profile'
import Lobby from './pages/lobby'
import Game from './pages/game'
import Leaderboard from './pages/leaderboard'
import History from './pages/history'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/newgame/lobby" element={<Lobby />} />
        <Route path="/newgame/:game_id" element={<Game />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  )
}

export default App
