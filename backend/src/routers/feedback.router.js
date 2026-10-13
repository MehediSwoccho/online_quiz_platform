import express from 'express';
import { createTeacherFeedback, createStudentComment, getClassFeedback } from '../controllers/feedback.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

// All routes require authentication
router.use(protectRoute);

// Create teacher feedback
router.post('/teacher', createTeacherFeedback);

// Create student comment
router.post('/student', createStudentComment);

// Get all feedback for a class
router.get('/class/:classId', getClassFeedback);

export default router;