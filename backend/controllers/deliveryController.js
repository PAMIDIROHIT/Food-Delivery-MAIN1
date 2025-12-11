import orderModel from "../models/orderModel.js";
import deliveryPartnerModel from "../models/deliveryPartnerModel.js";
import userModel from "../models/userModel.js";
import { emitToOrder, emitToUser } from "../websocket/socket.js";

// Assign delivery partner to an order
const assignDeliveryPartner = async (req, res) => {
    try {
        const { orderId, partnerId } = req.body;

        // Verify order exists
        const order = await orderModel.findById(orderId);
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Verify partner exists and is available
        const partner = await deliveryPartnerModel.findById(partnerId);
        if (!partner) {
            return res.json({ success: false, message: "Delivery partner not found" });
        }

        if (partner.status !== "available") {
            return res.json({ success: false, message: "Delivery partner is not available" });
        }

        // Update order with delivery partner
        const estimatedTime = new Date(Date.now() + 30 * 60 * 1000); // 30 mins from now
        await orderModel.findByIdAndUpdate(orderId, {
            deliveryPartner: partnerId,
            status: "Out for Delivery",
            estimatedDeliveryTime: estimatedTime,
            $push: {
                trackingHistory: {
                    status: "Delivery Partner Assigned",
                    timestamp: new Date(),
                    note: `${partner.name} has been assigned to your order`,
                },
            },
        });

        // Update partner status
        await deliveryPartnerModel.findByIdAndUpdate(partnerId, {
            status: "busy",
            activeOrder: orderId,
        });

        // Emit real-time notification
        emitToOrder(orderId, "partner-assigned", {
            partner: {
                id: partner._id,
                name: partner.name,
                phone: partner.phone,
                vehicleNumber: partner.vehicleNumber,
                rating: partner.rating,
                profileImage: partner.profileImage,
            },
            estimatedDeliveryTime: estimatedTime,
        });

        // Notify customer
        emitToUser(order.userId, "order-update", {
            orderId,
            status: "Out for Delivery",
            message: `${partner.name} is on the way with your order!`,
        });

        res.json({
            success: true,
            message: "Delivery partner assigned successfully",
            data: { orderId, partnerId, estimatedDeliveryTime: estimatedTime },
        });
    } catch (error) {
        console.error("Assign delivery partner error:", error);
        res.json({ success: false, message: "Error assigning delivery partner" });
    }
};

// Update delivery location (called by delivery app)
const updateDeliveryLocation = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { lat, lng, partnerId } = req.body;

        // Update partner location
        if (partnerId) {
            await deliveryPartnerModel.findByIdAndUpdate(partnerId, {
                currentLocation: {
                    lat,
                    lng,
                    lastUpdated: new Date(),
                },
            });
        }

        // Add to order tracking history
        await orderModel.findByIdAndUpdate(orderId, {
            $push: {
                trackingHistory: {
                    status: "Location Update",
                    location: { lat, lng },
                    timestamp: new Date(),
                },
            },
        });

        // Emit location update via WebSocket
        emitToOrder(orderId, "location-update", {
            location: { lat, lng },
            timestamp: new Date(),
        });

        res.json({ success: true, message: "Location updated" });
    } catch (error) {
        console.error("Update delivery location error:", error);
        res.json({ success: false, message: "Error updating location" });
    }
};

// Get delivery status for an order
const getDeliveryStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderModel
            .findById(orderId)
            .populate("deliveryPartner", "name phone vehicleNumber currentLocation rating profileImage");

        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        res.json({
            success: true,
            data: {
                orderId: order._id,
                status: order.status,
                deliveryPartner: order.deliveryPartner,
                deliveryLocation: order.deliveryLocation,
                restaurantLocation: order.restaurantLocation,
                estimatedDeliveryTime: order.estimatedDeliveryTime,
                trackingHistory: order.trackingHistory,
                address: order.address,
            },
        });
    } catch (error) {
        console.error("Get delivery status error:", error);
        res.json({ success: false, message: "Error fetching delivery status" });
    }
};

// Mark delivery as complete
const completeDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { partnerId } = req.body;

        // Update order status
        await orderModel.findByIdAndUpdate(orderId, {
            status: "Delivered",
            $push: {
                trackingHistory: {
                    status: "Delivered",
                    timestamp: new Date(),
                    note: "Order delivered successfully",
                },
            },
        });

        // Free up delivery partner
        if (partnerId) {
            const partner = await deliveryPartnerModel.findByIdAndUpdate(partnerId, {
                status: "available",
                activeOrder: null,
                $inc: { totalDeliveries: 1 },
            });

            if (partner) {
                console.log(`Partner ${partner.name} completed delivery, total: ${partner.totalDeliveries + 1}`);
            }
        }

        // Get order for user notification
        const order = await orderModel.findById(orderId);

        // Emit delivery complete notification
        emitToOrder(orderId, "delivery-complete", {
            status: "Delivered",
            timestamp: new Date(),
        });

        if (order) {
            emitToUser(order.userId, "order-update", {
                orderId,
                status: "Delivered",
                message: "Your order has been delivered! Enjoy your meal! 🎉",
            });
        }

        res.json({ success: true, message: "Delivery completed successfully" });
    } catch (error) {
        console.error("Complete delivery error:", error);
        res.json({ success: false, message: "Error completing delivery" });
    }
};

// Get all available delivery partners (for admin)
const getAvailablePartners = async (req, res) => {
    try {
        const partners = await deliveryPartnerModel.find({ status: "available" });
        res.json({ success: true, data: partners });
    } catch (error) {
        console.error("Get available partners error:", error);
        res.json({ success: false, message: "Error fetching partners" });
    }
};

// Create demo delivery partner (for testing)
const createDemoPartner = async (req, res) => {
    try {
        const demoPartner = new deliveryPartnerModel({
            name: "Demo Driver",
            phone: "+91 98765 43210",
            email: "demo@tomato.com",
            vehicleNumber: "KA-01-AB-1234",
            vehicleType: "bike",
            status: "available",
            rating: 4.8,
            isVerified: true,
            currentLocation: {
                lat: 12.9716,
                lng: 77.5946,
                lastUpdated: new Date(),
            },
        });

        await demoPartner.save();
        res.json({ success: true, message: "Demo partner created", data: demoPartner });
    } catch (error) {
        console.error("Create demo partner error:", error);
        res.json({ success: false, message: "Error creating demo partner" });
    }
};

// Simulate delivery movement (for demo purposes)
const simulateDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;

        const order = await orderModel.findById(orderId).populate("deliveryPartner");
        if (!order) {
            return res.json({ success: false, message: "Order not found" });
        }

        // Get start and end coordinates
        const start = order.restaurantLocation || { lat: 12.9716, lng: 77.5946 };
        const end = order.deliveryLocation || order.address || { lat: 12.9800, lng: 77.6000 };

        // Simulate 5 location updates
        const steps = 5;
        let currentStep = 0;

        const interval = setInterval(async () => {
            if (currentStep >= steps) {
                clearInterval(interval);
                // Complete delivery
                await orderModel.findByIdAndUpdate(orderId, { status: "Delivered" });
                emitToOrder(orderId, "delivery-complete", { status: "Delivered" });
                return;
            }

            // Calculate intermediate position
            const progress = (currentStep + 1) / steps;
            const lat = start.lat + (end.lat - start.lat) * progress;
            const lng = start.lng + (end.lng - start.lng) * progress;

            // Emit location update
            emitToOrder(orderId, "location-update", {
                location: { lat, lng },
                timestamp: new Date(),
                progress: Math.round(progress * 100),
            });

            currentStep++;
        }, 3000); // Update every 3 seconds

        res.json({ success: true, message: "Delivery simulation started" });
    } catch (error) {
        console.error("Simulate delivery error:", error);
        res.json({ success: false, message: "Error simulating delivery" });
    }
};

export {
    assignDeliveryPartner,
    updateDeliveryLocation,
    getDeliveryStatus,
    completeDelivery,
    getAvailablePartners,
    createDemoPartner,
    simulateDelivery,
};
