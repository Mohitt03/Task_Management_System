const Project = require("./project.models.js");
const ApiError = require("../../utils/ApiError.js");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a short code from project name.
 * "Task Management System" -> "TMS"
 * "Backend API"            -> "BA"
 * "Apollo"                 -> "APO"
 */
const generateShortCode = (name) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    return words.map((w) => w[0]).join("").toUpperCase();
};

module.exports.generateShortCode = generateShortCode;

// ─── Create ───────────────────────────────────────────────────────────────────

const createProject = async ({ name, description, status, priority, start_date, due_date, tags, members }, user) => {
    console.log("Service");

    const existing = await Project.findOne({ company_Id: user.company_Id, name });
    if (existing) {
        throw new ApiError(409, "A project with this name already exists in your company");
    }

    // Generate short_code and resolve collisions within the same company
    let short_code = generateShortCode(name);
    const codeConflict = await Project.findOne({ company_Id: user.company_Id, short_code });
    if (codeConflict) {
        const count = await Project.countDocuments({
            company_Id: user.company_Id,
            short_code: new RegExp("^" + short_code),
        });
        short_code = short_code + (count + 1);
    }

    const project = await Project.create({
        name,
        short_code,
        description,
        company_Id: user.company_Id,
        created_by: user._id,
        status,
        priority,
        start_date,
        due_date,
        tags,
        members: [
            { user_Id: user._id, role: "manager" },
            ...(members || []),
        ],
    });

    return project;
};

// ─── Get All (scoped to company) ──────────────────────────────────────────────

const getAllProjects = async (user, query = {}) => {
    const filter = { company_Id: user.company_Id };

    if (query.status) filter.status = query.status;
    if (query.priority) filter.priority = query.priority;

    if (query.myProjects === "true") {
        filter["members.user_Id"] = user._id;
    }

    const projects = await Project.find(filter)
        .populate("created_by", "name email")
        .populate("members.user_Id", "name email")
        .sort({ createdAt: -1 });

    return projects;
};

// ─── Get One ──────────────────────────────────────────────────────────────────

const getProjectById = async (projectId, user) => {
    const project = await Project.findOne({ _id: projectId, company_Id: user.company_Id })
        .populate("created_by", "name email")
        .populate("members.user_Id", "name email");

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    return project;
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateProject = async (projectId, updates, user) => {
    const project = await Project.findOne({ _id: projectId, company_Id: user.company_Id });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isManager = project.members.some(
        (m) => m.user_Id.toString() === user._id.toString() && m.role === "manager"
    );
    const isCreator = project.created_by.toString() === user._id.toString();

    if (!isManager && !isCreator) {
        throw new ApiError(403, "You don't have permission to update this project");
    }

    if (updates.name && updates.name !== project.name) {
        const existing = await Project.findOne({ company_Id: user.company_Id, name: updates.name });
        if (existing) {
            throw new ApiError(409, "A project with this name already exists in your company");
        }
    }

    if (updates.status === "completed" && project.status !== "completed") {
        updates.completed_at = new Date();
    }
    if (updates.status && updates.status !== "completed") {
        updates.completed_at = null;
    }

    const allowedFields = ["name", "description", "status", "priority", "start_date", "due_date", "tags", "completed_at"];
    allowedFields.forEach((field) => {
        if (updates[field] !== undefined) {
            project[field] = updates[field];
        }
    });

    await project.save();
    return project;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

const deleteProject = async (projectId, user) => {
    const project = await Project.findOne({ _id: projectId, company_Id: user.company_Id });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isCreator = project.created_by.toString() === user._id.toString();
    if (!isCreator) {
        throw new ApiError(403, "Only the project creator can delete this project");
    }

    await project.deleteOne();
    return { message: "Project deleted successfully" };
};

// ─── Member Management ────────────────────────────────────────────────────────

const addMember = async (projectId, { user_Id, }, user) => {
    const project = await Project.findOne({ _id: projectId, company_Id: user.company_Id });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    // const isManager = project.members.some(
    //     (m) => m.user_Id.toString() === user._id.toString() && m. === "manager"
    // );
    // if (!isManager) {
    //     throw new ApiError(403, "Only a project manager can add members");
    // }

    const alreadyMember = project.members.some((m) => m.user_Id.toString() === user_Id.toString());
    if (alreadyMember) {
        throw new ApiError(409, "User is already a member of this project");
    }

    project.members.push({ user_Id });
    await project.save();

    return project;
};

const removeMember = async (projectId, memberId, user) => {
    const project = await Project.findOne({ _id: projectId, company_Id: user.company_Id });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    const isManager = project.members.some(
        (m) => m.user_Id.toString() === user._id.toString() && m.role === "manager"
    );
    if (!isManager) {
        throw new ApiError(403, "Only a project manager can remove members");
    }

    const memberIndex = project.members.findIndex((m) => m.user_Id.toString() === memberId);
    if (memberIndex === -1) {
        throw new ApiError(404, "Member not found in this project");
    }

    const memberToRemove = project.members[memberIndex];
    if (memberToRemove.role === "manager") {
        const managerCount = project.members.filter((m) => m.role === "manager").length;
        if (managerCount === 1) {
            throw new ApiError(400, "Cannot remove the last manager. Assign another manager first.");
        }
    }

    project.members.splice(memberIndex, 1);
    await project.save();

    return project;
};

module.exports = {
    generateShortCode,
    createProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
};