import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useDispatch } from "react-redux";
import { addCar } from "../redux/slices/carsSlice";

import axiosInstance from "../utils/axiosInstance";
import axios from "axios";

function ListCarForm() {
    const dispatch = useDispatch();
    const [currentStep, setCurrentStep] = useState(1);
    const [deliveryAvailable, setDeliveryAvailable] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const [carData, setCarData] = useState({
        // Car Basic Information
        brand: "",
        model: "",
        year: "",
        vehicleType: "",
        fuelType: "",
        transmissionType: "",
        seatingCapacity: "",

        // Car Images (will store File objects)
        frontView: null,
        sideView: null,
        rearView: null,
        interiorDashboard: null,
        seats: null,
        odometerReading: null,

        // Car Specifications
        carNumberPlate: "",
        mileage: "",
        engineCapacity: "",
        airConditioning: "Yes",
        fuelTankBatteryCapacity: "",
        color: "",

        // Pricing
        pricePerDay: "",
        deposit: "",

        // Location Details
        // ownerCity removed
        pickupAddress: "",
        dropOffAllowed: "Yes",
        deliveryAvailable: false,
        deliveryCharge: "",

        // Car Condition & Rules
        carCondition: "Excellent",
        kmLimit: "",
        extraKmCharge: "",

        // Owner Information
        ownerFullName: "",
        ownerPhoneNumber: "",
        aadhaarLicenseNumber: "",

        // Verification Documents (will store File objects)
        rcBook: null,
        insuranceDocument: null,
        pollutionCertificate: null
    });


    // AUTOCOMPLETE STATES
    const [suggestions, setSuggestions] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const LOCATIONIQ_KEY = process.env.REACT_APP_LOCATIONIQ_KEY;

    // --------------------------------------------------------
    // LOCATION AUTOCOMPLETE HANDLER
    // --------------------------------------------------------
    const fetchLocationSuggestions = async (query) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await axios.get(
                `https://us1.locationiq.com/v1/autocomplete?key=${LOCATIONIQ_KEY}&q=${query}&limit=5`,
                {
                    params: {
                        key: LOCATIONIQ_KEY,
                        q: query,
                        limit: 5
                    }
                }
            );

            setSuggestions(res.data || []);
        } catch (err) {
            console.error("Autocomplete error:", err);
        }
    };

    // debounce typing for suggestions
    React.useEffect(() => {
        if (!isTyping) return;
        const timer = setTimeout(() => {
            fetchLocationSuggestions(carData.pickupAddress);
        }, 400); // 400ms debounce

        return () => clearTimeout(timer);
    }, [carData?.pickupAddress]);

    const handleLocationChange = (e) => {
        setIsTyping(true);
        setShowSuggestions(true);

        setCarData({
            ...carData,
            pickupAddress: e.target.value
        });
    };

    const selectSuggestion = (place) => {
        setCarData({
            ...carData,
            pickupAddress: place.display_name
        });

        setShowSuggestions(false);
        setSuggestions([]);
    };





    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });

        try {
            // Create FormData for file upload
            const formData = new FormData();

            // Append all text fields
            Object.keys(carData).forEach(key => {
                if (carData[key] instanceof File) {
                    // Append files
                    formData.append(key, carData[key]);
                } else if (carData[key] !== null && carData[key] !== '') {
                    // Append non-null, non-empty values
                    formData.append(key, carData[key]);
                }
            });

            // Send to backend
            const response = await axiosInstance.post('/cars/create', formData, {
                headers: {
                    "Content-Type": undefined
                }
            });

            const data = response.data;

            if (data.success) {
                setSubmitMessage({
                    type: 'success',
                    text: 'Car listed successfully! Pending admin approval.'
                });

                // Add to Redux store
                dispatch(addCar(data.car));

                // Reset form
                setTimeout(() => {
                    setCarData({
                        brand: "", model: "", year: "", vehicleType: "", fuelType: "",
                        transmissionType: "", seatingCapacity: "", frontView: null,
                        sideView: null, rearView: null, interiorDashboard: null,
                        seats: null, odometerReading: null, carNumberPlate: "",
                        mileage: "", engineCapacity: "", airConditioning: "Yes",
                        mileage: "", engineCapacity: "", airConditioning: "Yes",
                        fuelTankBatteryCapacity: "", color: "",
                        pricePerDay: "", deposit: "",
                        pickupAddress: "",
                        dropOffAllowed: "Yes", deliveryAvailable: false,
                        deliveryCharge: "", carCondition: "Excellent", kmLimit: "",
                        extraKmCharge: "", ownerFullName: "", ownerPhoneNumber: "",
                        aadhaarLicenseNumber: "", rcBook: null, insuranceDocument: null,
                        pollutionCertificate: null
                    });
                    setCurrentStep(1);
                }, 2000);

            } else {
                setSubmitMessage({
                    type: 'error',
                    text: data.message || 'Failed to list car. Please try again.'
                });
            }

        } catch (error) {
            console.error('Error submitting form:', error);
            setSubmitMessage({
                type: 'error',
                text: 'Network error. Please check your connection and try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const onChange = (e) => {
        const { name, value } = e.target;
        setCarData({ ...carData, [name]: value });
    };

    const onFileChange = (e) => {
        const { name, files } = e.target;
        setCarData({ ...carData, [name]: files[0] });
    };

    const nextStep = () => {
        setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        setCurrentStep(currentStep - 1);
    };

    const totalSteps = 5;

    return (
        <div>
            {/* Progress Indicator */}
            < div className="mb-4" >
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0">Step {currentStep} of {totalSteps}</h5>
                    <span className="text-muted">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
                </div>
                <div className="progress" style={{ height: "8px" }}>
                    <div
                        className="progress-bar"
                        style={{ width: `${(currentStep / totalSteps) * 100}%`, backgroundColor: "#ff6b35" }}
                    ></div>
                </div>
            </div >

            {/* Success/Error Message */}
            {
                submitMessage.text && (
                    <div className={`alert alert-${submitMessage.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
                        <strong>{submitMessage.type === 'success' ? '✅ Success!' : '❌ Error!'}</strong> {submitMessage.text}
                        <button type="button" className="btn-close" onClick={() => setSubmitMessage({ type: '', text: '' })}></button>
                    </div>
                )
            }

            {/* Step Titles */}
            <div className="mb-4">
                <h4 className="fw-bold text-center" style={{ color: "#ff6b35" }}>
                    {currentStep === 1 && "Car Basic Information"}
                    {currentStep === 2 && "Car Images"}
                    {currentStep === 3 && "Specifications & Pricing"}
                    {currentStep === 4 && "Location & Rental Rules"}
                    {currentStep === 5 && "Owner Information & Documents"}
                </h4>
            </div>

            <form className="row g-3" onSubmit={handleSubmit}>

                {/* ---------- STEP 1: CAR BASIC INFORMATION ---------- */}
                {currentStep === 1 && (
                    <>

                        <div className="col-md-6">
                            <label className="form-label">Car Brand</label>
                            <input type="text" className="form-control" placeholder="Toyota, BMW..." required name="brand" value={carData.brand} onChange={onChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Car Model</label>
                            <input type="text" className="form-control" placeholder="Fortuner, i20..." required name="model" value={carData.model} onChange={onChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Manufacturing Year</label>
                            <input type="number" className="form-control" placeholder="2020" required name="year" value={carData.year} onChange={onChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Vehicle Type</label>
                            <select className="form-select" required name="vehicleType" value={carData.vehicleType} onChange={onChange}>
                                <option value="">Select...</option>
                                <option>Sedan</option>
                                <option>SUV</option>
                                <option>Hatchback</option>
                                <option>MUV</option>
                                <option>Electric</option>
                                <option>Luxury</option>
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Fuel Type</label>
                            <select className="form-select" required name="fuelType" value={carData.fuelType} onChange={onChange}>
                                <option value="">Select...</option>
                                <option>Petrol</option>
                                <option>Diesel</option>
                                <option>Electric</option>
                                <option>Hybrid</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Transmission Type</label>
                            <select className="form-select" required name="transmissionType" value={carData.transmissionType} onChange={onChange}>
                                <option value="">Select...</option>
                                <option>Manual</option>
                                <option>Automatic</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Seating Capacity</label>
                            <select className="form-select" required name="seatingCapacity" value={carData.seatingCapacity} onChange={onChange}>
                                <option value="">Select...</option>
                                <option>2</option>
                                <option>4</option>
                                <option>5</option>
                                <option>6</option>
                                <option>7</option>
                                <option>8+</option>
                            </select>
                        </div>
                    </>
                )}

                {/* ---------- STEP 2: CAR IMAGES ---------- */}
                {currentStep === 2 && (
                    <>
                        <div className="col-12 mb-3">
                            <div className="alert alert-info">
                                <strong>📸 Tip:</strong> Clear, well-lit photos help attract more renters!
                            </div>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Front View <span className="text-danger">*</span></label>
                            <input type="file" className="form-control" required name="frontView" onChange={onFileChange} accept="image/*" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Side View</label>
                            <input type="file" className="form-control" name="sideView" onChange={onFileChange} accept="image/*" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Rear View</label>
                            <input type="file" className="form-control" name="rearView" onChange={onFileChange} accept="image/*" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Interior Dashboard</label>
                            <input type="file" className="form-control" name="interiorDashboard" onChange={onFileChange} accept="image/*" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Seats</label>
                            <input type="file" className="form-control" name="seats" onChange={onFileChange} accept="image/*" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Odometer Reading</label>
                            <input type="file" className="form-control" name="odometerReading" onChange={onFileChange} accept="image/*" />
                        </div>
                    </>
                )}

                {/* ---------- STEP 3: SPECIFICATIONS & PRICING ---------- */}
                {currentStep === 3 && (
                    <>
                        <h5 className="fw-bold mt-3 col-12">Car Specifications</h5>

                        <div className="col-md-6">
                            <label className="form-label">Car Number Plate</label>
                            <input type="text" className="form-control" placeholder="TS09AB1234" required name="carNumberPlate" value={carData.carNumberPlate} onChange={onChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Mileage (km/l or km/charge)</label>
                            <input type="number" className="form-control" placeholder="18" required name="mileage" value={carData.mileage} onChange={onChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Engine Capacity (cc)</label>
                            <input type="number" className="form-control" placeholder="1500" name="engineCapacity" value={carData.engineCapacity} onChange={onChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Air Conditioning</label>
                            <select className="form-select" required name="airConditioning" value={carData.airConditioning} onChange={onChange}>
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Fuel Tank / Battery Capacity</label>
                            <input type="text" className="form-control" placeholder="45 liters / 70 kWh" name="fuelTankBatteryCapacity" value={carData.fuelTankBatteryCapacity} onChange={onChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Color</label>
                            <input type="text" className="form-control" placeholder="White, Red..." required name="color" value={carData.color} onChange={onChange} />
                        </div>

                        <hr className="my-4" />
                        <h5 className="fw-bold col-12">Pricing</h5>



                        <div className="col-md-4">
                            <label className="form-label">Price Per Day (₹)</label>
                            <input type="number" className="form-control" placeholder="2500" required name="pricePerDay" value={carData.pricePerDay} onChange={onChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Deposit Amount (₹)</label>
                            <input type="number" className="form-control" placeholder="3000" required name="deposit" value={carData.deposit} onChange={onChange} />
                        </div>


                    </>
                )}

                {/* ---------- STEP 4: LOCATION & RENTAL RULES ---------- */}
                {currentStep === 4 && (
                    <>
                        <h5 className="fw-bold mt-3 col-12">Location Details</h5>

                        <div className="col-md-12 position-relative">
                            <label className="form-label">Pickup Address</label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Full address"
                                required
                                name="pickupAddress"
                                value={carData.pickupAddress}
                                onChange={handleLocationChange}
                                onFocus={() => setShowSuggestions(true)}
                                autoComplete="off"
                            />
                            {/* AUTOCOMPLETE DROPDOWN */}
                            {showSuggestions && suggestions.length > 0 && (
                                <div
                                    className="position-absolute bg-white shadow-lg rounded mt-1"
                                    style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto", width: "96%" }}
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

                        <div className="col-md-6">
                            <label className="form-label">Drop-off Allowed?</label>
                            <select className="form-select" required name="dropOffAllowed" value={carData.dropOffAllowed} onChange={onChange}>
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Delivery Available?</label>
                            <select
                                className="form-select"
                                required
                                name="deliveryAvailable"
                                value={carData.deliveryAvailable}
                                onChange={(e) => {
                                    onChange(e);
                                    setDeliveryAvailable(e.target.value === "Yes");
                                }}
                            >
                                <option>No</option>
                                <option>Yes</option>
                            </select>
                        </div>

                        {deliveryAvailable && (
                            <div className="col-md-12">
                                <label className="form-label">Delivery Charge (₹)</label>
                                <input type="number" className="form-control" placeholder="₹ charge" required name="deliveryCharge" value={carData.deliveryCharge} onChange={onChange} />
                            </div>
                        )}

                        <hr className="my-4" />
                        <h5 className="fw-bold col-12">Car Condition & Rules</h5>

                        <div className="col-md-4">
                            <label className="form-label">Car Condition</label>
                            <select className="form-select" required name="carCondition" value={carData.carCondition} onChange={onChange}>
                                <option>Excellent</option>
                                <option>Good</option>
                                <option>Average</option>
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">KM Limit (per day)</label>
                            <input type="number" className="form-control" placeholder="300" required name="kmLimit" value={carData.kmLimit} onChange={onChange} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Extra KM Charge (₹/km)</label>
                            <input type="number" className="form-control" placeholder="10" required name="extraKmCharge" value={carData.extraKmCharge} onChange={onChange} />
                        </div>
                    </>
                )}

                {/* ---------- STEP 5: OWNER INFORMATION & DOCUMENTS ---------- */}
                {currentStep === 5 && (
                    <>
                        <h5 className="fw-bold mt-3 col-12">Owner Information</h5>

                        <div className="col-md-6">
                            <label className="form-label">Owner Full Name</label>
                            <input type="text" className="form-control" required name="ownerFullName" value={carData.ownerFullName} onChange={onChange} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">Owner Phone Number</label>
                            <input type="tel" className="form-control" required name="ownerPhoneNumber" value={carData.ownerPhoneNumber} onChange={onChange} />
                        </div>

                        <div className="col-md-12">
                            <label className="form-label">Aadhaar / License Number</label>
                            <input type="text" className="form-control" placeholder="Optional for verification" name="aadhaarLicenseNumber" value={carData.aadhaarLicenseNumber} onChange={onChange} />
                        </div>

                        <hr className="my-4" />
                        <h5 className="fw-bold col-12">Verification Documents (Optional)</h5>

                        <div className="col-md-4">
                            <label className="form-label">RC Book</label>
                            <input type="file" className="form-control" name="rcBook" onChange={onFileChange} accept="image/*,application/pdf" />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Insurance Document</label>
                            <input type="file" className="form-control" name="insuranceDocument" onChange={onFileChange} accept="image/*,application/pdf" />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">Pollution Certificate</label>
                            <input type="file" className="form-control" name="pollutionCertificate" onChange={onFileChange} accept="image/*,application/pdf" />
                        </div>
                    </>
                )}

                {/* Navigation Buttons */}
                <div className="col-12 mt-4 d-flex justify-content-between">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            className="btn btn-secondary px-4"
                            onClick={prevStep}
                        >
                            ← Previous
                        </button>
                    )}

                    {currentStep < totalSteps ? (
                        <button
                            type="button"
                            className="btn text-white px-4 ms-auto"
                            style={{ backgroundColor: "#ff6b35" }}
                            onClick={nextStep}
                        >
                            Next →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="btn text-white px-5 ms-auto fw-semibold"
                            style={{ backgroundColor: "#ff6b35", padding: "0.8rem" }}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Submitting...
                                </>
                            ) : (
                                <>🚗 List My Car</>
                            )}
                        </button>
                    )}
                </div>
            </form>
        </div >
    );
}

export default ListCarForm;
