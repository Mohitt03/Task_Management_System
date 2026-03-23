const Project = require("./project.models.js");
const ApiError = require("../../utils/ApiError.js");
const { isOwner, assertOwner } = require('../../utils/ownership');
const userModel = require("../user/user.model.js");
const sendEmail = require('../../utils/sendEmail.js');

// Genreating Short Name
const generateShortCode = (name) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
    return words.map((w) => w[0]).join("").toUpperCase();
};

module.exports.generateShortCode = generateShortCode;

// ─── Create

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

    const result = await sendEmail({
        to: user.email,
        subject: "Project Created ",
        html: `<h1>Project Details.</h1> <br> <h2>Project Name :-</h2> <p>${name}</p> <br> <h2>Project Description :-</h2> <p>${description}</p> `,
    });

    return project;
};

// ─── Get 

const getProjects = async (user, queryParams = {}) => {

    let {
        page,
        limit,
        sortKey,
        sortOrder,
        search,
        ...filters
    } = queryParams || {};

    page = page ?? 1;
    // limit = null ?? 10;
    sortKey = sortKey ?? "createdAt";
    sortOrder = sortOrder ?? "desc";

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    let matchStage = {
        isActive: true,
        isDelete: false,
        company_Id: user.company_Id
    };


    // Dynamic filters
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


    // Search
    if (search) {
        matchStage.name = { $regex: search, $options: "i" };
    }

    const sortStage = {
        [sortKey]: sortOrder === "asc" ? 1 : -1
    };

    const [project, totalRecords] = await Promise.all([
        Project.aggregate([
            // { $match: { company_Id: user.company_Id } }
            { $match: matchStage },
            { $project: { isActive: 0, isDelete: 0 } },
            { $sort: sortStage },
            { $skip: skip },
            { $limit: limitNumber }
        ]),
        Project.aggregate([
            { $match: matchStage },
            { $count: "count" }
        ])
    ]);

    const count = totalRecords[0]?.count || 0;

    return {
        count,
        page: pageNumber,
        limit: limitNumber,
        project
    };
};


const getProjectsUser = async (user) => {
    const project = Project.find({ created_by: user.createdBy })
    return project
};

// ─── Update ───────────────────────────────────────────────────────────────────

const updateProject = async (projectId, updates, user) => {
    if (!Object.keys(updates).length) {
        throw new ApiError(400, "No fields provided for update");
    }

    const project = await Project.findOne({
        _id: projectId,
        company_Id: user.company_Id
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    assertOwner(user.company_Id, project.company_Id);

    // 🔍 duplicate name check
    if (updates.name && updates.name !== project.name) {
        const existing = await Project.findOne({
            company_Id: user.company_Id,
            name: { $regex: `^${updates.name}$`, $options: "i" }
        });

        if (existing) {
            throw new ApiError(409, "A project with this name already exists");
        }
    }

    // 🔄 status logic
    if (updates.status === "completed" && project.status !== "completed") {
        updates.completed_at = new Date();
    }

    if (updates.status && updates.status !== "completed") {
        updates.completed_at = null;
    }

    const allowedFields = [
        "name",
        "description",
        "status",
        "priority",
        "start_date",
        "due_date",
        "tags",
        "completed_at"
    ];

    for (const field of allowedFields) {
        if (updates[field] !== undefined && updates[field] !== null) {
            project[field] = updates[field];
        }
    }

    await project.save();

    const result = await sendEmail({
        to: user.email,
        subject: "Project Updated",
        html: `<h1>Project Details.</h1> <br> <h2>Project Name :-</h2> <p>${updates.name}</p> <br> <h2>Project Description :-</h2> <p>${updates.description}</p> `,
    });

    return project;
};

// ─── Delete ───────────────────────────────────────────────────────────────────

const deleteProject = async (projectId, user) => {
    const project = await Project.findOne({
        _id: projectId,
        company_Id: user.company_Id,
        isDelete: false
    });

    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    assertOwner(project.created_by, user._id)

    // 🗑️ Soft delete
    project.isDelete = true;
    project.isActive = false;
    project.deleted_at = new Date();

    await project.save();

    const result = await sendEmail({
        to: user.email,
        subject: "Project Deleted",
        html: `<h1>Project Details.</h1> <br> <h2>Project Name :-</h2> <p>${project.name}</p> <br> <h2>Project Description :-</h2> <p>${project.description}</p> `,
    });

    return { message: "Project deleted successfully" };
};

// ─── Member Management ────────────────────────────────────────────────────────

const addMember = async (projectId, { user_Id, }, user) => {
    const project = await Project.findOne({ _id: projectId, company_Id: user.company_Id });
    const AsignUser = await userModel.findById(user_Id)
    if (!project) {
        throw new ApiError(404, "Project not found");
    }

    assertOwner(project.company_Id, user.company_Id, message = "Admin is not owner of the project")

    assertOwner(AsignUser.createdBy, user._id, message = "Admin cannot assign another User")



    const alreadyMember = project.members.some((m) => m.user_Id.toString() === user_Id.toString());
    if (alreadyMember) {
        throw new ApiError(409, "User is already a member of this project");
    }

    project.members.push({ user_Id });
    await project.save();


    const result = await sendEmail({
        to: AsignUser.email,
        subject: "You have been assign to new Project",
        html: `<h1>Project Details.</h1> <br> <h2>Project Name :-</h2> <p>${project.name}</p> <br> <h2>Project Description :-</h2> <p>${project.description}</p> `,
    });


    return project;
};

const removeMember = async (projectId, memberId, user) => {
    const project = await Project.findOne({ _id: projectId, company_Id: user.company_Id });
    const AsignUser = await userModel.findById(memberId)
    if (!project) {
        throw new ApiError(404, "Project not found");
    }


    assertOwner(project.company_Id, user.company_Id, message = "Admin is not owner of the project")

    assertOwner(AsignUser.createdBy, user._id, message = "Admin cannot assign another User")


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

    const result = await sendEmail({
        to: AsignUser.email,
        subject: `You have been remove from the Project ${project.name}`,
        html: `<h1>Project Details.</h1> <br> <h2>Project Name :-</h2> <p>${project.name}</p> <br> <h2>Project Description :-</h2> <p>${project.description}</p> `,
    });
    return project;
};

module.exports = {
    generateShortCode,
    createProject,
    getProjects,
    getProjectsUser,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
};