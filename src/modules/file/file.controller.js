const ApiResponse = require("../../utils/ApiResponse2");
const asyncHandler = require("../../utils/asyncHandler");
const fileModel = require("./file.model");
const { uploadToCloudinary, downloadFileService } = require("./file.service");

const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // 🔒 Double check
        if (req.file.mimetype !== "application/pdf") {
            return res.status(400).json({ message: "Only PDF allowed" });
        }

        const file = await uploadToCloudinary(req.file, req.user?._id);

        res.status(201).json({
            message: "PDF uploaded successfully",
            data: file
        });

    } catch (error) {
        next(error);
    }
};

const getFile = asyncHandler(async (req, res, next) => {
    const response = fileModel.find()

    return new ApiResponse(res, 200, response, `File Fetch Succesfully`)
})


// const axios = require("axios");
// const cloudinary = require("../../config/cloudinary"); // your cloudinary config


const downloadFile = async (req, res, next) => {
    try {
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

    } catch (error) {
        next(error);
    }
};

module.exports = {
    downloadFile
};

module.exports = {
    uploadFile,
    downloadFile
};