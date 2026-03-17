const { createCommentService, getCommentService } = require("../services/comment.service");
const ApiResponse = require("../utils/ApiResponse2");
const asyncHandler = require("../utils/asyncHandler");

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

    const result = await getCommentService(req.query)


    return new ApiResponse(res, 200, result, "Fetch Succesfully")

})


module.exports = { addComment, getComment }