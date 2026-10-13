import express from "express";
import { 
  getChildQuizResults, 
  getQuizResultDetails, 
  getParentNotifications 
} from "../controllers/parent.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// All parent routes require authentication
router.use(protectRoute);

// Get all quiz results for parent's child
router.get("/quiz-results", getChildQuizResults);

// Get detailed quiz result
router.get("/quiz-results/:submissionId", getQuizResultDetails);

// Get parent notifications (low scores)
router.get("/notifications", getParentNotifications);

export default router;
