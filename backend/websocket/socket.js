import { Server } from "socket.io";
import orderModel from "../models/orderModel.js";
import deliveryPartnerModel from "../models/deliveryPartnerModel.js";

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Main namespace for general notifications
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Join user-specific room for personalized notifications
        socket.on("join-user", (userId) => {
            socket.join(`user-${userId}`);
            console.log(`User ${userId} joined their room`);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });

    // Delivery tracking namespace
    const deliveryNamespace = io.of("/delivery");

    deliveryNamespace.on("connection", (socket) => {
        console.log("Client connected to delivery tracking:", socket.id);

        // Customer joins room for their specific order
        socket.on("join-order", (orderId) => {
            socket.join(`order-${orderId}`);
            console.log(`Client joined order tracking: ${orderId}`);
        });

        // Leave order room
        socket.on("leave-order", (orderId) => {
            socket.leave(`order-${orderId}`);
            console.log(`Client left order tracking: ${orderId}`);
        });

        // Delivery partner updates their location
        socket.on("update-location", async (data) => {
            try {
                const { orderId, partnerId, location } = data;

                // Update delivery partner's location in database
                if (partnerId) {
                    await deliveryPartnerModel.findByIdAndUpdate(partnerId, {
                        currentLocation: {
                            lat: location.lat,
                            lng: location.lng,
                            lastUpdated: new Date(),
                        },
                    });
                }

                // Add to order tracking history
                if (orderId) {
                    await orderModel.findByIdAndUpdate(orderId, {
                        $push: {
                            trackingHistory: {
                                status: "Location Update",
                                location: { lat: location.lat, lng: location.lng },
                                timestamp: new Date(),
                            },
                        },
                    });

                    // Broadcast location to all clients tracking this order
                    deliveryNamespace.to(`order-${orderId}`).emit("location-update", {
                        location,
                        timestamp: new Date(),
                        partnerId,
                    });
                }

                console.log(`Location updated for order ${orderId}:`, location);
            } catch (error) {
                console.error("Error updating location:", error);
                socket.emit("error", { message: "Failed to update location" });
            }
        });

        // Delivery status update
        socket.on("status-update", async (data) => {
            try {
                const { orderId, status, note } = data;

                // Update order status
                await orderModel.findByIdAndUpdate(orderId, {
                    status,
                    $push: {
                        trackingHistory: {
                            status,
                            timestamp: new Date(),
                            note,
                        },
                    },
                });

                // Broadcast status update
                deliveryNamespace.to(`order-${orderId}`).emit("status-update", {
                    status,
                    timestamp: new Date(),
                    note,
                });

                console.log(`Status updated for order ${orderId}: ${status}`);
            } catch (error) {
                console.error("Error updating status:", error);
                socket.emit("error", { message: "Failed to update status" });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected from delivery tracking:", socket.id);
        });
    });

    return io;
};

// Helper function to get io instance
const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

// Emit to specific order room
const emitToOrder = (orderId, event, data) => {
    const deliveryNamespace = io.of("/delivery");
    deliveryNamespace.to(`order-${orderId}`).emit(event, data);
};

// Emit to specific user
const emitToUser = (userId, event, data) => {
    io.to(`user-${userId}`).emit(event, data);
};

export { initSocket, getIO, emitToOrder, emitToUser };
