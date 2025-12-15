import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    bookings: [],
    selectedBooking: null,
    loading: true,
    error: null,
};

const bookingsSlice = createSlice({
    name: 'bookings',
    initialState,
    reducers: {
        fetchBookingsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchBookingsSuccess: (state, action) => {
            state.loading = false;
            state.bookings = action.payload;
            state.error = null;
        },
        fetchBookingsFailure: (state, action) => {
            state.loading = false;
            state.error = action.payload;
        },
        addBooking: (state, action) => {
            state.bookings.push(action.payload);
        },
        updateBookingStatus: (state, action) => {
            const { bookingId, status } = action.payload;
            const booking = state.bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = status;
            }
        },
        cancelBooking: (state, action) => {
            const bookingId = action.payload;
            const booking = state.bookings.find(b => b.id === bookingId);
            if (booking) {
                booking.status = 'cancelled';
            }
        },
        setSelectedBooking: (state, action) => {
            state.selectedBooking = action.payload;
        },
    },
});

export const {
    fetchBookingsStart,
    fetchBookingsSuccess,
    fetchBookingsFailure,
    addBooking,
    updateBookingStatus,
    cancelBooking,
    setSelectedBooking,
} = bookingsSlice.actions;

export default bookingsSlice.reducer;
