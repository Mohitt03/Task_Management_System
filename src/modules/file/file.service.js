const cloudinary = require("../../config/cloudinary");
const File = require("./file.model");

const uploadToCloudinary = async (file, userId) => {
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

                const savedFile = await File.create({
                    url: result.secure_url,
                    public_id: result.public_id,
                    original_name: file.originalname,
                    mime_type: file.mimetype,
                    size: file.size,
                    uploaded_by: userId
                });

                resolve(savedFile);
            }
        );

        stream.end(file.buffer);
    });
};


const axios = require("axios");

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
    downloadFileService
};

module.exports = {
    uploadToCloudinary, downloadFileService
};