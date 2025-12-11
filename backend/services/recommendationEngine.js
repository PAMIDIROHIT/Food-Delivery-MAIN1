import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

// Get trending/popular items based on order frequency
const getTrendingItems = async (limit = 8) => {
    try {
        // Aggregate orders to find most ordered items
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get all recent orders
        const recentOrders = await orderModel.find({
            date: { $gte: thirtyDaysAgo },
            payment: true,
        });

        // Count item frequencies
        const itemCounts = {};
        recentOrders.forEach((order) => {
            order.items.forEach((item) => {
                const itemId = item._id || item.id;
                if (itemId) {
                    itemCounts[itemId] = (itemCounts[itemId] || 0) + (item.quantity || 1);
                }
            });
        });

        // Sort by count and get top items
        const sortedItems = Object.entries(itemCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, limit);

        // Get item IDs
        const topItemIds = sortedItems.map(([id]) => id);

        if (topItemIds.length === 0) {
            // Fallback to random items if no orders
            const allItems = await foodModel.find({}).limit(limit);
            return allItems;
        }

        // Fetch item details
        const trendingItems = await foodModel.find({
            _id: { $in: topItemIds },
        });

        // Sort by order count
        trendingItems.sort((a, b) => {
            const countA = itemCounts[a._id.toString()] || 0;
            const countB = itemCounts[b._id.toString()] || 0;
            return countB - countA;
        });

        return trendingItems;
    } catch (error) {
        console.error("Get trending items error:", error);
        // Fallback to random items
        return await foodModel.find({}).limit(limit);
    }
};

// Get personalized recommendations based on user's order history
const getPersonalizedRecommendations = async (userId, limit = 8) => {
    try {
        if (!userId) {
            return await getTrendingItems(limit);
        }

        // Get user's order history
        const userOrders = await orderModel.find({
            userId,
            payment: true,
        }).sort({ date: -1 }).limit(20);

        if (userOrders.length === 0) {
            return await getTrendingItems(limit);
        }

        // Analyze user preferences
        const categoryPreferences = {};
        const orderedItemIds = new Set();

        userOrders.forEach((order) => {
            order.items.forEach((item) => {
                if (item.category) {
                    categoryPreferences[item.category] =
                        (categoryPreferences[item.category] || 0) + (item.quantity || 1);
                }
                if (item._id) {
                    orderedItemIds.add(item._id.toString());
                }
            });
        });

        // Get top preferred categories
        const topCategories = Object.entries(categoryPreferences)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category]) => category);

        // Query for similar items
        let recommendations;
        if (topCategories.length > 0) {
            recommendations = await foodModel.find({
                category: { $in: topCategories },
                _id: { $nin: Array.from(orderedItemIds).slice(-10) }, // Exclude recently ordered
            }).limit(limit);
        }

        if (!recommendations || recommendations.length < limit) {
            // Fill with trending items
            const trendingItems = await getTrendingItems(limit - (recommendations?.length || 0));
            recommendations = [...(recommendations || []), ...trendingItems];
        }

        // Remove duplicates
        const uniqueRecommendations = recommendations.filter(
            (item, index, self) =>
                index === self.findIndex((t) => t._id.toString() === item._id.toString())
        );

        return uniqueRecommendations.slice(0, limit);
    } catch (error) {
        console.error("Get personalized recommendations error:", error);
        return await getTrendingItems(limit);
    }
};

// Get similar items based on category and price range
const getSimilarItems = async (foodId, limit = 6) => {
    try {
        const food = await foodModel.findById(foodId);
        if (!food) {
            return [];
        }

        // Find items in same category with similar price
        const priceRange = {
            min: food.price * 0.5,
            max: food.price * 1.5,
        };

        const similarItems = await foodModel.find({
            _id: { $ne: foodId },
            category: food.category,
            price: { $gte: priceRange.min, $lte: priceRange.max },
        }).limit(limit);

        // If not enough items, get from same category without price filter
        if (similarItems.length < limit) {
            const moreSimilar = await foodModel.find({
                _id: { $nin: [foodId, ...similarItems.map((i) => i._id)] },
                category: food.category,
            }).limit(limit - similarItems.length);

            similarItems.push(...moreSimilar);
        }

        return similarItems;
    } catch (error) {
        console.error("Get similar items error:", error);
        return [];
    }
};

// Get time-based suggestions (breakfast/lunch/dinner)
const getTimeBasedSuggestions = async (limit = 8) => {
    try {
        const hour = new Date().getHours();
        let categories = [];

        if (hour >= 6 && hour < 11) {
            // Breakfast
            categories = ["Breakfast", "Sandwich", "Cake", "Pure Veg"];
        } else if (hour >= 11 && hour < 15) {
            // Lunch
            categories = ["Rolls", "Pasta", "Noodles", "Sandwich"];
        } else if (hour >= 15 && hour < 18) {
            // Snacks
            categories = ["Cake", "Deserts", "Sandwich"];
        } else {
            // Dinner
            categories = ["Pasta", "Noodles", "Rolls", "Pure Veg"];
        }

        const suggestions = await foodModel.find({
            category: { $in: categories },
        }).limit(limit);

        // Fill with random items if not enough
        if (suggestions.length < limit) {
            const moreItems = await foodModel.find({
                _id: { $nin: suggestions.map((i) => i._id) },
            }).limit(limit - suggestions.length);
            suggestions.push(...moreItems);
        }

        return suggestions;
    } catch (error) {
        console.error("Get time-based suggestions error:", error);
        return await foodModel.find({}).limit(limit);
    }
};

// Get category-based recommendations
const getCategoryRecommendations = async (category, limit = 8) => {
    try {
        const items = await foodModel.find({ category }).limit(limit);
        return items;
    } catch (error) {
        console.error("Get category recommendations error:", error);
        return [];
    }
};

export {
    getTrendingItems,
    getPersonalizedRecommendations,
    getSimilarItems,
    getTimeBasedSuggestions,
    getCategoryRecommendations,
};
