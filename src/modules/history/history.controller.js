// const {  } = require("../services/history.service");
const historyModel = require("./history.model");
const ApiResponse = require("../../utils/ApiResponse2");
const asyncHandler = require("../../utils/asyncHandler");
const { TaskHistoryService, taskHistoryUserService } = require("./history.service")

// Getting Task History by the task id 
const getTaskHistory = asyncHandler(async (req, res) => {

    const taskId = req.params.id
    const history = await TaskHistoryService(req.params.id)

    return new ApiResponse(res, 200, history, "Succesfully Fetched")

});

const getTask = asyncHandler(async (req, res) => {

    const userId = req.user._id;

    const history = await taskHistoryUserService(userId)

    return new ApiResponse(res, 200, history, "Succesfully Fetched")



});



module.exports = { getTaskHistory, getTask   };