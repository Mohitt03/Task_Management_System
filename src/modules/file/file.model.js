const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
    {
        task_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task"
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
        },
        uploaded_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);