import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import Loader from "./Loader";
import CarDetailsModal from "./CarDetailsModal";
import CarCard from "./CarCard";

export default function YourCars() {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCar, setSelectedCar] = useState(null);

    const fetchCars = async () => {
        try {
            const response = await axiosInstance.get("/auth/my-cars");
            setCars(response.data.cars);
        } catch (error) {
            console.log("Error fetching cars:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchCars();
    }, []);

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-success';
            case 'rejected': return 'bg-danger';
            case 'pending': return 'bg-warning text-dark';
            default: return 'bg-secondary';
        }
    };

    const getCarImage = (car) => {
        if (car.images.frontView) {
            return car.images.frontView;
        }
        return "https://placehold.co/600x400?text=No+Image";
    };

    if (loading) return <div className="text-center mt-5">< Loader /></div>;

    return (
        <div className="w-100 mt-4">
            {
                showModal && (
                    <CarDetailsModal
                        car={selectedCar}
                        onClose={() => setShowModal(false)}
                    />
                )
            }

            {cars.length === 0 ? (
                <div className="alert alert-info">You haven't listed any cars yet.</div>
            ) : (
                <div className="row g-4">
                    {
                        cars.map((car) => (
                            <div key={car._id || car.id} className="col-md-6 col-lg-4">
                                <CarCard
                                    car={car}
                                    showSpecs={false} // Different from AllCars
                                    onCardClick={() => { setSelectedCar(car); setShowModal(true) }}
                                    actionButton={
                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                className="btn btn-outline-dark btn-sm flex-grow-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedCar(car);
                                                    setShowModal(true)
                                                }}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    }
                                />
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}