import React, { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

const NotificationBell = () => {
    const { url, token } = useContext(StoreContext);
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/notifications`, {
                headers: { token },
            });

            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
            // If API not available, use mock data
            setNotifications([
                {
                    _id: "1",
                    title: "Order Confirmed",
                    message: "Your order is being prepared",
                    read: false,
                    type: "order",
                    createdAt: new Date().toISOString(),
                },
            ]);
            setUnreadCount(1);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        try {
            await axios.put(
                `${url}/api/notifications/read/${notificationId}`,
                {},
                { headers: { token } }
            );

            setNotifications((prev) =>
                prev.map((n) =>
                    n._id === notificationId ? { ...n, read: true } : n
                )
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await axios.put(
                `${url}/api/notifications/read-all`,
                {},
                { headers: { token } }
            );

            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification._id);
        }

        // Navigate based on notification type
        if (notification.orderId) {
            navigate(`/track/${notification.orderId}`);
        }
        setShowDropdown(false);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNotificationIcon = (type) => {
        const icons = {
            order: "🍕",
            delivery: "🚗",
            promo: "🎉",
            system: "ℹ️",
        };
        return icons[type] || "📬";
    };

    if (!token) return null;

    return (
        <div className="notification-bell" ref={dropdownRef}>
            <button
                className="bell-button"
                onClick={() => setShowDropdown(!showDropdown)}
                aria-label="Notifications"
            >
                <span className="bell-icon">🔔</span>
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="notification-dropdown">
                    <div className="dropdown-header">
                        <h3>Notifications</h3>
                        {unreadCount > 0 && (
                            <button className="mark-all-read" onClick={handleMarkAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-list">
                        {loading ? (
                            <div className="notification-loading">
                                <div className="spinner"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="no-notifications">
                                <span className="empty-icon">🔕</span>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`notification-item ${notification.read ? "read" : "unread"}`}
                                    onClick={() => handleNotificationClick(notification)}
                                >
                                    <div className="notification-icon">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="notification-content">
                                        <h4>{notification.title}</h4>
                                        <p>{notification.message}</p>
                                        <span className="notification-time">
                                            {formatTime(notification.createdAt)}
                                        </span>
                                    </div>
                                    {!notification.read && <div className="unread-dot"></div>}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
