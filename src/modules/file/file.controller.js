const ApiResponse = require("../../utils/ApiResponse2");
const asyncHandler = require("../../utils/asyncHandler");
const fileModel = require("./file.model");
const { uploadToCloudinary, downloadFileService, getFilesByUserService, getFilesByTaskService } = require("./file.service");

const uploadFile = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // 🔒 Double check
    if (req.file.mimetype !== "application/pdf") {
        return res.status(400).json({ message: "Only PDF allowed" });
    }

    const file = await uploadToCloudinary(req.file, req.user._id, req.params.taskId);

    res.status(201).json({
        message: "PDF uploaded successfully",
        data: file
    });
});

const getFile = asyncHandler(async (req, res, next) => {
    const response = fileModel.find()

    return new ApiResponse(res, 200, response, `File Fetch Succesfully`)
})


const getFilesByUser = asyncHandler(async (req, res) => {
    const data = await getFilesByUserService(req.query, req.params.id);
    res.json(data);
});

const getFilesByTask = asyncHandler(async (req, res) => {
    const data = await getFilesByTaskService(req.query, req.params.id);
    res.json(data);
});

const downloadFile = asyncHandler(async (req, res, next) => {
    const { id } = req.params;

    const fileStreamData = await downloadFileService(id);

    // Set headers for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileStreamData.original_name}"`
    );

    // Pipe file
    fileStreamData.stream.pipe(res);

});


module.exports = {
    getFilesByUser,
    getFilesByTask,
    uploadFile,
    downloadFile
};