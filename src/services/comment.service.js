const commentModel = require("../models/comment.model");
const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");

const createCommentService = async (taskId, comment, user) => {

    const task = await Task.findById(taskId);
    console.log(task);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const newComment = await commentModel.create({
        taskId,
        userId: user._id,
        comment
    });

    return newComment;
};

const getCommentService = async (taskId) => {
    const comment = commentModel.find({ taskId: taskId })
    return comment;
}

module.exports = { createCommentService, getCommentService }