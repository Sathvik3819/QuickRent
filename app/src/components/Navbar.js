import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { contextStore } from "../context/contextStore.js";
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../redux/slices/authSlice.js";
import { toast } from "react-toastify";
import axiosInstance from "../utils/axiosInstance.js";

export default function Navbar() {
    const styles = {
        primaryText: {
            color: '#ea580c'
        },
        navLink: {
            fontWeight: '500',
            color: '#1f2937'
        }
    };

    const { user, isAuthenticated } = useSelector((state) => state.auth);

    const { isLoginOpen, setIsLoginOpen, isRegisterOpen, setIsRegisterOpen } = useContext(contextStore);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            dispatch(logoutUser());
            const res = await axiosInstance.post("/auth/logout");
            toast.success("Logout successful");
            // Redirect to home
            navigate("/");
            // Open signIn popup
            setIsLoginOpen(true);
            setIsRegisterOpen(false);
        } catch (error) {
            console.error(error);
            toast.error("Logout failed");
            // Still redirect and open signIn even if logout API fails
            navigate("/");
            setIsLoginOpen(true);
            setIsRegisterOpen(false);
        }
    };

    return (
        <motion.nav className="navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm px-4"
            initial={
                {
                    opacity: 0,
                    y: -20
                }
            }
            animate={
                {
                    opacity: 1,
                    y: 0
                }
            }
            transition={
                { duration: 0.5 }
            }>
            <div className="container-fluid">
                <NavLink to="/" className="navbar-brand fw-bold fs-3">
                    Quick<span style={
                        styles.primaryText
                    }>Rent</span>
                </NavLink>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav align-items-center">
                        <li className="nav-item">
                            <NavLink to="/" className="nav-link mx-2"
                                style={
                                    styles.navLink
                                }>Home</NavLink>
                        </li>
                        <li className="nav-item">
                            <NavLink to="/cars" className="nav-link mx-2"
                                style={
                                    styles.navLink
                                }>Cars</NavLink>
                        </li>
                        {
                            isAuthenticated && user && (
                                <li className="nav-item">
                                    <NavLink to="/my-bookings" className="nav-link mx-2"
                                        style={
                                            styles.navLink
                                        }>My Bookings</NavLink>
                                </li>
                            )
                        }
                        <li className="nav-item">
                            <NavLink to="/list-car" className="nav-link mx-2"
                                style={
                                    styles.navLink
                                }>List Your Car</NavLink>
                        </li>
                        {
                            user ? (
                                <>
                                    <li className="nav-item">
                                        <NavLink to="/dashboard" className="btn btn-outline-primary ms-3 px-4 rounded-3">
                                            <i className="bi bi-speedometer2 me-2"></i>Dashboard
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="btn btn-danger ms-3 text-white px-4 rounded-3"
                                            onClick={handleLogout}>Logout</NavLink>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <NavLink className="btn btn-dark ms-3 text-white px-4 rounded-3"
                                            onClick={
                                                () => {
                                                    setIsRegisterOpen(false);
                                                    setIsLoginOpen(true)
                                                }
                                            }>Sign In</NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink className="btn ms-3 px-4 rounded-3 text-white"
                                            style={
                                                {
                                                    backgroundColor: '#ea580c',
                                                    borderColor: '#ea580c'
                                                }
                                            }
                                            onClick={
                                                () => {
                                                    setIsRegisterOpen(true);
                                                    setIsLoginOpen(false)
                                                }
                                            }>Sign Up</NavLink>
                                    </li>
                                </>
                            )
                        } </ul>
                </div>
            </div>
        </motion.nav>
    )
}
