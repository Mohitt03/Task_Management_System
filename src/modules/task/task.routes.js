const express = require("express");
const router = express.Router();

const { createTask, getAllTasks, getTask, updateTask, deleteTask } = require("../controllers/task.controller");
const verifyJWT = require("../middlewares/auth.middleware");

router.post("/", verifyJWT, createTask);
router.get("/", getAllTasks);
router.get("/:id", getTask);
router.put("/:id", verifyJWT, updateTask);
router.delete("/:id", deleteTask);

module.exports = router;