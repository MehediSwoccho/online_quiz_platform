import express from "express";
import { 
  submitRating, 
  getStudentRating, 
  getClassRatingStats, 
  getTeacherRatings,
  deleteRating 
} from "../controllers/rating.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// Student routes
router.post("/submit", protectRoute, submitRating);
router.get("/student/:classId", protectRoute, getStudentRating);
router.delete("/student/:classId", protectRoute, deleteRating);

// Teacher routes
router.get("/class/:classId/stats", protectRoute, getClassRatingStats);
router.get("/teacher", protectRoute, getTeacherRatings);

export default router;
