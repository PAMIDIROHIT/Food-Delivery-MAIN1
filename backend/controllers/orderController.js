import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import { sendOrderConfirmation, sendStatusUpdate } from "../services/emailService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// placing user order for frontend
const placeOrder = async (req, res) => {
  const frontend_url = process.env.FRONTEND_URL || "http://localhost:5173/";
  try {
    const paymentMethod = req.body.paymentMethod || "stripe";

    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      paymentMethod: paymentMethod,
      // For COD, payment is confirmed upon delivery, not at order time
      payment: paymentMethod === "cod" ? false : false,
      // Add delivery location from address
      deliveryLocation: {
        lat: req.body.address?.lat || 12.98,
        lng: req.body.address?.lng || 77.60,
        address: `${req.body.address?.street || ""}, ${req.body.address?.city || ""}`,
      },
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Handle COD orders - skip Stripe, go directly to success
    if (paymentMethod === "cod") {
      // Send order confirmation email for COD
      const user = await userModel.findById(req.body.userId);
      if (user) {
        sendOrderConfirmation(user, newOrder).catch(err =>
          console.error("Email send error:", err)
        );
      }

      return res.json({
        success: true,
        orderId: newOrder._id,
        paymentMethod: "cod",
        message: "Order placed successfully! Pay on delivery."
      });
    }

    // Handle Stripe payments
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    res.json({ success: true, session_url: session.url, paymentMethod: "stripe" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error placing order" });
  }
};

const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success == "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });

      // Send order confirmation email
      const order = await orderModel.findById(orderId);
      if (order) {
        const user = await userModel.findById(order.userId);
        if (user) {
          // Send confirmation email asynchronously
          sendOrderConfirmation(user, order).catch(err =>
            console.error("Email send error:", err)
          );
        }
      }

      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// user orders for frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId })
      .sort({ date: -1 }) // Sort by newest first
      .populate("deliveryPartner", "name phone vehicleNumber rating");
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// Listing orders for admin pannel
const listOrders = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const orders = await orderModel.find({}).sort({ date: -1 });
      res.json({ success: true, data: orders });
    } else {
      res.json({ success: false, message: "You are not admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

// api for updating status
const updateStatus = async (req, res) => {
  try {
    let userData = await userModel.findById(req.body.userId);
    if (userData && userData.role === "admin") {
      const order = await orderModel.findByIdAndUpdate(
        req.body.orderId,
        { status: req.body.status },
        { new: true }
      );

      // Send status update email
      if (order) {
        const orderUser = await userModel.findById(order.userId);
        if (orderUser) {
          sendStatusUpdate(orderUser, order, req.body.status).catch(err =>
            console.error("Email send error:", err)
          );
        }
      }

      res.json({ success: true, message: "Status Updated Successfully" });
    } else {
      res.json({ success: false, message: "You are not an admin" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};

export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };

