import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plane, Calendar, Check, X, Clock, Search, Loader2 } from 'lucide-react';
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
            PENDING: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
            INFO_ADDED: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            CONFIRMED: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            CANCELLED: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
            FAILED: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.PENDING}`}>
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
        <div className="glass-card rounded-2xl p-6 hover:border-indigo-500/30 transition-all">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${booking.status === 'CONFIRMED'
                            ? 'bg-emerald-500/20'
                            : booking.status === 'CANCELLED'
                                ? 'bg-rose-500/20'
                                : 'bg-indigo-500/20'
                        }`}>
                        {booking.status === 'CONFIRMED' ? (
                            <Check className="h-6 w-6 text-emerald-400" />
                        ) : booking.status === 'CANCELLED' ? (
                            <X className="h-6 w-6 text-rose-400" />
                        ) : (
                            <Clock className="h-6 w-6 text-indigo-400" />
                        )}
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-white">
                                {booking.flight?.flight_number || 'Flight'}
                            </h3>
                            {getStatusBadge(booking.status)}
                        </div>
                        <p className="text-white/40 text-sm">
                            {booking.flight?.airline || 'Unknown Airline'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-white font-medium">{booking.flight?.source}</p>
                            <p className="text-white/30 text-xs">
                                {booking.flight?.departure_time && formatDateTime(booking.flight.departure_time)}
                            </p>
                        </div>
                        <Plane className="h-4 w-4 text-indigo-400 rotate-90" />
                        <div className="text-center">
                            <p className="text-white font-medium">{booking.flight?.destination}</p>
                            <p className="text-white/30 text-xs">
                                {booking.flight?.arrival_time && formatDateTime(booking.flight.arrival_time)}
                            </p>
                        </div>
                    </div>

                    <div className="text-center">
                        <p className="text-white/40 text-xs">Seat</p>
                        <p className="text-white font-semibold">{booking.seat_no}</p>
                    </div>

                    {booking.pnr && (
                        <div className="text-center">
                            <p className="text-white/40 text-xs">PNR</p>
                            <p className="text-white font-mono font-bold">{booking.pnr}</p>
                        </div>
                    )}

                    <div className="text-right">
                        <p className="text-white/40 text-xs">Amount</p>
                        <p className="text-white font-bold">₹{booking.final_price?.toLocaleString()}</p>
                    </div>

                    {booking.status === 'CONFIRMED' && (
                        <button
                            onClick={() => navigate(`/ticket/${booking.id}`)}
                            className="bg-emerald-500/20 text-emerald-400 px-4 py-2.5 rounded-xl hover:bg-emerald-500/30 transition-all text-sm font-medium border border-emerald-500/30"
                        >
                            View Ticket
                        </button>
                    )}

                    {showCancel && booking.status !== 'CANCELLED' && booking.status !== 'FAILED' && (
                        <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancelling === booking.id}
                            className="bg-rose-500/20 text-rose-400 px-4 py-2.5 rounded-xl hover:bg-rose-500/30 transition-all text-sm font-medium border border-rose-500/30 disabled:opacity-50"
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
                <div className="mt-4 pt-4 border-t border-white/10 text-sm text-white/40">
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
            <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Search className="h-6 w-6 text-white" />
                    </div>
                    Look Up Booking by PNR
                </h2>

                <form onSubmit={handlePNRSearch} className="flex gap-4">
                    <input
                        type="text"
                        value={pnrSearch}
                        onChange={(e) => setPnrSearch(e.target.value.toUpperCase())}
                        placeholder="Enter 6-character PNR"
                        maxLength={6}
                        className="flex-1 input-premium rounded-xl py-4 px-5 text-white placeholder-white/30 focus:outline-none font-mono uppercase tracking-[0.3em] text-center"
                    />
                    <button
                        type="submit"
                        disabled={searching || pnrSearch.length !== 6}
                        className="btn-premium text-white px-8 py-4 rounded-xl font-semibold flex items-center gap-3 disabled:opacity-50"
                    >
                        {searching ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                        Search
                    </button>
                </form>

                {searchResult && (
                    <div className="mt-6 animate-fade-in-up">
                        <p className="text-white/50 text-sm mb-3">Search Result:</p>
                        <BookingCard booking={searchResult} showCancel={false} />
                    </div>
                )}
            </div>

            {/* My Bookings */}
            {isAuthenticated && (
                <div>
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                            <Calendar className="h-6 w-6 text-white" />
                        </div>
                        My Bookings
                    </h2>

                    {loading ? (
                        <LoadingSpinner text="Loading your bookings..." />
                    ) : bookings.length === 0 ? (
                        <div className="glass-card rounded-3xl p-16 text-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 mb-6">
                                <Plane className="h-10 w-10 text-white/30" />
                            </div>
                            <h3 className="text-xl text-white/60 font-medium">No bookings yet</h3>
                            <p className="text-white/40 mt-2">Start by searching for flights</p>
                            <button
                                onClick={() => navigate('/flights')}
                                className="mt-8 btn-premium text-white px-8 py-4 rounded-xl font-semibold"
                            >
                                Search Flights
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map((booking, index) => (
                                <div key={booking.id} className="animate-fade-in-up" style={{ animationDelay: `${(index + 2) * 0.1}s` }}>
                                    <BookingCard booking={booking} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {!isAuthenticated && (
                <div className="glass-card rounded-3xl p-16 text-center animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                    <p className="text-white/50 mb-6">Login to view your booking history</p>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn-premium text-white px-8 py-4 rounded-xl font-semibold"
                    >
                        Login
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingHistory;
