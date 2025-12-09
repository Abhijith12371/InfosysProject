import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightAPI } from '../services/api';
import { Search, Plane, MapPin, Calendar, Clock, IndianRupee, ArrowRight, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const FlightSearch = () => {
    const [flights, setFlights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        source: '',
        destination: '',
        departure_date: '',
    });
    const navigate = useNavigate();

    useEffect(() => {
        fetchFlights();
    }, []);

    const fetchFlights = async (params = {}) => {
        setLoading(true);
        try {
            const response = await flightAPI.searchFlights(params);
            setFlights(response.data.flights);
        } catch (error) {
            toast.error('Failed to fetch flights');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = {};
        if (filters.source) params.source = filters.source;
        if (filters.destination) params.destination = filters.destination;
        if (filters.departure_date) params.departure_date = filters.departure_date;
        fetchFlights(params);
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
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="space-y-8">
            {/* Search Header */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Search className="h-6 w-6 text-purple-400" />
                    Search Flights
                </h1>

                <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">From</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={filters.source}
                                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Delhi, Mumbai..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">To</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                value={filters.destination}
                                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Bangalore, Chennai..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="date"
                                value={filters.departure_date}
                                onChange={(e) => setFilters({ ...filters, departure_date: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Search className="h-5 w-5" />
                            Search
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <LoadingSpinner text="Searching for flights..." />
            ) : flights.length === 0 ? (
                <div className="text-center py-16">
                    <Plane className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl text-gray-400">No flights found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-gray-400">{flights.length} flights found</p>

                    {flights.map((flight) => (
                        <div
                            key={flight.id}
                            className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all group"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                {/* Airline & Flight Info */}
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center">
                                        <Plane className="h-7 w-7 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{flight.airline}</h3>
                                        <p className="text-gray-400 text-sm">{flight.flight_number}</p>
                                    </div>
                                </div>

                                {/* Route & Times */}
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{formatTime(flight.departure_time)}</p>
                                        <p className="text-gray-400 text-sm">{flight.source}</p>
                                        <p className="text-gray-500 text-xs">{formatDate(flight.departure_time)}</p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm">{formatDuration(flight.duration_minutes)}</span>
                                        </div>
                                        <div className="w-full flex items-center gap-2 my-2">
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-purple-500 to-transparent"></div>
                                            <ArrowRight className="h-4 w-4 text-purple-400" />
                                            <div className="h-[2px] flex-1 bg-gradient-to-l from-pink-500 to-transparent"></div>
                                        </div>
                                        <p className="text-xs text-gray-500">Direct</p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{formatTime(flight.arrival_time)}</p>
                                        <p className="text-gray-400 text-sm">{flight.destination}</p>
                                        <p className="text-gray-500 text-xs">{formatDate(flight.arrival_time)}</p>
                                    </div>
                                </div>

                                {/* Price & Book */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        {flight.dynamic_price > flight.base_price && (
                                            <p className="text-gray-500 line-through text-sm">₹{flight.base_price.toLocaleString()}</p>
                                        )}
                                        <p className="text-2xl font-bold text-white flex items-center justify-end">
                                            <IndianRupee className="h-5 w-5" />
                                            {flight.dynamic_price.toLocaleString()}
                                        </p>
                                        <p className="text-gray-400 text-xs">{flight.available_seats} seats left</p>
                                    </div>

                                    <button
                                        onClick={() => navigate(`/flights/${flight.id}`)}
                                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all whitespace-nowrap"
                                    >
                                        Select
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FlightSearch;
