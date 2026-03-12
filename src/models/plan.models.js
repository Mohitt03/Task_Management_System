const mongoose = require("mongoose");

const SubscriptionPlanSchema = new mongoose.Schema({
    name: { type: String },
    description: { type: String },

    price: {
        monthly: { type: Number },
        currency: { type: String }
    },

    limits: {
        maxProjects: { type: Number },
        maxTasksPerProject: { type: Number },
        maxUsers: { type: Number }
        // storageMB: { type: Number }
    },
    durationDays: { type: Number },
    isActive: {
        type: Boolean,
        default: true
    },
    isDelete: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model("Plan", SubscriptionPlanSchema) 