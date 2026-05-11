import express from "express";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";
import { aiLimiter, resumeLimiter } from "../middlewares/rateLimiter.js";
import { validate } from "../middlewares/validate.js";
import {
  analyzeResume,
  finishInterview,
  generateQuestion,
  generateShareToken,
  getInterviewReport,
  getMyInterviews,
  getSharedReport,
  submitAnswer,
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

// Public route — no auth required
interviewRouter.get("/shared/:token", getSharedReport);

// Protected routes
interviewRouter.post("/resume", isAuth, resumeLimiter, upload.single("resume"), analyzeResume);
interviewRouter.post(
  "/generate-questions",
  isAuth,
  aiLimiter,
  validate("generateQuestion"),
  generateQuestion
);
interviewRouter.post(
  "/submit-answer",
  isAuth,
  aiLimiter,
  validate("submitAnswer"),
  submitAnswer
);
interviewRouter.post(
  "/finish",
  isAuth,
  validate("finishInterview"),
  finishInterview
);
interviewRouter.post("/:id/share", isAuth, generateShareToken);

interviewRouter.get("/get-interview", isAuth, getMyInterviews);
interviewRouter.get("/report/:id", isAuth, getInterviewReport);

export default interviewRouter;
