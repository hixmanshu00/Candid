import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import connectDb from "./config/connectDb.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import { generalLimiter, authLimiter } from "./middlewares/rateLimiter.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import interviewRouter from "./routes/interview.route.js";
import paymentRouter from "./routes/payment.route.js";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (mobile apps, curl) or from local network
      if (!origin) return cb(null, true);
      const allowed = [
        process.env.CLIENT_URL,
        "http://localhost:5173",
      ].filter(Boolean);
      // Allow any 192.168.x.x or 10.x.x.x origin (same LAN)
      if (/^https?:\/\/(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(origin)) return cb(null, true);
      if (allowed.includes(origin)) return cb(null, true);
      cb(new Error("CORS: origin not allowed"));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use(generalLimiter);

app.get("/health", (_req, res) => res.json({ status: "ok", ts: Date.now() }));

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/user", userRouter);
app.use("/api/interview", interviewRouter);
app.use("/api/payment", paymentRouter);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectDb();
});
