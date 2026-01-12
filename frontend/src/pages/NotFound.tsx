
import { Link } from 'react-router-dom';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center px-6">
            <h1 className="text-[150px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent leading-none select-none">
                404
            </h1>
            <div className="relative -mt-12 space-y-6">
                <h2 className="text-3xl font-bold text-white">Page Not Found</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    The page you are looking for doesn't exist or you don't have permission to access it.
                </p>
                <Link
                    to="/"
                    className="inline-block px-8 py-3 bg-white text-black font-bold rounded-xl hover:scale-105 transition-transform"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
}
