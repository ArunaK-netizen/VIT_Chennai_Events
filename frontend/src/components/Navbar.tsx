import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMenu, FiX } from 'react-icons/fi';
import Button from './ui/Button';

export default function Navbar() {
    const { user, logout, loading } = useAuth();
    const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!isMobileMenuOpen);
    };

    const navLinks = [
        { name: 'Events', path: '/events' },
        { name: 'Merch', path: '/merch' },
    ];

    if (user?.role && ['coordinator', 'super_coordinator', 'admin'].includes(user.role)) {
        navLinks.push({ name: 'Admin', path: '/admin' });
    }

    return (
        <>
            <div className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
                <header
                    className={`w-full max-w-5xl transition-all duration-300 rounded-full border ${scrolled || isMobileMenuOpen
                        ? 'bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl shadow-black/20'
                        : 'bg-slate-900/60 backdrop-blur-md border-white/5'
                        }`}
                >
                    <div className="px-6 relative">
                        <div className="flex items-center justify-between h-16">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <Link to="/" className="text-2xl font-bold font-heading tracking-tight group flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
                                        T
                                    </div>
                                    <span className="text-white hidden sm:block">Techno<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">VIT</span></span>
                                </Link>
                            </div>

                            {/* Desktop Navigation */}
                            <nav className="hidden md:flex items-center space-x-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${location.pathname === link.path
                                            ? 'bg-white/10 text-white shadow-inner'
                                            : 'text-gray-300 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>

                            {/* Desktop Actions */}
                            <div className="hidden md:flex items-center space-x-3">
                                {loading ? (
                                    <div className="w-24 h-10 bg-white/10 rounded-full animate-pulse"></div>
                                ) : user ? (
                                    <>
                                        <Link to="/dashboard" className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors" title="Dashboard">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                                        </Link>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={logout}
                                            className="rounded-full border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/40 hover:text-white px-5"
                                        >
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <Link to="/login">
                                        <Button variant="primary" size="sm" className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40">
                                            Sign In
                                        </Button>
                                    </Link>
                                )}
                            </div>

                            {/* Mobile Menu Button */}
                            <div className="md:hidden flex items-center">
                                <button
                                    onClick={toggleMobileMenu}
                                    className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    {isMobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={() => setMobileMenuOpen(false)}
            />

            {/* Mobile Menu Panel */}
            <div
                className={`fixed top-24 left-4 right-4 z-50 md:hidden bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-top ${isMobileMenuOpen
                    ? 'opacity-100 scale-100 translate-y-0'
                    : 'opacity-0 scale-95 -translate-y-4 pointer-events-none'
                    }`}
            >
                <div className="p-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${location.pathname === link.path
                                ? 'bg-primary/20 text-primary border border-primary/20'
                                : 'text-gray-300 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {link.name}
                        </Link>
                    ))}
                    <div className="h-px bg-white/10 my-2 mx-2"></div>
                    {user ? (
                        <div className="grid grid-cols-2 gap-3">
                            <Link to="/dashboard" className="flex items-center justify-center px-4 py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors">
                                Dashboard
                            </Link>
                            <button onClick={logout} className="flex items-center justify-center px-4 py-3 rounded-xl border border-white/10 text-gray-300 font-medium hover:bg-white/5 hover:text-white transition-colors">
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="block">
                            <Button variant="primary" className="w-full justify-center rounded-xl py-3 shadow-lg shadow-primary/20">Sign In</Button>
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
