import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // BASIC INFO
        brand: { type: String, required: true },
        model: { type: String, required: true },
        year: { type: Number, required: true },
        vehicleType: { type: String, required: true }, // SUV, Sedan...
        fuelType: { type: String, required: true },
        transmissionType: { type: String, required: true }, // Manual / Auto
        seatingCapacity: { type: Number, required: true },

        // IMAGES
        images: {
            frontView: { type: String, required: true },
            sideView: { type: String },
            rearView: { type: String },
            interiorDashboard: { type: String },
            seats: { type: String },
            odometer: { type: String },
        },

        // SPECIFICATIONS
        carNumberPlate: { type: String, required: true, unique: true },
        mileage: Number,
        engineCapacity: Number,
        airConditioning: { type: Boolean, default: true },
        fuelTankCapacity: Number,
        color: String,

        // PRICING
        pricePerDay: { type: Number, required: true },
        deposit: { type: Number, required: true },

        // LOCATION
        // ownerCity removed
        pickupAddress: { type: String, required: true },
        dropOffAllowed: { type: Boolean, default: false },
        deliveryAvailable: { type: Boolean, default: false },
        deliveryCharge: Number,

        // CONDITION & RULES
        condition: {
            type: String,
            enum: ["Excellent", "Good", "Average"],
            required: true,
        },

        kmLimit: Number,
        extraKmCharge: Number,

        ownerRules: {
            noSmoking: { type: Boolean, default: false },
            noPets: { type: Boolean, default: false },
            noOutstation: { type: Boolean, default: false },
            fuelReturnPolicy: { type: Boolean, default: false },
        },

        // OWNER INFO
        ownerName: { type: String, required: true },
        ownerPhone: { type: String, required: true },
        ownerDocumentId: String, // Aadhaar / License

        // AVAILABILITY
        availability: {
            availableFrom: Date,
            availableUntil: Date,
            instantBooking: { type: Boolean, default: false },
        },

        // VERIFICATION DOCUMENTS
        verificationDocs: {
            rcBook: String,
            insurance: String,
            pollutionCertificate: String,
        },

        // STATUS
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },

        aiSuggestedPricePerDay: Number,
        aiSuggestedPricePerDay: Number,
        aiVerification: {
            processing: { type: Boolean, default: false },
            verified: { type: Boolean, default: false },
            issues: [String],
            estimatedMileage: Number
        },

        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number], // [longitude, latitude]
                required: true
            }
        }
    },

    { timestamps: true }
);

carSchema.index({ location: "2dsphere" });

export default mongoose.model("Car", carSchema);
