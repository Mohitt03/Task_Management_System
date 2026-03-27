const ApiResponse = require("../../utils/ApiResponse2");
const asyncHandler = require("../../utils/asyncHandler");
const { createCommentService, getCommentsByTaskId, getCommentsByUserId, updateCommentService, deleteCommentService } = require(".//comment.service")

const addComment = async (req, res) => {

    const taskId = req.params.id;
    const { comment } = req.body;

    const result = await createCommentService(
        taskId,
        comment,
        req.user
    );

      return new ApiResponse(res, 200, result, "Comment succesfully created")


};

//Task ID
const getComment = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const result = await getCommentsByTaskId(taskId)

      return new ApiResponse(res, 200, result, "Comment's succesfully fetched")

});

// User ID
const getCommentUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const result = await getCommentsByUserId(userId)

      return new ApiResponse(res, 200, result, "Comment's succesfully fetched")

});


const updateComment = asyncHandler(async (req, res) => {
    const updated = await updateCommentService(
        req.params.id,
        req.body.comment,
        req.user
    );

    return new ApiResponse(res, 200, updated, "Comment Updated Succesfully")

});

const deleteComment = asyncHandler(async (req, res) => {
    const deleted = await deleteCommentService(
        req.params.id,
        req.body.comment,
        req.user
    );

    return new ApiResponse(res, 200, deleted)
});

module.exports = { addComment, getComment, getCommentUser, updateComment, deleteComment }