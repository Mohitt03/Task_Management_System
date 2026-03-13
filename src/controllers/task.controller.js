const { createTaskservice, getAllTasksservice, getTaskByIdservice, updateTaskservice, deleteTaskservice } = require("../services/task.service");
const ApiResponse = require("../utils/ApiResponse2");
const asyncHandler = require("../utils/asyncHandler");

const createTask = asyncHandler(async (req, res) => {
    const task = await createTaskservice(req.body, req.user);
    return new ApiResponse(res, 200, task, 'Task is succesfully created')

});

const getAllTasks = async (req, res) => {
    try {
        const tasks = await getAllTasks();
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTask = async (req, res) => {
    try {
        const task = await getTaskById(req.params.id);
        res.json(task);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await updateTask(req.params.id, req.body);
        res.json(task);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        await deleteTask(req.params.id);
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

module.exports = { createTask, getAllTasks, getTask, updateTask, deleteTask };