import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, User, LogOut, History, Search, Shield } from 'lucide-react';

const Navbar = () => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                <Plane className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-white font-bold text-xl">SkyBook</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <Link
                            to="/flights"
                            className="text-white/90 hover:text-white flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                        >
                            <Search className="h-4 w-4" />
                            <span>Search Flights</span>
                        </Link>

                        {isAuthenticated ? (
                            <>
                                <Link
                                    to="/bookings"
                                    className="text-white/90 hover:text-white flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    <History className="h-4 w-4" />
                                    <span>My Bookings</span>
                                </Link>
                                {user?.is_admin === 1 && (
                                    <Link
                                        to="/admin"
                                        className="text-white/90 hover:text-white flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all font-semibold bg-white/5 border border-white/10"
                                    >
                                        <Shield className="h-4 w-4 text-purple-200" />
                                        <span>Admin Dashboard</span>
                                    </Link>
                                )}
                                <div className="flex items-center space-x-3">
                                    <div className="flex items-center space-x-2 bg-white/10 px-3 py-2 rounded-lg">
                                        <User className="h-4 w-4 text-white" />
                                        <span className="text-white text-sm">{user?.name}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="text-white/90 hover:text-white flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/login"
                                    className="text-white px-4 py-2 rounded-lg hover:bg-white/10 transition-all"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className="bg-white text-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-white/90 transition-all shadow-lg"
                                >
                                    Sign Up
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

