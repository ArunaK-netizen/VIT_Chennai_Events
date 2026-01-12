import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiCalendar, FiShoppingBag, FiUsers, FiCpu, FiUserCheck } from 'react-icons/fi';

export default function AdminNavbar() {
    const location = useLocation();
    const currentPath = location.pathname;
    const { user } = useAuth(); // Assuming logout availability, or just link to generic logout

    const links = [
        { href: '/admin', label: 'Overview', icon: FiGrid },
        { href: '/admin/events', label: 'Events', icon: FiCalendar },
        { href: '/admin/merch', label: 'Merch', icon: FiShoppingBag },
    ];

    if (user?.role === 'super_coordinator' || user?.role === 'admin') {
        links.push(
            { href: '/admin/users', label: 'Users', icon: FiUsers },
            { href: '/admin/clubs', label: 'Clubs', icon: FiCpu },
            { href: '/admin/coordinators', label: 'Coords', icon: FiUserCheck }
        );
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 pt-4 px-4 flex justify-center pointer-events-none">
            {/* 
                Structure:
                We use a "Dynamic Island" style floating pill.
                pointer-events-auto is needed on the pill itself since parent is none.
            */}

            <nav className="pointer-events-auto bg-[#151516]/80 backdrop-blur-xl border border-white/10 rounded-full px-2 py-2 flex items-center shadow-2xl shadow-black/50">

                {/* Logo / Label */}
                <Link to="/admin" className="px-4 py-2 mr-2 flex items-center gap-2 group">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">A</span>
                    </div>
                    <span className="text-sm font-semibold text-white group-hover:text-primary transition-colors">Admin</span>
                </Link>

                {/* Divider */}
                <div className="w-px h-6 bg-white/10 mx-2"></div>

                {/* Links */}
                <div className="flex items-center gap-1">
                    {links.map((link) => {
                        const isActive = currentPath === link.href || (link.href !== '/admin' && currentPath.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={`px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 ${isActive
                                    ? 'bg-white text-black font-bold shadow-lg shadow-white/10'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        )
                    })}
                </div>

                {/* User / Exit */}
                <div className="w-px h-6 bg-white/10 mx-4"></div>

                <div className="flex items-center pr-2">
                    <Link to="/dashboard" className="w-8 h-8 rounded-full bg-[#1F1F21] border border-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Exit to App">
                        <span className="text-xs">✕</span>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
