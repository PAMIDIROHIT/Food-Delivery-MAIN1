import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true
        },
        type: {
            type: String,
            enum: ["order", "promo", "system", "delivery"],
            default: "order"
        },
        title: { type: String, required: true },
        message: { type: String, required: true },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "order"
        },
        read: { type: Boolean, default: false },
        readAt: { type: Date },
        data: { type: Object }, // Additional metadata
    },
    { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

const notificationModel =
    mongoose.models.notification || mongoose.model("notification", notificationSchema);

export default notificationModel;
