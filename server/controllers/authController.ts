import type { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../models/user.ts";

export const login = (async (req: Request, res: Response) => {
    const {username, password} = req.body;

    const user = await User.findOne({username});
    if(!user) {
        res.status(400).json({message: "User not Found"});
        return;
    }
    if(user.password !== password) {
        res.status(400).json({message: "Incorrect Password"});
        return;
    }
    else {
        const token = jwt.sign(
            {username: user.username},
            process.env.JWT_SECRET!,
            {expiresIn: "15d"}
        );
        res.status(200).json({token, username: user.username});
    }
});

export const signup = (async (req: Request, res: Response) => {
    const {username, password, confirmPassword, dob} = req.body;

    const user = await User.findOne({username});
    if(user) {
        res.status(400).json({message: "Username already taken"});
    }
    else if(password !== confirmPassword) {
        res.status(400).json({message: "Passwords do not match"});
    }
    else {
        await User.create({username, password, dob});
        res.status(201).json({message: "Signup Successful"});
    }
});

export const updateprofile = async (req: Request, res: Response) => {
    const {username, newUsername, currentPassword, newPassword, confirmPassword, dob} = req.body;
    const user = await User.findOne({username});
    try {
        if(user!.password !== currentPassword) {
            res.status(400).json({message: "Incorrect Current Password"});
        }
        else if(newPassword !== confirmPassword) {
            res.status(400).json({message: "Passwords do not Match"});
        }
        else {
            await User.findOneAndUpdate(
                {username},
                {username: newUsername, password: newPassword, dob: dob}
            );
            res.status(200).json({message: "Profile Updated"});
        }
    }
    catch(err) {
        res.status(500).json({message: "Server Error"});
    }
};


// Get

export const getprofile = async (req: Request, res: Response) => {
    const {username} = req.params;
    const user = await User.findOne({username});
    res.status(200).json({
        _id: user?._id,
        username: user?.username,
        dob: user?.dob,
        coins: user?.coins,
        totalPlayed: user?.total_played
    });
};

export const getNavbarStats = async(req: Request, res: Response) => {
    const {username} = req.params;
    const user = await User.findOne({username});
    res.status(200).json({
        username: user?.username,
        coins: user?.coins,
        totalPlayed: user?.total_played,
    });
};
