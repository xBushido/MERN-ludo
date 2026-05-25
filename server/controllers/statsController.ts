import type { Request, Response } from "express";
import User from "../models/user.ts";
import Game from "../models/game.ts";

export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        const allUsers = await User.find({}, "username total_played coins").sort({coins: -1, total_played: 1});
        res.status(200).json(allUsers);
    } catch(err) {
        res.status(500).json({message: "Server Error"});
    }
}

export const getHistory = async (req: Request, res: Response) => {
    try {
        const {username} = req.params;
        const history = await Game.find({"players.username": username}).sort({finishedat: -1});
        res.status(200).json(history);

    } catch(err) {
        res.status(500).json({message: "Server Error"});
    }
}

export const getWins = async (req: Request, res: Response) => {
    try {
        const {username} = req.params;
        const allUserGames = await Game.find({ "players.username": username });

        // Bypassing Mongoose query bugs
        const winCount = allUserGames.filter((game) => {
            const myPlayer = game.players.find(p => p.username === username);
            return myPlayer && myPlayer.rank === 1;
        }).length;

        res.status(200).json({ wins: winCount });
    } catch (err) {
        console.error("Failed to fetch wins:", err);
        res.status(500).json({ message: "Server Error" });
    }
};