import {
    getTrendingItems,
    getPersonalizedRecommendations,
    getSimilarItems,
    getTimeBasedSuggestions,
    getCategoryRecommendations,
} from "../services/recommendationEngine.js";

// Get personalized recommendations for logged-in user
const getRecommendations = async (req, res) => {
    try {
        const userId = req.body.userId;
        const limit = parseInt(req.query.limit) || 8;

        const recommendations = await getPersonalizedRecommendations(userId, limit);

        res.json({
            success: true,
            data: recommendations,
            type: "personalized",
        });
    } catch (error) {
        console.error("Get recommendations error:", error);
        res.json({ success: false, message: "Error fetching recommendations" });
    }
};

// Get trending items (no auth required)
const getTrending = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const trending = await getTrendingItems(limit);

        res.json({
            success: true,
            data: trending,
            type: "trending",
        });
    } catch (error) {
        console.error("Get trending error:", error);
        res.json({ success: false, message: "Error fetching trending items" });
    }
};

// Get similar items to a specific food item
const getSimilar = async (req, res) => {
    try {
        const { foodId } = req.params;
        const limit = parseInt(req.query.limit) || 6;

        const similar = await getSimilarItems(foodId, limit);

        res.json({
            success: true,
            data: similar,
            type: "similar",
        });
    } catch (error) {
        console.error("Get similar error:", error);
        res.json({ success: false, message: "Error fetching similar items" });
    }
};

// Get time-based suggestions (breakfast/lunch/dinner)
const getTimeBased = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 8;
        const suggestions = await getTimeBasedSuggestions(limit);

        const hour = new Date().getHours();
        let mealTime = "snacks";
        if (hour >= 6 && hour < 11) mealTime = "breakfast";
        else if (hour >= 11 && hour < 15) mealTime = "lunch";
        else if (hour >= 18) mealTime = "dinner";

        res.json({
            success: true,
            data: suggestions,
            type: "time-based",
            mealTime,
        });
    } catch (error) {
        console.error("Get time-based error:", error);
        res.json({ success: false, message: "Error fetching suggestions" });
    }
};

// Get category-specific recommendations
const getByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const limit = parseInt(req.query.limit) || 8;

        const items = await getCategoryRecommendations(category, limit);

        res.json({
            success: true,
            data: items,
            type: "category",
            category,
        });
    } catch (error) {
        console.error("Get by category error:", error);
        res.json({ success: false, message: "Error fetching category items" });
    }
};

// Get all recommendation types in one call (for home page)
const getAllRecommendations = async (req, res) => {
    try {
        const userId = req.body?.userId;
        const limit = 6;

        const [trending, personalized, timeBased] = await Promise.all([
            getTrendingItems(limit),
            userId ? getPersonalizedRecommendations(userId, limit) : Promise.resolve([]),
            getTimeBasedSuggestions(limit),
        ]);

        res.json({
            success: true,
            data: {
                trending,
                personalized: personalized.length > 0 ? personalized : null,
                timeBased,
            },
        });
    } catch (error) {
        console.error("Get all recommendations error:", error);
        res.json({ success: false, message: "Error fetching recommendations" });
    }
};

export {
    getRecommendations,
    getTrending,
    getSimilar,
    getTimeBased,
    getByCategory,
    getAllRecommendations,
};
