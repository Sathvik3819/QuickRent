import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        carId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Car",
            required: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // BOOKING DETAILS
        pickupDate: { type: Date, required: true },
        dropoffDate: { type: Date, required: true },

        pickupLocation: { type: String, required: true },
        dropoffLocation: { type: String, required: true },

        // PRICING
        pricePerDay: Number,
        pricePerHour: Number,
        totalDays: Number,
        totalHours: Number,
        basePrice: Number, // days * pricePerDay
        extraKmUsed: { type: Number, default: 0 },
        extraKmCharge: { type: Number, default: 0 },
        discountApplied: Number,
        finalPrice: Number, // total payable
        depositAmount: Number,

        // PAYMENT
        paymentStatus: {
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending",
        },
        paymentMethod: String, // Razorpay, Stripe, Cash

        // BOOKING STATUS
        bookingStatus: {
            type: String,
            enum: ["active", "completed", "cancelled", "upcoming"],
            default: "upcoming",
        },

        // OPTIONAL – DAMAGE REPORT AT RETURN
        damageReport: {
            hasDamage: { type: Boolean, default: false },
            description: String,
            images: [String], // uploaded to Cloudinary
            estimatedRepairCost: Number,
            aiDamageDetection: String, // AI model output
        },
        status: {
            type: String,
            enum: ["Pending", "active", "completed", "cancelled", "upcoming"],
            default: "Pending",
        },
    },

    { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
