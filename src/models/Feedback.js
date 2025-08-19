// models/feedbackModel.js
import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
    {
        organisationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organisation",
            required: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            enum: [
                "product",
                "ux",
                "support",
                "pricing",
                "features",
                "performance",
                "other"
            ],
            default: "other",
        },
        sentiment: {
            type: String,
            enum: ["positive", "negative", "neutral"],
            default: null, // null means not yet analyzed
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Feedback", feedbackSchema);
