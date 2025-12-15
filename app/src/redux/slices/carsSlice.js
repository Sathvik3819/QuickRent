import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    allCars: [],
    filteredCars: [],
    selectedCar: null,
    loading: true,
    error: null,
    skipInitialFetch: false, // Flag to skip initial fetch when coming from booking form
    filters: {
        searchQuery: '',
        vehicleType: '',
        fuelType: '',
        transmission: '',
        priceRange: { min: 0, max: 10000 },
        location: '',
    },
};

const carsSlice = createSlice({
    name: 'cars',
    initialState,
    reducers: {
        setskipInitialFetch: (state, action) => {
            state.skipInitialFetch = action.payload
        },
        fetchCarsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchCarsSuccess: (state, action) => {
            state.loading = false;
            state.allCars = action.payload;
            // state.filteredCars = action.payload; // Don't reset, apply filters instead
            // We need to apply logic similar to setFilters here, but since reducers can't call each other easily in this structure,
            // we will just set it to allCars if no filters are active, OR we can extract the filtering logic.
            // For now, let's just reset it to allCars for simplicity unless we want to persist filters across refetches.
            state.filteredCars = action.payload;
            state.skipInitialFetch = false; // Reset flag after fetching all cars
            state.error = null;
        },
        fetchCarsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        searchCarsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        searchCarsSuccess: (state, action) => {
            state.loading = false;
            state.filteredCars = action.payload;
            state.skipInitialFetch = true; // Set flag to skip initial fetch
            state.error = null;
        },
        searchCarsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        setSelectedCar: (state, action) => {
            state.selectedCar = action.payload;
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload };

            const search = state.filters.searchQuery?.toLowerCase().trim();
            const location = state.filters.location?.toLowerCase().trim();

            // Apply filters
            state.filteredCars = state.allCars.filter((car) => {
                const matchesSearch = search
                    ? (car.brand?.toLowerCase().includes(search) ||
                        car.model?.toLowerCase().includes(search) ||
                        car.ownerCity?.toLowerCase().includes(search))
                    : true;

                const matchesType = state.filters.vehicleType
                    ? car.vehicleType === state.filters.vehicleType
                    : true;

                const matchesFuel = state.filters.fuelType
                    ? car.fuelType === state.filters.fuelType
                    : true;

                const matchesTransmission = state.filters.transmission
                    ? car.transmissionType === state.filters.transmission
                    : true;

                const matchesPrice =
                    car.pricePerDay >= state.filters.priceRange.min &&
                    car.pricePerDay <= state.filters.priceRange.max;

                const matchesLocation = location
                    ? car.ownerCity?.toLowerCase().includes(location)
                    : true;

                return matchesSearch && matchesType && matchesFuel &&
                    matchesTransmission && matchesPrice && matchesLocation;
            });
        },
        clearFilters: (state) => {
            state.filters = initialState.filters;
            state.filteredCars = state.allCars;
        },
        setLoadingState: (state, action) => {
            state.loading = action.payload
        },
        setSkipInitialFetch: (state, action) => {
            state.skipInitialFetch = action.payload;
        },
        addCar: (state, action) => {
            state.allCars.push(action.payload);
            state.filteredCars.push(action.payload);
        },
    },
});

export const {
    fetchCarsStart,
    fetchCarsSuccess,
    fetchCarsFailure,
    searchCarsStart,
    searchCarsSuccess,
    searchCarsFailure,
    setSelectedCar,
    setFilters,
    clearFilters,
    setLoadingState,
    setSkipInitialFetch,
    addCar,
} = carsSlice.actions;

export default carsSlice.reducer;
