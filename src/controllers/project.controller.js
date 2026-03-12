const asyncHandler = require("../utils/asyncHandler.js");
const ApiError = require("../utils/ApiError.js");
const ApiResponse = require("../utils/ApiResponse.js");
const projectService = require("../services/project.service.js");

// ─── Create Project ───────────────────────────────────────────────────────────

const createProject = asyncHandler(async (req, res) => {
    const { name, description, status, priority, start_date, due_date, tags, members } = req.body;

    if (!name?.trim()) {
        throw new ApiError(400, "Project name is required");
    }

    const project = await projectService.createProject(
        { name, description, status, priority, start_date, due_date, tags, members },
        req.user
    );

    return res
        .status(201)
        .json(new ApiResponse(201, project, "Project created successfully"));
});

// ─── Get All Projects ─────────────────────────────────────────────────────────

const getAllProjects = asyncHandler(async (req, res) => {
    const { status, priority, myProjects } = req.query;

    const projects = await projectService.getAllProjects(req.user, { status, priority, myProjects });

    return res
        .status(200)
        .json(new ApiResponse(200, projects, "Projects fetched successfully"));
});

// ─── Get Project By ID ────────────────────────────────────────────────────────

const getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const project = await projectService.getProjectById(projectId, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project fetched successfully"));
});

// ─── Update Project ───────────────────────────────────────────────────────────

const updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
        throw new ApiError(400, "No update fields provided");
    }

    const project = await projectService.updateProject(projectId, updates, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Project updated successfully"));
});

// ─── Delete Project ───────────────────────────────────────────────────────────

const deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    const result = await projectService.deleteProject(projectId, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, result, "Project deleted successfully"));
});

// ─── Add Member ───────────────────────────────────────────────────────────────

const addMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { user_Id, role } = req.body;

    if (!user_Id) {
        throw new ApiError(400, "user_Id is required");
    }

    const project = await projectService.addMember(projectId, { user_Id }, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Member added successfully"));
});

// ─── Remove Member ────────────────────────────────────────────────────────────

const removeMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;

    const project = await projectService.removeMember(projectId, memberId, req.user);

    return res
        .status(200)
        .json(new ApiResponse(200, project, "Member removed successfully"));
});

module.exports = {
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
};