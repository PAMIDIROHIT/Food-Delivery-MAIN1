import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";

// Create JWT token
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL,
            scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user exists with this Google ID
                let user = await userModel.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, return it
                    return done(null, user);
                }

                // Check if user exists with this email
                const email = profile.emails[0].value;
                user = await userModel.findOne({ email });

                if (user) {
                    // Link Google account to existing user
                    user.googleId = profile.id;
                    user.avatar = profile.photos[0]?.value || user.avatar;
                    user.emailVerified = true;
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                const newUser = new userModel({
                    name: profile.displayName,
                    email: email,
                    googleId: profile.id,
                    provider: "google",
                    avatar: profile.photos[0]?.value,
                    emailVerified: true,
                    password: "google-oauth-no-password", // Placeholder for Google users
                });

                await newUser.save();
                return done(null, newUser);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export { passport, createToken };
