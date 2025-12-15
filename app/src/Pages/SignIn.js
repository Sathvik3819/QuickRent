import React, { useState, useContext } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { NavLink } from "react-router";
import { contextStore } from "../context/contextStore";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setUser } from "../redux/slices/authSlice";

import axiosInstance from "../utils/axiosInstance";

function SignIn() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { setIsLoginOpen } = useContext(contextStore);

    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        const userData = {
            email,
            password
        }

        try {
            const response = await axiosInstance.post("/auth/login", userData);
            const data = response.data;

            if (data.success) {


                toast.success("User logged in successfully");
                setIsLoading(false);
                dispatch(setUser(data.user));
                setIsLoginOpen(false);
            } else {
                toast.error(data.message || "Failed to login");
                setIsLoading(false);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to login");
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (setIsLoginOpen) {
            setIsLoginOpen(false);
        }
    };

    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, minHeight: "100vh", background: "#18181849", zIndex: 1050 }}
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
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="fw-bold mb-0 flex-grow-1 text-center">Sign In</h3>
                    <i
                        className="bi bi-x fs-4"
                        style={{ cursor: "pointer", color: "#dc3545" }}
                        onClick={handleClose}
                    ></i>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* EMAIL */}
                    <div className="mb-3 d-flex flex-column">
                        <label className="form-label fw-semibold align-self-start">Email Address</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-envelope text-muted"></i>
                            </span>
                            <input
                                type="email"
                                className="form-control border-start-0"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{ boxShadow: "none" }}
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}
                    <div className="mb-3 d-flex flex-column">
                        <label className="form-label fw-semibold align-self-start">Password</label>
                        <div className="input-group">
                            <span className="input-group-text bg-white border-end-0">
                                <i className="bi bi-lock text-muted"></i>
                            </span>

                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control border-start-0 border-end-0"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{ boxShadow: "none" }}
                            />

                            <span
                                className="input-group-text bg-white border-start-0"
                                style={{ cursor: "pointer" }}
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                <i
                                    className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"
                                        } text-muted`}
                                ></i>
                            </span>
                        </div>
                    </div>



                    <div className="text-end mb-2" style={{ fontSize: "0.9rem" }}>
                        <NavLink to="/sign-up" className="text-decoration-none fw-semibold" style={{ color: "#ff6b35" }}>
                            Forgot Password ?
                        </NavLink>
                    </div>

                    {/* SIGN IN BUTTON */}
                    <button
                        type="submit"
                        className="btn w-100 text-white fw-semibold"
                        disabled={isLoading}
                        style={{
                            backgroundColor: isLoading ? "#ff6b35cc" : "#ff6b35",
                            padding: "0.75rem",
                            borderRadius: "8px",
                            fontSize: "1rem",
                            cursor: isLoading ? "not-allowed" : "pointer"
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Signing In...
                            </>
                        ) : "Sign in"}
                    </button>

                    {/* FORGOT PASSWORD */}
                    <div className="text-center my-3" style={{ fontSize: "0.9rem" }}>
                        Don't have an account?{" "}
                        <NavLink to="/sign-up" className="text-decoration-none fw-semibold" style={{ color: "#ff6b35" }}>
                            Sign Up
                        </NavLink>
                    </div>

                </form>
            </div>
        </div>
    );
}

export default SignIn;
