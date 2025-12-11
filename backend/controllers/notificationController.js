import notificationModel from "../models/notificationModel.js";
import userModel from "../models/userModel.js";

// Get notifications for a user
const getNotifications = async (req, res) => {
    try {
        const notifications = await notificationModel
            .find({ userId: req.body.userId })
            .sort({ createdAt: -1 })
            .limit(20);

        const unreadCount = await notificationModel.countDocuments({
            userId: req.body.userId,
            read: false,
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("Get notifications error:", error);
        res.json({ success: false, message: "Error fetching notifications" });
    }
};

// Mark notification as read
const markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;

        await notificationModel.findByIdAndUpdate(notificationId, {
            read: true,
            readAt: new Date(),
        });

        res.json({ success: true, message: "Notification marked as read" });
    } catch (error) {
        console.error("Mark as read error:", error);
        res.json({ success: false, message: "Error updating notification" });
    }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
    try {
        await notificationModel.updateMany(
            { userId: req.body.userId, read: false },
            { read: true, readAt: new Date() }
        );

        res.json({ success: true, message: "All notifications marked as read" });
    } catch (error) {
        console.error("Mark all as read error:", error);
        res.json({ success: false, message: "Error updating notifications" });
    }
};

// Create a notification (internal use)
const createNotification = async (userId, title, message, type = "order", orderId = null, data = {}) => {
    try {
        const notification = new notificationModel({
            userId,
            title,
            message,
            type,
            orderId,
            data,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Create notification error:", error);
        return null;
    }
};

// Delete old notifications (cleanup)
const deleteOldNotifications = async (req, res) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        await notificationModel.deleteMany({
            userId: req.body.userId,
            createdAt: { $lt: thirtyDaysAgo },
        });

        res.json({ success: true, message: "Old notifications deleted" });
    } catch (error) {
        console.error("Delete old notifications error:", error);
        res.json({ success: false, message: "Error deleting notifications" });
    }
};

export {
    getNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteOldNotifications,
};
