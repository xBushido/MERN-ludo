import { Router } from "express"
import { getprofile, login, signup, updateprofile } from "../controllers/authController.ts";

const authRoutes = Router();

authRoutes.post("/login", login);
authRoutes.post("/signup", signup);
authRoutes.get("/profile/:username", getprofile);
authRoutes.put("/update-profile", updateprofile);

export default authRoutes;