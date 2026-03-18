const { ref } = require("joi");
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    stripeSessionId: String,
    planId: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    amount: Number,
    currency: String,
    status: { type: String, default: "created" },
    items: Array,
    customerEmail: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);
