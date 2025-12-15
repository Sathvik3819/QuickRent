import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from 'react-toastify';
import Loader from "./Loader";
import BookingCard from "./BookingCard";

import axiosInstance from "../utils/axiosInstance";
import { useSelector } from "react-redux";

function BookingRequests() {
    const [bookingRequests, setBookingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const user = useSelector((state) => state.auth.user);


    useEffect(() => {
        fetchBookingRequests();
    }, []);

    const fetchBookingRequests = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get(`/bookings/owner/${user._id}`);
            const data = response.data;

            if (data.success) {
                setBookingRequests(data.bookings);
            }
        } catch (error) {
            console.error("Error fetching booking requests:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (bookingId) => {
        setProcessingId(bookingId);
        try {
            const response = await axiosInstance.patch(`/bookings/${bookingId}/approve`);

            const data = response.data;

            if (data.success) {
                toast.success(" Booking approved successfully!");
                fetchBookingRequests(); // Refresh list
            } else {
                toast.error(data.message || "Failed to approve booking");
            }
        } catch (error) {
            console.error("Error approving booking:", error);
            toast.error("Failed to approve booking");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (bookingId) => {
        setProcessingId(bookingId);
        try {
            const response = await axiosInstance.patch(`/bookings/${bookingId}/reject`);

            const data = response.data;

            if (data.success) {
                toast.info("Booking rejected");
                fetchBookingRequests(); // Refresh list
            } else {
                toast.error(data.message || "Failed to reject booking");
            }
        } catch (error) {
            console.error("Error rejecting booking:", error);
            toast.error("Failed to reject booking");
        } finally {
            setProcessingId(null);
        }
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
    };

    if (loading) {
        return <Loader text="Loading booking requests..." />;
    }

    if (bookingRequests.length === 0) {
        return (
            <div className="text-center py-5">
                <i className="bi bi-inbox" style={{ fontSize: "64px", color: "#d1d5db" }}></i>
                <h5 className="mt-3 text-muted">No Booking Requests</h5>
                <p className="text-muted small">You don't have any pending booking requests yet.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="row g-3">
                {bookingRequests.map((booking, index) => (
                    <div className="col-12" key={booking._id}>
                        <BookingCard
                            booking={booking}
                            type="owner"
                            onApprove={handleApprove}
                            onReject={handleReject}
                            processingId={processingId}
                            variants={cardVariants}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BookingRequests;
