import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plane, Clock, IndianRupee, ArrowRight, Check, TrendingUp, TrendingDown, AlertCircle, Loader2 } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const FlightDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [flight, setFlight] = useState(null);
    const [seats, setSeats] = useState(null);
    const [pricing, setPricing] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        fetchFlightData();
    }, [id]);

    const fetchFlightData = async () => {
        try {
            const [flightRes, seatsRes, pricingRes] = await Promise.all([
                flightAPI.getFlightDetails(id),
                flightAPI.getAvailableSeats(id),
                flightAPI.getPricingDetails(id),
            ]);
            setFlight(flightRes.data);
            setSeats(seatsRes.data);
            setPricing(pricingRes.data);
        } catch (error) {
            toast.error('Failed to load flight details');
            navigate('/flights');
        } finally {
            setLoading(false);
        }
    };

    const handleSeatSelect = (seatNo) => {
        if (seats.booked_seats.includes(seatNo)) return;
        setSelectedSeat(seatNo === selectedSeat ? null : seatNo);
    };

    const handleBookSeat = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to book a flight');
            navigate('/login');
            return;
        }

        if (!selectedSeat) {
            toast.error('Please select a seat');
            return;
        }

        setBooking(true);
        try {
            const response = await bookingAPI.selectSeat({
                flight_id: id,
                seat_no: selectedSeat,
            });
            toast.success(`Seat ${selectedSeat} reserved!`);
            navigate(`/booking/${response.data.booking_id}`);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to reserve seat');
        } finally {
            setBooking(false);
        }
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getSeatType = (seatNo) => {
        const col = seatNo.slice(-1);
        if (col === 'A' || col === 'F') return 'Window';
        if (col === 'C' || col === 'D') return 'Aisle';
        return 'Middle';
    };

    if (loading) {
        return <LoadingSpinner text="Loading flight details..." />;
    }

    if (!flight) {
        return null;
    }

    // Generate seat grid
    const rows = Math.ceil(flight.total_seats / 6);
    const seatGrid = [];
    for (let row = 1; row <= rows; row++) {
        seatGrid.push(['A', 'B', 'C', 'D', 'E', 'F'].map((col) => `${row}${col}`));
    }

    return (
        <div className="space-y-8">
            {/* Flight Overview */}
            <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
                <div className="flex items-center gap-4 mb-8">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-50"></div>
                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center">
                            <Plane className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{flight.airline}</h1>
                        <p className="text-white/50">{flight.flight_number}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Route */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-8">
                            <div>
                                <p className="text-4xl font-bold text-white">{formatTime(flight.departure_time)}</p>
                                <p className="text-xl text-white/70 mt-2">{flight.source}</p>
                                <p className="text-white/40 text-sm">{formatDate(flight.departure_time)}</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                                <div className="flex items-center gap-2 text-white/50">
                                    <Clock className="h-5 w-5" />
                                    <span className="font-medium">{Math.floor((new Date(flight.arrival_time) - new Date(flight.departure_time)) / 60000)} min</span>
                                </div>
                                <div className="w-full flex items-center gap-2 my-4">
                                    <div className="h-1 flex-1 bg-gradient-to-r from-indigo-500 to-transparent rounded"></div>
                                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-2 rounded-full">
                                        <ArrowRight className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="h-1 flex-1 bg-gradient-to-l from-purple-500 to-transparent rounded"></div>
                                </div>
                                <p className="text-white/40 text-sm font-medium">Non-stop</p>
                            </div>

                            <div className="text-right">
                                <p className="text-4xl font-bold text-white">{formatTime(flight.arrival_time)}</p>
                                <p className="text-xl text-white/70 mt-2">{flight.destination}</p>
                                <p className="text-white/40 text-sm">{formatDate(flight.arrival_time)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="glass-card rounded-2xl p-6 border-indigo-500/20">
                        <p className="text-white/50 text-sm mb-3 font-medium">Dynamic Price</p>
                        <div className="flex items-baseline gap-2">
                            <IndianRupee className="h-6 w-6 text-white" />
                            <span className="text-4xl font-bold text-white">{flight.dynamic_price.toLocaleString()}</span>
                        </div>
                        {pricing && (
                            <div className="mt-6 space-y-3 text-sm">
                                <div className="flex justify-between text-white/50">
                                    <span>Base Price</span>
                                    <span>₹{pricing.base_price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>Seat Factor</span>
                                    <span className="flex items-center gap-1">
                                        {pricing.seat_factor > 1 && <TrendingUp className="h-3 w-3 text-rose-400" />}
                                        {pricing.seat_factor.toFixed(2)}x
                                    </span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>Time Factor</span>
                                    <span className="flex items-center gap-1">
                                        {pricing.time_factor > 1 && <TrendingUp className="h-3 w-3 text-rose-400" />}
                                        {pricing.time_factor.toFixed(2)}x
                                    </span>
                                </div>
                                <div className="flex justify-between text-white/50">
                                    <span>Demand Factor</span>
                                    <span className="flex items-center gap-1">
                                        {pricing.demand_factor > 1 ? (
                                            <TrendingUp className="h-3 w-3 text-rose-400" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-emerald-400" />
                                        )}
                                        {pricing.demand_factor.toFixed(2)}x
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Seat Selection */}
            <div className="glass-card rounded-3xl p-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <h2 className="text-xl font-bold text-white mb-2">Select Your Seat</h2>
                <p className="text-white/50 mb-8">
                    {seats?.available_count} seats available out of {flight.total_seats}
                </p>

                {/* Legend */}
                <div className="flex gap-8 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10"></div>
                        <span className="text-white/50 text-sm">Available</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500"></div>
                        <span className="text-white/50 text-sm">Selected</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/30"></div>
                        <span className="text-white/50 text-sm">Booked</span>
                    </div>
                </div>

                {/* Seat Grid */}
                <div className="bg-white/5 rounded-2xl p-6 max-h-[400px] overflow-y-auto">
                    <div className="flex justify-center mb-6">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-2 rounded-t-xl text-white text-sm font-medium">
                            ✈️ Front of Aircraft
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        {seatGrid.slice(0, 30).map((row, rowIndex) => (
                            <div key={rowIndex} className="flex items-center gap-2">
                                <span className="text-white/30 text-xs w-6 text-right font-mono">{rowIndex + 1}</span>
                                <div className="flex gap-1.5">
                                    {row.slice(0, 3).map((seat) => (
                                        <button
                                            key={seat}
                                            onClick={() => handleSeatSelect(seat)}
                                            disabled={seats?.booked_seats.includes(seat)}
                                            className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${seats?.booked_seats.includes(seat)
                                                    ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400/50 cursor-not-allowed'
                                                    : selectedSeat === seat
                                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white scale-110 shadow-lg shadow-indigo-500/30'
                                                        : 'bg-white/5 border border-white/10 text-white/40 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white'
                                                }`}
                                        >
                                            {seat}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-10"></div>
                                <div className="flex gap-1.5">
                                    {row.slice(3).map((seat) => (
                                        <button
                                            key={seat}
                                            onClick={() => handleSeatSelect(seat)}
                                            disabled={seats?.booked_seats.includes(seat)}
                                            className={`w-9 h-9 rounded-lg text-xs font-medium transition-all ${seats?.booked_seats.includes(seat)
                                                    ? 'bg-rose-500/20 border border-rose-500/30 text-rose-400/50 cursor-not-allowed'
                                                    : selectedSeat === seat
                                                        ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white scale-110 shadow-lg shadow-indigo-500/30'
                                                        : 'bg-white/5 border border-white/10 text-white/40 hover:bg-indigo-500/20 hover:border-indigo-500/30 hover:text-white'
                                                }`}
                                        >
                                            {seat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Selected Seat Info & Book Button */}
                {selectedSeat && (
                    <div className="mt-8 glass-card rounded-2xl p-5 border-indigo-500/30 flex items-center justify-between animate-scale-in">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500">
                                <Check className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-lg">Seat {selectedSeat} Selected</p>
                                <p className="text-white/50 text-sm">{getSeatType(selectedSeat)} Seat</p>
                            </div>
                        </div>
                        <button
                            onClick={handleBookSeat}
                            disabled={booking}
                            className="btn-premium text-white px-8 py-4 rounded-xl font-semibold disabled:opacity-50 flex items-center gap-2"
                        >
                            {booking ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Reserving...
                                </>
                            ) : (
                                `Book Now - ₹${flight.dynamic_price.toLocaleString()}`
                            )}
                        </button>
                    </div>
                )}

                {!isAuthenticated && (
                    <div className="mt-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex items-center gap-4">
                        <AlertCircle className="h-6 w-6 text-amber-400" />
                        <p className="text-amber-200">Please login to book this flight</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightDetails;
