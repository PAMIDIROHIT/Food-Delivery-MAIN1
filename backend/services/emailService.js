import transporter from "../config/email.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
const FROM_NAME = process.env.EMAIL_FROM_NAME || "TOMATO Food Delivery";
const FROM_EMAIL = process.env.EMAIL_USER;

// Email templates
const emailTemplates = {
    orderConfirmation: (user, order) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍕 TOMATO</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your order is confirmed!</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">
            Hi <strong>${user.name || "Food Lover"}</strong>,
          </p>
          <p style="color: #666; line-height: 1.6;">
            Great news! Your order has been confirmed and our chefs are already preparing your delicious meal.
          </p>
          
          <!-- Order Box -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0 0 10px 0; color: #333;">
              <strong>Order ID:</strong> 
              <span style="font-family: monospace; background: #e9ecef; padding: 4px 8px; border-radius: 4px;">
                #${order._id.toString().slice(-6).toUpperCase()}
              </span>
            </p>
            <p style="margin: 0 0 10px 0; color: #333;">
              <strong>Total Amount:</strong> 
              <span style="color: #FF6B35; font-weight: bold;">₹${order.amount}</span>
            </p>
            <p style="margin: 0; color: #333;">
              <strong>Estimated Delivery:</strong> 30-40 minutes
            </p>
          </div>
          
          <!-- Items -->
          <h3 style="color: #333; margin: 25px 0 15px 0;">Order Items:</h3>
          ${order.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee;">
              <span style="color: #333;">${item.name} × ${item.quantity}</span>
              <span style="color: #666;">₹${item.price * item.quantity}</span>
            </div>
          `).join('')}
          
          <!-- Track Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/track/${order._id}" 
               style="display: inline-block; background: #FF6B35; color: white; text-decoration: none; padding: 14px 35px; border-radius: 30px; font-weight: 600; font-size: 16px;">
              📍 Track Your Order
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Thank you for ordering with TOMATO! 🍕
          </p>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 TOMATO Food Delivery. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,

    statusUpdate: (user, order, status, statusMessage) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🍕 TOMATO</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order Update</p>
        </div>
        
        <!-- Content -->
        <div style="padding: 30px;">
          <p style="font-size: 18px; color: #333; margin: 0 0 20px 0;">
            Hi <strong>${user.name || "Food Lover"}</strong>,
          </p>
          
          <!-- Status Badge -->
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: ${getStatusColor(status)}; color: white; padding: 15px 30px; border-radius: 50px; font-size: 18px; font-weight: 600;">
              ${getStatusEmoji(status)} ${status}
            </div>
          </div>
          
          <p style="color: #666; line-height: 1.6; text-align: center; font-size: 16px;">
            ${statusMessage}
          </p>
          
          <!-- Order Box -->
          <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 25px 0; text-align: center;">
            <p style="margin: 0; color: #666;">
              Order ID: <strong style="color: #333; font-family: monospace;">#${order._id.toString().slice(-6).toUpperCase()}</strong>
            </p>
          </div>
          
          <!-- Track Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${FRONTEND_URL}/track/${order._id}" 
               style="display: inline-block; background: #FF6B35; color: white; text-decoration: none; padding: 14px 35px; border-radius: 30px; font-weight: 600; font-size: 16px;">
              📍 View Order Details
            </a>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2024 TOMATO Food Delivery. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `,
};

// Helper functions
const getStatusColor = (status) => {
    const colors = {
        "Food Processing": "#FF9800",
        "Preparing": "#FF9800",
        "Out for Delivery": "#4CAF50",
        "Delivered": "#2196F3",
    };
    return colors[status] || "#666";
};

const getStatusEmoji = (status) => {
    const emojis = {
        "Food Processing": "👨‍🍳",
        "Preparing": "👨‍🍳",
        "Out for Delivery": "🚗",
        "Delivered": "✅",
    };
    return emojis[status] || "📦";
};

const getStatusMessage = (status) => {
    const messages = {
        "Food Processing": "Your food is being prepared by our expert chefs! 👨‍🍳",
        "Preparing": "Your food is being prepared by our expert chefs! 👨‍🍳",
        "Out for Delivery": "Your order is on the way! Our delivery partner is bringing your food to you. 🚗",
        "Delivered": "Your order has been delivered! Enjoy your delicious meal! 🎉",
    };
    return messages[status] || "Your order status has been updated.";
};

// Send order confirmation email
const sendOrderConfirmation = async (user, order) => {
    if (!user?.email) {
        console.log("No email address for user, skipping confirmation email");
        return;
    }

    const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: user.email,
        subject: "🎉 Order Confirmed - TOMATO",
        html: emailTemplates.orderConfirmation(user, order),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log("Order confirmation email sent:", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending order confirmation email:", error.message);
        return { success: false, error: error.message };
    }
};

// Send status update email
const sendStatusUpdate = async (user, order, status) => {
    if (!user?.email) {
        console.log("No email address for user, skipping status update email");
        return;
    }

    // Don't send email for minor status updates
    const notifyStatuses = ["Preparing", "Out for Delivery", "Delivered"];
    if (!notifyStatuses.includes(status)) {
        return;
    }

    const statusMessage = getStatusMessage(status);

    const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: user.email,
        subject: `${getStatusEmoji(status)} Order ${status} - TOMATO`,
        html: emailTemplates.statusUpdate(user, order, status, statusMessage),
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Status update email sent (${status}):`, info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("Error sending status update email:", error.message);
        return { success: false, error: error.message };
    }
};

// Send welcome email for new users
const sendWelcomeEmail = async (user) => {
    if (!user?.email) return;

    const mailOptions = {
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: user.email,
        subject: "🍕 Welcome to TOMATO!",
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #FF6B35 0%, #FF8F5C 100%); padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 32px;">🍕 Welcome to TOMATO!</h1>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 18px; color: #333;">Hi ${user.name || "Food Lover"},</p>
            <p style="color: #666; line-height: 1.6;">
              Welcome to TOMATO! We're excited to have you on board. Get ready to explore delicious food from the best restaurants near you.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${FRONTEND_URL}" style="display: inline-block; background: #FF6B35; color: white; text-decoration: none; padding: 14px 35px; border-radius: 30px; font-weight: 600;">
                Start Ordering 🍕
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent to:", user.email);
    } catch (error) {
        console.error("Error sending welcome email:", error.message);
    }
};

export { sendOrderConfirmation, sendStatusUpdate, sendWelcomeEmail };
