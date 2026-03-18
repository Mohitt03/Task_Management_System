const { required } = require("joi");
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    stripeSessionId: String,
    // For checking the status of the subscription plan
    status: { type: String, default: "pending", enum: ["pending", "active"] },
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    planStartDate: { type: Date, default: null },
    planExpiryDate: { type: Date, default: null },
    isActive: {
        type: Boolean,
        default: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model("Company", companySchema);