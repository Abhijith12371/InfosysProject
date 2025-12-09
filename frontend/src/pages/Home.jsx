import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[85vh] relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating Orbs */}
                <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }}></div>
                <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/15 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Hero Content */}
            <div className="w-full max-w-5xl px-4 flex flex-col items-center text-center relative z-10">
                {/* Badge */}
                <div className="animate-fade-in-up mb-8" style={{ animationDelay: '0.1s' }}>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-purple-300 border border-purple-500/20">
                        <Sparkles className="w-4 h-4 text-purple-400" />
                        <span>Next-Gen Flight Booking Experience</span>
                    </div>
                </div>

                {/* Main Heading */}
                <h1
                    className="text-6xl md:text-8xl lg:text-9xl font-black text-white mb-8 tracking-tight animate-fade-in-up"
                    style={{
                        animationDelay: '0.2s',
                        textShadow: '0 0 80px rgba(99, 102, 241, 0.5)'
                    }}
                >
                    Travel
                    <br />
                    <span className="text-gradient-premium animate-gradient bg-clip-text">
                        Without Limits
                    </span>
                </h1>

                {/* Subtitle */}
                <p
                    className="text-xl md:text-2xl text-white/70 font-light max-w-2xl mb-14 leading-relaxed animate-fade-in-up"
                    style={{ animationDelay: '0.4s' }}
                >
                    Book flights instantly with real-time dynamic pricing.
                    Secure, seamless, and designed for the modern traveler.
                </p>

                {/* CTA Buttons */}
                <div
                    className="flex flex-col sm:flex-row gap-5 animate-fade-in-up"
                    style={{ animationDelay: '0.6s' }}
                >
                    <button
                        onClick={() => navigate('/flights')}
                        className="group relative px-10 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden btn-premium"
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            Book Your Flight
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>

                    <button
                        onClick={() => navigate('/flights')}
                        className="px-10 py-5 rounded-2xl font-bold text-lg text-white btn-glass"
                    >
                        Explore Destinations
                    </button>
                </div>

                {/* Stats Row */}
                <div
                    className="flex flex-wrap justify-center gap-12 mt-20 animate-fade-in-up"
                    style={{ animationDelay: '0.8s' }}
                >
                    <div className="text-center">
                        <p className="text-4xl md:text-5xl font-bold text-white text-glow">500+</p>
                        <p className="text-white/50 mt-2">Daily Flights</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl md:text-5xl font-bold text-white text-glow">50K+</p>
                        <p className="text-white/50 mt-2">Happy Travelers</p>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl md:text-5xl font-bold text-white text-glow">99%</p>
                        <p className="text-white/50 mt-2">On-Time Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
