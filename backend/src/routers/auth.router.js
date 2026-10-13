import express from "express";
import { signup,login,logout,updateProfile,checkAuth,parentLogin } from "../controllers/auth.controller.js";
import {validate} from "../middlewares/userValidate.middleware.js"
import {protectRoute} from "../middlewares/protectRoute.js"  


const router = express.Router();

// Public routes - no authentication required
router.post("/signup",validate,signup)  
router.post("/login",login)
router.post("/parent-login",parentLogin)
router.post("/logout",logout)
router.get("/check",checkAuth);  // Make this public to avoid circular dependency

// Protected routes - authentication required
router.put("/update-profile",protectRoute,updateProfile) 


export default router;