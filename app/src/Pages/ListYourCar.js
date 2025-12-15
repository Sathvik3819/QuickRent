import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import ListCarForm from "../components/ListCarForm";

import axiosInstance from "../utils/axiosInstance";


export default function ListYourCar() {
    return (
        <div className="container py-5">
            <div className="mb-4">
                <h2><i className="bi bi-plus-circle-fill me-2"></i>List Your Car</h2>
            </div>
            <div className="card shadow-sm p-4" style={{ borderRadius: "12px" }}>
                <ListCarForm />
            </div>
        </div>
    );
}
