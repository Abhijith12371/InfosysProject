import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Plane, Printer, ArrowLeft, CheckCircle } from 'lucide-react';
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
            if (isAuthenticated) {
                const response = await bookingAPI.getBookingHistory();
                const found = response.data.bookings.find(b => b.id === bookingId);
                if (found && found.status === 'CONFIRMED') {
                    setBooking(found);
                    setLoading(false);
                    return;
                }
            }

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
        // Create a new window for printing
        const printContent = ticketRef.current;
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>SkyBook E-Ticket - ${booking.pnr}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                        background: #f3f4f6;
                        padding: 20px;
                    }
                    .ticket {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        border-radius: 16px;
                        overflow: hidden;
                        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                    }
                    .header {
                        background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
                        padding: 24px 32px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .header-left {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                    }
                    .logo-box {
                        background: rgba(255,255,255,0.2);
                        padding: 10px;
                        border-radius: 10px;
                    }
                    .logo-box svg {
                        width: 28px;
                        height: 28px;
                        color: white;
                    }
                    .brand-name {
                        color: white;
                        font-size: 24px;
                        font-weight: bold;
                    }
                    .brand-sub {
                        color: rgba(255,255,255,0.8);
                        font-size: 12px;
                    }
                    .pnr-section {
                        text-align: right;
                    }
                    .pnr-label {
                        color: rgba(255,255,255,0.8);
                        font-size: 12px;
                    }
                    .pnr-value {
                        color: white;
                        font-size: 28px;
                        font-weight: bold;
                        letter-spacing: 4px;
                    }
                    .content {
                        padding: 32px;
                    }
                    .passenger-row {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 24px;
                    }
                    .label {
                        color: #6b7280;
                        font-size: 12px;
                        margin-bottom: 4px;
                    }
                    .value {
                        color: #1f2937;
                        font-size: 18px;
                        font-weight: bold;
                    }
                    .value-sm {
                        color: #4b5563;
                        font-size: 14px;
                    }
                    .route-section {
                        background: #f9fafb;
                        border-radius: 12px;
                        padding: 24px;
                        margin-bottom: 24px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    }
                    .city {
                        text-align: center;
                    }
                    .city-name {
                        font-size: 32px;
                        font-weight: bold;
                        color: #1f2937;
                    }
                    .city-time {
                        color: #6b7280;
                        margin-top: 4px;
                    }
                    .city-date {
                        color: #9ca3af;
                        font-size: 12px;
                    }
                    .route-line {
                        flex: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        padding: 0 24px;
                    }
                    .line {
                        flex: 1;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #a78bfa, transparent);
                    }
                    .plane-icon {
                        background: #7c3aed;
                        padding: 10px;
                        border-radius: 50%;
                        margin: 0 12px;
                    }
                    .plane-icon svg {
                        width: 20px;
                        height: 20px;
                        color: white;
                        transform: rotate(90deg);
                    }
                    .details-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 16px;
                        margin-bottom: 24px;
                    }
                    .detail-box {
                        background: #f3e8ff;
                        padding: 16px;
                        border-radius: 12px;
                        text-align: center;
                    }
                    .detail-box.seat {
                        background: #4f46e5;
                    }
                    .detail-box.seat .label {
                        color: rgba(255,255,255,0.8);
                    }
                    .detail-box.seat .value {
                        color: white;
                        font-size: 24px;
                    }
                    .footer-section {
                        border-top: 2px dashed #e5e7eb;
                        padding-top: 24px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                    .amount .label {
                        color: #6b7280;
                    }
                    .amount .value {
                        font-size: 24px;
                    }
                    .qr-placeholder {
                        background: #f3f4f6;
                        padding: 12px;
                        border-radius: 8px;
                        display: grid;
                        grid-template-columns: repeat(6, 1fr);
                        gap: 2px;
                    }
                    .qr-cell {
                        width: 8px;
                        height: 8px;
                        background: #1f2937;
                    }
                    .qr-cell.white {
                        background: white;
                    }
                    .notice {
                        text-align: center;
                        color: #9ca3af;
                        font-size: 11px;
                        margin-top: 24px;
                        line-height: 1.5;
                    }
                    .status-badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 6px;
                        background: #d1fae5;
                        color: #059669;
                        padding: 4px 12px;
                        border-radius: 20px;
                        font-size: 12px;
                        font-weight: 600;
                    }
                </style>
            </head>
            <body>
                <div class="ticket">
                    <div class="header">
                        <div class="header-left">
                            <div class="logo-box">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                </svg>
                            </div>
                            <div>
                                <div class="brand-name">SkyBook</div>
                                <div class="brand-sub">E-Ticket / Boarding Pass</div>
                            </div>
                        </div>
                        <div class="pnr-section">
                            <div class="pnr-label">PNR / Booking Reference</div>
                            <div class="pnr-value">${booking.pnr}</div>
                        </div>
                    </div>
                    
                    <div class="content">
                        <div class="passenger-row">
                            <div>
                                <div class="label">Passenger Name</div>
                                <div class="value">${booking.passenger_name}</div>
                                <div class="value-sm">${booking.passenger_email}</div>
                            </div>
                            <div style="text-align: right;">
                                <div class="label">Flight</div>
                                <div class="value">${booking.flight?.flight_number}</div>
                                <div class="value-sm">${booking.flight?.airline}</div>
                            </div>
                        </div>
                        
                        <div class="route-section">
                            <div class="city">
                                <div class="city-name">${booking.flight?.source}</div>
                                <div class="city-time">${new Date(booking.flight?.departure_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                <div class="city-date">${new Date(booking.flight?.departure_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                            </div>
                            <div class="route-line">
                                <div class="line"></div>
                                <div class="plane-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                                    </svg>
                                </div>
                                <div class="line"></div>
                            </div>
                            <div class="city">
                                <div class="city-name">${booking.flight?.destination}</div>
                                <div class="city-time">${new Date(booking.flight?.arrival_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                <div class="city-date">${new Date(booking.flight?.arrival_time).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                            </div>
                        </div>
                        
                        <div class="details-grid">
                            <div class="detail-box">
                                <div class="label">Date</div>
                                <div class="value">${new Date(booking.flight?.departure_time).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</div>
                            </div>
                            <div class="detail-box">
                                <div class="label">Boarding</div>
                                <div class="value">${new Date(new Date(booking.flight?.departure_time).getTime() - 45 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                            </div>
                            <div class="detail-box">
                                <div class="label">Gate</div>
                                <div class="value">TBA</div>
                            </div>
                            <div class="detail-box seat">
                                <div class="label">Seat</div>
                                <div class="value">${booking.seat_no}</div>
                            </div>
                        </div>
                        
                        <div class="footer-section">
                            <div class="amount">
                                <div class="label">Amount Paid</div>
                                <div class="value">₹${booking.final_price?.toLocaleString()}</div>
                            </div>
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div>
                                    <div class="label">Status</div>
                                    <div class="status-badge">✓ CONFIRMED</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="notice">
                            <p>Please arrive at the airport at least 2 hours before departure for domestic flights.</p>
                            <p>This e-ticket is valid for travel. Present this along with a valid photo ID at check-in.</p>
                        </div>
                    </div>
                </div>
                <script>
                    window.onload = function() {
                        window.print();
                        window.onafterprint = function() { window.close(); }
                    }
                </script>
            </body>
            </html>
        `);

        printWindow.document.close();
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
            <div className="text-center py-20 animate-fade-in-up">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 mb-6">
                    <Plane className="h-10 w-10 text-white/30" />
                </div>
                <h3 className="text-xl text-white/60 font-medium">Ticket not available</h3>
                <p className="text-white/40 mt-2">Only confirmed bookings have tickets.</p>
                <button
                    onClick={() => navigate('/bookings')}
                    className="mt-8 btn-premium text-white px-8 py-4 rounded-xl font-semibold"
                >
                    Go to My Bookings
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
            {/* Action Buttons */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => navigate('/bookings')}
                    className="text-white/60 hover:text-white flex items-center gap-2 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    Back to Bookings
                </button>
                <button
                    onClick={handlePrint}
                    className="btn-premium text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold"
                >
                    <Printer className="h-5 w-5" />
                    Print Ticket
                </button>
            </div>

            {/* E-Ticket Preview */}
            <div ref={ticketRef} className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 px-8 py-6">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur-sm">
                                <Plane className="h-7 w-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">SkyBook</h1>
                                <p className="text-white/80 text-sm">E-Ticket / Boarding Pass</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-white/80 text-sm">PNR / Booking Reference</p>
                            <p className="text-3xl font-bold text-white tracking-[0.2em] font-mono">{booking.pnr}</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {/* Passenger & Flight Info */}
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
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 mb-8">
                        <div className="flex items-center justify-between">
                            <div className="text-center">
                                <p className="text-4xl font-bold text-gray-800">{booking.flight?.source}</p>
                                <p className="text-gray-600 mt-2 font-medium">{formatTime(booking.flight?.departure_time)}</p>
                                <p className="text-gray-400 text-sm">{formatDate(booking.flight?.departure_time)}</p>
                            </div>

                            <div className="flex-1 px-8">
                                <div className="flex items-center justify-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent"></div>
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-full shadow-lg">
                                        <Plane className="h-5 w-5 text-white rotate-90" />
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                                </div>
                                <p className="text-center text-gray-500 text-sm mt-3 font-medium">Direct Flight</p>
                            </div>

                            <div className="text-center">
                                <p className="text-4xl font-bold text-gray-800">{booking.flight?.destination}</p>
                                <p className="text-gray-600 mt-2 font-medium">{formatTime(booking.flight?.arrival_time)}</p>
                                <p className="text-gray-400 text-sm">{formatDate(booking.flight?.arrival_time)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        <div className="bg-indigo-50 rounded-xl p-4 text-center">
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
                        <div className="bg-pink-50 rounded-xl p-4 text-center">
                            <p className="text-gray-500 text-sm mb-1">Gate</p>
                            <p className="text-lg font-semibold text-gray-800">TBA</p>
                        </div>
                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-center shadow-lg">
                            <p className="text-white/80 text-sm mb-1">Seat</p>
                            <p className="text-2xl font-bold text-white">{booking.seat_no}</p>
                        </div>
                    </div>

                    {/* Footer Section */}
                    <div className="border-t-2 border-dashed border-gray-200 pt-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-gray-500 text-sm">Amount Paid</p>
                                <p className="text-2xl font-bold text-gray-800">₹{booking.final_price?.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-gray-500 text-sm">Status</p>
                                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-semibold mt-1">
                                        <CheckCircle className="h-4 w-4" />
                                        CONFIRMED
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
        </div>
    );
};

export default ETicket;
