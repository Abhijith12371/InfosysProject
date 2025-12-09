import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Shield, Plane } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="absolute top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-24">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-2.5 rounded-xl">
                                <Plane className="h-6 w-6 text-white" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            Sky<span className="text-gradient-premium">Book</span>
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-8">
                        <Link
                            to="/"
                            className="text-white/70 hover:text-white font-medium transition-colors relative group"
                        >
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>
                        <Link
                            to="/flights"
                            className="text-white/70 hover:text-white font-medium transition-colors relative group"
                        >
                            Flights
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/bookings"
                                    className="text-white/70 hover:text-white font-medium transition-colors relative group"
                                >
                                    My Bookings
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                {user?.is_admin === 1 && (
                                    <Link
                                        to="/admin"
                                        className="text-white/70 hover:text-white font-medium transition-colors flex items-center gap-1.5 relative group"
                                    >
                                        <Shield className="h-4 w-4" />
                                        Admin
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                )}
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-white/10">
                                    <span className="text-white/80 font-medium">{user?.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="text-white/60 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
                                    >
                                        <LogOut className="h-5 w-5" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="ml-4 px-6 py-2.5 rounded-xl font-semibold text-white btn-premium text-sm"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
