import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import User from "./models/User.js";

import uploadRoutes from "./routes/uploadRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import authRoutes from "./routes/AuthRoutes.js";
import { Authentication } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.get("/", (req, res) => {
    res.send("Hello from the server!");
});

app.use("/api/auth", authRoutes);
app.use("/api", uploadRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/bookings", Authentication, bookingRoutes);
// Route to list all collections in the database
app.get("/collections", async (req, res) => {
    try {
        const u = await User.find({});
        res.json(u);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});




// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
