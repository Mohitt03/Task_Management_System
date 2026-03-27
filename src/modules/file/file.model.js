const { required } = require("joi");
const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },
        uploaded_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },
        url: {
            type: String,
            required: true
        },
        public_id: {
            type: String,
            required: true
        },
        original_name: {
            type: String
        },
        mime_type: {
            type: String
        },
        size: {
            type: Number
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);