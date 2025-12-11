import mongoose from "mongoose";

const deliveryPartnerSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String },
        vehicleNumber: { type: String },
        vehicleType: {
            type: String,
            enum: ["bike", "scooter", "car"],
            default: "bike"
        },
        currentLocation: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 },
            lastUpdated: { type: Date, default: Date.now },
        },
        activeOrder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        },
        status: {
            type: String,
            enum: ["available", "busy", "offline"],
            default: "offline"
        },
        rating: { type: Number, default: 5.0 },
        totalDeliveries: { type: Number, default: 0 },
        isVerified: { type: Boolean, default: false },
        profileImage: { type: String },
    },
    { timestamps: true }
);

// Index for geospatial queries
deliveryPartnerSchema.index({ "currentLocation.lat": 1, "currentLocation.lng": 1 });

const deliveryPartnerModel =
    mongoose.models.deliveryPartner || mongoose.model("deliveryPartner", deliveryPartnerSchema);

export default deliveryPartnerModel;
