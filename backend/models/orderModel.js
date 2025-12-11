import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: { type: Array, required: true },
  amount: { type: Number, required: true },
  address: { type: Object, required: true },
  status: { type: String, default: "Food Processing" },
  date: { type: Date, default: Date.now() },
  payment: { type: Boolean, default: false },
  paymentMethod: {
    type: String,
    enum: ["stripe", "cod"],
    default: "stripe"
  },
  // Delivery tracking fields
  deliveryPartner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "deliveryPartner"
  },
  deliveryLocation: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
  },
  restaurantLocation: {
    lat: { type: Number, default: 12.9716 }, // Default restaurant location
    lng: { type: Number, default: 77.5946 },
  },
  estimatedDeliveryTime: { type: Date },
  trackingHistory: [{
    status: { type: String },
    location: {
      lat: { type: Number },
      lng: { type: Number }
    },
    timestamp: { type: Date, default: Date.now },
    note: { type: String },
  }],
});

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;

