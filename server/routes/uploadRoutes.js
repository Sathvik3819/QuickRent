import express from "express";
import upload from "../config/multer.js";
import { Authentication } from "../middleware/authMiddleware.js";

const uploadRouter = express.Router();

uploadRouter.post("/upload-image", Authentication, upload.single("image"), (req, res) => {
    try {
        res.json({
            success: true,
            url: req.file.path, // Cloudinary URL
            public_id: req.file.filename,
        });
    } catch (err) {
        res.status(500).json({ success: false, message: "Upload failed" });
    }
});

export default uploadRouter;
