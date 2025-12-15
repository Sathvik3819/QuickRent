import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCarsStart, fetchCarsSuccess, fetchCarsFailure, searchCarsStart, searchCarsSuccess, searchCarsFailure, clearFilters } from "../redux/slices/carsSlice";
import Loader from "../components/Loader";
import CarCard from "../components/CarCard";
import useDebounce from "../hooks/useDebounce";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import axios from "axios";

function AllCars() {

    const dispatch = useDispatch();
    const { filteredCars = [], loading, allCars = [], skipInitialFetch = false } = useSelector((state) => state.cars) || {};
    const [searchQuery, setSearchQuery] = useState("");
    const [hasInitialized, setHasInitialized] = useState(false);
    const navigate = useNavigate();



    // Use the hook to get a delayed version of the search query
    const debouncedSearchTerm = useDebounce(searchQuery.trim(), 500);
    const [aiMode, setAiMode] = useState(false);
    const [aiSearching, setAiSearching] = useState(false);

    // Initial fetch on mount (only if not coming from booking form)
    useEffect(() => {
        // Skip initial fetch if we have filtered cars from booking form
        // Check if filteredCars is different from allCars (meaning filters are active)
        if (skipInitialFetch && filteredCars.length > 0) {
            // Only skip if filteredCars is different from allCars (filters are active)
            if (allCars.length === 0 || filteredCars.length !== allCars.length) {
                setHasInitialized(true);
                return;
            }
        }

        // Only fetch on initial mount if we don't have any cars
        if (!hasInitialized && allCars.length === 0 && filteredCars.length === 0) {
            const controller = new AbortController();

            const fetchInitialCars = async () => {
                try {
                    dispatch(fetchCarsStart());
                    const response = await axiosInstance.get("/cars", {
                        signal: controller.signal
                    });
                    dispatch(fetchCarsSuccess(response.data.cars));
                } catch (error) {
                    if (!axios.isCancel(error) && error.name !== "CanceledError" && error.name !== "AbortError") {
                        console.error("Error fetching cars:", error);
                        dispatch(fetchCarsFailure(error.message));
                    }
                }
            };

            fetchInitialCars();
            setHasInitialized(true);

            return () => {
                controller.abort();
            };
        } else if (!hasInitialized) {
            setHasInitialized(true);
        }
    }, []); // Only run on mount

    // This Effect runs ONLY when the user stops typing (debounced value changes)
    useEffect(() => {
        // AI Mode handles its own search trigger
        if (aiMode) return;

        // Skip if this is the initial render and we have filtered cars from booking form
        if (!hasInitialized) return;

        // Skip if we have filtered cars from booking form and search is empty (user hasn't typed yet)
        if (skipInitialFetch && !debouncedSearchTerm && filteredCars.length > 0) {
            if (allCars.length === 0 || filteredCars.length !== allCars.length) {
                return;
            }
        }

        const controller = new AbortController();

        const fetchCars = async () => {
            try {
                if (!debouncedSearchTerm) {
                    // Empty search -> Fetch all cars
                    dispatch(fetchCarsStart());
                    const response = await axiosInstance.get("/cars", {
                        signal: controller.signal
                    });
                    dispatch(fetchCarsSuccess(response.data.cars));
                } else {
                    // Active search -> Fetch query
                    dispatch(searchCarsStart());
                    const response = await axiosInstance.get(`/cars/search?q=${encodeURIComponent(debouncedSearchTerm)}`, {
                        signal: controller.signal
                    });
                    dispatch(searchCarsSuccess(response.data.cars || []));
                }
            } catch (error) {
                if (!axios.isCancel(error) && error.name !== "CanceledError" && error.name !== "AbortError") {
                    console.error("Error fetching cars:", error);
                    if (debouncedSearchTerm) {
                        dispatch(searchCarsFailure(error.message));
                    } else {
                        dispatch(fetchCarsFailure(error.message));
                    }
                }
            }
        };

        fetchCars();

        return () => {
            controller.abort();
        };
    }, [debouncedSearchTerm, dispatch, hasInitialized, skipInitialFetch, filteredCars.length, allCars.length, aiMode]);

    const performAiSearch = async () => {
        if (!searchQuery.trim()) return;

        setAiSearching(true);
        dispatch(searchCarsStart()); // Set loading
        try {
            const response = await axiosInstance.get(`/cars/ai-search?prompt=${encodeURIComponent(searchQuery)}`);
            dispatch(searchCarsSuccess(response.data.cars || []));
            toast.success("AI Search completed!", { icon: "✨" });
        } catch (error) {
            console.error("AI Search Error:", error);
            dispatch(searchCarsFailure(error.message || "AI Search failed"));
            toast.error("AI couldn't understand that. Try again.");
        } finally {
            setAiSearching(false);
        }
    };


    const handleClearFilters = () => {
        dispatch(clearFilters());
        setSearchQuery("");
        setAiMode(false);
    };

    const handleBookNowClick = (id) => {
        try {
            navigate(`/cars/${id}`)
        } catch (err) {
            toast.error("an error occured")
        }
    }

    // Simple change handler (just updates UI state)
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Animation variants
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

    const styles = {
        headerSection: {
            backgroundColor: "#f0f4ff",
            borderBottom: "1px solid #e0e7ff"
        },
        card: {
            borderRadius: "20px",
            overflow: "hidden",
            border: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            transition: "all 0.3s ease",
            cursor: "pointer",
            backgroundColor: "#fff",
            maxHeight: "400px"
        },
        cardHover: {
            transform: "translateY(-8px)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.15)"
        },
        imageContainer: {
            position: "relative",
            height: "160px",
            overflow: "hidden",
            backgroundColor: "#f5f5f5"
        },
        carImage: {
            width: "100%",
            height: "160px",
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
        priceBadge: {
            position: "absolute",
            bottom: "15px",
            right: "15px",
            backgroundColor: "rgba(0, 0, 0, 0.85)",
            color: "white",
            padding: "3px 8px",
            borderRadius: "12px",
            fontSize: "12px",
            fontWeight: "700",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
        },
        cardBody: {
            padding: "20px"
        },
        carName: {
            fontSize: "22px",
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
            marginTop: "16px"
        },
        specItem: {
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: "#4b5563"
        },
        icon: {
            fontSize: "18px",
            color: "#6b7280"
        },
        searchInput: {
            border: "2px solid #e5e7eb",
            borderRadius: "12px",
            padding: "12px 16px",
            fontSize: "15px",
            outline: "none",
            transition: "all 0.3s ease"
        }
    };



    return (
        <div >
            {/* Header Section */}
            <div className="py-5 d-flex justify-content-center align-items-center flex-column" style={styles.headerSection}>
                <motion.h2
                    className="text-center fw-bold mb-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {aiMode ? "✨ AI Smart Search" : "Available Cars"}
                </motion.h2>
                <motion.p
                    className="text-center text-muted mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {aiMode ? "Describe what you're looking for, and let AI do the rest." : "Choose from the best cars in the world"}
                </motion.p>
                <motion.div
                    className="d-flex flex-column align-items-center gap-3"
                    style={{ width: "90%", maxWidth: "600px" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <div
                        className="d-flex align-items-center border-0 rounded-3 overflow-hidden position-relative"
                        style={{
                            width: "100%",
                            boxShadow: aiMode ? "0 0 15px rgba(139, 92, 246, 0.3)" : "0 4px 12px rgba(0,0,0,0.08)",
                            transition: "box-shadow 0.3s ease",
                            border: aiMode ? "2px solid #8b5cf6" : "none"
                        }}
                    >
                        <input
                            type="text"
                            className="w-100 p-3"
                            placeholder={aiMode ? "ex: Find me a red SUV under ₹500/hr..." : "Search for cars, brands, or locations..."}
                            style={{ ...styles.searchInput, border: "none" }}
                            value={searchQuery}
                            onChange={handleSearchChange}
                            onKeyDown={(e) => {
                                if (aiMode && e.key === "Enter") {
                                    performAiSearch();
                                }
                            }}
                        />
                        {aiMode && (
                            <button
                                onClick={performAiSearch}
                                className="btn position-absolute end-0 me-2 rounded-pill"
                                style={{
                                    backgroundColor: "#8b5cf6",
                                    color: "white",
                                    fontWeight: "600",
                                    padding: "8px 20px"
                                }}
                                disabled={aiSearching}
                            >
                                {aiSearching ? "Thinking..." : "Ask AI"}
                            </button>
                        )}
                    </div>

                    <div className="d-flex gap-3">
                        <motion.button
                            onClick={() => {
                                setAiMode(!aiMode);
                                setSearchQuery(""); // Clear search on toggle
                            }}
                            className="d-flex align-items-center gap-2 border-0 rounded-pill px-4 py-2"
                            style={{
                                backgroundColor: aiMode ? "#dbeafe" : "#f3f4f6",
                                color: aiMode ? "#2563eb" : "#4b5563",
                                fontSize: "14px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.3s ease"
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <i className={aiMode ? "bi bi-stars" : "bi bi-toggle-off"}></i>
                            <span>{aiMode ? "AI Mode Active" : "Enable AI Search"}</span>
                        </motion.button>
                        {/* Clear Filters Button */}
                        {(filteredCars.length !== allCars.length || searchQuery) && (
                            <div className="container mt-4 d-flex justify-content-center">
                                <button
                                    className="btn btn-outline-danger rounded-pill px-4"
                                    onClick={handleClearFilters}
                                >
                                    <i className="bi bi-x-circle me-2"></i>
                                    Clear Filters & Show All
                                </button>
                            </div>
                        )}


                    </div>
                </motion.div>
            </div>


            {/* Cars Grid */}
            {
                loading ? (
                    <Loader text="Loading cars..." />
                ) : (
                    <motion.div
                        className="container py-5"
                        style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "30px"
                        }}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        {
                            filteredCars.length > 0 ? (
                                filteredCars?.map((car, index) => (
                                    <CarCard
                                        key={car._id || index}
                                        car={car}
                                        variants={cardVariants}
                                        onCardClick={() => handleBookNowClick(car?._id)} // Optional: Clicking card goes to details
                                        actionButton={
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation(); // Prevent card click
                                                    handleBookNowClick(car?._id);
                                                }}
                                                className="btn w-100 mt-3"
                                                style={{
                                                    backgroundColor: car.status === "approved" ? "#ea580c" : "#9ca3af",
                                                    color: "white",
                                                    fontWeight: "600",
                                                    padding: "12px",
                                                    borderRadius: "10px",
                                                    border: "none",
                                                    pointerEvents: car.status === "approved" ? "auto" : "none"
                                                }}
                                            >
                                                {car.status === "approved" ? "Book Now" : "Currently Unavailable"}
                                            </button>
                                        }
                                    />
                                ))
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <i className="bi bi-car-front" style={{ fontSize: "64px", color: "#d1d5db" }}></i>
                                    <h5 className="mt-3 text-muted">No cars found</h5>
                                    <p className="text-muted">Try adjusting your search or check back later</p>
                                </div>
                            )
                        }
                    </motion.div>
                )
            }
        </div>
    );
}

export default AllCars;
