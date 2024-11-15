import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        totalSpending: {
            type: Number,
            required: true,
            default: 0,
        },
        visits: {
            type: Number,
            required: true,
            default: 0,
        },
        lastVisit: {
            type: Date,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Customer", customerSchema);
