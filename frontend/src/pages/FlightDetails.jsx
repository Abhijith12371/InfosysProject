import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { flightAPI, bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plane, MapPin, Clock, IndianRupee, ArrowRight, Check, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
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
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center">
                        <Plane className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{flight.airline}</h1>
                        <p className="text-gray-400">{flight.flight_number}</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Route */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-8">
                            <div>
                                <p className="text-4xl font-bold text-white">{formatTime(flight.departure_time)}</p>
                                <p className="text-xl text-gray-300 mt-1">{flight.source}</p>
                                <p className="text-gray-500">{formatDate(flight.departure_time)}</p>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                                <div className="flex items-center gap-2 text-gray-400">
                                    <Clock className="h-5 w-5" />
                                    <span>{Math.floor((new Date(flight.arrival_time) - new Date(flight.departure_time)) / 60000)} min</span>
                                </div>
                                <div className="w-full flex items-center gap-2 my-3">
                                    <div className="h-1 flex-1 bg-gradient-to-r from-purple-500 to-transparent rounded"></div>
                                    <div className="bg-purple-600 p-2 rounded-full">
                                        <ArrowRight className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="h-1 flex-1 bg-gradient-to-l from-pink-500 to-transparent rounded"></div>
                                </div>
                                <p className="text-gray-500 text-sm">Non-stop</p>
                            </div>

                            <div className="text-right">
                                <p className="text-4xl font-bold text-white">{formatTime(flight.arrival_time)}</p>
                                <p className="text-xl text-gray-300 mt-1">{flight.destination}</p>
                                <p className="text-gray-500">{formatDate(flight.arrival_time)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                        <p className="text-gray-400 text-sm mb-2">Dynamic Price</p>
                        <div className="flex items-baseline gap-2">
                            <IndianRupee className="h-6 w-6 text-white" />
                            <span className="text-4xl font-bold text-white">{flight.dynamic_price.toLocaleString()}</span>
                        </div>
                        {pricing && (
                            <div className="mt-4 space-y-2 text-sm">
                                <div className="flex justify-between text-gray-400">
                                    <span>Base Price</span>
                                    <span>₹{pricing.base_price.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Seat Factor</span>
                                    <span className="flex items-center gap-1">
                                        {pricing.seat_factor > 1 && <TrendingUp className="h-3 w-3 text-red-400" />}
                                        {pricing.seat_factor.toFixed(2)}x
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Time Factor</span>
                                    <span className="flex items-center gap-1">
                                        {pricing.time_factor > 1 && <TrendingUp className="h-3 w-3 text-red-400" />}
                                        {pricing.time_factor.toFixed(2)}x
                                    </span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Demand Factor</span>
                                    <span className="flex items-center gap-1">
                                        {pricing.demand_factor > 1 ? (
                                            <TrendingUp className="h-3 w-3 text-red-400" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3 text-green-400" />
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
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h2 className="text-xl font-bold text-white mb-4">Select Your Seat</h2>
                <p className="text-gray-400 mb-6">
                    {seats?.available_count} seats available out of {flight.total_seats}
                </p>

                {/* Legend */}
                <div className="flex gap-6 mb-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white/10 rounded border border-white/20"></div>
                        <span className="text-gray-400 text-sm">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-purple-600 rounded"></div>
                        <span className="text-gray-400 text-sm">Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500/30 rounded border border-red-500/50"></div>
                        <span className="text-gray-400 text-sm">Booked</span>
                    </div>
                </div>

                {/* Seat Grid */}
                <div className="bg-white/5 rounded-xl p-6 max-h-96 overflow-y-auto">
                    <div className="flex justify-center mb-4">
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-2 rounded-t-xl text-white text-sm">
                            ✈️ Front of Aircraft
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-1">
                        {seatGrid.slice(0, 30).map((row, rowIndex) => (
                            <div key={rowIndex} className="flex items-center gap-1">
                                <span className="text-gray-500 text-xs w-6 text-right">{rowIndex + 1}</span>
                                <div className="flex gap-1">
                                    {row.slice(0, 3).map((seat) => (
                                        <button
                                            key={seat}
                                            onClick={() => handleSeatSelect(seat)}
                                            disabled={seats?.booked_seats.includes(seat)}
                                            className={`w-8 h-8 rounded text-xs font-medium transition-all ${seats?.booked_seats.includes(seat)
                                                    ? 'bg-red-500/30 border border-red-500/50 text-red-400 cursor-not-allowed'
                                                    : selectedSeat === seat
                                                        ? 'bg-purple-600 text-white scale-110'
                                                        : 'bg-white/10 border border-white/20 text-gray-400 hover:bg-purple-500/30 hover:border-purple-500'
                                                }`}
                                        >
                                            {seat}
                                        </button>
                                    ))}
                                </div>
                                <div className="w-8"></div>
                                <div className="flex gap-1">
                                    {row.slice(3).map((seat) => (
                                        <button
                                            key={seat}
                                            onClick={() => handleSeatSelect(seat)}
                                            disabled={seats?.booked_seats.includes(seat)}
                                            className={`w-8 h-8 rounded text-xs font-medium transition-all ${seats?.booked_seats.includes(seat)
                                                    ? 'bg-red-500/30 border border-red-500/50 text-red-400 cursor-not-allowed'
                                                    : selectedSeat === seat
                                                        ? 'bg-purple-600 text-white scale-110'
                                                        : 'bg-white/10 border border-white/20 text-gray-400 hover:bg-purple-500/30 hover:border-purple-500'
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
                    <div className="mt-6 bg-purple-600/20 rounded-xl p-4 border border-purple-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Check className="h-6 w-6 text-purple-400" />
                            <div>
                                <p className="text-white font-semibold">Seat {selectedSeat} Selected</p>
                                <p className="text-gray-400 text-sm">{getSeatType(selectedSeat)} Seat</p>
                            </div>
                        </div>
                        <button
                            onClick={handleBookSeat}
                            disabled={booking}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                        >
                            {booking ? 'Reserving...' : `Book Now - ₹${flight.dynamic_price.toLocaleString()}`}
                        </button>
                    </div>
                )}

                {!isAuthenticated && (
                    <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <p className="text-yellow-200 text-sm">Please login to book this flight</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FlightDetails;
