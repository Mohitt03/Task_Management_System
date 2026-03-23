const commentModel = require("./comment.model");
const Task = require("../task/task.model");
const ApiError = require("../../utils/ApiError");
const { isOwner } = require("../..//utils/ownership")


const createCommentService = async (taskId, comment, user) => {

    const task = await Task.findById(taskId).populate("projectId");

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    // Check if user is assigned to the task
    const isAssignedUser = task.assignedTo.toString() === user._id.toString();

    // Check if user is admin of the same company
    const isCompanyAdmin =
        user.role === "Admin" &&
        task.projectId.companyId.toString() === user.companyId.toString();

    if (!isAssignedUser && !isCompanyAdmin) {
        throw new ApiError(403, "You are not allowed to comment on this task");
    }

    const newComment = await commentModel.create({
        taskId,
        userId: user._id,
        comment
    });

    return newComment;
};


const getComments = async (filter) => {
    const comments = await commentModel
        .find(filter)
        .sort({ createdAt: -1 });

    if (!comments.length) {
        throw new ApiError(404, "No comments found");
    }

    return comments;
};

// Usage
const getCommentsByTaskId = (taskId) => getComments({ taskId });
const getCommentsByUserId = (userId) => getComments({ userId });


module.exports = { createCommentService, getCommentsByTaskId, getCommentsByUserId }