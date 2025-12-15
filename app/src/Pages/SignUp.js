import React, { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router";
import { contextStore } from "../context/contextStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setUser } from "../redux/slices/authSlice";
import { useDispatch } from "react-redux";
import axiosInstance from "../utils/axiosInstance";
import axios from "axios";

function SignUp() {
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [city, setCity] = useState("");
    const [address, setAddress] = useState("");

    // Autocomplete States
    const [suggestions, setSuggestions] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const LOCATIONIQ_KEY = process.env.REACT_APP_LOCATIONIQ_KEY || import.meta.env.VITE_LOCATIONIQ_KEY;

    const { setIsRegisterOpen } = useContext(contextStore);

    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "fullName") setFullName(value);
        else if (name === "email") setEmail(value);
        else if (name === "password") setPassword(value);
        else if (name === "phoneNumber") setPhoneNumber(value);
        else if (name === "address") setAddress(value);
    };

    const fetchLocationSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        try {
            const res = await axios.get(
                `https://us1.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_KEY}&q=${query}&limit=5`
            );
            setSuggestions(res.data || []);
        } catch (err) {
            console.error("Autocomplete error:", err);
        }
    };

    React.useEffect(() => {
        if (!isTyping) return;
        const timer = setTimeout(() => {
            fetchLocationSuggestions(city);
        }, 400);

        return () => clearTimeout(timer);
    }, [city, isTyping]);

    const handleCityChange = (e) => {
        setIsTyping(true);
        setShowSuggestions(true);
        setCity(e.target.value);
    };

    const selectSuggestion = (place) => {
        // You might want to extract just the city name or keep full address
        // For 'City' field, let's try to extract city/town/village from display_name or just use display_name
        // Ideally we use display_name or parse address object if available (but autocomplete simple returns display_name usually)
        // Let's use display_name to be safe and consistent with ListCarForm
        setCity(place.display_name);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (step === 1) {
            if (fullName && email && password) {
                setStep(2);
            } else {
                toast.error("Please fill all fields.");
            }
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const userData = {
            fullName,
            email,
            password,
            phoneNumber,
            city,
            address,
        };

        try {
            const response = await axiosInstance.post("/auth/register", userData);
            const data = response.data;
            if (data.success) {
                toast.success("User registered successfully");
                dispatch(setUser(data.user));
                setIsRegisterOpen(false);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to register user");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (setIsRegisterOpen) {
            setIsRegisterOpen(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh", background: "#04040441", zIndex: 1050 }}
        >
            <div
                className="card shadow-sm p-4"
                style={{
                    width: "100%",
                    maxWidth: "420px",
                    borderRadius: "14px",
                    border: "1px solid #dededeff",
                }}
            >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h3 className="fw-bold mb-0 flex-grow-1 text-center">Sign Up</h3>
                    <i
                        className="bi bi-x fs-4"
                        style={{ cursor: "pointer", color: "#dc3545" }}
                        onClick={handleClose}
                    ></i>
                </div>
                <p className="text-center text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                    Create your account to start booking (Step {step}/2)
                </p>

                <form onSubmit={step === 2 ? handleSubmit : handleNext}>
                    {step === 1 && (
                        <>
                            {/* FULL NAME */}
                            <div className="mb-3 d-flex flex-column">
                                <label className="form-label align-self-start">Full Name</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-person text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Enter your full name"
                                        value={fullName}
                                        name="fullName"
                                        onChange={handleChange}
                                        required
                                        style={{ boxShadow: "none" }}
                                    />
                                </div>
                            </div>

                            {/* EMAIL */}
                            <div className="mb-3 d-flex flex-column">
                                <label className="form-label align-self-start">Email Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-envelope text-muted"></i>
                                    </span>
                                    <input
                                        type="email"
                                        className="form-control border-start-0"
                                        placeholder="Enter your email"
                                        value={email}
                                        name="email"
                                        onChange={handleChange}
                                        required
                                        style={{ boxShadow: "none" }}
                                    />
                                </div>
                            </div>

                            {/* PASSWORD */}
                            <div className="mb-3 d-flex flex-column">
                                <label className="form-label align-self-start">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-lock text-muted"></i>
                                    </span>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control border-start-0 border-end-0"
                                        placeholder="Enter your password"
                                        value={password}
                                        name="password"
                                        onChange={handleChange}
                                        required
                                        style={{ boxShadow: "none" }}
                                    />
                                    <span
                                        className="input-group-text bg-white border-start-0"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} text-muted`}></i>
                                    </span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="btn w-100 text-white fw-semibold mb-3"
                                style={{
                                    backgroundColor: "#ff6b35",
                                    padding: "0.75rem",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                }}
                            >
                                Next
                            </button>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            {/* PHONE NUMBER */}
                            <div className="mb-3 d-flex flex-column">
                                <label className="form-label align-self-start">Phone Number</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-telephone text-muted"></i>
                                    </span>
                                    <input
                                        type="tel"
                                        className="form-control border-start-0"
                                        placeholder="Enter your phone number"
                                        value={phoneNumber}
                                        name="phoneNumber"
                                        onChange={handleChange}
                                        required
                                        style={{ boxShadow: "none" }}
                                    />
                                </div>
                            </div>

                            {/* CITY */}
                            <div className="mb-3 d-flex flex-column position-relative">
                                <label className="form-label align-self-start">City</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-geo-alt text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Enter your city"
                                        value={city}
                                        name="city"
                                        onChange={handleCityChange}
                                        onFocus={() => {
                                            if (city.length > 2) setShowSuggestions(true);
                                        }}
                                        required
                                        style={{ boxShadow: "none" }}
                                        autoComplete="off"
                                    />
                                </div>
                                {/* AUTOCOMPLETE DROPDOWN */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div
                                        className="position-absolute bg-white shadow-lg rounded mt-1"
                                        style={{ zIndex: 1000, top: "100%", left: 0, width: "100%", maxHeight: "200px", overflowY: "auto" }}
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

                            {/* ADDRESS */}
                            <div className="mb-3 d-flex flex-column">
                                <label className="form-label align-self-start">Address</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0">
                                        <i className="bi bi-house text-muted"></i>
                                    </span>
                                    <input
                                        type="text"
                                        className="form-control border-start-0"
                                        placeholder="Enter your address"
                                        value={address}
                                        name="address"
                                        onChange={handleChange}
                                        required
                                        style={{ boxShadow: "none" }}
                                    />
                                </div>
                            </div>

                            <div className="d-flex gap-2 mb-3">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="btn flex-grow-1 fw-semibold"
                                    style={{
                                        border: "1px solid #ced4da",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        fontSize: "1rem",
                                        color: "#6c757d",
                                        backgroundColor: "#f8f9fa"
                                    }}
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="btn flex-grow-1 text-white fw-semibold"
                                    style={{
                                        backgroundColor: "#ff6b35",
                                        padding: "0.75rem",
                                        borderRadius: "8px",
                                        fontSize: "1rem",
                                    }}
                                    disabled={isLoading}
                                >
                                    {isLoading ? "Creating Account..." : "Create Account"}
                                </button>
                            </div>
                        </>
                    )}

                    {/* SIGN IN LINK - Only show on step 1 to avoid clutter or keep it always? Keeping it always is fine, or maybe only step 1. Let's keep it for easy access. */}
                    <div className="text-center" style={{ fontSize: "0.9rem" }}>
                        Already have an account?{" "}
                        <NavLink to="/sign-in" className="text-decoration-none fw-semibold" style={{ color: "#ff6b35" }}>
                            Sign In
                        </NavLink>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
