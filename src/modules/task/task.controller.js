const { createTaskService, getAllTasksService, getTaskByProjIdService, updateTaskService, deleteTaskService, getUserTasksService, updateTaskStatusService } = require("./task.service");
const ApiResponse = require("../../utils/ApiResponse2");
const asyncHandler = require("../../utils/asyncHandler");

const createTask = asyncHandler(async (req, res) => {
    let projectId = req.params.projId

    const task = await createTaskService(req.body, req.user, projectId);
    return new ApiResponse(res, 200, task, 'Task is succesfully created')

});

const getAllTasks = asyncHandler(async (req, res) => {


    const tasks = await getAllTasksService(req.query, req.user);

    return new ApiResponse(res, 200, tasks, "Succesfully Fetched")
});

const getTaskByProjId = asyncHandler(async (req, res) => {
    const projectId = req.params.id;
    const queryParams = req.query;

    if (!projectId) {
        return res.status(400).json({
            success: false,
            message: "Project ID is required"
        });
    }

    const result = await getTaskByProjIdService(projectId, queryParams, req.user);

    return res.status(200).json({
        success: true,
        message: "Tasks fetched successfully",
        ...result
    });

});

const updateTask = asyncHandler(async (req, res) => {
    const task = await updateTaskService(req.params.id, req.body, req.user);
    return new ApiResponse(res, 200, task, 'Task is updated succesfully')

});

const deleteTask = asyncHandler(async (req, res) => {

    const task = await deleteTaskService(req.params.id, req.user);
    return new ApiResponse(res, 200, task, 'Task deleted succesfully')

});

/**
 * GET /tasks/my-tasks
 */
const getUserTasks = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const tasks = await getUserTasksService(userId);

    // res.status(200).json({
    //     success: true,
    //     count: tasks.length,
    //     data: tasks
    // });

    return new ApiResponse(res, 200, tasks, "Succesfully Fetched")



});


/**
 * PATCH /tasks/:id/status
 */
const updateTaskStatus = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const taskId = req.params.id;
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({
            success: false,
            message: "Status is required"
        });
    }

    const updatedTask = await updateTaskStatusService(
        taskId,
        userId,
        status
    );

    res.status(200).json({
        success: true,
        message: "Task status updated successfully",
        data: updatedTask
    });

});

module.exports = { createTask, getAllTasks, getTaskByProjId, updateTask, deleteTask, getUserTasks, updateTaskStatus };