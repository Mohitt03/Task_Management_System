const User = require("../user/user.model.js")
const companyModel = require("../company/company.model.js");
const Project = require("../project/project.models.js");
const ApiError = require("../../utils/ApiError.js");
const historyModel = require("./history.model.js");
const mongoose = require('mongoose');
const { assertOwner } = require("../../utils/ownership.js");
const Task = require('../../modules/task/task.model.js')

// Getting History of a One Task 
const getTaskHistoryService = async (queryParams, taskId, user) => {

    let {
        page,
        limit,
        sortKey = "createdAt",
        sortOrder = "desc",
        search,
        ...filters
    } = queryParams;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    // Base match
    let matchStage = {
        taskId: new mongoose.Types.ObjectId(taskId)
    };

    console.log("History Service", user);

    if (user.role === "Admin") {
        let task = await Task.find({ reportTo: user._id })

        console.log("Inside Owner Logic", task);

        if (task.length === 0) {
            throw new ApiError(400, "You are not the owner");
        }
    }

    // 🔍 Dynamic filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            const values = filters[key].split(",");

            if (key === "_id") {
                matchStage[key] = {
                    $in: values.map(id => new mongoose.Types.ObjectId(id))
                };
            } else if (key === "userId") {
                matchStage[key] = {
                    $in: values.map(id => new mongoose.Types.ObjectId(id))
                };
            } else {
                matchStage[key] = { $in: values };
            }
        }
    });

    // 🔍 Search
    if (search) {
        matchStage.$or = [
            { action: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }




    // 🔃 Sorting
    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };

    console.log(matchStage, sortStage, limitNumber);
    // 🚀 Aggregation
    const [history, totalRecords] = await Promise.all([

        historyModel.aggregate([
            { $match: matchStage },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limitNumber }
        ]),

        historyModel.aggregate([
            { $match: matchStage },
            { $count: "count" }
        ])
    ]);

    const count = totalRecords[0]?.count || 0;
    console.log(history);

    return {
        count,
        page: pageNumber,
        limit: limitNumber,
        history
    };
};


//Getting History of Task by User Id

const taskHistoryUserService = async (user) => {

    if (!user) throw new ApiError(404, "Please provide User ID");

    const result = await historyModel.find({ updatedBy: user._id })

    if (result.length < 1) throw new ApiError(404, "You are not the owner");

    return result;
}


module.exports = { getTaskHistoryService, taskHistoryUserService }