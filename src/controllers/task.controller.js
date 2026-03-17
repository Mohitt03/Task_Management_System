const { createTaskService, getAllTasksService, getTaskByIdService, updateTaskService, deleteTaskService, asignTaskService } = require("../services/task.service");
const ApiResponse = require("../utils/ApiResponse2");
const asyncHandler = require("../utils/asyncHandler");

const createTask = asyncHandler(async (req, res) => {
    const task = await createTaskService(req.body, req.user);
    return new ApiResponse(res, 200, task, 'Task is succesfully created')

});

const getAllTasks = async (req, res) => {
    try {
        const tasks = await getAllTasksService();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTask = asyncHandler(async (req, res) => {
    const task = await getTaskById(req.params);
    return new ApiResponse(res, 200, task, 'Task is fetch succesfully')
});

const updateTask = asyncHandler(async (req, res) => {
    const task = await updateTaskService(req.params.id, req.body, req.user);
    return new ApiResponse(res, 200, task, 'Task is updated succesfully')

});

const assignTask = asyncHandler(async (req, res) => {

    const userId = req.body;
    const task = await updateTaskService(req.params.id, userId, req.user)
    return new ApiResponse(res, 200, task, 'Task assigned to:- ', userId)
});

const deleteTask = async (req, res) => {
    try {
        await deleteTask(req.params.id);
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = { createTask, getAllTasks, getTask, updateTask, deleteTask, assignTask };