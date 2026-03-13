const companyModel = require("../models/company.model");
const projectModel = require("../models/project.models");
const Task = require("../models/task.model");


const generateTaskId = (taskName, taskCount) => {
    const shortName = taskName
        .split(" ")
        .map((word) => word[0].toUpperCase())
        .join("");

    const taskNumber = String(taskCount + 1).padStart(2, "0");

    return `${shortName}-${taskNumber}`;
};

const createTaskservice = async (data, user) => {
    const { title, description, assignedTo, reportTo, priority, status } = data

    // Finding project user company id
    const Project = await projectModel.findOne({ company_Id: user.company_Id })

    //Count task in a project
    const taskCount = await Task.countDocuments({ projectId: Project._id });

    const taskId = generateTaskId(data.title, taskCount);


    const task = await Task.create({ task_id: taskId, title, description, projectId: Project._id, assignedTo, reportTo, priority, status });
    return task;
};

const getAllTasksservice = async () => {
    return await Task.find()
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email");
};

const getTaskByIdservice = async (id) => {
    const task = await Task.findById(id)
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email");

    if (!task) {
        throw new Error("Task not found");
    }

    return task;
};

const updateTaskservice = async (id, data) => {
    const updated = await Task.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
    );

    if (!updated) {
        throw new Error("Task not found");
    }

    return updated;
};

const deleteTaskservice = async (id) => {
    const deleted = await Task.findByIdAndDelete(id);

    if (!deleted) {
        throw new Error("Task not found");
    }

    return deleted;
};

module.exports = { createTaskservice, getAllTasksservice, getTaskByIdservice, updateTaskservice, deleteTaskservice };