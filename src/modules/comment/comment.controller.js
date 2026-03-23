const asyncHandler = require("../../utils/asyncHandler");
const { createCommentService, getCommentsByTaskId, getCommentsByUserId } = require(".//comment.service")

const addComment = async (req, res) => {

    const taskId = req.params.id;
    const { comment } = req.body;
    console.log(req.params.id);

    const result = await createCommentService(
        taskId,
        comment,
        req.user
    );

    res.status(201).json({
        success: true,
        data: result
    });

};


const getComment = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const result = await getCommentsByTaskId(taskId)

    res.status(201).json({
        success: true,
        data: result
    });
});


const getCommentUser = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const result = await getCommentsByUserId(userId)

    res.status(201).json({
        success: true,
        data: result
    });
});


module.exports = { addComment, getComment, getCommentUser }