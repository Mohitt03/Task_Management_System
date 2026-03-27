const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.middleware");
const { uploadFile, downloadFile, getFilesByUser, getFilesByTask } = require("./file.controller");
const rbacMiddleware = require("../../middlewares/rbac.middleware");



// Get files by uploaded_by
router.get("/by-user/:id", rbacMiddleware(["Admin", "User"]), getFilesByUser);

// Get files by task_id
router.get("/by-task/:id", rbacMiddleware(["Admin", "User"]), getFilesByTask);

// single file upload
router.post(
    "/upload/:taskId",
    rbacMiddleware(["Admin", "User"]),
    upload.single("file"), // field name = file
    uploadFile
);

router.get("/download/:id", rbacMiddleware(["Admin", "User"]), downloadFile);


module.exports = router;