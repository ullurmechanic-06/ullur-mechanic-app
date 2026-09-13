const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "MOCK_KEY",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "MOCK_SECRET",
  region: process.env.AWS_REGION || "ap-south-1",
});

const BUCKET = process.env.AWS_S3_BUCKET_NAME || "ullur-mechanic-assets";

// Disk storage fallback if S3 is not configured
const diskStorage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${folder}-${uuidv4()}${ext}`);
    },
  });

// Multer uploader factory
const createUploader = (folder) => {
  const isS3Configured = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_S3_BUCKET_NAME;

  const storage = isS3Configured
    ? multerS3({
        s3,
        bucket: BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${folder}/${uuidv4()}${ext}`);
        },
      })
    : diskStorage(folder);

  return multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
      const allowed = /jpeg|jpg|png|webp|pdf/;
      const valid = allowed.test(path.extname(file.originalname).toLowerCase());
      cb(valid ? null : new Error("Invalid file type"), valid);
    },
  });
};

const deleteFile = async (key) => {
  try {
    if (process.env.AWS_ACCESS_KEY_ID) {
      await s3.deleteObject({ Bucket: BUCKET, Key: key }).promise();
    }
  } catch (err) {
    console.error("S3 delete error:", err);
  }
};

module.exports = { s3, createUploader, deleteFile };
