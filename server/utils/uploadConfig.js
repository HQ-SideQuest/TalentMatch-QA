const multer = require('multer');
const path = require('path');
const { randomUUID } = require('node:crypto');
const { uploadsDirectory } = require('./cvStorage');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDirectory);
  },
  filename: (req, file, cb) => {
    cb(null, randomUUID() + path.extname(file.originalname).toLowerCase());
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.pdf', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();
  
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed'), false);
  }
};

const MAX_CV_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_CV_SIZE_BYTES, files: 1 }
});

upload.MAX_CV_SIZE_BYTES = MAX_CV_SIZE_BYTES;

module.exports = upload;
