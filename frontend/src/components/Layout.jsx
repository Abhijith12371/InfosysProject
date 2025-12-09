import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

import bgImage from '../assets/image.png';

const Layout = () => {
    return (
        <div
            className="min-h-screen bg-cover bg-center bg-fixed"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            {/* Premium Overlay with Gradient */}
            <div className="min-h-screen bg-gradient-to-br from-slate-900/95 via-indigo-950/90 to-slate-900/95">
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'rgba(15, 15, 35, 0.9)',
                            backdropFilter: 'blur(20px)',
                            color: '#fff',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            borderRadius: '1rem',
                            padding: '1rem 1.25rem',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#fff',
                            },
                            style: {
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#fff',
                            },
                            style: {
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                            },
                        },
                    }}
                />
                <Navbar />
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-28">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
