import express from "express";
import User from "../models/User.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import Car from "../models/Car.js"
import { Authentication } from "../middleware/authMiddleware.js";


dotenv.config();

const router = express.Router();

router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, city, address } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ fullName, email, password: hashedPassword, phoneNumber, city, address });
        await newUser.save();

        const token = await jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
            path: "/"
        });

        res.status(201).json({ success: true, message: "User registered successfully", token, user: newUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});



router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).populate("listedCars");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }
        const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // true in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-site in production
            path: "/"
        });
        res.status(200).json({ success: true, message: "User logged in successfully", token, user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.get("/my-cars", Authentication, async (req, res) => {
    try {
        console.log(req.user);
        const cars = await Car.find({ ownerId: req.user.id });
        res.json({ success: true, cars });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error });
    }
});

import upload from "../config/multer.js";

router.put("/profile", Authentication, upload.single("profileImage"), async (req, res) => {
    try {
        const { fullName, phoneNumber, city, address } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (fullName) user.fullName = fullName;
        if (phoneNumber) user.phoneNumber = phoneNumber;
        if (city) user.city = city;
        if (address) user.address = address;

        if (req.file) {
            user.profileImage = req.file.path;
        }

        await user.save();

        res.json({ success: true, message: "Profile updated successfully", user });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully" });
});

export default router;
