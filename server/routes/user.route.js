import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { getCurrentUser, getUserProgress } from "../controllers/user.controller.js";

const userRouter = express.Router();

userRouter.get("/current-user", isAuth, getCurrentUser);
userRouter.get("/progress", isAuth, getUserProgress);

export default userRouter;
