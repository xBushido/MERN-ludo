import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.ts";
import statRoutes from "./routes/statsRoutes.ts";

export const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/auth", authRoutes);
app.use("/stats", statRoutes);