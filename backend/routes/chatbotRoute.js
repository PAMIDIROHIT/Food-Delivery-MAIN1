import express from "express";
import rateLimit from "express-rate-limit";
import authMiddleware from "../middleware/auth.js";
import {
    sendMessage,
    getHistory,
    clearHistory,
    trackOrder,
    getMenuCards,
} from "../controllers/chatbotController.js";

const chatbotRouter = express.Router();

// Rate limiter: 30 requests per minute per user
const chatLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        success: false,
        message: "Too many messages! Please slow down and try again in a minute.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// All routes require authentication
chatbotRouter.use(authMiddleware);

// Chat endpoints
chatbotRouter.post("/message", chatLimiter, sendMessage);
chatbotRouter.get("/history", getHistory);
chatbotRouter.delete("/clear", clearHistory);
chatbotRouter.get("/track-order", trackOrder);
chatbotRouter.get("/menu-cards", getMenuCards);

export default chatbotRouter;
