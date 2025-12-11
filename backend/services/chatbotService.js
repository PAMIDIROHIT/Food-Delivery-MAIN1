import { GoogleGenerativeAI } from "@google/generative-ai";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class ChatbotService {
    constructor() {
        this.model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    }

    // Fetch all menu items and format as context
    async getMenuContext() {
        try {
            const foods = await foodModel.find({});
            if (!foods || foods.length === 0) {
                return "Currently, our menu is being updated. Please check back soon!";
            }

            // Group by category
            const categories = {};
            foods.forEach((food) => {
                if (!categories[food.category]) {
                    categories[food.category] = [];
                }
                categories[food.category].push({
                    name: food.name,
                    description: food.description,
                    price: food.price,
                });
            });

            // Format as readable text
            let menuText = "🍽️ TOMATO MENU:\n\n";
            for (const [category, items] of Object.entries(categories)) {
                menuText += `📌 ${category.toUpperCase()}:\n`;
                items.forEach((item) => {
                    menuText += `  • ${item.name} - ₹${item.price}\n    ${item.description}\n`;
                });
                menuText += "\n";
            }

            return menuText;
        } catch (error) {
            console.error("Error fetching menu:", error);
            return "Menu currently unavailable.";
        }
    }

    // Get user's order history for personalization
    async getUserOrderHistory(userId) {
        try {
            const orders = await orderModel
                .find({ userId: userId })
                .sort({ date: -1 })
                .limit(5);

            if (!orders || orders.length === 0) {
                return "No previous orders found.";
            }

            let historyText = "📦 YOUR RECENT ORDERS:\n";
            orders.forEach((order, index) => {
                const itemNames = order.items.map((item) => item.name).join(", ");
                const status = order.status;
                const date = new Date(order.date).toLocaleDateString();
                historyText += `${index + 1}. [${date}] ${itemNames} - ₹${order.amount} (${status})\n`;
            });

            return historyText;
        } catch (error) {
            console.error("Error fetching order history:", error);
            return "Could not fetch order history.";
        }
    }

    // Track active orders for a user
    async trackOrder(userId) {
        try {
            const activeOrders = await orderModel
                .find({
                    userId: userId,
                    status: { $nin: ["Delivered", "Cancelled"] },
                })
                .sort({ date: -1 });

            if (!activeOrders || activeOrders.length === 0) {
                return {
                    success: true,
                    hasActiveOrders: false,
                    message:
                        "You don't have any active orders right now. Would you like to place a new order? 🍕",
                };
            }

            const orderDetails = activeOrders.map((order) => ({
                orderId: order._id.toString().slice(-6).toUpperCase(),
                items: order.items.map((item) => item.name).join(", "),
                amount: order.amount,
                status: order.status,
                date: new Date(order.date).toLocaleString(),
            }));

            return {
                success: true,
                hasActiveOrders: true,
                orders: orderDetails,
                message: this.formatOrderStatus(orderDetails),
            };
        } catch (error) {
            console.error("Error tracking order:", error);
            return {
                success: false,
                message:
                    "Sorry, I couldn't fetch your order status. Please try again later.",
            };
        }
    }

    // Format order status for display
    formatOrderStatus(orders) {
        let message = "📦 Here's your order status:\n\n";
        orders.forEach((order) => {
            const statusEmoji = this.getStatusEmoji(order.status);
            message += `Order #${order.orderId}\n`;
            message += `${statusEmoji} Status: ${order.status}\n`;
            message += `🍽️ Items: ${order.items}\n`;
            message += `💰 Total: ₹${order.amount}\n`;
            message += `🕐 Ordered: ${order.date}\n\n`;
        });
        return message;
    }

    // Get emoji based on order status
    getStatusEmoji(status) {
        const statusEmojis = {
            "Food Processing": "👨‍🍳",
            "Out for delivery": "🚴",
            Delivered: "✅",
            Cancelled: "❌",
        };
        return statusEmojis[status] || "📋";
    }

    // Build the system prompt with context
    buildSystemPrompt(menuContext, orderHistory) {
        return `You are TOMATO's friendly AI food assistant! 🍅

YOUR PERSONALITY:
- Warm, helpful, and enthusiastic about food
- Concise but informative (keep responses under 100 words)
- Use emojis sparingly (max 2-3 per message)
- Always mention prices in ₹ (Indian Rupees)

CURRENT MENU:
${menuContext}

USER'S ORDER HISTORY:
${orderHistory}

YOUR CAPABILITIES:
1. Help users explore the menu and find dishes
2. Recommend items based on preferences (spicy, vegetarian, budget, etc.)
3. Answer questions about ingredients, prices, and categories
4. Help with order tracking (tell them to ask "track my order")
5. Suggest popular items and combinations

RULES:
- If a dish isn't on our menu, politely say it's unavailable and suggest alternatives
- For order issues or complaints, suggest contacting customer support
- Don't make up dishes or prices - only use menu items provided
- If unsure, ask clarifying questions
- Keep responses friendly and appetizing!

Remember: You're here to help customers have a great ordering experience!`;
    }

    // Main method to send message and get AI response
    async sendMessage(userMessage, userId, conversationHistory = []) {
        try {
            // Fetch context
            const menuContext = await this.getMenuContext();
            const orderHistory = await this.getUserOrderHistory(userId);

            // Build system prompt
            const systemPrompt = this.buildSystemPrompt(menuContext, orderHistory);

            // Build conversation content for Gemini
            const chat = this.model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                    {
                        role: "model",
                        parts: [
                            {
                                text: "Understood! I'm TOMATO's friendly food assistant, ready to help customers explore our delicious menu and have a great ordering experience. How can I help you today? 🍅",
                            },
                        ],
                    },
                    ...conversationHistory.map((msg) => ({
                        role: msg.role === "user" ? "user" : "model",
                        parts: [{ text: msg.content }],
                    })),
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 500,
                },
            });

            // Send user message
            const result = await chat.sendMessage(userMessage);
            const response = result.response.text();

            return {
                success: true,
                message: response,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error("Chatbot error:", error);

            // Provide helpful fallback response
            return {
                success: false,
                message:
                    "I'm having a little trouble right now 😅 Could you try asking again? If you need immediate help, please contact our support team!",
                timestamp: new Date(),
            };
        }
    }
}

// Export singleton instance
const chatbotService = new ChatbotService();
export default chatbotService;
