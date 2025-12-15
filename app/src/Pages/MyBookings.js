import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingsSuccess } from "../redux/slices/bookingsSlice";
import Loader from "../components/Loader";
import axiosInstance from "../utils/axiosInstance";
import BookingCard from "../components/BookingCard";

export default function MyBookings() {
    const dispatch = useDispatch();
    const { bookings, loading } = useSelector((state) => state.bookings);
    const { user } = useSelector((state) => state.auth);

    // Initialize with dummy data (later replace with API call)
    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const response = await axiosInstance.get(`/bookings/user/${user?._id}`);
                dispatch(fetchBookingsSuccess(response.data.bookings));
            } catch (error) {
                console.error("Error fetching bookings:", error);
            }
        };
        if (user?._id) {
            fetchBookings();
        }
    }, [dispatch, user?._id]);


    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    return (
        <div className="container py-5">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="w-100">
                        <h3 className="fw-bold mb-2">My Bookings</h3>
                        <p className="text-muted mb-0">View and manage your bookings here.</p>
                    </div>
                </div>
            </motion.div>

            {
                loading ? (
                    <Loader text="Loading your bookings..." />
                ) : (
                    <motion.div
                        className="booking-history"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {bookings.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="bi bi-calendar-x" style={{ fontSize: "64px", color: "#d1d5db" }}></i>
                                <p className="text-muted mt-3">No bookings found</p>
                            </div>
                        ) : (
                            bookings.map((booking) => (
                                <BookingCard
                                    key={booking._id || booking.id}
                                    booking={booking}
                                    type="renter"
                                    variants={cardVariants}
                                />
                            ))
                        )}
                    </motion.div>
                )
            }

        </div >
    );
}
