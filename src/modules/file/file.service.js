const cloudinary = require("../../config/cloudinary");
const taskModel = require("../task/task.model");
const File = require("./file.model");
const axios = require("axios");
const mongoose = require("mongoose");

// Common builder for pagination
const buildPagination = (page = 1, limit = 10) => {
    const skip = (page - 1) * limit;
    return { skip, limit: Number(limit) };
};

// 🔍 Dynamic search builder
const buildSearch = (search) => {
    if (!search) return {};

    return {
        $or: [
            { original_name: { $regex: search, $options: "i" } },
            { mime_type: { $regex: search, $options: "i" } }
        ]
    };
};



// ================= GET FILES BY USER =================
const getFilesByUserService = async (query, uploaded_by) => {
    const { page = 1, limit = 10, search } = query;

    if (!uploaded_by) throw new Error("uploaded_by is required");

    const { skip } = buildPagination(page, limit);

    const matchStage = {
        uploaded_by: new mongoose.Types.ObjectId(uploaded_by),
        ...buildSearch(search)
    };

    const data = await File.aggregate([
        { $match: matchStage },

        {
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: Number(limit) }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    return {
        page: Number(page),
        limit: Number(limit),
        total: data[0].totalCount[0]?.count || 0,
        files: data[0].data
    };
};



// ================= GET FILES BY TASK =================
const getFilesByTaskService = async (query, task_id) => {
    const { page = 1, limit = 10, search } = query;

    if (!task_id) throw new Error("task_id is required");

    const { skip } = buildPagination(page, limit);

    const matchStage = {
        task_id: new mongoose.Types.ObjectId(task_id),
        ...buildSearch(search)
    };

    const data = await File.aggregate([
        { $match: matchStage },

        {
            $facet: {
                data: [
                    { $sort: { createdAt: -1 } },
                    { $skip: skip },
                    { $limit: Number(limit) }
                ],
                totalCount: [
                    { $count: "count" }
                ]
            }
        }
    ]);

    return {
        page: Number(page),
        limit: Number(limit),
        total: data[0].totalCount[0]?.count || 0,
        files: data[0].data
    };
};




const uploadToCloudinary = async (file, userId, taskId) => {

    let projectId = await taskModel.findById(taskId).populate("projectId")

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "task_management/pdfs",
                resource_type: "raw", // ✅ FINAL FIX
                use_filename: true,
                unique_filename: true
            },
            async (error, result) => {
                if (error) return reject(error);
                console.log("Service", taskId);

                const savedFile = await File.create({
                    url: result.secure_url,
                    public_id: result.public_id,
                    original_name: file.originalname,
                    mime_type: file.mimetype,
                    size: file.size,
                    uploaded_by: userId,
                    task_id: taskId,
                    companyId: projectId.projectId.company_Id
                });

                resolve(savedFile);
            }
        );

        stream.end(file.buffer);
    });
};


const downloadFileService = async (fileId) => {

    // 1. Get file from DB
    const file = await File.findById(fileId);

    if (!file) {
        throw new Error("File not found");
    }

    // 2. Fetch file from Cloudinary as stream
    const response = await axios({
        url: file.url,
        method: "GET",
        responseType: "stream"
    });

    return {
        stream: response.data,
        original_name: file.original_name || "file.pdf"
    };
};


module.exports = {
    uploadToCloudinary, downloadFileService, getFilesByUserService, getFilesByTaskService
};