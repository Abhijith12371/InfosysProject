import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flightAPI } from '../services/api';
import { Search, Plane, MapPin, Calendar, Clock, IndianRupee, ArrowRight } from 'lucide-react';
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
            <div className="glass-card rounded-3xl p-8 animate-fade-in-up">
                <h1 className="text-2xl font-bold text-white mb-8 flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                        <Search className="h-6 w-6 text-white" />
                    </div>
                    Search Flights
                </h1>

                <form onSubmit={handleSearch} className="grid md:grid-cols-4 gap-5">
                    <div>
                        <label className="block text-sm text-white/60 mb-3 font-medium">From</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                            <input
                                type="text"
                                value={filters.source}
                                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                                className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                placeholder="Delhi, Mumbai..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-3 font-medium">To</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                            <input
                                type="text"
                                value={filters.destination}
                                onChange={(e) => setFilters({ ...filters, destination: e.target.value })}
                                className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                placeholder="Bangalore, Chennai..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-white/60 mb-3 font-medium">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                            <input
                                type="date"
                                value={filters.departure_date}
                                onChange={(e) => setFilters({ ...filters, departure_date: e.target.value })}
                                className="w-full input-premium rounded-xl py-4 px-12 text-white focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-end">
                        <button
                            type="submit"
                            className="w-full btn-premium text-white py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3"
                        >
                            <Search className="h-5 w-5" />
                            Search Flights
                        </button>
                    </div>
                </form>
            </div>

            {/* Results */}
            {loading ? (
                <LoadingSpinner text="Searching for flights..." />
            ) : flights.length === 0 ? (
                <div className="text-center py-20 animate-fade-in-up">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 mb-6">
                        <Plane className="h-10 w-10 text-white/30" />
                    </div>
                    <h3 className="text-xl text-white/60 font-medium">No flights found</h3>
                    <p className="text-white/40 mt-2">Try adjusting your search criteria</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <p className="text-white/50 font-medium">{flights.length} flights found</p>

                    {flights.map((flight, index) => (
                        <div
                            key={flight.id}
                            className="glass-card rounded-2xl p-6 hover:border-indigo-500/30 transition-all group animate-fade-in-up cursor-pointer"
                            style={{ animationDelay: `${index * 0.1}s` }}
                            onClick={() => navigate(`/flights/${flight.id}`)}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                {/* Airline & Flight Info */}
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity"></div>
                                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-xl flex items-center justify-center">
                                            <Plane className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{flight.airline}</h3>
                                        <p className="text-white/40 text-sm">{flight.flight_number}</p>
                                    </div>
                                </div>

                                {/* Route & Times */}
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{formatTime(flight.departure_time)}</p>
                                        <p className="text-white/50 text-sm">{flight.source}</p>
                                        <p className="text-white/30 text-xs">{formatDate(flight.departure_time)}</p>
                                    </div>

                                    <div className="flex-1 flex flex-col items-center">
                                        <div className="flex items-center gap-2 text-white/40">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-sm font-medium">{formatDuration(flight.duration_minutes)}</span>
                                        </div>
                                        <div className="w-full flex items-center gap-2 my-3">
                                            <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500 to-transparent"></div>
                                            <div className="p-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
                                                <ArrowRight className="h-3 w-3 text-indigo-400" />
                                            </div>
                                            <div className="h-[2px] flex-1 bg-gradient-to-l from-purple-500 to-transparent"></div>
                                        </div>
                                        <p className="text-xs text-white/30 font-medium">Non-stop</p>
                                    </div>

                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-white">{formatTime(flight.arrival_time)}</p>
                                        <p className="text-white/50 text-sm">{flight.destination}</p>
                                        <p className="text-white/30 text-xs">{formatDate(flight.arrival_time)}</p>
                                    </div>
                                </div>

                                {/* Price & Book */}
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        {flight.dynamic_price > flight.base_price && (
                                            <p className="text-white/30 line-through text-sm">₹{flight.base_price.toLocaleString()}</p>
                                        )}
                                        <p className="text-2xl font-bold text-white flex items-center justify-end">
                                            <IndianRupee className="h-5 w-5" />
                                            {flight.dynamic_price.toLocaleString()}
                                        </p>
                                        <p className="text-white/40 text-xs">{flight.available_seats} seats left</p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/flights/${flight.id}`);
                                        }}
                                        className="btn-premium text-white px-6 py-3 rounded-xl font-semibold whitespace-nowrap"
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
