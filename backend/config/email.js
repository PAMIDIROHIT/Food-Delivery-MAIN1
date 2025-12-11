import nodemailer from "nodemailer";

// Create Gmail transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Verify transporter configuration
transporter.verify((error, success) => {
    if (error) {
        console.log("Email transporter error:", error.message);
    } else {
        console.log("Email server is ready to send messages");
    }
});

export default transporter;
