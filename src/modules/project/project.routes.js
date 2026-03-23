const express = require("express");
const router = express.Router();
const {
    createProject,
    getProjects,
    getProjectsByUser,
    updateProject,
    deleteProject,
    addMember,
    removeMember,
} = require("./project.controller.js");
const rbacMiddleware = require("../../middlewares/rbac.middleware.js");
const { checkPlanLimit } = require("../../middlewares/checkPlan.middleware.js");
const { projectValidation } = require("../../validations/projectValidation.js");

// All project routes require authentication and only admin can manage the project
router.use( rbacMiddleware(["Admin", "User"]));

// ─── Core CRUD ────────────────────────────────────────────────────────────────
// POST   /api/projects          → Create a new project
// GET    /api/projects          → Get all projects in company (?status=active&priority=high&myProjects=true)
// GET    /api/projects/:id      → Get a single project
// PATCH  /api/projects/:id      → Update a project
// DELETE /api/ projects/:id      → Delete a project

router.route("/")
    .post(checkPlanLimit("projects"), createProject)
    .get(rbacMiddleware(["Admin"]), getProjects);

router.route("/User").get(getProjectsByUser);

router.route("/:projectId")
    .patch(updateProject)
    .delete(deleteProject);

// ─── Member Management ────────────────────────────────────────────────────────
// POST   /api/projects/:id/members              → Add a member
// DELETE /api/projects/:id/members/:memberId    → Remove a member

router.route("/:projectId/members")
    .post(rbacMiddleware(["Admin"]), addMember);

router.route("/:projectId/members/:memberId")
    .delete(removeMember);

module.exports = router;