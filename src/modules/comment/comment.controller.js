const { createCommentService, getCommentService } = require(".//comment.service")

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


const getComment = async (req, res) => {
    const taskId = req.params.id;
    const result = await getCommentService(taskId)

    res.status(201).json({
        success: true,
        data: result
    });

}


module.exports = { addComment, getComment }