const mongoose = require('mongoose')

const taskHistorySchema = new mongoose.Schema(
    {
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Task",
            required: true
        },

        action: {
            type: String,
            enum: [
                "status-change",
                "priority-change",
                "assigned-change",
                "title-update",
                "description-update",
                "comment",
                "created"
            ]
        },

        field: {
            type: String
        },  

        oldValue: {
            type: String
        },

        newValue: {
            type: String
        },

        message: {
            type: String
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }

    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("TaskHistory", taskHistorySchema);