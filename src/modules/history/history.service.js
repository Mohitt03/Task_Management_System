const User = require("../user/user.model.js")
const companyModel = require("../company/company.model.js");
const Project = require("../project/project.models.js");
const ApiError = require("../../utils/ApiError.js");
const historyModel = require("./history.model.js");


// Getting History of a One Task 
const TaskHistoryService = async (taskId) => {
    if (!taskId) throw new ApiError(400, "Please provide task id");

    const result = await historyModel.find({ taskId: taskId });

    return result;

}


//Getting History of Task by User Id

const taskHistoryUserService = async (userId) => {

    if (!userId) throw new ApiError(400, "Please provide User ID");

    const result = await historyModel.find({ updatedBy: userId })

    return result;
}


module.exports = { TaskHistoryService, taskHistoryUserService }