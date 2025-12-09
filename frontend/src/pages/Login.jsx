import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, Plane } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);
            toast.success('Welcome back!');
            navigate('/flights');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="glass-card rounded-3xl p-10 w-full max-w-md animate-fade-in-up">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="relative inline-block mb-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-50"></div>
                        <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center">
                            <Plane className="h-8 w-8 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
                    <p className="text-white/50 mt-3">Sign in to continue booking flights</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full input-premium rounded-xl py-4 px-12 text-white placeholder-white/30 focus:outline-none"
                                placeholder="you@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-white/70 mb-3">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/30" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                Signing in...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-white/50 mt-10">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
