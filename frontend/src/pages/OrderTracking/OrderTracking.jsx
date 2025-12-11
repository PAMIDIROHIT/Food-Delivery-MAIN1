import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { StoreContext } from "../../context/StoreContext";
import DeliveryMap from "../../components/Maps/DeliveryMap";
import "./OrderTracking.css";

const OrderTracking = () => {
    const { orderId } = useParams();
    const { url, token } = useContext(StoreContext);
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [simulatingDelivery, setSimulatingDelivery] = useState(false);

    // Status timeline configuration
    const statusSteps = [
        { status: "Food Processing", icon: "👨‍🍳", label: "Preparing" },
        { status: "Out for Delivery", icon: "🚗", label: "On the Way" },
        { status: "Delivered", icon: "✅", label: "Delivered" },
    ];

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId]);

    const fetchOrderDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${url}/api/delivery/status/${orderId}`, {
                headers: { token },
            });

            if (response.data.success) {
                setOrder(response.data.data);
            } else {
                setError(response.data.message || "Failed to fetch order details");
            }
        } catch (err) {
            console.error("Error fetching order:", err);
            setError("Error connecting to server");
        } finally {
            setLoading(false);
        }
    };

    const handleSimulateDelivery = async () => {
        try {
            setSimulatingDelivery(true);
            await axios.post(
                `${url}/api/delivery/simulate/${orderId}`,
                {},
                { headers: { token } }
            );
        } catch (err) {
            console.error("Simulation error:", err);
        }
    };

    const getCurrentStepIndex = () => {
        if (!order) return 0;
        const index = statusSteps.findIndex((step) => step.status === order.status);
        return index >= 0 ? index : 0;
    };

    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="order-tracking-container">
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading order details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="order-tracking-container">
                <div className="error-state">
                    <div className="error-icon">❌</div>
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={() => navigate("/myorders")}>Back to Orders</button>
                </div>
            </div>
        );
    }

    const currentStep = getCurrentStepIndex();
    const isDelivering = order?.status === "Out for Delivery";

    return (
        <div className="order-tracking-container">
            <div className="tracking-header">
                <button className="back-btn" onClick={() => navigate("/myorders")}>
                    ← Back
                </button>
                <h1>Track Order</h1>
                <span className="order-id">#{orderId?.slice(-6)}</span>
            </div>

            {/* Status Timeline */}
            <div className="status-timeline">
                {statusSteps.map((step, index) => (
                    <div
                        key={step.status}
                        className={`timeline-step ${index <= currentStep ? "completed" : ""} ${index === currentStep ? "active" : ""
                            }`}
                    >
                        <div className="step-icon">{step.icon}</div>
                        <div className="step-label">{step.label}</div>
                        {index < statusSteps.length - 1 && (
                            <div className={`step-line ${index < currentStep ? "filled" : ""}`}></div>
                        )}
                    </div>
                ))}
            </div>

            {/* Live Map for "Out for Delivery" status */}
            {isDelivering && (
                <DeliveryMap
                    orderId={orderId}
                    restaurantLocation={order?.restaurantLocation || { lat: 12.9716, lng: 77.5946 }}
                    deliveryAddress={order?.deliveryLocation || order?.address || { lat: 12.98, lng: 77.60 }}
                />
            )}

            {/* Delivery Partner Info */}
            {order?.deliveryPartner && (
                <div className="delivery-partner-card">
                    <h3>Your Delivery Partner</h3>
                    <div className="partner-content">
                        <div className="partner-avatar">
                            {order.deliveryPartner.profileImage ? (
                                <img src={order.deliveryPartner.profileImage} alt="" />
                            ) : (
                                <span>🚴</span>
                            )}
                        </div>
                        <div className="partner-info">
                            <h4>{order.deliveryPartner.name}</h4>
                            <p>📞 {order.deliveryPartner.phone}</p>
                            <p>🚗 {order.deliveryPartner.vehicleNumber}</p>
                            <div className="rating">⭐ {order.deliveryPartner.rating || 5.0}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details */}
            <div className="order-details-card">
                <h3>Order Details</h3>
                <div className="detail-row">
                    <span className="label">Status</span>
                    <span className={`value status-badge ${order?.status?.toLowerCase().replace(/\s/g, "-")}`}>
                        {order?.status}
                    </span>
                </div>
                {order?.estimatedDeliveryTime && (
                    <div className="detail-row">
                        <span className="label">Estimated Delivery</span>
                        <span className="value">{formatTime(order.estimatedDeliveryTime)}</span>
                    </div>
                )}
                <div className="detail-row">
                    <span className="label">Delivery Address</span>
                    <span className="value address">
                        {typeof order?.address === "object"
                            ? `${order.address.street || ""}, ${order.address.city || ""}`
                            : order?.address || "Not available"}
                    </span>
                </div>
            </div>

            {/* Tracking History */}
            {order?.trackingHistory && order.trackingHistory.length > 0 && (
                <div className="tracking-history-card">
                    <h3>Tracking History</h3>
                    <div className="history-list">
                        {order.trackingHistory
                            .slice()
                            .reverse()
                            .map((item, index) => (
                                <div key={index} className="history-item">
                                    <div className="history-time">
                                        {formatTime(item.timestamp)}
                                        <span className="history-date">{formatDate(item.timestamp)}</span>
                                    </div>
                                    <div className="history-content">
                                        <div className="history-status">{item.status}</div>
                                        {item.note && <div className="history-note">{item.note}</div>}
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* Demo Simulate Button (for testing) */}
            {isDelivering && !simulatingDelivery && (
                <button className="simulate-btn" onClick={handleSimulateDelivery}>
                    🎮 Simulate Delivery (Demo)
                </button>
            )}
            {simulatingDelivery && (
                <div className="simulation-notice">
                    🚗 Simulating delivery movement... Watch the map!
                </div>
            )}
        </div>
    );
};

export default OrderTracking;
