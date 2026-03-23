const companyModel = require("../company/company.model");
const projectModel = require("../project/project.models");
const Task = require("../task/task.model");
const historyModel = require("../history/history.model")
const ApiError = require("../../utils/ApiError");
const asyncHandler = require("../../utils/asyncHandler");
const { assertOwner } = require("../../utils/ownership");
const mongoose = require('mongoose')

const generateTaskId = (taskName, taskCount) => {
    const shortName = taskName
        .split(" ")
        .map((word) => word[0].toUpperCase())
        .join("");

    const taskNumber = String(taskCount + 1).padStart(2, "0");

    return `${shortName}-${taskNumber}`;
};

const createTaskService = async (data, user, projectId) => {
    const { title, description, assignedTo, reportTo, priority, status } = data;

    // Count tasks in project
    const taskCount = await Task.countDocuments({ projectId });

    const project = await projectModel.findById(projectId);

    if (!project) throw new ApiError(404, "Project Not found");

    // Ownership check
    assertOwner(project.company_Id, user.company_Id);

    // Check assigned user is in project
    const isMember = project.members.some(
        (member) => member.user_Id.toString() === assignedTo.toString()
    );

    if (!isMember) {
        throw new ApiError(400, "Assigned user is not part of this project");
    }

    // Check duplicate title in same project
    const existingTask = await Task.findOne({ title, projectId });

    if (existingTask) {
        throw new ApiError(400, "Title already exists in this project");
    }

    // Generate task ID
    const taskId = generateTaskId(title, taskCount);

    const task = await Task.create({
        task_id: taskId,
        title,
        description,
        projectId,
        assignedTo,
        reportTo,
        priority,
        status
    });

    await historyModel.create({
        taskId: task._id,
        action: "created",
        updatedBy: user._id
    });

    return task;
};

const getAllTasksService = async () => {
    return await Task.find()
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email");
};

const getTaskByProjIdService = async (projectId, queryParams) => {

    let {
        page = 1,
        limit = 10,
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
        projectId: new mongoose.Types.ObjectId(projectId)
    };

    // 🔍 Dynamic filters
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            const values = filters[key].split(",");

            if (key === "_id") {
                matchStage[key] = {
                    $in: values.map(id => new mongoose.Types.ObjectId(id))
                };
            } else {
                matchStage[key] = { $in: values };
            }
        }
    });

    // 🔎 Search (title + description)
    if (search) {
        matchStage.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ];
    }

    // 🔃 Sorting
    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };

    const [tasks, totalRecords] = await Promise.all([
        Task.aggregate([
            { $match: matchStage },

            // populate assignedTo
            {
                $lookup: {
                    from: "users",
                    localField: "assignedTo",
                    foreignField: "_id",
                    as: "assignedTo"
                }
            },
            { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },

            // populate reportTo
            {
                $lookup: {
                    from: "users",
                    localField: "reportTo",
                    foreignField: "_id",
                    as: "reportTo"
                }
            },
            { $unwind: { path: "$reportTo", preserveNullAndEmptyArrays: true } },

            {
                $project: {
                    title: 1,
                    description: 1,
                    priority: 1,
                    status: 1,
                    createdAt: 1,
                    assignedTo: {
                        _id: 1,
                        name: "$assignedTo.name",
                        email: "$assignedTo.email"
                    },
                    reportTo: {
                        _id: 1,
                        name: "$reportTo.name",
                        email: "$reportTo.email"
                    }
                }
            },

            { $sort: sortStage },
            { $skip: skip },
            { $limit: limitNumber }
        ]),

        Task.aggregate([
            { $match: matchStage },
            { $count: "count" }
        ])
    ]);

    const count = totalRecords[0]?.count || 0;

    return {
        count,
        page: pageNumber,
        limit: limitNumber,
        tasks
    };
};

const updateTaskService = async (id, data, user) => {
    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task Not found");
    }

    const project = await projectModel.findById(task.projectId);

    if (!project) {
        throw new ApiError(404, "Project Not found");
    }

    // Ownership check
    assertOwner(project.company_Id, user.company_Id);

    const historyLogs = [];
    const trackFields = ["status", "priority", "assignedTo"];

    trackFields.forEach(field => {
        let action = "";

        if (
            data[field] !== undefined &&
            String(data[field]) !== String(task[field] ?? "")
        ) {
            if (field === "status") action = "status-change";
            if (field === "priority") action = "priority-change";
            if (field === "assignedTo") action = "assignee-change";

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

    if (historyLogs.length > 0) {
        await historyModel.insertMany(historyLogs);
    }

    return updated;
};
const deleteTaskService = async (id, user) => {

    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task Not found");
    }

    const project = await projectModel.findById(task.projectId);

    if (!project) {
        throw new ApiError(404, "Project Not found");
    }

    // Ownership check
    assertOwner(project.company_Id, user.company_Id);

    const deleted = await Task.findByIdAndDelete(id);

    return deleted;
};


// For User Service 
/**
 * Get tasks for logged-in user (only their project tasks)
 */
const getUserTasksService = async (userId) => {

    if (!userId) throw new ApiError(400, "Please enter user id");


    const tasks = await Task.find({
        assignedTo: userId
    })
        .populate("projectId", "name")
        .populate("assignedTo", "name email")
        .populate("reportTo", "name email");

    if (!tasks) throw new ApiError(400, "No Task Found by this user")

    return tasks;

};


/**
 * Update only task status
 */
const updateTaskStatusService = async (taskId, user, status) => {
    const allowedStatuses = [
        "to-do",
        "in-progress",
        "done",
        "testing",
        "qa-verified",
        "re-open",
        "deployment"
    ];

    if (!allowedStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status value");
    }

    // 1. Get task
    const task = await Task.findById(taskId);

    if (!task) {
        throw new ApiError(404, "Task Not found");
    }


    // 3. Ownership check (company-level)
    assertOwner(task.assignedTo, user._id);

    // 4. Optional: Restrict to assigned user
    if (String(task.assignedTo) !== String(user._id)) {
        throw new ApiError(403, "You can only update your assigned tasks");
    }

    const historyLogs = [];

    // 5. Track status change
    if (String(task.status) !== String(status)) {
        historyLogs.push({
            action: "status-change",
            taskId: task._id,
            field: "status",
            oldValue: task.status,
            newValue: status,
            updatedBy: user._id
        });

        task.status = status;
        await task.save();
    }

    // 6. Insert history
    if (historyLogs.length > 0) {
        await historyModel.insertMany(historyLogs);
    }

    return task;
};

module.exports = { createTaskService, getAllTasksService, getTaskByProjIdService, updateTaskService, deleteTaskService, getUserTasksService, updateTaskStatusService };