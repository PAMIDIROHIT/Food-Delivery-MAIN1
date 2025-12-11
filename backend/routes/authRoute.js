import express from "express";
import { passport } from "../config/passport.js";
import { googleAuthCallback, getCurrentUser } from "../controllers/authController.js";
import authMiddleware from "../middleware/auth.js";

const authRouter = express.Router();

// Initiate Google OAuth
authRouter.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth callback
authRouter.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/auth/google/failure",
    }),
    googleAuthCallback
);

// OAuth failure route
authRouter.get("/google/failure", (req, res) => {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
});

// Get current user (protected route)
authRouter.get("/me", authMiddleware, getCurrentUser);

export default authRouter;
