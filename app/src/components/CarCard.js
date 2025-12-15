
import React from 'react';
import { motion } from 'framer-motion';

const CarCard = ({ car, showSpecs = true, actionButton, onCardClick, variants }) => {

    const styles = {
        card: {
            borderRadius: "20px",
            overflow: "hidden",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            cursor: onCardClick ? "pointer" : "default",
            backgroundColor: "#fff",
            height: "100%",
            display: "flex",
            flexDirection: "column"
        },
        imageContainer: {
            position: "relative",
            height: "200px",
            overflow: "hidden",
            backgroundColor: "#f5f5f5"
        },
        carImage: {
            width: "100%",
            height: "100%",
            objectFit: "cover"
        },
        availableBadge: {
            position: "absolute",
            top: "15px",
            left: "15px",
            backgroundColor: "#3b82f6",
            color: "white",
            padding: "3px 8px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "600",
            boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)"
        },
        unavailableBadge: {
            position: "absolute",
            top: "15px",
            left: "15px",
            backgroundColor: "#6b7280",
            color: "white",
            padding: "3px 8px",
            borderRadius: "20px",
            fontSize: "10px",
            fontWeight: "600"
        },
        statusBadgeBase: {
            position: "absolute",
            top: "15px",
            left: "15px",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "600",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            textTransform: "uppercase"
        },
        priceBadge: {
            position: "absolute",
            bottom: "15px",
            right: "15px",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "white",
            padding: "4px 10px",
            borderRadius: "12px",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        },
        cardBody: {
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            flex: 1
        },
        carName: {
            fontSize: "20px",
            fontWeight: "700",
            color: "#1f2937",
            marginBottom: "4px"
        },
        carSubtitle: {
            fontSize: "14px",
            color: "#6b7280",
            marginBottom: "16px"
        },
        specificationsGrid: {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginTop: "auto",
            marginBottom: "20px"
        },
        specItem: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "13px",
            color: "#4b5563"
        },
        icon: {
            fontSize: "16px",
            color: "#6b7280"
        }
    };

    const getStatusBadgeStyle = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return { backgroundColor: '#22c55e', color: 'white' };
            case 'pending': return { backgroundColor: '#f59e0b', color: 'white' };
            case 'rejected': return { backgroundColor: '#ef4444', color: 'white' };
            default: return { backgroundColor: '#6b7280', color: 'white' };
        }
    };

    return (
        <motion.div
            style={styles.card}
            variants={variants}
            whileHover={{
                y: -8,
                boxShadow: "0 12px 24px rgba(0,0,0,0.15)"
            }}
            onClick={onCardClick}
        >
            {/* Image Container */}
            <div style={styles.imageContainer}>
                <img
                    src={car.images?.frontView || "https://via.placeholder.com/400x250?text=Car+Image"}
                    alt={`${car.brand} ${car.model}`}
                    style={styles.carImage}
                    onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x250?text=Car+Image";
                    }}
                />

                {/* Status Badge */}
                <div style={{
                    ...styles.statusBadgeBase,
                    ...getStatusBadgeStyle(car.status)
                }}>
                    {car.status === "approved" ? "Available" : car.status || "Unknown"}
                </div>

                {/* Optional: AI Verified Badge if true */}
                {car.aiVerification?.verified && (
                    <div className="position-absolute bottom-0 start-0 m-2">
                        <span className="badge bg-primary bg-opacity-75 backdrop-blur">
                            ✨ AI Verified
                        </span>
                    </div>
                )}

                {/* Price Badge */}
                <div style={styles.priceBadge}>
                    ₹{car.price || car.pricePerDay} <span style={{ fontSize: "11px", fontWeight: "400", opacity: 0.9 }}>/ day</span>
                </div>
            </div>

            {/* Card Body */}
            <div style={styles.cardBody}>
                <div className="mb-3">
                    <h5 style={styles.carName}>{car.brand} {car.model}</h5>
                    <p style={styles.carSubtitle}>
                        {car.vehicleType} • {car.year} • {car.fuelType}
                    </p>
                </div>

                {/* Specifications Grid */}
                {showSpecs && (
                    <div style={styles.specificationsGrid}>
                        <div style={styles.specItem}>
                            <i className="bi bi-people-fill" style={styles.icon}></i>
                            <span>{car.seatingCapacity} Seats</span>
                        </div>
                        <div style={styles.specItem}>
                            <i className="bi bi-gear-fill" style={styles.icon}></i>
                            <span>{car.transmissionType}</span>
                        </div>
                        <div style={styles.specItem} className="col-span-2">
                            <i className="bi bi-geo-alt-fill" style={styles.icon}></i>
                            <span className="text-truncate" style={{ maxWidth: '120px' }} title={car?.pickupAddress}>
                                {car?.pickupAddress?.split(',')[0] || "Location"}
                            </span>
                        </div>
                    </div>
                )}

                {/* Action Button */}
                <div className="mt-auto">
                    {actionButton}
                </div>
            </div>
        </motion.div>
    );
};

export default CarCard;
