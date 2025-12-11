import conversationModel from "../models/conversationModel.js";
import chatbotService from "../services/chatbotService.js";

// Send a message to the chatbot
export const sendMessage = async (req, res) => {
    try {
        const { message, userId } = req.body;

        // Validate message
        if (!message || message.trim() === "") {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty",
            });
        }

        // Check for userId from auth middleware
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login to use the chatbot",
            });
        }

        // Find or create conversation
        let conversation = await conversationModel.findOne({ userId });
        if (!conversation) {
            conversation = new conversationModel({ userId, messages: [] });
        }

        // Get conversation history for context (last 10 messages)
        const conversationHistory = conversation.messages.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        // Get AI response
        const response = await chatbotService.sendMessage(
            message.trim(),
            userId,
            conversationHistory
        );

        // Save user message
        conversation.messages.push({
            role: "user",
            content: message.trim(),
        });

        // Save bot response (text only, not menu cards)
        conversation.messages.push({
            role: "assistant",
            content: response.message,
        });

        await conversation.save();

        // Return response with menu cards if available
        res.json({
            success: true,
            message: response.message,
            menuCards: response.menuCards || null,
            addToCart: response.addToCart || null,
            timestamp: response.timestamp,
            isFallback: response.isFallback || false,
        });
    } catch (error) {
        console.error("Chatbot sendMessage error:", error);
        res.status(500).json({
            success: false,
            message: "Something went wrong. Please try again.",
        });
    }
};

// Get conversation history
export const getHistory = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login to view chat history",
            });
        }

        const conversation = await conversationModel.findOne({ userId });

        res.json({
            success: true,
            messages: conversation ? conversation.messages : [],
        });
    } catch (error) {
        console.error("Chatbot getHistory error:", error);
        res.status(500).json({
            success: false,
            message: "Could not fetch chat history",
        });
    }
};

// Clear conversation history
export const clearHistory = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login first",
            });
        }

        await conversationModel.deleteOne({ userId });

        res.json({
            success: true,
            message: "Chat history cleared",
        });
    } catch (error) {
        console.error("Chatbot clearHistory error:", error);
        res.status(500).json({
            success: false,
            message: "Could not clear chat history",
        });
    }
};

// Track order status
export const trackOrder = async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Please login to track orders",
            });
        }

        const result = await chatbotService.trackOrder(userId);

        res.json(result);
    } catch (error) {
        console.error("Chatbot trackOrder error:", error);
        res.status(500).json({
            success: false,
            message: "Could not track order",
        });
    }
};

// Get menu cards (for quick browsing)
export const getMenuCards = async (req, res) => {
    try {
        const { category, maxPrice, minPrice, search, limit } = req.query;

        const result = await chatbotService.getMenuCards({
            category,
            maxPrice: maxPrice ? parseInt(maxPrice) : null,
            minPrice: minPrice ? parseInt(minPrice) : null,
            search,
            limit: limit ? parseInt(limit) : 10,
        });

        res.json(result);
    } catch (error) {
        console.error("Chatbot getMenuCards error:", error);
        res.status(500).json({
            success: false,
            message: "Could not fetch menu",
        });
    }
};
