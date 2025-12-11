import React, { useState, useEffect, useRef, useContext } from "react";
import "./Chatbot.css";
import { StoreContext } from "../../context/StoreContext";
import axios from "axios";

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { url, token, addToCart } = useContext(StoreContext);

    // Quick action buttons - thinking like a customer
    const quickActions = [
        { label: "🍽️ See Menu", prompt: "Show me your complete menu" },
        { label: "⭐ Popular", prompt: "What are your most popular dishes?" },
        { label: "🥗 Vegetarian", prompt: "Show me vegetarian options" },
        { label: "💰 Budget", prompt: "Show me items under 200 rupees" },
        { label: "📦 Track Order", prompt: "Track my order" },
        { label: "🌶️ Spicy", prompt: "Show me spicy food options" },
    ];

    // Scroll to bottom when messages update
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Load conversation history when chat opens
    useEffect(() => {
        if (isOpen && token) {
            loadHistory();
        }
    }, [isOpen, token]);

    // Load chat history from backend
    const loadHistory = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${url}/api/chat/history`, {
                headers: { token },
            });
            if (response.data.success) {
                setMessages(response.data.messages || []);
            }
        } catch (error) {
            console.error("Failed to load chat history:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle adding item to cart
    const handleAddToCart = async (item) => {
        try {
            await addToCart(item._id);
            // Add a bot message confirming the addition
            const confirmMessage = {
                role: "assistant",
                content: `Added ${item.name} to your cart! 🛒`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, confirmMessage]);
        } catch (error) {
            console.error("Failed to add to cart:", error);
        }
    };

    // Send message to chatbot
    const sendMessage = async (text) => {
        if (!text.trim() || isTyping) return;

        const userMessage = {
            role: "user",
            content: text.trim(),
            timestamp: new Date(),
        };

        // Add user message immediately
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await axios.post(
                `${url}/api/chat/message`,
                { message: text.trim() },
                { headers: { token } }
            );

            if (response.data.success) {
                const botMessage = {
                    role: "assistant",
                    content: response.data.message,
                    timestamp: response.data.timestamp,
                    menuCards: response.data.menuCards || null,
                };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                // Handle error response
                const errorMessage = {
                    role: "assistant",
                    content:
                        response.data.message ||
                        "Sorry, something went wrong. Please try again!",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage = {
                role: "assistant",
                content:
                    "I'm having trouble connecting. Please check your internet and try again! 🔄",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    // Handle form submit
    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    // Handle quick action click
    const handleQuickAction = (prompt) => {
        sendMessage(prompt);
    };

    // Clear chat history
    const clearChat = async () => {
        try {
            await axios.delete(`${url}/api/chat/clear`, {
                headers: { token },
            });
            setMessages([]);
        } catch (error) {
            console.error("Failed to clear chat:", error);
        }
    };

    // Format timestamp
    const formatTime = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    // Menu Card Component
    const MenuCard = ({ item }) => (
        <div className="menu-card">
            <div className="menu-card-image">
                <img src={`${url}/images/${item.image}`} alt={item.name} />
            </div>
            <div className="menu-card-content">
                <h4>{item.name}</h4>
                <p className="menu-card-desc">{item.description?.slice(0, 50)}...</p>
                <div className="menu-card-footer">
                    <span className="menu-card-price">₹{item.price}</span>
                    <button
                        className="menu-card-add"
                        onClick={() => handleAddToCart(item)}
                    >
                        + Add
                    </button>
                </div>
            </div>
        </div>
    );

    // Don't render if user is not logged in
    if (!token) {
        return null;
    }

    return (
        <div className="chatbot-container">
            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? "open" : ""}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? "Close chat" : "Open chat"}
            >
                {isOpen ? "✕" : "💬"}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">🍅</div>
                            <div className="chatbot-header-text">
                                <h3>TOMATO Assistant</h3>
                                <span className="chatbot-status">
                                    {isTyping ? "Typing..." : "Online • Ask me anything!"}
                                </span>
                            </div>
                        </div>
                        <button
                            className="chatbot-clear-btn"
                            onClick={clearChat}
                            title="Clear chat"
                        >
                            🗑️
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="chatbot-messages">
                        {isLoading ? (
                            <div className="chatbot-loading">
                                <div className="loading-spinner"></div>
                                <span>Loading conversation...</span>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="chatbot-welcome">
                                <div className="welcome-icon">🍅</div>
                                <h4>Welcome to TOMATO!</h4>
                                <p>
                                    I'm your personal food assistant. I can help you:
                                </p>
                                <ul className="welcome-features">
                                    <li>🍽️ Browse our delicious menu</li>
                                    <li>⭐ Find popular dishes</li>
                                    <li>🥗 Discover vegetarian options</li>
                                    <li>💰 Find budget-friendly meals</li>
                                    <li>📦 Track your orders</li>
                                    <li>🛒 Add items to cart instantly</li>
                                </ul>
                                <div className="quick-actions">
                                    {quickActions.slice(0, 4).map((action, index) => (
                                        <button
                                            key={index}
                                            className="quick-action-btn"
                                            onClick={() => handleQuickAction(action.prompt)}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {messages.map((msg, index) => (
                                    <div key={index}>
                                        <div
                                            className={`chatbot-message ${msg.role === "user" ? "user" : "bot"}`}
                                        >
                                            {msg.role === "assistant" && (
                                                <div className="message-avatar">🍅</div>
                                            )}
                                            <div className="message-content">
                                                <div className="message-text">{msg.content}</div>
                                                <div className="message-time">
                                                    {formatTime(msg.timestamp)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Menu Cards Display */}
                                        {msg.menuCards && msg.menuCards.length > 0 && (
                                            <div className="menu-cards-container">
                                                <div className="menu-cards-grid">
                                                    {msg.menuCards.map((item) => (
                                                        <MenuCard key={item._id} item={item} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {isTyping && (
                                    <div className="chatbot-message bot">
                                        <div className="message-avatar">🍅</div>
                                        <div className="message-content">
                                            <div className="typing-indicator">
                                                <span></span>
                                                <span></span>
                                                <span></span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </>
                        )}
                    </div>

                    {/* Quick Actions Bar */}
                    {messages.length > 0 && (
                        <div className="chatbot-quick-actions">
                            {quickActions.map((action, index) => (
                                <button
                                    key={index}
                                    className="mini-quick-btn"
                                    onClick={() => handleQuickAction(action.prompt)}
                                    disabled={isTyping}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <form className="chatbot-input-area" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about menu, orders, or recommendations..."
                            disabled={isTyping}
                            className="chatbot-input"
                        />
                        <button
                            type="submit"
                            className="chatbot-send-btn"
                            disabled={!input.trim() || isTyping}
                        >
                            ➤
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
