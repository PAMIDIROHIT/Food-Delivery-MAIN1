import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
});

const conversationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
            index: true,
        },
        messages: [messageSchema],
        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Pre-save hook to limit messages to last 20
conversationSchema.pre("save", function (next) {
    if (this.messages.length > 20) {
        this.messages = this.messages.slice(-20);
    }
    this.lastMessageAt = new Date();
    next();
});

// Method to add a message
conversationSchema.methods.addMessage = function (role, content) {
    this.messages.push({ role, content });
    return this.save();
};

const conversationModel =
    mongoose.models.conversation ||
    mongoose.model("conversation", conversationSchema);

export default conversationModel;
