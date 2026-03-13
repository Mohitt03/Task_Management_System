const companyModel = require("../models/company.model");
const projectModel = require("../models/project.models");
const Task = require("../models/task.model");
const historyModel = require("../models/history.model")
const ApiError = require("../utils/ApiError")

const generateTaskId = (taskName, taskCount) => {
    const shortName = taskName
        .split(" ")
        .map((word) => word[0].toUpperCase())
        .join("");

    const taskNumber = String(taskCount + 1).padStart(2, "0");

    return `${shortName}-${taskNumber}`;
};

const createTaskService = async (data, user) => {
    const { title, description, assignedTo, reportTo, priority, status } = data

    // Finding project user company id
    const Project = await projectModel.findOne({ company_Id: user.company_Id })

    //Count task in a project
    const taskCount = await Task.countDocuments({ projectId: Project._id });

    const taskId = generateTaskId(data.title, taskCount);


    const task = await Task.create({ task_id: taskId, title, description, projectId: Project._id, assignedTo, reportTo, priority, status });

    const history = await historyModel.create({
        taskId: task._id,
        action: "created",
        updatedBy: user._id
    })
    return task;
};

const getAllTasksService = async () => {
    return await Task.find()
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email");
};

const getTaskByIdService = async (id) => {
    const task = await Task.findById(id)
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email");

    if (!task) {
        throw new Error("Task not found");
    }

    return task;
};

const updateTaskService = async (id, data, user) => {

    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task Not found")
    }

    const historyLogs = [];

    const trackFields = ["status", "priority", "assignedTo"];
    // console.log(user);

    trackFields.forEach(field => {
        // console.log(field);

        // console.log(data[field], task[field], data[field] !== undefined && data[field].toString() !== task[field]?.toString());
        let action = ""
        if (data[field] !== undefined && data[field].toString() !== task[field]?.toString()) {

            if (field === "status") { action = "status-change" }
            if (field === "priority") { action = "priority-change" }
            historyLogs.push({
                action,
                taskId: task._id,
                field,
                oldValue: task[field],
                newValue: data[field],
                updatedBy: user._id
            });
        }
    });


    const updated = await Task.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );
    // console.log(historyLogs);

    // insert history records
    if (historyLogs.length > 0) {
        await historyModel.insertMany(historyLogs);
    }

    return updated;
};

const deleteTaskService = async (id) => {
    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
        throw new Error("Task not found");
    }

    return deleted;
};

module.exports = { createTaskService, getAllTasksService, getTaskByIdService, updateTaskService, deleteTaskService };