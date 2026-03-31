// const {  } = require("../services/history.service");
const TaskHistory = require("./history.model");
const ApiResponse = require("../../utils/ApiResponse2");
const asyncHandler = require("../../utils/asyncHandler");
const { getTaskHistoryService, taskHistoryUserService } = require("./history.service")

// Getting Task History by the task id 
// const getTaskHistory = asyncHandler(async (req, res) => {

//     const taskId = req.params.id
//     const history = await TaskHistoryService(req.params.id)

//     return new ApiResponse(res, 200, history, "Succesfully Fetched")

// });


const getTaskHistory = asyncHandler(async (req, res) => {

    const taskId = req.params.id;

    const result = await getTaskHistoryService(req.query, taskId, req.user);

    return new ApiResponse(res, 200, result, "Successfully Fetched");

});



// Getting task history by the user id=who created it or the owner of the task/project/project
const getTask = asyncHandler(async (req, res) => {

    const user = req.user._id;

    const history = await taskHistoryUserService(user)

    return new ApiResponse(res, 200, history, "Succesfully Fetched")

});

//Only Admin owner can see the task history and the User 

module.exports = { getTaskHistory, getTask };