import express from "express";
import authMiddleware from "../middleware/auth.js";
import {
    assignDeliveryPartner,
    updateDeliveryLocation,
    getDeliveryStatus,
    completeDelivery,
    getAvailablePartners,
    createDemoPartner,
    simulateDelivery,
} from "../controllers/deliveryController.js";

const deliveryRouter = express.Router();

// Assign delivery partner to order (admin only)
deliveryRouter.post("/assign", authMiddleware, assignDeliveryPartner);

// Update delivery location (delivery partner app)
deliveryRouter.put("/location/:orderId", updateDeliveryLocation);

// Get delivery status for an order
deliveryRouter.get("/status/:orderId", authMiddleware, getDeliveryStatus);

// Mark delivery as complete
deliveryRouter.put("/complete/:orderId", completeDelivery);

// Get available delivery partners (admin)
deliveryRouter.get("/partners/available", authMiddleware, getAvailablePartners);

// Create demo partner for testing
deliveryRouter.post("/partners/demo", createDemoPartner);

// Simulate delivery movement (for demo)
deliveryRouter.post("/simulate/:orderId", authMiddleware, simulateDelivery);

export default deliveryRouter;
