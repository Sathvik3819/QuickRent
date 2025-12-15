import React, { useState } from "react";

export default function CarDetailsModal({ show, onClose, car }) {
  const [activeImage, setActiveImage] = useState(null);

  // 1. Helper to handle the specific image object structure
  const imageLabels = {
    frontView: "Front",
    sideView: "Side",
    rearView: "Rear",
    interiorDashboard: "Dashboard",
    seats: "Seats",
    odometer: "Odometer"
  };

  const carImages = Object.keys(car.images || {}).map(key => ({
    key: key,
    label: imageLabels[key] || key,
    url: car.images[key]
  })).filter(img => img.url);

  const currentImage = activeImage || (carImages.length > 0 ? carImages[0].url : "https://placehold.co/600x400?text=No+Image");

  // 2. Helper for Status Colors
  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "approved": return "bg-success";
      case "rejected": return "bg-danger";
      case "pending": return "bg-warning text-dark";
      default: return "bg-secondary";
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>

      <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{ zIndex: 1055 }}>
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg">

            {/* Header */}
            <div className="modal-header bg-light">
              <div>
                <h5 className="modal-title fw-bold">
                  {car.brand} {car.model} <span className="text-muted fs-6">({car.year})</span>
                </h5>
                <span className={`badge ${getStatusBadge(car.status)} me-2`}>
                  {car.status?.toUpperCase()}
                </span>
                <span className="badge bg-secondary">{car.carNumberPlate}</span>
              </div>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>

            {/* Body */}
            <div className="modal-body p-0">

              {/* Image Gallery */}
              <div className="bg-dark text-center position-relative" style={{ minHeight: "300px" }}>
                <img
                  src={currentImage}
                  alt="Car View"
                  className="img-fluid"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
                <div className="d-flex justify-content-center gap-2 p-2 position-absolute bottom-0 w-100"
                  style={{ background: "rgba(0,0,0,0.6)" }}>
                  {carImages.map((img) => (
                    <button
                      key={img.key}
                      onClick={() => setActiveImage(img.url)}
                      className={`btn btn-sm p-0 border-2 ${currentImage === img.url ? 'border-primary' : 'border-secondary'}`}
                      style={{ width: "50px", height: "40px", overflow: "hidden" }}
                    >
                      <img src={img.url} alt={img.label} className="w-100 h-100" style={{ objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4">
                {car.aiVerification && (car.status === 'rejected' || car.aiVerification.issues.length > 0) && (
                  <div className="alert alert-danger border-danger shadow-sm mb-4">
                    <div className="d-flex align-items-center mb-2">
                      <h6 className="fw-bold mb-0 text-danger">Verification Report</h6>
                    </div>
                    <hr className="my-2 text-danger opacity-25" />

                    <ul className="mb-2 text-start small">
                      {car.aiVerification.issues.map((issue, idx) => (
                        <li key={idx} className="mb-1">{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Car Details Grid */}
                <div className="row g-4">
                  {/* Specs */}
                  <div className="col-md-7">
                    <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: "0.8rem" }}>Vehicle Specifications</h6>
                    <div className="row g-3">
                      <SpecItem label="Fuel Type" value={car.fuelType} icon="bi-fuel-pump" />
                      <SpecItem label="Transmission" value={car.transmissionType} icon="bi-gear-wide-connected" />
                      <SpecItem label="Seats" value={`${car.seatingCapacity} Persons`} icon="bi-people-fill" />
                      <SpecItem label="Type" value={car.vehicleType} icon="bi-car-front-fill" />
                      <SpecItem label="Color" value={car.color} icon="bi-palette-fill" />
                      <SpecItem label="Location" value={car.pickupAddress} icon="bi-geo-alt-fill" />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="col-md-5">
                    <div className="card bg-light border-0 h-100">
                      <div className="card-body">
                        <h6 className="fw-bold text-uppercase text-muted mb-3" style={{ fontSize: "0.8rem" }}>Pricing Details</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <span>Per Day</span>
                          <span className="fw-bold">₹{car.pricePerDay}</span>
                        </div>
                        <hr />
                        <div className="d-flex justify-content-between text-success">
                          <span>Deposit (Refundable)</span>
                          <span className="fw-bold">₹{car.deposit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>



              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light">
              <button type="button" className="btn btn-secondary" onClick={onClose}>Close</button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// Micro Components
const SpecItem = ({ label, value, icon }) => (
  <div className="col-6">
    <div className="d-flex align-items-center">
      <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3"
        style={{ width: "40px", height: "40px" }}>
        <i className={`bi ${icon} text-primary fs-5`}></i>
      </div>
      <div>
        <small className="text-muted d-block" style={{ fontSize: "0.7rem" }}>{label}</small>
        <span className="fw-medium text-dark">{value}</span>
      </div>
    </div>
  </div>
);

const RuleBadge = ({ label, isRestricted, icon }) => (
  <span className={`badge ${isRestricted ? 'bg-danger' : 'bg-success'} bg-opacity-10 ${isRestricted ? 'text-danger' : 'text-success'} border ${isRestricted ? 'border-danger' : 'border-success'} border-opacity-25 fw-normal py-2 px-3`}>
    <i className={`bi ${isRestricted ? 'bi-x-circle' : 'bi-check-circle'} me-2`}></i>
    {label}: {isRestricted ? 'No' : 'Yes'}
  </span>
);