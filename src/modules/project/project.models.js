const { boolean } = require("joi");
const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        // Auto-generated from project name e.g. "Task Management System" → "TMS"
        short_code: {
            type: String,
            required: true,
            uppercase: true,
            trim: true,
        },

        // Incremented every time a task is created under this project
        task_counter: {
            type: Number,
            default: 0,
        },

        description: {
            type: String,
            trim: true,
        },

        company_Id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        members: [
            {
                user_Id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                    required: true,
                },
                joined_at: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],

        status: {
            type: String,
            enum: ["planning", "active", "on_hold", "completed", "archived"],
            default: "planning",
        },

        priority: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            default: "medium",
        },

        start_date: {
            type: Date,
        },

        due_date: {
            type: Date,
        },

        completed_at: {
            type: Date,
        },
        isActive: {
            type: Boolean,
            default: true
        },

        isDelete: {
            type: Boolean,
            default: false
        },

        tags: [
            {
                type: String,
                trim: true,
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Ensure project names are unique within a company
projectSchema.index({ company_Id: 1, name: 1 }, { unique: true });
projectSchema.index({ company_Id: 1, short_code: 1 }, { unique: true });

const Project = mongoose.model("Project", projectSchema);
module.exports = Project;