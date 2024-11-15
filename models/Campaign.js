import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        segmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Segment",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ["PENDING", "SENT", "FAILED"],
            default: "PENDING",
        },
        state: {
            type: String,
            enum: ["ACTIVE", "CLOSED"],
            default: "ACTIVE",
        },
    },
    { timestamps: true }
);
campaignSchema.methods.updateState = async function (newState) {
    if (newState === "ACTIVE" || newState === "CLOSED") {
        this.state = newState;
        await this.save();
    } else {
        throw new Error("Invalid state");
    }
};
export default mongoose.model("Campaign", campaignSchema);
