import { passport, createToken } from "../config/passport.js";
import userModel from "../models/userModel.js";

// Initiate Google OAuth - handled by passport middleware in routes

// Google OAuth callback handler
const googleAuthCallback = (req, res) => {
    try {
        const user = req.user;
        const token = createToken(user._id);
        const role = user.role;

        // Redirect to frontend with token in URL
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/auth/callback?token=${token}&role=${role}`);
    } catch (error) {
        console.error("Google auth callback error:", error);
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/auth/callback?error=auth_failed`);
    }
};

// Get current user info
const getCurrentUser = async (req, res) => {
    try {
        const user = await userModel.findById(req.body.userId).select("-password");
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                provider: user.provider,
                emailVerified: user.emailVerified,
            },
        });
    } catch (error) {
        console.error("Get current user error:", error);
        res.json({ success: false, message: "Error fetching user" });
    }
};

export { googleAuthCallback, getCurrentUser };
