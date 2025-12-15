import Car from "../models/Car.js";
import axios from "axios";
import genAI from "../config/gemini.js";

/**
 * Converts Cloudinary URL → Base64 string for Gemini
 */
const toBase64 = async (url) => {
    try {
        if (!url) return null;
        const res = await axios.get(url, { responseType: "arraybuffer" });
        return Buffer.from(res.data).toString("base64");
    } catch (err) {
        console.error("Base64 convert error for URL:", url, err.message);
        return null;
    }
};

export const runAIVerification = async (car, files) => {
    try {
        console.log(`🔍 AI verification started for car ${car._id}`);

        // 1. Helper to resolve image paths (handles both Multer objects and direct URL strings)
        const resolveUrl = (src) => {
            if (!src) return null;
            if (typeof src === 'string') return src;
            return src?.[0]?.path;
        };

        // 2. Fetch and convert images in parallel
        const [front, rear, side, dashboard, seats, odometer] = await Promise.all([
            toBase64(resolveUrl(files.frontView)),
            toBase64(resolveUrl(files.rearView)),
            toBase64(resolveUrl(files.sideView)),
            toBase64(resolveUrl(files.interiorDashboard)),
            toBase64(resolveUrl(files.seats)),
            toBase64(resolveUrl(files.odometerReading))
        ]);

        // 3. Prepare Prompt
        const promptText = `
        You are a car verification AI.
        Data provided: ${car.brand} ${car.model} (${car.year}).
        
        Analyze the attached images and check:
        1. Does the visual car model match the data provided?
        2. Does the interior/dashboard match the car class?
        3. Read the odometer if visible and estimate mileage.
        4. Detect if images look fake or AI-generated.
        
        Output JSON ONLY. No markdown, no backticks.
        Format:
        {
          "verified": boolean,
          "issues": ["string"],
          "estimatedMileageFromOdometer": number | null
        }
        `;

        // 4. Construct Request Parts
        // Note: Text is one part, images are separate parts
        const requestParts = [promptText];

        const pushImg = (imgData) => {
            if (imgData) {
                requestParts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: imgData
                    },
                });
            }
        };

        pushImg(front);
        pushImg(rear);
        pushImg(side);
        pushImg(dashboard);
        pushImg(seats);
        pushImg(odometer);

        // 5. Initialize Model & Generate Content
        // IMPORTANT: Use a model version you have access to (checked in previous steps)
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash", // Updated from 1.5-flash to avoid 404
            generationConfig: { responseMimeType: "application/json" } // Force JSON mode
        });

        const result = await model.generateContent(requestParts);
        const response = await result.response;
        const text = response.text();

        // 6. Parse Response
        let aiResult = {};
        try {
            // Cleanup in case JSON mode isn't perfect
            const clean = text.replace(/```json|```/g, "").trim();
            aiResult = JSON.parse(clean);
        } catch (err) {
            console.error("JSON Parse Error:", text);
            aiResult = {
                verified: false,
                issues: ["AI response parsing failed"],
                estimatedMileageFromOdometer: null
            };
        }

        // 7. Update Database
        await Car.findByIdAndUpdate(car._id, {
            aiVerification: {
                processing: false,
                verified: aiResult.verified || false,
                // FIX: Variable name was 'aiJson', changed to 'aiResult'
                issues: aiResult.issues || [],
                estimatedMileage: aiResult.estimatedMileageFromOdometer || null,
            },
            status: aiResult.verified ? "approved" : "rejected",
        });

        console.log(`✅ AI verification completed for car ${car._id}`);

    } catch (err) {
        console.error("❌ AI verification FATAL error:", err);

        await Car.findByIdAndUpdate(car._id, {
            aiVerification: {
                processing: false,
                verified: false,
                issues: [`System Error: ${err.message}`],
            },
            status: "rejected",
        });
    }
};