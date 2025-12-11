import { GoogleGenerativeAI } from "@google/generative-ai";
import foodModel from "../models/foodModel.js";
import orderModel from "../models/orderModel.js";

// Initialize Gemini AI with error handling
let genAI;
let model;

try {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ GEMINI_API_KEY not found in environment variables!");
    } else {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("✅ Gemini AI initialized successfully");
    }
} catch (error) {
    console.error("❌ Failed to initialize Gemini AI:", error.message);
}

class ChatbotService {
    constructor() {
        this.model = model;
        this.menuCache = null;
        this.menuCacheTime = null;
        this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    }

    // Fetch all menu items with caching
    async getMenuItems() {
        try {
            // Use cache if valid
            if (this.menuCache && this.menuCacheTime &&
                (Date.now() - this.menuCacheTime) < this.CACHE_DURATION) {
                return this.menuCache;
            }

            const foods = await foodModel.find({});
            this.menuCache = foods;
            this.menuCacheTime = Date.now();
            return foods;
        } catch (error) {
            console.error("Error fetching menu items:", error);
            return [];
        }
    }

    // Get menu context for AI
    async getMenuContext() {
        try {
            const foods = await this.getMenuItems();
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
                    id: food._id.toString(),
                    name: food.name,
                    description: food.description,
                    price: food.price,
                    image: food.image,
                });
            });

            // Format as readable text
            let menuText = "🍽️ TOMATO MENU:\n\n";
            for (const [category, items] of Object.entries(categories)) {
                menuText += `📌 ${category.toUpperCase()}:\n`;
                items.forEach((item) => {
                    menuText += `  • ${item.name} (ID: ${item.id}) - ₹${item.price}\n    ${item.description}\n`;
                });
                menuText += "\n";
            }

            return menuText;
        } catch (error) {
            console.error("Error building menu context:", error);
            return "Menu currently unavailable.";
        }
    }

    // Get structured menu data for frontend cards
    async getMenuCards(filters = {}) {
        try {
            const foods = await this.getMenuItems();
            if (!foods || foods.length === 0) {
                return { success: true, items: [], message: "No menu items available" };
            }

            let filteredFoods = [...foods];

            // Apply filters
            if (filters.category) {
                filteredFoods = filteredFoods.filter(f =>
                    f.category.toLowerCase().includes(filters.category.toLowerCase())
                );
            }

            if (filters.maxPrice) {
                filteredFoods = filteredFoods.filter(f => f.price <= filters.maxPrice);
            }

            if (filters.minPrice) {
                filteredFoods = filteredFoods.filter(f => f.price >= filters.minPrice);
            }

            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                filteredFoods = filteredFoods.filter(f =>
                    f.name.toLowerCase().includes(searchLower) ||
                    f.description.toLowerCase().includes(searchLower) ||
                    f.category.toLowerCase().includes(searchLower)
                );
            }

            // Sort options
            if (filters.sortBy === 'price_low') {
                filteredFoods.sort((a, b) => a.price - b.price);
            } else if (filters.sortBy === 'price_high') {
                filteredFoods.sort((a, b) => b.price - a.price);
            }

            // Limit results
            const limit = filters.limit || 10;
            filteredFoods = filteredFoods.slice(0, limit);

            return {
                success: true,
                items: filteredFoods.map(f => ({
                    _id: f._id,
                    name: f.name,
                    description: f.description,
                    price: f.price,
                    image: f.image,
                    category: f.category,
                })),
                total: filteredFoods.length,
            };
        } catch (error) {
            console.error("Error getting menu cards:", error);
            return { success: false, items: [], message: "Failed to load menu" };
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
                    message: "You don't have any active orders right now. Would you like to place a new order? 🍕",
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
                message: "Sorry, I couldn't fetch your order status. Please try again later.",
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
            "Delivered": "✅",
            "Cancelled": "❌",
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
6. When recommending items, mention you can show them as cards

SPECIAL COMMANDS (recognize these intents):
- If user wants to see menu items visually, respond with: [SHOW_MENU_CARDS]
- If user mentions a specific category like "salad", "pizza", etc., include: [SHOW_CATEGORY:category_name]
- If user asks for items under a price, include: [SHOW_UNDER_PRICE:amount]
- If user wants to add item to cart, include: [ADD_TO_CART:item_name]

RULES:
- If a dish isn't on our menu, politely say it's unavailable and suggest alternatives
- For order issues or complaints, suggest contacting customer support
- Don't make up dishes or prices - only use menu items provided
- If unsure, ask clarifying questions
- Keep responses friendly and appetizing!

Remember: You're here to help customers have a great ordering experience!`;
    }

    // Parse AI response for special commands
    parseResponse(response) {
        const parsed = {
            text: response,
            showMenuCards: false,
            category: null,
            maxPrice: null,
            addToCart: null,
        };

        // Check for menu cards command
        if (response.includes('[SHOW_MENU_CARDS]')) {
            parsed.showMenuCards = true;
            parsed.text = response.replace('[SHOW_MENU_CARDS]', '').trim();
        }

        // Check for category command
        const categoryMatch = response.match(/\[SHOW_CATEGORY:(\w+)\]/i);
        if (categoryMatch) {
            parsed.category = categoryMatch[1];
            parsed.showMenuCards = true;
            parsed.text = response.replace(categoryMatch[0], '').trim();
        }

        // Check for price filter command
        const priceMatch = response.match(/\[SHOW_UNDER_PRICE:(\d+)\]/i);
        if (priceMatch) {
            parsed.maxPrice = parseInt(priceMatch[1]);
            parsed.showMenuCards = true;
            parsed.text = response.replace(priceMatch[0], '').trim();
        }

        // Check for add to cart command
        const cartMatch = response.match(/\[ADD_TO_CART:([^\]]+)\]/i);
        if (cartMatch) {
            parsed.addToCart = cartMatch[1];
            parsed.text = response.replace(cartMatch[0], '').trim();
        }

        return parsed;
    }

    // Main method to send message and get AI response
    async sendMessage(userMessage, userId, conversationHistory = []) {
        try {
            // Check if Gemini is initialized
            if (!this.model) {
                console.error("Gemini model not initialized");
                return this.getFallbackResponse(userMessage, userId);
            }

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
                    ...conversationHistory.slice(-10).map((msg) => ({
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
            const responseText = result.response.text();

            // Parse response for special commands
            const parsed = this.parseResponse(responseText);

            // Get menu cards if needed
            let menuCards = null;
            if (parsed.showMenuCards) {
                const cardResult = await this.getMenuCards({
                    category: parsed.category,
                    maxPrice: parsed.maxPrice,
                    limit: 6,
                });
                if (cardResult.success && cardResult.items.length > 0) {
                    menuCards = cardResult.items;
                }
            }

            return {
                success: true,
                message: parsed.text,
                menuCards: menuCards,
                addToCart: parsed.addToCart,
                timestamp: new Date(),
            };
        } catch (error) {
            console.error("Chatbot API error:", error.message);
            console.error("Full error:", error);

            // Return intelligent fallback
            return this.getFallbackResponse(userMessage, userId);
        }
    }

    // Intelligent fallback when AI fails
    async getFallbackResponse(userMessage, userId) {
        const message = userMessage.toLowerCase();
        let response = "";
        let menuCards = null;

        try {
            // Handle common intents without AI
            if (message.includes("menu") || message.includes("food") || message.includes("show")) {
                const result = await this.getMenuCards({ limit: 6 });
                menuCards = result.items;
                response = "Here's our delicious menu! 🍽️ Click on any item to add it to your cart.";
            } else if (message.includes("vegetarian") || message.includes("veg")) {
                const result = await this.getMenuCards({ search: "salad", limit: 6 });
                menuCards = result.items;
                response = "Here are some great vegetarian options for you! 🥗";
            } else if (message.includes("track") || message.includes("order")) {
                const trackResult = await this.trackOrder(userId);
                response = trackResult.message;
            } else if (message.includes("cheap") || message.includes("budget") || message.includes("under")) {
                const priceMatch = message.match(/\d+/);
                const maxPrice = priceMatch ? parseInt(priceMatch[0]) : 200;
                const result = await this.getMenuCards({ maxPrice, limit: 6 });
                menuCards = result.items;
                response = `Here are items under ₹${maxPrice}! 💰`;
            } else if (message.includes("popular") || message.includes("best") || message.includes("recommend")) {
                const result = await this.getMenuCards({ limit: 6 });
                menuCards = result.items;
                response = "Here are our most popular items! ⭐ Customers love these!";
            } else if (message.includes("hello") || message.includes("hi") || message.includes("hey")) {
                response = "Hello! 👋 Welcome to TOMATO! I'm here to help you find delicious food. Try asking me about our menu, popular items, or vegetarian options!";
            } else {
                response = "I'd love to help you! 🍅 You can ask me to:\n• Show the menu\n• Find vegetarian options\n• See popular items\n• Track your order\n• Find items under a specific price";
            }

            return {
                success: true,
                message: response,
                menuCards: menuCards,
                timestamp: new Date(),
                isFallback: true,
            };
        } catch (error) {
            console.error("Fallback error:", error);
            return {
                success: true,
                message: "Welcome to TOMATO! 🍅 I'm here to help you order delicious food. Try asking about our menu!",
                timestamp: new Date(),
                isFallback: true,
            };
        }
    }
}

// Export singleton instance
const chatbotService = new ChatbotService();
export default chatbotService;
