import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, CreditCard, Check, Loader2, Plane, AlertCircle, ArrowRight, PartyPopper } from 'lucide-react';
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
            await bookingAPI.addPassengerInfo(bookingId, passengerInfo);
            toast.success('Passenger information added');

            setBooking(prev => ({
                ...prev,
                passenger_name: passengerInfo.passenger_name,
                passenger_email: passengerInfo.passenger_email,
                status: 'INFO_ADDED'
            }));

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

                setBooking(prev => ({
                    ...prev,
                    pnr: response.data.pnr,
                    status: 'CONFIRMED'
                }));

                setStep(3);
            } else {
                toast.error('Payment failed. Please try again with a different card.');
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
            <div className="flex items-center justify-center gap-4 animate-fade-in-up">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-4">
                        <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg transition-all ${step >= s
                                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'bg-white/5 text-white/30 border border-white/10'
                                }`}
                        >
                            {step > s ? <Check className="h-6 w-6" /> : s}
                        </div>
                        {s < 3 && (
                            <div
                                className={`w-20 h-1 rounded transition-all ${step > s ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-white/10'
                                    }`}
                            ></div>
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-center gap-14 text-sm font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <span className={step >= 1 ? 'text-indigo-400' : 'text-white/30'}>Passenger Info</span>
                <span className={step >= 2 ? 'text-indigo-400' : 'text-white/30'}>Payment</span>
                <span className={step >= 3 ? 'text-indigo-400' : 'text-white/30'}>Confirmation</span>
            </div>

            {/* Flight Summary */}
            <div className="glass-card rounded-2xl p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center">
                        <Plane className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-white font-semibold">{booking.flight?.airline}</p>
                                <p className="text-white/40 text-sm">{booking.flight?.flight_number}</p>
                            </div>
                            <ArrowRight className="text-white/30" />
                            <div>
                                <p className="text-white">{booking.flight?.source} → {booking.flight?.destination}</p>
                                <p className="text-white/40 text-sm">Seat {booking.seat_no}</p>
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
                <div className="glass-card rounded-3xl p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                            <User className="h-6 w-6 text-white" />
                        </div>
                        Passenger Information
                    </h2>

                    <form onSubmit={handlePassengerSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-3">Full Name (as per ID)</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                <input
                                    type="text"
                                    value={passengerInfo.passenger_name}
                                    onChange={(e) => setPassengerInfo({ ...passengerInfo, passenger_name: e.target.value })}
                                    required
                                    className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-3">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                <input
                                    type="email"
                                    value={passengerInfo.passenger_email}
                                    onChange={(e) => setPassengerInfo({ ...passengerInfo, passenger_email: e.target.value })}
                                    required
                                    className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                    placeholder="john@example.com"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full btn-premium text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 disabled:opacity-50"
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
                <div className="glass-card rounded-3xl p-8 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-xl font-bold text-white mb-8 flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                            <CreditCard className="h-6 w-6 text-white" />
                        </div>
                        Payment Details
                    </h2>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400" />
                        <p className="text-amber-200 text-sm">This is a simulated payment. Use any 16-digit card number.</p>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-3">Card Number</label>
                            <div className="relative">
                                <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                                <input
                                    type="text"
                                    value={paymentInfo.card_number}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, card_number: e.target.value.replace(/\D/g, '').slice(0, 16) })}
                                    required
                                    maxLength={16}
                                    className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none font-mono tracking-wider"
                                    placeholder="4111 1111 1111 1111"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-white/70 mb-3">Month</label>
                                <select
                                    value={paymentInfo.expiry_month}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry_month: e.target.value })}
                                    required
                                    className="w-full input-premium rounded-xl py-4 px-4 text-white focus:outline-none appearance-none cursor-pointer bg-slate-800/50"
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
                                <label className="block text-sm font-medium text-white/70 mb-3">Year</label>
                                <select
                                    value={paymentInfo.expiry_year}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, expiry_year: e.target.value })}
                                    required
                                    className="w-full input-premium rounded-xl py-4 px-4 text-white focus:outline-none appearance-none cursor-pointer bg-slate-800/50"
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
                                <label className="block text-sm font-medium text-white/70 mb-3">CVV</label>
                                <input
                                    type="password"
                                    value={paymentInfo.cvv}
                                    onChange={(e) => setPaymentInfo({ ...paymentInfo, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                                    required
                                    maxLength={4}
                                    className="w-full input-premium rounded-xl py-4 px-4 text-white placeholder-white/30 focus:outline-none font-mono"
                                    placeholder="123"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full btn-premium text-white py-5 rounded-xl font-semibold flex items-center justify-center gap-3 disabled:opacity-50 text-lg"
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
                <div className="glass-card rounded-3xl p-10 text-center border-emerald-500/30 animate-scale-in">
                    <div className="relative inline-block mb-8">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 w-24 h-24 rounded-full flex items-center justify-center">
                            <Check className="h-12 w-12 text-white" />
                        </div>
                    </div>

                    <h2 className="text-4xl font-bold text-white mb-3">Booking Confirmed!</h2>
                    <p className="text-white/50 mb-8">Your flight has been booked successfully</p>

                    <div className="inline-block bg-white/10 rounded-2xl px-10 py-6 mb-8">
                        <p className="text-white/50 text-sm mb-2">Your PNR</p>
                        <p className="text-5xl font-bold text-white tracking-[0.3em] font-mono">{booking.pnr}</p>
                    </div>

                    <div className="space-y-3 text-left max-w-sm mx-auto glass-card rounded-2xl p-6">
                        <div className="flex justify-between">
                            <span className="text-white/50">Flight</span>
                            <span className="text-white font-medium">{booking.flight?.flight_number}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Route</span>
                            <span className="text-white font-medium">{booking.flight?.source} → {booking.flight?.destination}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Seat</span>
                            <span className="text-white font-medium">{booking.seat_no}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-white/50">Passenger</span>
                            <span className="text-white font-medium">{booking.passenger_name}</span>
                        </div>
                        <div className="flex justify-between pt-3 border-t border-white/10">
                            <span className="text-white/50">Total Paid</span>
                            <span className="text-white font-bold text-lg">₹{booking.final_price?.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/bookings')}
                        className="mt-10 btn-glass text-white px-10 py-4 rounded-xl font-semibold"
                    >
                        View All Bookings
                    </button>
                </div>
            )}
        </div>
    );
};

export default BookingFlow;
