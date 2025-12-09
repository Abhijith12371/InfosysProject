import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard, Users, Plane, Calendar, DollarSign, TrendingUp,
    Package, AlertCircle, Check, X, Loader2, ChevronRight, RefreshCw
} from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [flights, setFlights] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchStats();
    }, [isAuthenticated]);

    useEffect(() => {
        if (activeTab === 'bookings') fetchBookings();
        if (activeTab === 'users') fetchUsers();
        if (activeTab === 'flights') fetchFlights();
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const response = await adminAPI.getStats();
            setStats(response.data);
        } catch (error) {
            if (error.response?.status === 403) {
                toast.error('Admin access required');
                navigate('/');
            } else {
                toast.error('Failed to load dashboard');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const response = await adminAPI.getAllBookings();
            setBookings(response.data);
        } catch (error) {
            toast.error('Failed to load bookings');
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await adminAPI.getUsers();
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to load users');
        }
    };

    const fetchFlights = async () => {
        try {
            const response = await adminAPI.getFlights();
            setFlights(response.data);
        } catch (error) {
            toast.error('Failed to load flights');
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        if (activeTab === 'bookings') await fetchBookings();
        if (activeTab === 'users') await fetchUsers();
        if (activeTab === 'flights') await fetchFlights();
        setRefreshing(false);
        toast.success('Data refreshed');
    };

    const handleToggleAdmin = async (userId) => {
        try {
            await adminAPI.toggleUserAdmin(userId);
            toast.success('Admin status updated');
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update');
        }
    };

    const handleUpdateBookingStatus = async (bookingId, status) => {
        try {
            await adminAPI.updateBookingStatus(bookingId, status);
            toast.success('Booking status updated');
            fetchBookings();
            fetchStats();
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to update');
        }
    };

    const formatDateTime = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getStatusColor = (status) => {
        const colors = {
            PENDING: 'bg-yellow-500/20 text-yellow-400',
            INFO_ADDED: 'bg-blue-500/20 text-blue-400',
            CONFIRMED: 'bg-green-500/20 text-green-400',
            CANCELLED: 'bg-red-500/20 text-red-400',
            FAILED: 'bg-gray-500/20 text-gray-400',
        };
        return colors[status] || colors.PENDING;
    };

    if (loading) {
        return <LoadingSpinner text="Loading admin dashboard..." />;
    }

    if (!stats) {
        return (
            <div className="text-center py-12">
                <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-2xl text-white font-semibold">Access Denied</h2>
                <p className="text-gray-400 mt-2">You don't have admin privileges.</p>
            </div>
        );
    }

    const tabs = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'bookings', label: 'Bookings', icon: Calendar },
        { id: 'flights', label: 'Flights', icon: Plane },
        { id: 'users', label: 'Users', icon: Users },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400">Manage flights, bookings, and users</p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="bg-white/10 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/20 transition-all disabled:opacity-50"
                >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10 pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-400 hover:bg-white/10'
                            }`}
                    >
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div className="space-y-6">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-purple-600/20 to-purple-600/5 rounded-2xl p-6 border border-purple-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-purple-500/20 p-2 rounded-lg">
                                    <Users className="h-5 w-5 text-purple-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Total Users</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.total_users}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600/20 to-blue-600/5 rounded-2xl p-6 border border-blue-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-blue-500/20 p-2 rounded-lg">
                                    <Plane className="h-5 w-5 text-blue-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Total Flights</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.total_flights}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-600/20 to-green-600/5 rounded-2xl p-6 border border-green-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-green-500/20 p-2 rounded-lg">
                                    <Check className="h-5 w-5 text-green-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Confirmed Bookings</span>
                            </div>
                            <p className="text-3xl font-bold text-white">{stats.confirmed_bookings}</p>
                        </div>

                        <div className="bg-gradient-to-br from-pink-600/20 to-pink-600/5 rounded-2xl p-6 border border-pink-500/20">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="bg-pink-500/20 p-2 rounded-lg">
                                    <DollarSign className="h-5 w-5 text-pink-400" />
                                </div>
                                <span className="text-gray-400 text-sm">Total Revenue</span>
                            </div>
                            <p className="text-3xl font-bold text-white">₹{stats.total_revenue?.toLocaleString()}</p>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">Booking Summary</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Bookings</span>
                                    <span className="text-white font-semibold">{stats.total_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Pending</span>
                                    <span className="text-yellow-400 font-semibold">{stats.pending_bookings}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Confirmed</span>
                                    <span className="text-green-400 font-semibold">{stats.confirmed_bookings}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
                            <div className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('bookings')}
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-gray-300"
                                >
                                    <span>View All Bookings</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => setActiveTab('flights')}
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all text-gray-300"
                                >
                                    <span>Manage Flights</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Bookings Tab */}
            {activeTab === 'bookings' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">PNR</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Flight</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Passenger</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Seat</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Amount</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Status</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bookings.map((b) => (
                                    <tr key={b.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 text-white font-mono">{b.pnr || '—'}</td>
                                        <td className="px-6 py-4 text-white">{b.flight?.flight_number}</td>
                                        <td className="px-6 py-4 text-gray-300">{b.passenger_name || '—'}</td>
                                        <td className="px-6 py-4 text-white">{b.seat_no}</td>
                                        <td className="px-6 py-4 text-white">₹{b.final_price?.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(b.status)}`}>
                                                {b.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {b.status !== 'CANCELLED' && b.status !== 'CONFIRMED' && (
                                                <button
                                                    onClick={() => handleUpdateBookingStatus(b.id, 'CONFIRMED')}
                                                    className="text-green-400 hover:text-green-300 text-sm mr-2"
                                                >
                                                    Confirm
                                                </button>
                                            )}
                                            {b.status !== 'CANCELLED' && (
                                                <button
                                                    onClick={() => handleUpdateBookingStatus(b.id, 'CANCELLED')}
                                                    className="text-red-400 hover:text-red-300 text-sm"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Flights Tab */}
            {activeTab === 'flights' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Flight</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Route</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Departure</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Price</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Seats</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Bookings</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {flights.map((f) => (
                                    <tr key={f.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4">
                                            <p className="text-white font-semibold">{f.flight_number}</p>
                                            <p className="text-gray-400 text-sm">{f.airline}</p>
                                        </td>
                                        <td className="px-6 py-4 text-white">{f.source} → {f.destination}</td>
                                        <td className="px-6 py-4 text-gray-300">{formatDateTime(f.departure_time)}</td>
                                        <td className="px-6 py-4 text-white">₹{f.base_price?.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-white">{f.available_seats}/{f.total_seats}</td>
                                        <td className="px-6 py-4 text-purple-400">{f.bookings_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-white/5">
                                <tr>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Name</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Email</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Mobile</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Bookings</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Role</th>
                                    <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-white/5">
                                        <td className="px-6 py-4 text-white font-semibold">{u.name}</td>
                                        <td className="px-6 py-4 text-gray-300">{u.email}</td>
                                        <td className="px-6 py-4 text-gray-400">{u.mobile_no || '—'}</td>
                                        <td className="px-6 py-4 text-purple-400">{u.booking_count}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs ${u.is_admin ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                {u.is_admin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleAdmin(u.id)}
                                                className="text-purple-400 hover:text-purple-300 text-sm"
                                            >
                                                {u.is_admin ? 'Remove Admin' : 'Make Admin'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
