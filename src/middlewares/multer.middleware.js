const multer = require("multer");
const path = require("path");
const ApiError = require('../utils/ApiError')

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/png"];
    const allowedExtensions = [".jpg", ".jpeg", ".png"];

    const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);
    const extValid = allowedExtensions.includes(
      path.extname(file.originalname).toLowerCase() 
    );

    if (mimeTypeValid && extValid) {
      cb(null, true);
    } else {
      cb(
        new Error("Only JPG, JPEG, and PNG image files are allowed"),
        false
      );
      throw new ApiError(500, "Only image files are allowed")

    }
  }
});

module.exports = { upload };
