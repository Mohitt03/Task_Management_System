const express = require("express");
const router = express.Router();
const upload = require("../../middlewares/upload.middleware");
const { uploadFile, downloadFile } = require("./file.controller");

// single file upload
router.post(
    "/upload/:taskId",
    upload.single("file"), // field name = file
    uploadFile
);

router.get("/download/:id", downloadFile);

// router.get("/", getFile)

module.exports = router;