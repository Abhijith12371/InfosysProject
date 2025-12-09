import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, CreditCard, Check, Loader2, Plane, AlertCircle, ArrowRight } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const BookingFlow = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(1);
    const [processing, setProcessing] = useState(false);

    const [passengerInfo, setPassengerInfo] = useState({
        passenger_name: '',
        passenger_email: '',
    });

    const [paymentInfo, setPaymentInfo] = useState({
        card_number: '',
        expiry_month: '',
        expiry_year: '',
        cvv: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchBooking();
    }, [bookingId, isAuthenticated]);

    const fetchBooking = async () => {
        try {
            const response = await bookingAPI.getBookingHistory();
            const currentBooking = response.data.bookings.find((b) => b.id === bookingId);
            if (!currentBooking) {
                toast.error('Booking not found');
                navigate('/flights');
                return;
            }
            setBooking(currentBooking);

            // Set step based on status
            if (currentBooking.status === 'INFO_ADDED') {
                setStep(2);
            } else if (currentBooking.status === 'CONFIRMED') {
                setStep(3);
            }
        } catch (error) {
            toast.error('Failed to load booking');
            navigate('/flights');
        } finally {
            setLoading(false);
        }
    };

    const handlePassengerSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await bookingAPI.addPassengerInfo(bookingId, passengerInfo);
            toast.success('Passenger information added');

            // Update local booking state immediately
            setBooking(prev => ({
                ...prev,
                passenger_name: passengerInfo.passenger_name,
                passenger_email: passengerInfo.passenger_email,
                status: 'INFO_ADDED'
            }));

            // Move to payment step
            setStep(2);
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to add passenger info');
        } finally {
            setProcessing(false);
        }
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setProcessing(true);

        try {
            const response = await bookingAPI.processPayment(bookingId, {
                card_number: paymentInfo.card_number,
                expiry_month: parseInt(paymentInfo.expiry_month),
                expiry_year: parseInt(paymentInfo.expiry_year),
                cvv: paymentInfo.cvv,
            });

            if (response.data.payment_status === 'SUCCESS') {
                toast.success(`Booking confirmed! PNR: ${response.data.pnr}`);

                // Update local booking state with confirmation details
                setBooking(prev => ({
                    ...prev,
                    pnr: response.data.pnr,
                    status: 'CONFIRMED'
                }));

                setStep(3);
            } else {
                toast.error('Payment failed. Please try again with a different card.');
                // Refresh booking to get updated status
                fetchBooking();
            }
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Payment processing failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading booking..." />;
    }

    if (!booking) {
        return null;
    }

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            {/* Progress Steps */}
            <div className="flex items-center justify-center gap-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${step >= s
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                                : 'bg-white/10 text-gray-500'
                                }`}
                        >
                            {step > s ? <Check className="h-5 w-5" /> : s}
                        </div>
                        {s < 3 && (
                            <div
                                className={`w-24 h-1 rounded ${step > s ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-white/10'
                                    }`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-16 text-sm">
                <span className={step >= 1 ? 'text-purple-400' : 'text-gray-500'}>Passenger Info</span>
                <span className={step >= 2 ? 'text-purple-400' : 'text-gray-500'}>Payment</span>
                <span className={step >= 3 ? 'text-purple-400' : 'text-gray-500'}>Confirmation</span>
            </div>

            {/* Flight Summary */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Plane className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-white font-semibold">{booking.flight?.airline}</p>
                                <p className="text-gray-400 text-sm">{booking.flight?.flight_number}</p>
                            </div>
                            <ArrowRight className="text-gray-500" />
                            <div>
                                <p className="text-white">{booking.flight?.source} → {booking.flight?.destination}</p>
                                <p className="text-gray-400 text-sm">Seat {booking.seat_no}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-white">₹{booking.final_price?.toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Step 1: Passenger Info */}
            {step === 1 && booking.status === 'PENDING' && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <User className="h-6 w-6 text-purple-400" />
                        Passenger Information
                    </h2>

                    <form onSubmit={handlePassengerSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Full Name (as per ID)</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={passengerInfo.passenger_name}
                                    onChange={(e) => setPassengerInfo({ ...passengerInfo, passenger_name: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={passengerInfo.passenger_email}
                                    onChange={(e) => setPassengerInfo({ ...passengerInfo, passenger_email: e.target.value })}
                                    required
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Continue to Payment'
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (booking.status === 'PENDING' || booking.status === 'INFO_ADDED') && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                        <CreditCard className="h-6 w-6 text-purple-400" />
                        Payment Details
                    </h2>

                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                        <p className="text-yellow-200 text-sm">This is a simulated payment. Use any 16-digit card number.</p>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={paymentInfo.card_number}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, card_number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                    required
                                    maxLength={16}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="4111 1111 1111 1111"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                                <select
                                    value={paymentInfo.expiry_month}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry_month: e.target.value })}
                                    required
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-slate-800">MM</option>
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i + 1} value={i + 1} className="bg-slate-800">
                                            {String(i + 1).padStart(2, '0')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                                <select
                                    value={paymentInfo.expiry_year}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry_year: e.target.value })}
                                    required
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                                >
                                    <option value="" className="bg-slate-800">YYYY</option>
                                    {[2025, 2026, 2027, 2028, 2029, 2030].map((year) => (
                                        <option key={year} value={year} className="bg-slate-800">
                                            {year}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">CVV</label>
                                <input
                                    type="password"
                                    value={paymentInfo.cvv}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                    required
                                    maxLength={4}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing Payment...
                                </>
                            ) : (
                                `Pay ₹${booking.final_price?.toLocaleString()}`
                            )}
                        </button>
                    </form>
                </div>
            )}

            {/* Step 3: Confirmation */}
            {(step === 3 || booking.status === 'CONFIRMED') && (
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-8 border border-green-500/30 text-center">
                    <div className="bg-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-white" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed! 🎉</h2>
                    <p className="text-gray-300 mb-6">Your flight has been booked successfully</p>

                    <div className="bg-white/10 rounded-xl p-6 mb-6 inline-block">
                        <p className="text-gray-400 text-sm mb-1">Your PNR</p>
                        <p className="text-4xl font-bold text-white tracking-widest">{booking.pnr}</p>
                    </div>

                    <div className="space-y-2 text-left max-w-sm mx-auto bg-white/5 rounded-xl p-6">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Flight</span>
                            <span className="text-white">{booking.flight?.flight_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Route</span>
                            <span className="text-white">{booking.flight?.source} → {booking.flight?.destination}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Seat</span>
                            <span className="text-white">{booking.seat_no}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Passenger</span>
                            <span className="text-white">{booking.passenger_name}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-white/10">
                            <span className="text-gray-400">Total Paid</span>
                            <span className="text-white font-bold">₹{booking.final_price?.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/bookings')}
                        className="mt-8 bg-white text-purple-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                    >
                        View All Bookings
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingFlow;
