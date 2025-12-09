import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth API
export const authAPI = {
    signup: (data) => api.post('/users/signup', data),
    login: (data) => api.post('/users/login', data),
    getProfile: () => api.get('/users/profile'),
};

// Flight API
export const flightAPI = {
    searchFlights: (params) => api.get('/flights', { params }),
    getFlightDetails: (id) => api.get(`/flights/${id}`),
    getAvailableSeats: (id) => api.get(`/flights/${id}/seats`),
    getPricingDetails: (id) => api.get(`/flights/${id}/pricing`),
};

// Booking API
export const bookingAPI = {
    selectSeat: (data) => api.post('/bookings/select-seat', data),
    addPassengerInfo: (bookingId, data) => api.post(`/bookings/${bookingId}/passenger`, data),
    processPayment: (bookingId, data) => api.post(`/bookings/${bookingId}/payment`, data),
    getBookingHistory: () => api.get('/bookings/history'),
    getBookingByPNR: (pnr) => api.get(`/bookings/pnr/${pnr}`),
    cancelBooking: (bookingId) => api.delete(`/bookings/${bookingId}`),
};

export default api;
