import { Link } from 'react-router-dom';
import Dashboard from '../components/admin/Dashboard';
import EventsTable from '../components/admin/EventsTable';
import CollectionChart from '../components/admin/CollectionChart';

import { useAuth } from '../context/AuthContext';

export default function Admin() {
    const { user } = useAuth();
    return (
        <div className="max-w-7xl mx-auto space-y-8 pt-24 pb-12 px-6">
            <h1 className="text-4xl font-bold tracking-tighter text-white">Admin Overview</h1>

            {/* Key Metrics Cards */}
            <Dashboard />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <div className="xl:col-span-2 bg-[#151516] border border-white/5 rounded-[32px] p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Top Revenue Events</h2>
                        <select className="bg-black/40 border border-white/5 rounded-lg text-xs text-gray-400 px-3 py-1.5 focus:outline-none">
                            <option>All Time</option>
                        </select>
                    </div>
                    <CollectionChart />
                </div>

                {/* Quick Actions (Functional) */}
                <div className="xl:col-span-1 space-y-8">
                    <div className="bg-[#151516] border border-white/5 rounded-[32px] p-8 shadow-2xl h-full">
                        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Allow Create only if NOT coordinator */}
                            {user?.role !== 'coordinator' && (
                                <Link to="/admin/events/new" className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                                    <span className="block text-2xl mb-1">📅</span>
                                    <span className="text-sm font-bold text-gray-400 group-hover:text-white">Create Event</span>
                                </Link>
                            )}

                            {/* Restricted Actions */}
                            {(user?.role === 'admin' || user?.role === 'super_coordinator') && (
                                <>
                                    <Link to="/admin/users" className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                                        <span className="block text-2xl mb-1">👥</span>
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-white">Manage Users</span>
                                    </Link>
                                    <Link to="/admin/clubs" className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                                        <span className="block text-2xl mb-1">🏰</span>
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-white">Manage Clubs</span>
                                    </Link>
                                    <Link to="/admin/coordinators" className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left group">
                                        <span className="block text-2xl mb-1">👔</span>
                                        <span className="text-sm font-bold text-gray-400 group-hover:text-white">Coordinators</span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#151516] border border-white/5 rounded-[32px] p-8 shadow-2xl">
                <EventsTable />
            </div>
        </div>
    );
}
