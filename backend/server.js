import express from "express";
import http from "http";
import cors from "cors";
import session from "express-session";
import { connectDB } from "./config/db.js";
import { passport } from "./config/passport.js";
import { initSocket } from "./websocket/socket.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import "dotenv/config";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import chatbotRouter from "./routes/chatbotRoute.js";
import authRouter from "./routes/authRoute.js";
import deliveryRouter from "./routes/deliveryRoute.js";
import notificationRouter from "./routes/notificationRoute.js";
import recommendationRouter from "./routes/recommendationRoute.js";

// app config
const app = express();
const port = process.env.PORT || 4000;

// Create HTTP server for Socket.io
const server = http.createServer(app);

// Initialize Socket.io
const io = initSocket(server);

// middlewares
app.use(express.json());

// CORS configuration - allow frontend and admin panel
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(null, true); // Allow all for development
      }
    },
    credentials: true,
  })
);

// Session middleware (required for Passport OAuth)
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// DB connection
connectDB();

// api endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/chat", chatbotRouter);
app.use("/api/auth", authRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/recommendations", recommendationRouter);

app.get("/", (req, res) => {
  res.send("API Working - Socket.io enabled");
});

// Use server.listen instead of app.listen for Socket.io
server.listen(port, () => {
  console.log(`Server Started on port: ${port} with Socket.io`);
});

export { io };

