const express = require("express");
const router = express.Router();

const { createTask, getAllTasks, getTaskByProjId, updateTask, deleteTask, getUserTasks, updateTaskStatus } = require("./task.controller");
const rbacMiddleware = require("../../middlewares/rbac.middleware")

//Admin Routes
// Create Task
router.post("/:projId", rbacMiddleware(["Admin"]), createTask);

//Get All Task
router.get("/", rbacMiddleware(["Admin"]), getAllTasks);

//Get Task by Project Id
router.get("/:id", rbacMiddleware(["Admin"]), getTaskByProjId);

// Updating Task
router.put("/:id", rbacMiddleware(["Admin"]), updateTask);

//Deleting Task
router.delete("/:id", rbacMiddleware(["Admin"]), deleteTask);

//User Routes
router.get("/user/tasks", getUserTasks);
router.put("/user/tasks/:id", updateTaskStatus);

module.exports = router;