import mongoose from "mongoose";

const segmentSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            ref: "User",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        conditions: [
            {
                conditions: [
                    {
                        field: String,
                        operator: String,
                        value: mongoose.Schema.Types.Mixed,
                    },
                ],
                logic: {
                    type: String,
                    enum: ["AND", "OR"],
                    required: true,
                },
            },
        ],
        audienceSize: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Segment", segmentSchema);
