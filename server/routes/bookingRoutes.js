import express from "express";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import { Authentication } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new booking
router.post("/", async (req, res) => {
    try {
        const {
            carId,
            pickupDate,
            dropoffDate,
            pickupLocation,
            dropoffLocation
        } = req.body;

        // Validate required fields
        if (!carId || !pickupDate || !dropoffDate || !pickupLocation) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const userId = req.user.id;

        const car = await Car.findById(carId);

        const pricePerDay = car.pricePerDay;
        const noOfDays = Math.floor((new Date(dropoffDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24));

        const totalDays = noOfDays;
        const basePrice = pricePerDay * totalDays;

        const newBooking = new Booking({
            carId,
            userId,
            pickupDate: new Date(pickupDate),
            dropoffDate: new Date(dropoffDate),
            pickupLocation,
            dropoffLocation: dropoffLocation || pickupLocation,
            bookingStatus: "upcoming",
            paymentStatus: "pending",
            status: "Pending",
            pricePerDay,
            totalDays,
            basePrice,
            finalPrice: basePrice,
            depositAmount: basePrice * 0.25,
        });

        await newBooking.save();

        // UPDATE USER: add to bookedCars
        await User.findByIdAndUpdate(userId, {
            $push: { bookedCars: newBooking._id }
        });

        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            booking: newBooking
        });

    } catch (error) {
        console.error("Error creating booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create booking",
            error: error.message
        });
    }
});

// Get all bookings for a user
router.get("/user/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const bookings = await Booking.find({ userId }).populate("carId");
        console.log(bookings);
        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
});

// Get all booking requests for car owner
router.get("/owner/:ownerId", async (req, res) => {
    try {
        const { ownerId } = req.params;

        // Find all cars owned by this owner
        const ownerCars = await Car.find({ ownerId });
        const carIds = ownerCars.map(car => car._id);

        // Find all bookings for these cars
        const bookings = await Booking.find({
            carId: { $in: carIds }
        }).populate("carId");

        res.status(200).json({
            success: true,
            bookings
        });
    } catch (error) {
        console.error("Error fetching owner bookings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch bookings",
            error: error.message
        });
    }
});

// Approve booking
router.patch("/:bookingId/approve", async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                status: "active",
                bookingStatus: "active"
            },
            { new: true }
        ).populate("carId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking approved successfully",
            booking
        });
    } catch (error) {
        console.error("Error approving booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to approve booking",
            error: error.message
        });
    }
});

// Reject booking
router.patch("/:bookingId/reject", async (req, res) => {
    try {
        const { bookingId } = req.params;

        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            {
                status: "cancelled",
                bookingStatus: "cancelled"
            },
            { new: true }
        ).populate("carId");

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Booking rejected",
            booking
        });
    } catch (error) {
        console.error("Error rejecting booking:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject booking",
            error: error.message
        });
    }
});

export default router;
