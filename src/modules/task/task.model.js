const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        task_id: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },

        title: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            trim: true
        },

        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        reportTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

        priority: {
            type: String,
            enum: ["High", "Medium", "Low"],
            default: "Medium"
        },

        status: {
            type: String,
            enum: [
                "to-do",
                "in-progress",
                "done",
                "testing",
                "qa-verified",
                "re-open",
                "deployment"
            ],
            default: "to-do"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Task", taskSchema);