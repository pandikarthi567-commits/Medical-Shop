// middleware/uploadPrescription.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "../uploads/prescriptions");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const mimeTypeAllowed = allowed.test(file.mimetype);
  const extNameAllowed = allowed.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimeTypeAllowed && extNameAllowed) {
    return cb(null, true);
  }

  cb(new Error("Only JPG, PNG, and PDF files are allowed"));
};

const uploadPrescription = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = uploadPrescription;