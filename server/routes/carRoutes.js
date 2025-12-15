import express from "express";
import Car from "../models/Car.js";
import Booking from "../models/Booking.js";
import upload from "../config/multer.js";
import { Authentication, OptionalAuthentication } from "../middleware/authMiddleware.js";
import { getCoordinates } from "../utils/location.js";
import { runAIVerification } from "../ai/carVerification.js";
import User from "../models/User.js";

const carRouter = express.Router();

import genAI from "../config/gemini.js";

// AI Smart Search
carRouter.get("/ai-search", async (req, res) => {
    try {
        const { prompt } = req.query;

        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const schemaDescription = `
        Schema for 'Car' collection:
        - brand (String)
        - model (String)
        - year (Number)
        - vehicleType (String: SUV, Sedan, Hatchback, etc.)
        - fuelType (String: Petrol, Diesel, Electric, Hybrid)
        - transmissionType (String: Manual, Automatic)
        - seatingCapacity (Number)
        - pricePerDay (Number)
        - pricePerDay (Number)
        - color (String)
        - airConditioning (Boolean)
        - condition (String: Excellent, Good, Average)
        - pickupAddress (String)
        - rating (Number - assume virtual or not present, stick to fields above)
        `;

        const finalPrompt = `
        You are a MongoDB expert. Convert the user's natural language query into a valid MongoDB find query object (JSON).
        
        Schema:
        ${schemaDescription}
        
        User Query: "${prompt}"
        
        Rules:
        1. Return ONLY the JSON object. No markdown, no "json" tags.
        2. Use regex for string matching (case-insensitive) if needed.
        3. Do not use $where or $function.
        4. If the query implies sorting (e.g., "cheapest"), add a "sort" key in the JSON, otherwise just "filter".
           Example output with sort: { "filter": { ... }, "sort": { "pricePerDay": 1 } }
           Example output without sort: { "filter": { ... } }
        `;

        const result = await model.generateContent(finalPrompt);
        const responseText = result.response.text().replace(/```json|```/g, "").trim();

        let parsedQuery;
        try {
            parsedQuery = JSON.parse(responseText);
        } catch (e) {
            console.error("AI JSON Parse Error:", responseText);
            return res.status(400).json({ success: false, message: "AI could not understand the query." });
        }

        const filter = parsedQuery.filter || parsedQuery; // Handle direct filter or wrapped
        const sort = parsedQuery.sort || {};

        // Force approved status
        const finalFilter = { ...filter, status: "approved" };

        console.log("🤖 AI Generated Query:", JSON.stringify(finalFilter, null, 2));
        if (Object.keys(sort).length) console.log("   With Sort:", sort);

        const cars = await Car.find(finalFilter).sort(sort).populate("ownerId", "fullName email phone");

        res.json({ success: true, cars, count: cars.length, aiDebug: filter });

    } catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get available cars by location and date range
carRouter.post("/available", async (req, res) => {
    try {
        const { pickupLocation, pickupDate, dropoffDate } = req.body;

        if (!pickupLocation || !pickupDate || !dropoffDate) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields"
            });
        }

        const pickup = new Date(pickupDate);
        const dropoff = new Date(dropoffDate);

        if (pickup >= dropoff) {
            return res.status(400).json({
                success: false,
                message: "Dropoff date must be after pickup date"
            });
        }

        // Step 1: convert pickup location into coordinates
        const { lat, lon } = await getCoordinates(pickupLocation);

        // Step 2: find cars near this location
        const carsNearby = await Car.find({
            status: "approved",
            location: {
                $near: {
                    $geometry: { type: "Point", coordinates: [lon, lat] },
                    $maxDistance: 20000 // 20 km
                }
            }
        });

        // Step 3: find overlapping bookings
        const overlappingBookings = await Booking.find({
            pickupDate: { $lt: dropoff },
            dropoffDate: { $gt: pickup },
            bookingStatus: { $in: ["active", "upcoming"] }
        });

        const bookedCarIds = new Set(
            overlappingBookings.map(b => b.carId.toString())
        );

        // Step 4: filter out booked cars
        const availableCars = carsNearby.filter(
            (car) => !bookedCarIds.has(car._id.toString())
        );

        res.json({
            success: true,
            cars: availableCars,
            totalFound: availableCars.length
        });

    } catch (error) {
        console.error("Error fetching available cars:", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Search cars
carRouter.get("/search", async (req, res) => {
    try {
        const { q } = req.query;

        if (!q || q.trim() === "") {
            return res.json({ success: true, cars: [] });
        }

        const searchQuery = q.trim().toLowerCase();

        // Search across brand, model, and ownerCity
        const cars = await Car.find({
            status: "approved",
            $or: [
                { brand: { $regex: searchQuery, $options: "i" } },
                { model: { $regex: searchQuery, $options: "i" } },
                // ownerCity removed
                { vehicleType: { $regex: searchQuery, $options: "i" } }
            ]
        }).populate("ownerId", "fullName email phone");

        res.json({ success: true, cars });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all cars
carRouter.get("/", OptionalAuthentication, async (req, res) => {
    try {
        let cars = [];

        if (req.user) {
            cars = await Car.find({
                status: "approved",
                ownerId: { $ne: req.user?.id }
            }).populate("ownerId", "fullName email phone");
        } else {
            cars = await Car.find({
                status: "approved",
            }).populate("ownerId", "fullName email phone")
        }

        res.json({ success: true, cars });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: error.message });
    }
});


carRouter.get("/:id", async (req, res) => {
    try {
        const car = await Car.findById(req.params.id).populate("ownerId");
        if (!car) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }
        res.json({ success: true, car });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});


carRouter.post(
    "/create",
    Authentication,
    upload.fields([
        { name: "frontView", maxCount: 1 },
        { name: "sideView", maxCount: 1 },
        { name: "rearView", maxCount: 1 },
        { name: "interiorDashboard", maxCount: 1 },
        { name: "seats", maxCount: 1 },
        { name: "odometerReading", maxCount: 1 },
        { name: "rcBook", maxCount: 1 },
        { name: "insuranceDocument", maxCount: 1 },
        { name: "pollutionCertificate", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            const {
                brand,
                model,
                year,
                vehicleType,
                fuelType,
                transmissionType,
                seatingCapacity,
                carNumberPlate,
                mileage,
                engineCapacity,
                airConditioning,
                fuelTankBatteryCapacity, // Frontend key
                color,
                pricePerDay,
                deposit,
                // ownerCity removed
                pickupAddress,
                dropOffAllowed,
                deliveryAvailable,
                deliveryCharge,
                carCondition, // Frontend key
                kmLimit,
                extraKmCharge,
                ownerFullName, // Frontend key
                ownerPhoneNumber, // Frontend key
                aadhaarLicenseNumber, // Frontend key
            } = req.body;

            const images = {
                frontView: req.files.frontView?.[0]?.path || "",
                sideView: req.files.sideView?.[0]?.path || "",
                rearView: req.files.rearView?.[0]?.path || "",
                interiorDashboard: req.files.interiorDashboard?.[0]?.path || "",
                seats: req.files.seats?.[0]?.path || "",
                odometer: req.files.odometerReading?.[0]?.path || "",
            };

            const verificationDocs = {
                rcBook: req.files.rcBook?.[0]?.path || "",
                insurance: req.files.insuranceDocument?.[0]?.path || "",
                pollutionCertificate: req.files.pollutionCertificate?.[0]?.path || "",
            };

            const coords = await getCoordinates(pickupAddress);

            const newCar = new Car({
                brand,
                model,
                year: parseInt(year),
                vehicleType,
                fuelType,
                transmissionType,
                seatingCapacity: parseInt(seatingCapacity),
                carNumberPlate,
                mileage: parseFloat(mileage) || 0,
                engineCapacity: parseFloat(engineCapacity) || 0,
                airConditioning: airConditioning === "Yes",
                fuelTankCapacity: parseFloat(fuelTankBatteryCapacity) || 0,
                color,
                pricePerDay: parseFloat(pricePerDay),
                deposit: parseFloat(deposit),
                // ownerCity removed
                pickupAddress,
                dropOffAllowed: dropOffAllowed === "Yes",
                deliveryAvailable: deliveryAvailable === "Yes",
                deliveryCharge: parseFloat(deliveryCharge) || 0,
                condition: carCondition,
                kmLimit: parseFloat(kmLimit) || 0,
                extraKmCharge: parseFloat(extraKmCharge) || 0,

                // Mapped Owner Info
                ownerName: ownerFullName,
                ownerPhone: ownerPhoneNumber,
                ownerDocumentId: aadhaarLicenseNumber || "",

                images,
                verificationDocs,
                ownerId: req.user.id,

                location: {
                    type: "Point",
                    coordinates: [coords.lon, coords.lat]
                },

                status: "pending",
                aiVerification: {
                    processing: true,
                    verified: false,
                    issues: [],
                },
            });

            const savedCar = await newCar.save();

            // UPDATE USER: set isOwner = true and add to listedCars
            await User.findByIdAndUpdate(req.user.id, {
                $set: { isOwner: true },
                $push: { listedCars: savedCar._id }
            });

            res.json({
                success: true,
                message: "Car listed. AI verification started.",
                carId: savedCar._id,
            });

            // Run AI without blocking response
            setImmediate(() => runAIVerification(savedCar, req.files));
        } catch (err) {
            console.log("❌ Car creation error:", err);
            res.status(500).json({ success: false, message: err.message });
        }
    }
);



// Update car
carRouter.put("/:id", Authentication, async (req, res) => {
    try {
        const updatedCar = await Car.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCar) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        res.json({ success: true, car: updatedCar });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete car
carRouter.delete("/:id", Authentication, async (req, res) => {
    try {
        const deletedCar = await Car.findByIdAndDelete(req.params.id);

        if (!deletedCar) {
            return res.status(404).json({ success: false, message: "Car not found" });
        }

        res.json({ success: true, message: "Car deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default carRouter;
