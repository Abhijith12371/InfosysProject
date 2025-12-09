import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in-up">
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-full">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
            </div>
            <p className="text-white/50 mt-6 font-medium">{text}</p>
        </div>
    );
};

export default LoadingSpinner;
