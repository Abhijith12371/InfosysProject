import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plane, User, Calendar, MapPin, Clock, QrCode, Download, Printer, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const ETicket = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const ticketRef = useRef(null);

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBooking();
    }, [bookingId]);

    const fetchBooking = async () => {
        try {
            // Try to get from history first if authenticated
            if (isAuthenticated) {
                const response = await bookingAPI.getBookingHistory();
                const found = response.data.bookings.find(b => b.id === bookingId);
                if (found && found.status === 'CONFIRMED') {
                    setBooking(found);
                    setLoading(false);
                    return;
                }
            }

            // If not found or not authenticated, booking must have PNR for lookup
            toast.error('Ticket not available');
            navigate('/bookings');
        } catch (error) {
            toast.error('Failed to load ticket');
            navigate('/bookings');
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateStr) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });
    };

    if (loading) {
        return <LoadingSpinner text="Loading your ticket..." />;
    }

    if (!booking || booking.status !== 'CONFIRMED') {
        return (
            <div className="text-center py-12">
                <p className="text-gray-400">Ticket not available. Only confirmed bookings have tickets.</p>
                <button onClick={() => navigate('/bookings')} className="mt-4 text-purple-400 hover:text-purple-300">
                    Go to My Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Action Buttons */}
            <div className="flex justify-between items-center print:hidden">
                <button
                    onClick={() => navigate('/bookings')}
                    className="text-gray-400 hover:text-white flex items-center gap-2"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Bookings
                </button>
                <button
                    onClick={handlePrint}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                    <Printer className="h-5 w-5" />
                    Print Ticket
                </button>
            </div>

            {/* E-Ticket */}
            <div ref={ticketRef} className="bg-white rounded-2xl overflow-hidden shadow-2xl print:shadow-none">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <Plane className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">SkyBook</h1>
                                <p className="text-white/80 text-sm">E-Ticket / Boarding Pass</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/80 text-sm">PNR / Booking Reference</p>
                            <p className="text-3xl font-bold text-white tracking-widest">{booking.pnr}</p>
                        </div>
                    </div>
                </div>

                {/* Flight Details */}
                <div className="p-8">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <p className="text-gray-500 text-sm mb-1">Passenger Name</p>
                            <p className="text-2xl font-bold text-gray-800">{booking.passenger_name}</p>
                            <p className="text-gray-500 text-sm mt-1">{booking.passenger_email}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500 text-sm mb-1">Flight</p>
                            <p className="text-xl font-bold text-gray-800">{booking.flight?.flight_number}</p>
                            <p className="text-gray-600">{booking.flight?.airline}</p>
                        </div>
                    </div>

                    {/* Route Section */}
                    <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-gray-800">{booking.flight?.source}</p>
                                <p className="text-gray-500 mt-1">{formatTime(booking.flight?.departure_time)}</p>
                                <p className="text-gray-400 text-sm">{formatDate(booking.flight?.departure_time)}</p>
                            </div>

                            <div className="flex-1 px-8">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                                    <div className="bg-purple-600 p-3 rounded-full">
                                        <Plane className="h-6 w-6 text-white rotate-90" />
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                                </div>
                                <p className="text-center text-gray-500 text-sm mt-2">Direct Flight</p>
                            </div>

                            <div className="text-center">
                                <p className="text-4xl font-bold text-gray-800">{booking.flight?.destination}</p>
                                <p className="text-gray-500 mt-1">{formatTime(booking.flight?.arrival_time)}</p>
                                <p className="text-gray-400 text-sm">{formatDate(booking.flight?.arrival_time)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-4 gap-6 mb-8">
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-sm mb-1">Date</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {new Date(booking.flight?.departure_time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-sm mb-1">Boarding</p>
                            <p className="text-lg font-semibold text-gray-800">
                                {new Date(new Date(booking.flight?.departure_time).getTime() - 45 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-sm mb-1">Gate</p>
                            <p className="text-lg font-semibold text-gray-800">TBA</p>
                        </div>
                        <div className="bg-indigo-600 rounded-xl p-4 text-center">
                            <p className="text-white/80 text-sm mb-1">Seat</p>
                            <p className="text-2xl font-bold text-white">{booking.seat_no}</p>
                        </div>
                    </div>

                    {/* Barcode Section */}
                    <div className="border-t-2 border-dashed border-gray-200 pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Amount Paid</p>
                                <p className="text-2xl font-bold text-gray-800">₹{booking.final_price?.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-gray-500 text-sm">Booking ID</p>
                                    <p className="text-gray-600 font-mono text-sm">{booking.id.slice(0, 8)}...</p>
                                </div>
                                {/* QR Code Placeholder */}
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <div className="grid grid-cols-5 gap-1">
                                        {[...Array(25)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`w-3 h-3 ${Math.random() > 0.5 ? 'bg-gray-800' : 'bg-white'}`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Note */}
                    <div className="mt-6 text-center text-gray-400 text-xs">
                        <p>Please arrive at the airport at least 2 hours before departure for domestic flights.</p>
                        <p className="mt-1">This e-ticket is valid for travel. Present this along with a valid photo ID at check-in.</p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          #root {
            visibility: visible;
            position: absolute;
            left: 0;
            top: 0;
          }
        }
      `}</style>
        </div>
    );
};

export default ETicket;
