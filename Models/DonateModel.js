const mongoose = require("mongoose");

const DonateSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Signup",
        required: true,
    },
    paymentId: {
        type: String,
        required: true,
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "success", "failed"],
        default: "pending",
    },
    amount: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

const Donation =  mongoose.model("Donation", DonateSchema);

module.exports =Donation
