import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    cartData: { type: Object, default: {} },
    // Google OAuth fields
    googleId: { type: String, sparse: true, unique: true },
    provider: { type: String, default: "local" }, // 'local' or 'google'
    avatar: { type: String },
    emailVerified: { type: Boolean, default: false },
  },
  { minimize: false }
);


const userModel = mongoose.model.user || mongoose.model("user", userSchema);
export default userModel;
