import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import client from '../../api/client';

interface AdminEvent {
    _id: string;
    name: string;
    vitians: number;
    nonVitians: number;
    paid: number;
    unpaid: number;
    registered: number;
    amountCollected: number;
    // New Fields for Controls
    isPinned: boolean;
    isHidden: boolean;
    registrationsOpen: boolean;
}

import { useAuth } from '../../context/AuthContext';
import { toast } from '../../lib/toast';

export default function EventsTable() {
    const { user } = useAuth();
    const [events, setEvents] = useState<AdminEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            const res = await client.get('/admin/events');
            if (res.data.success) {
                setEvents(res.data.data || []);
            } else {
                setEvents([]);
            }
        } catch (error) {
            console.error("Failed to fetch events", error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleToggle = async (id: string, field: string, currentValue: boolean) => {
        const originalEvents = [...events];
        // Optimistic Update
        setEvents(prev => prev.map(e => e._id === id ? { ...e, [field]: !currentValue } : e));

        try {
            await client.patch(`/events/${id}`, { [field]: !currentValue });
            toast.success("Updated successfully");
        } catch (error: any) {
            // Revert
            setEvents(originalEvents);
            toast.error(error.response?.data?.detail || "Update failed");
        }
    };

    const filteredEvents = events.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filter logic for sorting pinned first
    const sortedEvents = [...filteredEvents].sort((a, b) => {
        if (a.isPinned === b.isPinned) return 0;
        return a.isPinned ? -1 : 1;
    });

    if (loading) {
        return <div className="text-center py-10 text-gray-400">Loading events...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header / Actions */}
            <div className="flex md:flex-row flex-col justify-between md:items-center gap-4">
                <h2 className="text-2xl font-bold text-white tracking-tight">Events</h2>

                <div className="flex gap-3">
                    <div className="relative group">
                        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-[#1F1F21] w-full md:w-64 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:bg-[#2C2C2E] transition-colors text-gray-200"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Hide for Coordinators */}
                    {user?.role !== 'coordinator' && (
                        <Link to="/admin/events/new" className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity">
                            <FiPlus />
                            <span>Create</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Detailed List View */}
            <div className="flex flex-col gap-1">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-2 px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                    <div className="col-span-3">Event</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-center">Stats</div>
                    <div className="col-span-2 text-center">Rev</div>
                    <div className="col-span-3 text-right">Actions</div>
                </div>

                {sortedEvents.length === 0 ? (
                    <div className="py-20 text-center text-gray-500">
                        No events found.
                    </div>
                ) : (
                    sortedEvents.map(event => (
                        <div key={event._id} className={`group grid grid-cols-12 gap-2 px-4 py-3 items-center rounded-xl border transition-all duration-200 ${event.isPinned ? 'bg-[#1a1a1c] border-blue-500/30' : 'bg-[#151516]/50 border-transparent hover:border-white/5'}`}>

                            {/* Name & Pin Indicator */}
                            <div className="col-span-3 font-medium text-white flex flex-col justify-center">
                                <Link to={`/admin/events/${event._id}`} className="hover:text-primary transition-colors text-sm font-bold truncate pr-2 flex items-center gap-2" title={event.name}>
                                    {event.isPinned && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 animate-pulse"></span>}
                                    {event.name}
                                </Link>
                                <div className="flex gap-2 mt-1">
                                    {event.isHidden && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-500 uppercase font-bold">Hidden</span>}
                                    {!event.registrationsOpen && <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-500 uppercase font-bold">Regs Closed</span>}
                                </div>
                            </div>

                            {/* Status Toggles */}
                            <div className="col-span-2 flex flex-col gap-1 items-center justify-center">
                                {/* Only Super/Admin can see Pin */}
                                {user?.role !== 'coordinator' && (
                                    <button
                                        onClick={() => handleToggle(event._id, 'isPinned', event.isPinned)}
                                        className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-20 transition-all ${event.isPinned ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-gray-500 hover:bg-white/10'}`}
                                    >
                                        {event.isPinned ? 'Unpin' : 'Pin'}
                                    </button>
                                )}

                                <button
                                    onClick={() => handleToggle(event._id, 'isHidden', event.isHidden)}
                                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-20 transition-all ${event.isHidden ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}`}
                                >
                                    {event.isHidden ? 'Hidden' : 'Visible'}
                                </button>

                                <button
                                    onClick={() => handleToggle(event._id, 'registrationsOpen', event.registrationsOpen)}
                                    className={`text-[10px] uppercase font-bold px-2 py-1 rounded w-20 transition-all ${event.registrationsOpen ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-800 text-gray-500'}`}
                                >
                                    {event.registrationsOpen ? 'Regs Open' : 'Regs Closed'}
                                </button>
                            </div>

                            {/* Quick Stats */}
                            <div className="col-span-2 flex flex-col items-center justify-center">
                                <span className="text-white font-bold text-xs">{event.registered} <span className="text-[9px] text-gray-500 font-normal uppercase">Regs</span></span>
                                <span className="text-gray-400 text-xs">{event.paid} <span className="text-[9px] text-gray-500 font-normal uppercase">Paid</span></span>
                            </div>

                            {/* Revenue */}
                            <div className="col-span-2 text-center text-white font-mono text-sm tracking-tight opacity-80 group-hover:opacity-100">
                                ₹{event.amountCollected.toLocaleString()}
                            </div>

                            {/* Actions */}
                            <div className="col-span-3 flex justify-end items-center gap-2">
                                <Link to={`/admin/events/${event._id}/edit`} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors" title="Edit">
                                    <FiEdit2 size={14} />
                                </Link>
                                <button
                                    onClick={async () => {
                                        if (confirm('Delete?')) {
                                            try {
                                                await client.delete(`/events/${event._id}`);
                                                setEvents(prev => prev.filter(e => e._id !== event._id));
                                            } catch (e) {
                                                console.error(e);
                                                toast.error("Failed to delete");
                                            }
                                        }
                                    }}
                                    className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
