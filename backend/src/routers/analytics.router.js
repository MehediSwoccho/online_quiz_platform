import express from "express";
import { getStudentAnalytics, getClassAnalytics } from "../controllers/analytics.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// Get overall student analytics
router.get("/student", protectRoute, getStudentAnalytics);

// Get class-specific analytics
router.get("/class/:classId", protectRoute, getClassAnalytics);

export default router;

