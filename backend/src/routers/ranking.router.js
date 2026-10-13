import express from 'express';
import { getClassRankings, getOverallRankings } from '../controllers/ranking.controller.js';
import { protectRoute } from '../middlewares/protectRoute.js';

const router = express.Router();

// Get rankings for a specific class
router.get('/class/:classId', protectRoute, getClassRankings);

// Get overall rankings across all classes
router.get('/overall', protectRoute, getOverallRankings);

export default router;