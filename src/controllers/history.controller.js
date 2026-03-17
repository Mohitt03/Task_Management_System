// const {  } = require("../services/history.service");
const historyModel = require("../models/history.model");
const ApiResponse = require("../utils/ApiResponse2");
const asyncHandler = require("../utils/asyncHandler");


// Getting One Task History
const getTaskHistory = asyncHandler(async (req, res) => {

    const taskId = req.params.id
    const task = await historyModel.find({ taskId: taskId })
    console.log(task);

    return new ApiResponse(res, 200, task, "Succesfully Fetched")

});

// const getTask = async (req, res) => {
//     try {
//         const task = await getTaskById(req.params.id);
//         res.json(task);S
//     } catch (error) {
//         res.status(404).json({ message: error.message });
//     }
// };



module.exports = { getTaskHistory };