const multer = require("multer");

const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "Image file is too large. Maximum allowed size is 2MB",
      });
    }

    return res.status(400).json({
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      message: err.message || "File upload error",
    });
  }

  next();
};

module.exports = uploadErrorHandler;