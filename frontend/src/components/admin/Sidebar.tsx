import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiCalendar, FiShoppingBag, FiUsers, FiCpu, FiUserCheck } from 'react-icons/fi';

export default function Sidebar() {
    const location = useLocation();
    const currentPath = location.pathname;
    const { user } = useAuth();

    const links = [
        { href: '/admin', label: 'Dashboard', icon: FiGrid },
        { href: '/admin/events', label: 'Events', icon: FiCalendar },
        { href: '/admin/merch', label: 'Merch', icon: FiShoppingBag },
        { href: '/admin/users', label: 'Users', icon: FiUsers },
    ];

    if (user?.role === 'super_coordinator') {
        links.push(
            { href: '/admin/clubs', label: 'Clubs', icon: FiCpu },
            { href: '/admin/coordinators', label: 'Coordinators', icon: FiUserCheck }
        );
    }

    return (
        <aside className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/5 flex-shrink-0 hidden md:block">
            <div className="p-6">
                <Link to="/admin" className="block mb-8">
                    <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-xs">Admin</span>
                        Panel
                    </span>
                </Link>

                <nav className="space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = currentPath === link.href || (link.href !== '/admin' && currentPath.startsWith(link.href));

                        return (
                            <Link key={link.href} to={link.href} className="block">
                                <span
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                    ${isActive
                                            ? 'bg-primary/20 text-primary border border-primary/20 shadow-lg shadow-primary/10'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-gray-500 group-hover:text-white'}`} />
                                    <span className="font-medium">{link.label}</span>
                                </span>
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold border border-white/10">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div>
                        <p className="text-white text-sm font-medium line-clamp-1">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
