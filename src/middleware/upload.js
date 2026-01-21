const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function makeStorage(baseDir) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      ensureDir(baseDir);
      cb(null, baseDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${uuid()}${ext}`);
    },
  });
}

function fileFilter(req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }
  cb(null, true);
}

function makeUploader(destDir) {
  return multer({
    storage: makeStorage(destDir),
    fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });
}

module.exports = { makeUploader };
