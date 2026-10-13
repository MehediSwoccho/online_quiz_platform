import express from "express";
import { chatWithAI, getChatHistory, getChatbotCapabilities } from "../controllers/chatbot.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();

// All chatbot routes require authentication
router.use(protectRoute);

// Chat with AI
router.post("/chat", chatWithAI);

// Get chat history (optional)
router.get("/history", getChatHistory);

// Get chatbot capabilities
router.get("/capabilities", getChatbotCapabilities);

export default router;
