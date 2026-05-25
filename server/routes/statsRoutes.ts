import { Router } from "express"
import { getHistory, getLeaderboard, getWins } from "../controllers/statsController.ts";


const statRoutes = Router();

statRoutes.get("/leaderboard", getLeaderboard);
statRoutes.get("/history/:username", getHistory);
statRoutes.get("/wins/:username", getWins);

export default statRoutes;