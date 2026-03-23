const express = require("express");
const router = express.Router();

const { createTask, getAllTasks, getTaskByProjId, updateTask, deleteTask, getUserTasks, updateTaskStatus } = require("./task.controller");
const rbacMiddleware = require("../../middlewares/rbac.middleware")

//Admin Routes
router.post("/:projId", rbacMiddleware(["Admin"]), createTask);
router.get("/", rbacMiddleware(["Admin"]), getAllTasks);
router.get("/:id", rbacMiddleware(["Admin"]), getTaskByProjId);
router.put("/:id", rbacMiddleware(["Admin"]), updateTask);
router.delete("/:id", rbacMiddleware(["Admin"]), deleteTask);

//User Routes
router.get("/user/tasks", getUserTasks);
router.put("/user/tasks/:id", updateTaskStatus);

module.exports = router;