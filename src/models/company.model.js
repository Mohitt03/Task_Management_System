const { required } = require("joi");
const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: { type: String, required: true },
    S_Admin_Id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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