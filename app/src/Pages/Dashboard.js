import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { logoutUser, setUser } from '../redux/slices/authSlice';
import { toast } from 'react-toastify';
import axiosInstance from '../utils/axiosInstance';
import YourCars from '../components/YourCars';
import BookingRequests from '../components/BookingRequests';
import Loader from '../components/Loader';

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState({
        pendingRequests: 0,
        activeBookings: 0,
        totalCars: 0
    });
    const [loadingStats, setLoadingStats] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (!user) return;
            setLoadingStats(true);
            try {
                // 1. Get Cars
                const carsRes = await axiosInstance.get("/auth/my-cars");
                const carsCount = carsRes.data.cars ? carsRes.data.cars.length : 0;

                let pending = 0;
                let active = 0;

                // 2. Get Bookings (if owner)
                if (user.isOwner) {
                    const bookingsRes = await axiosInstance.get(`/bookings/owner/${user._id}`);
                    const bookings = bookingsRes.data.bookings || [];
                    pending = bookings.filter(b => b.status === "Pending").length;
                    active = bookings.filter(b => b.status === "active").length;
                }

                setStats({
                    pendingRequests: pending,
                    activeBookings: active,
                    totalCars: carsCount
                });

            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                toast.error("Failed to load dashboard statistics");
            } finally {
                setLoadingStats(false);
            }
        };
        fetchStats();
    }, [user]);

    const handleLogout = async () => {
        try {
            dispatch(logoutUser());
            await axiosInstance.post("/auth/logout");
            toast.success("Logged out successfully");
            navigate("/");
        } catch (error) {
            console.error(error);
            toast.error("Logout failed");
        }
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append("profileImage", file);

        try {
            const response = await axiosInstance.put("/auth/profile", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            if (response.data.success) {
                dispatch(setUser(response.data.user));
                toast.success("Profile image updated");
            }
        } catch (error) {
            console.error("Image upload failed:", error);
            toast.error("Failed to upload image");
        }
    };

    if (!user) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 bg-light pb-5">


            <div className="container py-3 px-4">
                {/* 2. Profile Header Card */}
                <div className="card border shadow-sm rounded-4 mt-n5 mb-4 position-relative z-2">
                    <div className="card-body p-4 p-md-5">
                        <div className="row align-items-center">
                            {/* Avatar */}
                            <div className="col-md-auto text-center text-md-start">
                                <div className="position-relative d-inline-block">
                                    <img
                                        src={user.profileImage || `https://ui-avatars.com/api/?name=${user.fullName}&background=random&size=128`}
                                        alt="Profile"
                                        className="rounded-circle border border-4 border-white shadow-sm"
                                        width="120"
                                        height="120"
                                        style={{ marginTop: '-80px', backgroundColor: '#fff', objectFit: 'cover' }}
                                    />
                                    <label
                                        htmlFor="profile-upload"
                                        className="position-absolute bottom-0 end-0 p-2 bg-white rounded-circle shadow-sm border"
                                        style={{ cursor: 'pointer', transform: 'translate(10%, 10%)' }}
                                    >
                                        <i className="bi bi-camera-fill text-primary"></i>
                                    </label>
                                    <input
                                        type="file"
                                        id="profile-upload"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="col-md text-center text-md-start mt-3 mt-md-0">
                                <h2 className="fw-bold mb-1">{user.fullName}</h2>
                                <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 text-secondary mb-2">
                                    <span><i className="bi bi-envelope me-1"></i> {user.email}</span>
                                    {user.city && <span><i className="bi bi-geo-alt me-1"></i> {user.city}</span>}
                                </div>
                                <div className="d-flex gap-2 justify-content-center justify-content-md-start">
                                    <span className={`badge ${user.isOwner ? 'bg-indigo-100 text-primary' : 'bg-gray-100 text-primary'} px-3 py-2 rounded-pill border`}>
                                        {user.isOwner ? (<span><i className="bi bi-car-front"></i> Car Owner</span>) : (<span><i className="bi bi-person"></i> Renter</span>)}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="col-md-auto mt-4 mt-md-0 text-center">
                                {user.isOwner ? (
                                    <button className="btn btn-primary px-4 py-2 rounded-pill fw-medium" onClick={() => navigate('/list-car')}>
                                        <i className="bi bi-plus-lg me-2"></i> List New Car
                                    </button>
                                ) : (
                                    <button className="btn btn-outline-primary px-4 py-2 rounded-pill fw-medium" onClick={() => navigate('/list-car')}>
                                        Become an Host
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Navigation Tabs */}
                <div className="row">
                    <div className="col-12">
                        <div className="d-flex gap-4 border-bottom mb-4 px-2">
                            <button
                                onClick={() => setActiveTab('overview')}
                                className={`btn border-0 py-3 fw-medium position-relative ${activeTab === 'overview' ? 'text-primary' : 'text-muted'}`}
                            >
                                Overview
                                {activeTab === 'overview' && (
                                    <motion.div layoutId="activeTab" className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0' }} />
                                )}
                            </button>
                            <button
                                onClick={() => setActiveTab('garage')}
                                className={`btn border-0 py-3 fw-medium position-relative ${activeTab === 'garage' ? 'text-primary' : 'text-muted'}`}
                            >
                                My Garage
                                {activeTab === 'garage' && (
                                    <motion.div layoutId="activeTab" className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0' }} />
                                )}
                            </button>
                            {user.isOwner && (
                                <button
                                    onClick={() => setActiveTab('requests')}
                                    className={`btn border-0 py-3 fw-medium position-relative ${activeTab === 'requests' ? 'text-primary' : 'text-danger'}`}
                                >
                                    Booking Requests
                                    {activeTab === 'requests' && (
                                        <motion.div layoutId="activeTab" className="position-absolute bottom-0 start-0 w-100 bg-primary" style={{ height: '3px', borderRadius: '3px 3px 0 0' }} />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Tab Content */}
                <AnimatePresence mode="wait">
                    {activeTab === 'overview' ? (
                        <motion.div
                            key="overview"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Stats Row */}
                            {loadingStats ? (
                                <Loader />
                            ) : (
                                <div className="row g-3 mb-4">
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 bg-primary text-white p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="opacity-75 mb-1">Total Cars</h6>
                                                    <h3 className="fw-bold mb-0">{stats.totalCars}</h3>
                                                </div>
                                                <i className="bi bi-car-front fs-1 opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 bg-warning text-dark p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="opacity-75 mb-1">Pending Requests</h6>
                                                    <h3 className="fw-bold mb-0">{stats.pendingRequests}</h3>
                                                </div>
                                                <i className="bi bi-hourglass-split fs-1 opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-4">
                                        <div className="card border-0 shadow-sm rounded-4 bg-success text-white p-3">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="opacity-75 mb-1">Active Bookings</h6>
                                                    <h3 className="fw-bold mb-0">{stats.activeBookings}</h3>
                                                </div>
                                                <i className="bi bi-check-circle fs-1 opacity-50"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="card border-0 shadow-sm rounded-4 h-100">
                                        <div className="card-body p-4">
                                            <h5 className="fw-bold mb-4">Contact Details</h5>
                                            <div className="vstack gap-3">
                                                <div className="d-flex align-items-center text-muted">
                                                    <div className="bg-light p-2 rounded-circle me-3">
                                                        <i className="bi bi-envelope text-primary"></i>
                                                    </div>
                                                    <div>
                                                        <small className="d-block text-uppercase" style={{ fontSize: '0.7rem' }}>Email Address</small>
                                                        <span className="text-dark fw-medium">{user.email}</span>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center text-muted">
                                                    <div className="bg-light p-2 rounded-circle me-3">
                                                        <i className="bi bi-telephone text-success"></i>
                                                    </div>
                                                    <div>
                                                        <small className="d-block text-uppercase" style={{ fontSize: '0.7rem' }}>Phone Number</small>
                                                        <span className="text-dark fw-medium">{user.ownerDetails?.ownerPhone || 'Not provided'}</span>
                                                    </div>
                                                </div>

                                                <div className="d-flex align-items-center text-muted">
                                                    <div className="bg-light p-2 rounded-circle me-3">
                                                        <i className="bi bi-geo-alt text-danger"></i>
                                                    </div>
                                                    <div>
                                                        <small className="d-block text-uppercase" style={{ fontSize: '0.7rem' }}>Location</small>
                                                        <span className="text-dark fw-medium">{user.city || 'Not specified'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-8">
                                    {/* Stats or additional info could go here */}
                                    <div className="card border-0 shadow-sm rounded-4 h-100 bg-primary text-white" style={{ background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" }}>
                                        <div className="card-body p-5 d-flex flex-column justify-content-center align-items-start">
                                            <h3 className="fw-bold display-6 mb-2">Welcome Back, {user.fullName}!</h3>
                                            <p className="lead opacity-75 mb-4">Check  and manage your car listings directly from your dashboard.</p>
                                            <button className="btn btn-light rounded-pill px-4 fw-bold text-primary" onClick={() => setActiveTab('garage')}>
                                                Go to My Garage
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : activeTab === 'garage' ? (
                        <motion.div
                            key="garage"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <YourCars />
                        </motion.div>
                    ) : activeTab === 'requests' ? (
                        <motion.div
                            key="requests"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            <BookingRequests />
                        </motion.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Dashboard;
