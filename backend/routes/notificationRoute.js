import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteOldNotifications,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

// Get user notifications
notificationRouter.get("/", authMiddleware, getNotifications);

// Mark single notification as read
notificationRouter.put("/read/:notificationId", authMiddleware, markAsRead);

// Mark all notifications as read
notificationRouter.put("/read-all", authMiddleware, markAllAsRead);

// Delete old notifications
notificationRouter.delete("/cleanup", authMiddleware, deleteOldNotifications);

export default notificationRouter;
