const commentModel = require("../models/comment.model");
const Task = require("../models/task.model");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const createCommentService = asyncHandler(async (taskId, comment, user) => {

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
});

// const getCommentService = async (taskId) => {
//     const comment = commentModel.find({ taskId: taskId })
//     return comment;
// }


// const getCommentService = async (queryParams) => {

//     let {
//         page = 1,
//         limit = 10,
//         sortKey = "createdAt",
//         sortOrder = "desc",
//         search,
//         ...filters
//     } = queryParams;

//     // Convert to numbers safely
//     const pageNumber = parseInt(page) || 1;
//     const limitNumber = parseInt(limit) || 10;
//     const skip = (pageNumber - 1) * limitNumber;

//     // Default match condition
//     let matchStage = {};

//     // Apply dynamic filters
//     Object.keys(filters).forEach(key => {
//         if (filters[key]) {
//             const values = filters[key].split(",");

//             if (key === "_id" || key === "taskId") {
//                 matchStage[key] = {
//                     $in: values.map(id => new mongoose.Types.ObjectId(id))
//                 };
//             } else {
//                 matchStage[key] = { $in: values };
//             }
//         }
//     });

//     // Optional search (example: searching in comment text)
//     if (search) {
//         matchStage.comment = { $regex: search, $options: "i" };
//     }

//     // Sort condition
//     const sortStage = {
//         [sortKey]: sortOrder === "asc" ? 1 : -1
//     };

//     // Aggregation
//     const [comments, totalRecords] = await Promise.all([
//         commentModel.aggregate([
//             { $match: matchStage },
//             { $sort: sortStage },
//             { $skip: skip },
//             { $limit: limitNumber }
//         ]),
//         commentModel.aggregate([
//             { $match: matchStage },
//             { $count: "count" }
//         ])
//     ]);

//     const count = totalRecords[0]?.count || 0;

//     return {
//         count,
//         page: pageNumber,
//         limit: limitNumber,
//         comments
//     };
// };

const getCommentService = async (queryParams) => {

    let {
        page = 1,
        limit = 10,
        sortKey = "createdAt",
        sortOrder = "desc",
        search,
        ...filters
    } = queryParams;

    // Convert to numbers safely
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Default match condition
    let matchStage = {
        isActive: true,
        isDelete: false
    };

    // Apply dynamic filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            const values = filters[key].split(",");

            if (["_id", "taskId"].includes(key)) {
                matchStage[key] = {
                    $in: values.map(id => new mongoose.Types.ObjectId(id))
                };
            } else if (key === "comment") {
                matchStage[key] = {
                    $regex: filters[key],
                    $options: "i"
                };
            } else {
                matchStage[key] = { $in: values };
            }
        }
    });

    // Optional search
    if (search) {
        matchStage.comment = { $regex: search, $options: "i" };
    }

    // Sort condition
    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };

    console.log(matchStage);

    // Aggregation
    const [comments, totalRecords] = await Promise.all([
        commentModel.aggregate([
            { $match: matchStage },
            { $project: { isActive: 0, isDelete: 0 } },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limitNumber }
        ]),
        commentModel.aggregate([
            { $match: matchStage },
            { $count: "count" }
        ])
    ]);

    const count = totalRecords[0]?.count || 0;

    console.log(count, pageNumber, limitNumber, comments);
    return {
        count,
        page: pageNumber,
        limit: limitNumber,
        comments
    };


};

module.exports = { createCommentService, getCommentService }