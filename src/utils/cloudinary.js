const cloudinary = require("cloudinary").v2;
const fs = require("fs")


cloudinary.config({
    cloud_name: "dsqfsk7ze",
    api_key: "986853669535398",
    api_secret: "NvpIwW0Og4IvAvelnqPP2gaE1JA"
});

const uploadOnCloudinary = async (fileBuffer) => {
    try {
        return await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: "auto" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(fileBuffer);
        });
    } catch (error) {
        console.log("Cloudinary upload error:", error);
        return null;
    }
};




module.exports = { uploadOnCloudinary }