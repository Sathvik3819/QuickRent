import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import BookingForm from "./BookingForm";
import axiosInstance from "../utils/axiosInstance";
import Loader from "./Loader";
import { toast } from "react-toastify";

const CarDetails = () => {

    const { id } = useParams();
    const [car, setCar] = useState({});
    const [images, setImages] = useState([]);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCarDetails = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get(`/cars/${id}`);
                const data = response.data;
                if (data.success) {

                    setCar(data.car);
                    //convert the object to array 
                    const imgArray = Object.values(data.car.images);
                    setImages(imgArray);
                } else {
                    toast.error("Failed to load car details");
                }
            } catch (error) {
                console.error("Error fetching car details:", error);
                toast.error("Error loading car details");
            } finally {
                setLoading(false);
            }
        };
        fetchCarDetails();
    }, [id])



    if (loading) {
        return <Loader />;
    }

    if (!car || !car.brand) {
        return <div className="container py-5 text-center"><h3>Car not found</h3></div>;
    }

    return (
        <div>

            <div className="container py-3">
                <div className="row">
                    <div className="col-md-8">
                        <div className="d-flex align-items-center py-1">
                            <NavLink to="/cars" ><i className="bi bi-arrow-left align-self-start"></i></NavLink>
                        </div>
                        <div className="d-flex align-items-center" style={{ maxHeight: "300px", maxWidth: "800px", overflow: "hidden", objectFit: "contain" }}>
                            <i onClick={() => { if (current > 0) { setCurrent(current - 1) } }} className="bi fs-3 cursor-pointer bi-chevron-left" style={{ cursor: "pointer" }} ></i>
                            <img src={images[current]} alt="" className="" style={{ objectFit: "cover", width: "93%", height: "93%", borderRadius: "12px" }} />
                            <i onClick={() => { if (current < images.length - 1) { setCurrent(current + 1) } }} className="bi fs-3 cursor-pointer justify-self-end bi-chevron-right" style={{ cursor: "pointer" }}></i>
                        </div>
                        <div className="py-2">
                            <img src={images[0]} onClick={() => { setCurrent(0) }} alt="" className="cursor-pointer" style={{ maxHeight: "50px" }} />
                            <img src={images[1]} onClick={() => { setCurrent(1) }} alt="" className="cursor-pointer" style={{ maxHeight: "50px" }} />
                            <img src={images[2]} onClick={() => { setCurrent(2) }} alt="" className="cursor-pointer" style={{ maxHeight: "50px" }} />
                            <img src={images[3]} onClick={() => { setCurrent(3) }} alt="" className="cursor-pointer" style={{ maxHeight: "50px" }} />
                            <img src={images[4]} onClick={() => { setCurrent(4) }} alt="" className="cursor-pointer" style={{ maxHeight: "50px" }} />
                            <img src={images[5]} onClick={() => { setCurrent(5) }} alt="" className="cursor-pointer" style={{ maxHeight: "50px" }} />
                        </div>
                        <div className="text-start">
                            <h3 className="m-0">{car.brand} {car.model}</h3>
                            <p className="text-muted">{car.vehicleType} • {car.year}</p>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-around">
                            <div className="py-2 px-4" style={{ backgroundColor: "#def3ffff", borderRadius: "12px", minWidth: "110px", textAlign: "center" }}>
                                <i className="bi bi-person" ></i>
                                <p className="m-0">{car.seatingCapacity} Seats</p>
                            </div>
                            <div className="py-2 px-4" style={{ backgroundColor: "#def3ffff", borderRadius: "12px", minWidth: "110px", textAlign: "center" }}>
                                <i className="bi bi-fuel-pump" ></i>
                                <p className="m-0">{car.fuelType}</p>
                            </div>
                            <div className="py-2 px-4" style={{ backgroundColor: "#def3ffff", borderRadius: "12px", minWidth: "110px", textAlign: "center" }}>
                                <i className="bi bi-arrow-clockwise" ></i>
                                <p className="m-0">{car.transmissionType}</p>
                            </div>
                            <div className="py-2 px-4" style={{ backgroundColor: "#def3ffff", borderRadius: "12px", minWidth: "110px", textAlign: "center" }}>
                                <i className="bi bi-geo-alt" ></i>
                                <p className="m-0">{car?.pickupAddress}</p>
                            </div>
                        </div>

                        {/* Features Section */}
                        <div className="mt-4">
                            <h5 className="text-start mb-3" style={{ color: "#1f2937" }}>Features</h5>
                            <div className="row">
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2" style={{ color: "#3b82f6" }}></i>
                                        <span style={{ color: "#6b7280" }}>360 Camera</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2" style={{ color: "#3b82f6" }}></i>
                                        <span style={{ color: "#6b7280" }}>Bluetooth</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2" style={{ color: "#3b82f6" }}></i>
                                        <span style={{ color: "#6b7280" }}>GPS</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2" style={{ color: "#3b82f6" }}></i>
                                        <span style={{ color: "#6b7280" }}>Heated Seats</span>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-2">
                                    <div className="d-flex align-items-center">
                                        <i className="bi bi-check-circle-fill me-2" style={{ color: "#3b82f6" }}></i>
                                        <span style={{ color: "#6b7280" }}>Rear View Mirror</span>
                                    </div>
                                </div>
                                {car.airConditioning && (
                                    <div className="col-md-6 mb-2">
                                        <div className="d-flex align-items-center">
                                            <i className="bi bi-check-circle-fill me-2" style={{ color: "#3b82f6" }}></i>
                                            <span style={{ color: "#6b7280" }}>Air Conditioning</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specifications Section */}
                        <div className="mt-4">
                            <h5 className="text-start mb-3" style={{ color: "#1f2937" }}>Specifications</h5>
                            <div className="row g-2">
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-palette-fill me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Color</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>{car.color || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-fuel-pump-fill me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Fuel Tank</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>{car.fuelTankCapacity ? `${car.fuelTankCapacity}L` : "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer2 me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Mileage</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>{car.mileage ? `${car.mileage} km/l` : "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-lightning-charge-fill me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Engine</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>{car.engineCapacity ? `${car.engineCapacity}cc` : "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-speedometer me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">KM Limit</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>{car.kmLimit ? `${car.kmLimit} km/day` : "Unlimited"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pricing Section */}
                        <div className="mt-4">
                            <h5 className="text-start mb-3" style={{ color: "#1f2937" }}>Pricing</h5>
                            <div className="row g-2">
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-currency-rupee me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Per Day</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>₹{car.pricePerDay}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-wallet-fill me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Security Deposit</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>₹{car.deposit}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Owner Details Section */}
                        <div className="mt-4">
                            <h5 className="text-start mb-3" style={{ color: "#1f2937" }}>Owner Details</h5>
                            <div className="row g-2">
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-person-fill me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Owner Name</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>{car.ownerName || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="p-2 d-flex align-items-center">
                                        <i className="bi bi-telephone-fill me-2" style={{ color: "#6b7280" }}></i>
                                        <div>
                                            <p className="text-muted small mb-0">Contact</p>
                                            <p className="fw-semibold mb-0" style={{ color: "#1f2937", fontSize: "14px" }}>{car.ownerPhone || "N/A"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4 d-flex justify-content-end">
                        <div className="py-5" style={{ position: "sticky", zIndex: "1019", top: "20px", alignSelf: "flex-start", width: "100%" }}>
                            <BookingForm carId={car._id} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CarDetails;
