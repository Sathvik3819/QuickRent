import axios from "axios";

// TODO: Replace with your actual LocationIQ API key in .env file
const LOCATION_IQ_KEY = process.env.LOCATION_IQ_KEY;

async function getCoordinates(address) {
    if (!LOCATION_IQ_KEY) {
        throw new Error("LocationIQ API key not found. Please add it to your .env file.");
    }

    try {
        const url = `https://us1.locationiq.com/v1/search?key=${LOCATION_IQ_KEY}&q=${encodeURIComponent(
            address
        )}&format=json&limit=1`;

        const res = await axios.get(url);
        
        if (res.data && res.data.length > 0) {
            const data = res.data[0];
            return {
                lat: parseFloat(data.lat),
                lon: parseFloat(data.lon)
            };
        } else {
            throw new Error(`Could not find coordinates for address: ${address}`);
        }
    } catch (error) {
        console.error("Error fetching coordinates from LocationIQ:", error.message);
        throw error;
    }
}

export { getCoordinates };
