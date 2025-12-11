import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    getRecommendations,
    getTrending,
    getSimilar,
    getTimeBased,
    getByCategory,
    getAllRecommendations,
} from "../controllers/recommendationController.js";

const recommendationRouter = express.Router();

// Get personalized recommendations (requires auth)
recommendationRouter.get("/personalized", authMiddleware, getRecommendations);

// Get trending items (no auth required)
recommendationRouter.get("/trending", getTrending);

// Get similar items (no auth required)
recommendationRouter.get("/similar/:foodId", getSimilar);

// Get time-based suggestions (no auth required)
recommendationRouter.get("/time-based", getTimeBased);

// Get category items (no auth required)
recommendationRouter.get("/category/:category", getByCategory);

// Get all recommendation types at once (optional auth)
recommendationRouter.post("/all", getAllRecommendations);

export default recommendationRouter;
