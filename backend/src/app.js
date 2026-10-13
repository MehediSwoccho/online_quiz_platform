import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import authRouter from "./routers/auth.router.js";
import classRouter from "./routers/class.router.js";
import quizRouter from "./routers/quiz.router.js";
import notificationRouter from "./routers/notification.router.js";
import rankingRouter from "./routers/ranking.router.js";
import feedbackRouter from "./routers/feedback.router.js";
import analyticsRouter from "./routers/analytics.router.js";
import chatbotRouter from "./routers/chatbot.router.js";
import consultationRouter from "./routers/consultation.router.js";
import ratingRouter from "./routers/rating.router.js";
import parentRouter from "./routers/parent.router.js";

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(cookieParser());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS."));
  },
  credentials: true,
}));

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

app.use("/api/auth", authRouter);
app.use("/api/classes", classRouter);
app.use("/api/quizzes", quizRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/rankings", rankingRouter);
app.use("/api/feedback", feedbackRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/chatbot", chatbotRouter);
app.use("/api/consultations", consultationRouter);
app.use("/api/ratings", ratingRouter);
app.use("/api/parent", parentRouter);

export { app };
export default app;
