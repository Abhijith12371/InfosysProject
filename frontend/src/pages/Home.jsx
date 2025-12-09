import { Link } from 'react-router-dom';
import { Plane, Search, CreditCard, CheckCircle, Zap, Shield, Clock } from 'lucide-react';

const Home = () => {
    return (
        <div className="space-y-16">
            {/* Hero Section */}
            <section className="text-center py-16">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Plane className="h-96 w-96 text-purple-500" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                            Book Your Flight
                            <span className="block bg-gradient-to-r from-purple-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                                In Seconds
                            </span>
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                            Experience seamless flight booking with dynamic pricing, instant confirmations,
                            and a beautiful interface designed for the modern traveler.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/flights"
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
                            >
                                <Search className="h-5 w-5" />
                                Search Flights
                            </Link>
                            <Link
                                to="/signup"
                                className="bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all border border-white/20 flex items-center justify-center gap-2"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="grid md:grid-cols-3 gap-8">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all group">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Zap className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Dynamic Pricing</h3>
                    <p className="text-gray-400">
                        Real-time price adjustments based on demand, availability, and timing.
                        Get the best deals on your flights.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all group">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Shield className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Secure Booking</h3>
                    <p className="text-gray-400">
                        Concurrency-safe seat reservations ensure your booking is protected.
                        No double bookings, guaranteed.
                    </p>
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all group">
                    <div className="bg-gradient-to-br from-orange-500 to-red-500 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <Clock className="h-7 w-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">Instant Confirmation</h3>
                    <p className="text-gray-400">
                        Get your unique PNR instantly after booking.
                        Check your booking status anytime, anywhere.
                    </p>
                </div>
            </section>

            {/* How It Works */}
            <section className="bg-white/5 backdrop-blur-sm rounded-3xl p-12 border border-white/10">
                <h2 className="text-3xl font-bold text-white text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-4 gap-8">
                    <div className="text-center">
                        <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <Search className="h-8 w-8 text-purple-400" />
                            <span className="absolute -top-2 -right-2 bg-purple-600 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center">1</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Search Flights</h4>
                        <p className="text-gray-400 text-sm">Find flights by source, destination, and date</p>
                    </div>

                    <div className="text-center">
                        <div className="bg-pink-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <Plane className="h-8 w-8 text-pink-400" />
                            <span className="absolute -top-2 -right-2 bg-pink-600 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center">2</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Select Seat</h4>
                        <p className="text-gray-400 text-sm">Choose your preferred seat on the flight</p>
                    </div>

                    <div className="text-center">
                        <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <CreditCard className="h-8 w-8 text-orange-400" />
                            <span className="absolute -top-2 -right-2 bg-orange-600 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center">3</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Pay Securely</h4>
                        <p className="text-gray-400 text-sm">Complete payment with our secure gateway</p>
                    </div>

                    <div className="text-center">
                        <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <CheckCircle className="h-8 w-8 text-green-400" />
                            <span className="absolute -top-2 -right-2 bg-green-600 text-white w-6 h-6 rounded-full text-sm flex items-center justify-center">4</span>
                        </div>
                        <h4 className="text-white font-semibold mb-2">Get PNR</h4>
                        <p className="text-gray-400 text-sm">Receive instant booking confirmation</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="text-center py-12">
                <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-3xl p-12 border border-purple-500/30">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Fly?</h2>
                    <p className="text-gray-300 mb-8 max-w-xl mx-auto">
                        Join thousands of travelers who trust SkyBook for their flight bookings.
                    </p>
                    <Link
                        to="/flights"
                        className="inline-flex items-center gap-2 bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all"
                    >
                        <Search className="h-5 w-5" />
                        Start Searching
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Home;
