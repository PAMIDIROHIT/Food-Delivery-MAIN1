import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Connect to MongoDB
await mongoose.connect(process.env.MONGO_URL);
console.log("Connected to MongoDB");

// Define user schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },
    cartData: { type: Object, default: {} },
}, { minimize: false });

const User = mongoose.model("user", userSchema);

// Admin credentials - CHANGE THESE!
const adminEmail = "admin@tomato.com";
const adminPassword = "admin123";
const adminName = "Admin";

async function createOrUpdateAdmin() {
    try {
        // Check if user exists
        let user = await User.findOne({ email: adminEmail });

        if (user) {
            // Update existing user to admin
            user.role = "admin";
            await user.save();
            console.log(`✅ Updated existing user "${adminEmail}" to admin role`);
        } else {
            // Create new admin user
            const salt = await bcrypt.genSalt(Number(process.env.SALT));
            const hashedPassword = await bcrypt.hash(adminPassword, salt);

            const newAdmin = new User({
                name: adminName,
                email: adminEmail,
                password: hashedPassword,
                role: "admin",
                cartData: {}
            });

            await newAdmin.save();
            console.log(`✅ Created new admin user`);
        }

        console.log("\n=== Admin Login Credentials ===");
        console.log(`Email: ${adminEmail}`);
        console.log(`Password: ${adminPassword}`);
        console.log("===============================\n");

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from MongoDB");
    }
}

createOrUpdateAdmin();
