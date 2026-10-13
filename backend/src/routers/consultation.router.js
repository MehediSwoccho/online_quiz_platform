import express from "express";
import { 
  requestConsultation, 
  getTeacherConsultations, 
  acceptConsultation, 
  sendMessage, 
  getConsultationDetails, 
  getStudentConsultations,
  completeConsultation 
} from "../controllers/consultation.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// Student routes
router.post("/request", protectRoute, requestConsultation);
router.get("/student", protectRoute, getStudentConsultations);

// Teacher routes
router.get("/teacher", protectRoute, getTeacherConsultations);
router.put("/accept/:consultationId", protectRoute, acceptConsultation);

// Common routes
router.get("/:consultationId", protectRoute, getConsultationDetails);
router.post("/:consultationId/message", protectRoute, sendMessage);
router.put("/:consultationId/complete", protectRoute, completeConsultation);

export default router;
