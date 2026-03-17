const express = require("express");
const router = express.Router();

const { createTask, getAllTasks, getTask, updateTask, deleteTask, assignTask } = require("../controllers/task.controller");
const verifyJWT = require("../middlewares/auth.middleware");

// router.use(verifyJWT, (req, res, next) => {
//     console.log("This is the Task Route", req.user.name);
//     next(); // VERY IMPORTANT
// });

const socketMiddleware = require("../middlewares/socket.middleware");

router.post(
    "/",
    verifyJWT,
    socketMiddleware("taskCreated", (req) => ({
        user: req.user?.id,
        message: "New task created"
    })),
);

// router.post("/", createTask);
// router.get("/", getAllTasks);
// router.get("/:id", getTask);
// router.put("/:id", updateTask);
// router.delete("/:id", deleteTask);
// router.put("/assign/:id", updateTask)

module.exports = router;