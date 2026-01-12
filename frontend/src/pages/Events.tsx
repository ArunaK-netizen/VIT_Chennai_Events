import { useState, useEffect, useMemo } from 'react';
import client from '../api/client';
import type { Event } from '../types';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';

export default function Events() {
    const { user } = useAuth();
    const [events, setEvents] = useState<Event[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [eventsRes] = await Promise.all([
                    client.get('/events/')
                ]);

                let regsRes = { data: [] };
                if (user) {
                    try {
                        regsRes = await client.get('/registrations/');
                    } catch (e) {
                        console.log("No registrations found");
                    }
                }

                setEvents(eventsRes.data);
                setRegistrations(regsRes.data || []);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [user]);

    const filteredEvents = useMemo(() => {
        return events
            .filter(event => !event.isHidden) // Filter out hidden events
            // Sort by Pinned First
            .sort((a, b) => {
                if (a.isPinned === b.isPinned) return 0;
                return a.isPinned ? -1 : 1;
            })
            // Then Filter by search
            .filter(event => {
                const searchTermLower = searchTerm.toLowerCase();
                const clubNames = event.clubs.map((c: any) => (typeof c === 'string' ? c : c.name).toLowerCase());

                return searchTerm
                    ? event.name.toLowerCase().includes(searchTermLower) ||
                    clubNames.some(name => name.includes(searchTermLower))
                    : true;
            });
    }, [events, searchTerm]);

    return (
        <div className="min-h-screen bg-black pt-32 pb-20">
            <div className="max-w-[1400px] mx-auto px-6 lg:px-12">

                {/* Header (Apple Style) */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
                    <div>
                        <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">
                            Events.
                        </h1>
                        <p className="text-xl text-gray-500 max-w-md leading-relaxed">
                            Curated workshops, talks, and competitions for the visionaries.
                        </p>
                    </div>

                    {/* Minimal Search */}
                    <div className="w-full md:w-80">
                        <input
                            type="text"
                            placeholder="Find an event..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            // Input styles handled by global CSS reset
                            className="w-full px-5 py-3 h-12 text-sm"
                        />
                    </div>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="py-20 text-center text-gray-500 animate-pulse">Loading catalogue...</div>
                ) : (
                    <>
                        {filteredEvents.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
                                {filteredEvents.map(event => {
                                    const registration = registrations.find((reg: any) => {
                                        const regEventId = typeof reg.event === 'string' ? reg.event : reg.event._id;
                                        return regEventId === event._id;
                                    });
                                    const registrationStatus = registration ? registration.paymentStatus : 'not_registered';
                                    return <EventCard key={event._id} event={event} registrationStatus={registrationStatus} />
                                })}
                            </div>
                        ) : (
                            <div className="py-20 text-center">
                                <p className="text-gray-500">No events found.</p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
