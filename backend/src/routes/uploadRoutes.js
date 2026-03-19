import express from "express";
import multer from "multer";
import { PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import s3 from "../config/s3.js";

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileName = `${Date.now()}-${req.file.originalname}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    });

    await s3.send(command);

    res.json({
      message: "Upload success",
      key: fileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

router.get("/files", async (req, res) => {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
    });

    const data = await s3.send(command);
    res.json(data.Contents || []);
  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({
      message: "Failed to fetch files",
      error: error.message,
    });
  }
});

export default router;