import express from "express";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middlewares/protectRoute.js";

const router = express.Router();


router.use(protectRoute);


router.get("/", getUserNotifications);


router.get("/unread-count", getUnreadCount);


router.put("/:notificationId/read", markNotificationRead);


router.put("/mark-all-read", markAllNotificationsRead);

export default router;