import React, { useContext, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { searchCarsSuccess, searchCarsFailure, setSkipInitialFetch } from "../redux/slices/carsSlice";
import { toast } from 'react-toastify';
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";
import { contextStore } from "../context/contextStore";

function BookingForm({ carId = null }) {

    const [formData, setFormData] = useState({
        pickupLocation: "",
        pickupDate: "",
        dropoffDate: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // AUTOCOMPLETE STATES
    const [suggestions, setSuggestions] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const LOCATIONIQ_KEY = process.env.REACT_APP_LOCATIONIQ_KEY || import.meta.env.VITE_LOCATIONIQ_KEY;

    const { setIsLoginOpen } = useContext(contextStore);
    const { user } = useSelector((state) => state.auth);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // --------------------------------------------------------
    // LOCATION AUTOCOMPLETE HANDLER
    // --------------------------------------------------------
    const fetchLocationSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await axios.get(
                `https://api.locationiq.com/v1/autocomplete`,
                {
                    params: {
                        key: LOCATIONIQ_KEY,
                        q: query,
                        limit: 5,
                    }
                }
            );

            setSuggestions(res.data || []);
        } catch (err) {
            console.error("Autocomplete error:", err);
        }
    };

    // debounce typing for suggestions
    useEffect(() => {
        if (!isTyping) return;
        const timer = setTimeout(() => {
            fetchLocationSuggestions(formData.pickupLocation);
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [formData.pickupLocation]);

    const handleLocationChange = (e) => {
        setIsTyping(true);
        setShowSuggestions(true);

        setFormData({
            ...formData,
            pickupLocation: e.target.value
        });
    };

    const selectSuggestion = (place) => {
        setFormData({
            ...formData,
            pickupLocation: place.display_name
        });

        setShowSuggestions(false);
        setSuggestions([]);
    };

    // --------------------------------------------------------
    // FORM SUBMIT HANDLER
    // --------------------------------------------------------
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!user) {
            setIsLoginOpen(true);
            return;
        }

        // --------------------------------------------------------
        // BOOK FOR SPECIFIC CAR
        // --------------------------------------------------------
        if (carId) {
            setLoading(true);
            try {
                const bookingData = {
                    carId,
                    pickupLocation: formData.pickupLocation,
                    dropoffLocation: formData.pickupLocation,
                    pickupDate: formData.pickupDate,
                    dropoffDate: formData.dropoffDate
                };

                const response = await axiosInstance.post("/bookings", bookingData);

                if (response.data.success) {
                    toast.success("🎉 Booking created! Status: Pending");
                    navigate("/my-bookings");
                } else {
                    toast.error(response.data.message);
                }
            } catch (err) {
                toast.error("⚠️ Booking failed");
            } finally {
                setLoading(false);
            }
            return;
        }

        // --------------------------------------------------------
        // FIND AVAILABLE CARS
        // --------------------------------------------------------
        setLoading(true);
        try {
            const response = await axiosInstance.post("/cars/available", formData);

            if (response.data.success) {
                dispatch(searchCarsSuccess(response.data.cars || []));
                dispatch(setSkipInitialFetch(true));
                toast.success(`Found ${response.data.cars.length} cars`);
                navigate("/cars");
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            dispatch(searchCarsFailure(err.message));
            toast.error("⚠️ Failed to search cars.");
        } finally {
            setLoading(false);
        }
    };

    // --------------------------------------------------------
    // UI COMPONENT
    // --------------------------------------------------------

    return (
        <motion.div
            className="p-4 bg-white rounded-4 shadow-lg position-relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            style={{ minWidth: "350px", maxWidth: "400px" }}
        >
            <h3 className="mb-4 fw-bold text-center">Book Your Ride</h3>

            {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

            <form onSubmit={handleSubmit}>

                {/* -------------------------------- */}
                {/* Location Field with Autocomplete */}
                {/* -------------------------------- */}
                <div className="mb-3 position-relative">
                    <label className="form-label fw-semibold">
                        <i className="bi bi-geo-alt-fill me-2" style={{ color: "#ea580c" }}></i>
                        Pickup Location
                    </label>

                    <input
                        type="text"
                        name="pickupLocation"
                        className="form-control"
                        placeholder="Enter pickup location"
                        value={formData.pickupLocation}
                        onChange={handleLocationChange}
                        onFocus={() => setShowSuggestions(true)}
                        required
                        style={{ border: "2px solid #e5e7eb", borderRadius: "10px", padding: "12px" }}
                    />

                    {/* AUTOCOMPLETE DROPDOWN */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div
                            className="position-absolute bg-white shadow-lg w-100 rounded mt-1"
                            style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
                        >
                            {suggestions.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="p-2 border-bottom"
                                    style={{ cursor: "pointer", fontSize: "14px" }}
                                    onClick={() => selectSuggestion(item)}
                                >
                                    <i className="bi bi-geo-alt text-danger me-2"></i>
                                    {item.display_name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pickup Date */}
                <div className="mb-3">
                    <label className="form-label fw-semibold">
                        <i className="bi bi-calendar-event me-2" style={{ color: "#ea580c" }}></i>
                        Pickup Date
                    </label>
                    <input
                        type="date"
                        name="pickupDate"
                        className="form-control"
                        value={formData.pickupDate}
                        onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                        required
                    />
                </div>

                {/* Dropoff Date */}
                <div className="mb-4">
                    <label className="form-label fw-semibold">
                        <i className="bi bi-calendar-check me-2" style={{ color: "#ea580c" }}></i>
                        Dropoff Date
                    </label>
                    <input
                        type="date"
                        name="dropoffDate"
                        className="form-control"
                        value={formData.dropoffDate}
                        onChange={(e) => setFormData({ ...formData, dropoffDate: e.target.value })}
                        required
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="btn w-100 text-white py-3 fw-semibold"
                    disabled={loading}
                    style={{
                        backgroundColor: loading ? "#9ca3af" : "#ea580c",
                        borderRadius: "10px",
                        fontSize: "16px"
                    }}
                >
                    {loading ? "Processing..." : carId ? "Book Now" : "Find Your Car"}
                </button>

            </form>
        </motion.div>
    );
}

export default BookingForm;
