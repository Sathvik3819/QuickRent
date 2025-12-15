import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        // BASIC USER DETAILS
        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        phoneNumber: {
            type: String,
        },

        password: {
            type: String,
            required: true,
        },

        profileImage: {
            type: String, // Cloudinary URL
        },

        // LOCATION
        city: String,
        address: String,

        // ---- HYBRID ROLE SYSTEM ----

        // Everyone starts as a normal user
        isOwner: {
            type: Boolean,
            default: false,
        },

        // Only filled when user chooses to become an owner
        ownerDetails: {
            isVerified: { type: Boolean, default: false },

            // Owner documents
            aadhaarNumber: String,
            drivingLicenseNumber: String,

            // Optional document images
            aadhaarImage: String,
            drivingLicenseImage: String,
        },

        // RELATIONS
        bookedCars: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Booking",
            }
        ],

        listedCars: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Car",
            }
        ],

        // OPTIONAL: AI PERSONALIZATION
        aiPreferences: {
            preferredCarType: String,
            preferredFuel: String,
            preferredTransmission: String,
            budgetRange: String,
        },
    },

    { timestamps: true }
);

export default mongoose.model("User", userSchema);
