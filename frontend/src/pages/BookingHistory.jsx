import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plane, Calendar, MapPin, Check, X, Clock, Search, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const BookingHistory = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pnrSearch, setPnrSearch] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [searching, setSearching] = useState(false);
    const [cancelling, setCancelling] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            fetchBookings();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated]);

    const fetchBookings = async () => {
        try {
            const response = await bookingAPI.getBookingHistory();
            setBookings(response.data.bookings);
        } catch (error) {
            toast.error('Failed to load bookings');
        } finally {
            setLoading(false);
        }
    };

    const handlePNRSearch = async (e) => {
        e.preventDefault();
        if (!pnrSearch.trim()) return;

        setSearching(true);
        setSearchResult(null);

        try {
            const response = await bookingAPI.getBookingByPNR(pnrSearch.trim());
            setSearchResult(response.data);
        } catch (error) {
            toast.error('Booking not found');
        } finally {
            setSearching(false);
        }
    };

    const handleCancel = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        setCancelling(bookingId);
        try {
            const response = await bookingAPI.cancelBooking(bookingId);
            toast.success(response.data.message);
            fetchBookings();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to cancel booking');
        } finally {
            setCancelling(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            INFO_ADDED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            CONFIRMED: 'bg-green-500/20 text-green-400 border-green-500/30',
            CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
            FAILED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.PENDING}`}>
                {status}
            </span>
        );
    };

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const BookingCard = ({ booking, showCancel = true }) => (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/30 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${booking.status === 'CONFIRMED'
                        ? 'bg-green-500/20'
                        : booking.status === 'CANCELLED'
                            ? 'bg-red-500/20'
                            : 'bg-purple-500/20'
                        }`}>
                        {booking.status === 'CONFIRMED' ? (
                            <Check className="h-6 w-6 text-green-400" />
                        ) : booking.status === 'CANCELLED' ? (
                            <X className="h-6 w-6 text-red-400" />
                        ) : (
                            <Clock className="h-6 w-6 text-purple-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                                {booking.flight?.flight_number || 'Flight'}
                            </h3>
                            {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-gray-400 text-sm">
                            {booking.flight?.airline || 'Unknown Airline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-white font-medium">{booking.flight?.source}</p>
                            <p className="text-gray-500 text-xs">
                                {booking.flight?.departure_time && formatDateTime(booking.flight.departure_time)}
                            </p>
                        </div>
                        <Plane className="h-4 w-4 text-purple-400 rotate-90" />
                        <div className="text-center">
                            <p className="text-white font-medium">{booking.flight?.destination}</p>
                            <p className="text-gray-500 text-xs">
                                {booking.flight?.arrival_time && formatDateTime(booking.flight.arrival_time)}
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-gray-400 text-xs">Seat</p>
                        <p className="text-white font-semibold">{booking.seat_no}</p>
                    </div>

                    {booking.pnr && (
                        <div className="text-center">
                            <p className="text-gray-400 text-xs">PNR</p>
                            <p className="text-white font-mono font-bold">{booking.pnr}</p>
                        </div>
                    )}

                    <div className="text-right">
                        <p className="text-gray-400 text-xs">Amount</p>
                        <p className="text-white font-bold">₹{booking.final_price?.toLocaleString()}</p>
                    </div>

                    {/* View Ticket Button for confirmed bookings */}
                    {booking.status === 'CONFIRMED' && (
                        <button
                            onClick={() => navigate(`/ticket/${booking.id}`)}
                            className="bg-green-500/20 text-green-400 px-4 py-2 rounded-lg hover:bg-green-500/30 transition-all text-sm border border-green-500/30"
                        >
                            View Ticket
                        </button>
                    )}

                    {showCancel && booking.status !== 'CANCELLED' && booking.status !== 'FAILED' && (
                        <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all text-sm border border-red-500/30 disabled:opacity-50"
                        >
                            {cancelling === booking.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Cancel'
                            )}
                        </button>
                    )}
                </div>
            </div>

            {booking.passenger_name && (
                <div className="mt-4 pt-4 border-t border-white/10 text-sm text-gray-400">
                    Passenger: <span className="text-white">{booking.passenger_name}</span>
                    {booking.passenger_email && (
                        <span className="ml-4">• {booking.passenger_email}</span>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* PNR Search */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                    <Search className="h-6 w-6 text-purple-400" />
                    Look Up Booking by PNR
                </h2>

                <form onSubmit={handlePNRSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={pnrSearch}
                        onChange={(e) => setPnrSearch(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character PNR"
                        maxLength={6}
                        className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono uppercase tracking-widest"
                    />
                    <button
                        type="submit"
                        disabled={searching || pnrSearch.length !== 6}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        Search
                    </button>
                </form>

                {searchResult && (
                    <div className="mt-6">
                        <p className="text-gray-400 text-sm mb-3">Search Result:</p>
                        <BookingCard booking={searchResult} showCancel={false} />
                    </div>
                )}
            </div>

            {/* My Bookings */}
            {isAuthenticated && (
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-purple-400" />
                        My Bookings
                    </h2>

                    {loading ? (
                        <LoadingSpinner text="Loading your bookings..." />
                    ) : bookings.length === 0 ? (
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
                            <Plane className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                            <h3 className="text-xl text-gray-400">No bookings yet</h3>
                            <p className="text-gray-500 mt-2">Start by searching for flights</p>
                            <button
                                onClick={() => navigate('/flights')}
                                className="mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                            >
                                Search Flights
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking) => (
                                <BookingCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!isAuthenticated && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
                    <p className="text-gray-400 mb-4">Login to view your booking history</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                        Login
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
