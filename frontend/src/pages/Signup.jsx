import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Phone, Loader2, Plane } from 'lucide-react';
import toast from 'react-hot-toast';

const Signup = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        mobile_no: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const { signup } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            await signup({
                name: formData.name,
                email: formData.email,
                mobile_no: formData.mobile_no || null,
                password: formData.password,
            });
            toast.success('Account created successfully!');
            navigate('/flights');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-8">
            <div className="glass-card rounded-3xl p-10 w-full max-w-md animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Plane className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Account</h1>
                    <p className="text-white/50 mt-3">Start booking flights in minutes</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
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
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">Mobile Number (Optional)</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                type="tel"
                                name="mobile_no"
                                value={formData.mobile_no}
                                onChange={handleChange}
                                className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                placeholder="+1234567890"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">Confirm Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-premium text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                Creating account...
                            </>
                        ) : (
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-white/50 mt-10">
                    Already have an account?{' '}
                    <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Signup;
