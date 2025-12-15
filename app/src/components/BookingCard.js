
import React from 'react';
import { motion } from 'framer-motion';

const BookingCard = ({ booking, type = 'renter', onApprove, onReject, processingId, variants }) => {

    const getStatusStyle = (status) => {
        switch (String(status).toLowerCase()) {
            case "pending":
                return {
                    backgroundColor: "#fef2f2",
                    color: "#ef4444",
                    borderColor: "#fecaca"
                };
            case "approved":
            case "confirmed":
                return {
                    backgroundColor: "#f0fdf4",
                    color: "#22c55e",
                    borderColor: "#bbf7d0"
                };
            case "completed":
                return {
                    backgroundColor: "#f3f4f6",
                    color: "#6b7280",
                    borderColor: "#d1d5db"
                };
            default:
                return {
                    backgroundColor: "#f3f4f6",
                    color: "#6b7280",
                    borderColor: "#d1d5db"
                };
        }
    };

    const styles = {
        bookingCard: {
            backgroundColor: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            display: "flex",
            gap: "24px",
            alignItems: "flex-start",
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            transition: "all 0.3s ease",
            cursor: "default"
        },
        carImageContainer: {
            width: "220px",
            height: "140px",
            borderRadius: "12px",
            overflow: "hidden",
            flexShrink: 0,
            backgroundColor: "#f5f5f5"
        },
        carImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover"
        },
        carInfo: {
            flex: 1
        },
        carName: {
            fontSize: "20px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "4px"
        },
        carDetails: {
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "0"
        },
        bookingDetails: {
            flex: 2,
            display: "flex",
            flexDirection: "column",
            gap: "16px"
        },
        bookingHeader: {
            display: "flex",
            alignItems: "center",
            gap: "12px"
        },
        bookingId: {
            fontSize: "16px",
            fontWeight: "600",
            color: "#1f2937"
        },
        statusBadge: {
            padding: "4px 12px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "500",
            border: "1px solid"
        },
        detailRow: {
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            fontSize: "14px",
            color: "#4b5563"
        },
        icon: {
            fontSize: "18px",
            color: "#3b82f6",
            marginTop: "2px"
        },
        priceSection: {
            textAlign: "right",
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%'
        },
        priceLabel: {
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "4px"
        },
        price: {
            fontSize: "32px",
            fontWeight: "700",
            color: "#3b82f6",
            marginBottom: "8px"
        },
        bookedDate: {
            fontSize: "13px",
            color: "#9ca3af"
        }
    };

    return (
        <motion.div
            style={styles.bookingCard}
            variants={variants}
            whileHover={{
                boxShadow: "0 8px 16px rgba(0,0,0,0.08)",
                y: -4
            }}
            layout
        >
            {/* Car Image And Info */}
            <div className='d-none d-md-block'>
                <div style={styles.carImageContainer}>
                    <img
                        src={booking.carId?.images?.frontView || "https://via.placeholder.com/220x140?text=Car"}
                        alt={booking.carId?.brand || "Car"}
                        style={styles.carImage}
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/220x140?text=Car+Image";
                        }}
                    />
                </div>
            </div>

            {/* Content Section */}
            <div style={styles.bookingDetails} className="w-100">
                <div className="d-flex justify-content-between align-items-start">
                    <div style={styles.carInfo}>
                        <h5 style={styles.carName}>{booking.carId?.brand} {booking.carId?.model}</h5>
                        <p style={styles.carDetails}>{booking.carId?.vehicleType}</p>
                    </div>

                    {/* Booking ID and Status Badge */}
                    <div className="text-end">
                        <div style={styles.bookingId} className="mb-2">#{booking._id?.slice(-6).toUpperCase()}</div>
                        <span
                            style={{
                                ...styles.statusBadge,
                                ...getStatusStyle(booking.status)
                            }}
                        >
                            {booking.status}
                        </span>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Period */}
                    <div className="col-md-6" style={styles.detailRow}>
                        <i className="bi bi-calendar-event" style={styles.icon}></i>
                        <div>
                            <div style={{ fontWeight: "500", color: "#6b7280", fontSize: "13px" }}>
                                Rental Period
                            </div>
                            <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                {new Date(booking.pickupDate).toLocaleDateString("en-US", { day: "numeric", month: "short" })} - {new Date(booking.dropoffDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="col-md-6" style={styles.detailRow}>
                        <i className="bi bi-geo-alt-fill" style={styles.icon}></i>
                        <div>
                            <div style={{ fontWeight: "500", color: "#6b7280", fontSize: "13px" }}>
                                Pick-up Location
                            </div>
                            <div style={{ fontWeight: "600", color: "#1f2937" }}>
                                {booking.pickupLocation}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price and Actions Section */}
            <div style={styles.priceSection} className="ps-3 border-start">
                <div>
                    <div style={styles.priceLabel}>Total Price</div>
                    <div style={styles.price}>₹{booking.finalPrice}</div>
                    <div style={styles.bookedDate}>
                        {type === 'owner' ? (
                            <span>{booking.totalDays} Days</span>
                        ) : (
                            <span>Booked on {new Date(booking.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" })}</span>
                        )}
                    </div>
                </div>

                {type === 'owner' && booking.status === 'Pending' && (
                    <div className="d-flex gap-2 mt-3 justify-content-end">
                        <button
                            className="btn btn-sm btn-success rounded-3 px-3"
                            onClick={() => onApprove && onApprove(booking._id)}
                            disabled={processingId === booking._id}
                        >
                            {processingId === booking._id ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                                <i className="bi bi-check-lg"></i>
                            )}
                        </button>
                        <button
                            className="btn btn-sm btn-danger rounded-3 px-3"
                            onClick={() => onReject && onReject(booking._id)}
                            disabled={processingId === booking._id}
                        >
                            {processingId === booking._id ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                            ) : (
                                <i className="bi bi-x-lg"></i>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default BookingCard;
