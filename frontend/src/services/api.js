import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
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

// Admin API
export const adminAPI = {
    getStats: () => api.get('/admin/stats'),
    getUsers: () => api.get('/admin/users'),
    toggleUserAdmin: (userId) => api.put(`/admin/users/${userId}/toggle-admin`),
    getAllBookings: (statusFilter) => api.get('/admin/bookings', { params: { status_filter: statusFilter } }),
    updateBookingStatus: (bookingId, status) => api.put(`/admin/bookings/${bookingId}/status`, { status }),
    getFlights: () => api.get('/admin/flights'),
    createFlight: (data) => api.post('/admin/flights', data),
    updateFlight: (flightId, data) => api.put(`/admin/flights/${flightId}`, data),
    deleteFlight: (flightId) => api.delete(`/admin/flights/${flightId}`),
};

export default api;
