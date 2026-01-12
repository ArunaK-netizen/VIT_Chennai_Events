import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';
import { toast } from '../lib/toast';
import { FiCalendar, FiMapPin, FiUsers, FiDollarSign, FiClock, FiCheck, FiX } from 'react-icons/fi';

export default function EventDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [registrationStatus, setRegistrationStatus] = useState<string>('not_registered');

    // Team Management State
    const [teamEmails, setTeamEmails] = useState<string[]>([]);

    useEffect(() => {
        async function fetchEventDetails() {
            try {
                const res = await client.get(`/events/${id}`);
                setEvent(res.data);

                if (user) {
                    try {
                        const regRes = await client.get('/registrations/');
                        const userReg = regRes.data.find((r: any) => {
                            const regEventId = typeof r.event === 'string' ? r.event : r.event._id;
                            return regEventId === id;
                        });
                        if (userReg) {
                            setRegistrationStatus(userReg.paymentStatus || 'pending');
                        }
                    } catch (e) {
                        console.error("Error fetching registrations", e);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch event details", error);
                toast.error("Failed to load event details");
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchEventDetails();
    }, [id, user]);

    // Team Helpers
    const handleAddTeammate = () => {
        if (!event) return;
        if (teamEmails.length + 1 >= event.groupSizeMax) {
            toast.warning(`Maximum team size is ${event.groupSizeMax}`);
            return;
        }
        setTeamEmails([...teamEmails, ""]);
    };

    const handleEmailChange = (index: number, value: string) => {
        const newEmails = [...teamEmails];
        newEmails[index] = value;
        setTeamEmails(newEmails);
    };

    const handleRemoveTeammate = (index: number) => {
        const newEmails = [...teamEmails];
        newEmails.splice(index, 1);
        setTeamEmails(newEmails);
    };

    const handleRegister = async () => {
        if (!user) {
            toast.info("Please login to register");
            navigate('/login');
            return;
        }

        if (!event) return;

        // Validation
        const validEmails = teamEmails.filter(e => e.trim() !== "");
        const totalMembers = 1 + validEmails.length; // +1 for self

        if (totalMembers < event.groupSizeMin) {
            toast.error(`Minimum team size is ${event.groupSizeMin}. Please add more members.`);
            return;
        }

        try {
            await client.post('/registrations/', {
                event: id,
                teamEmails: validEmails
            });
            setRegistrationStatus('pending');
            toast.success("Successfully registered!");
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Registration failed");
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Loading...</div>;
    if (!event) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Event not found</div>;

    const formatDate = (dateString: string) => {
        if (!dateString) return 'TBA';
        try {
            // Create date object from string (handle both UTC and Local appropriately)
            const date = new Date(dateString);
            // check for invalid date
            if (isNaN(date.getTime())) return dateString; // fallback

            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    };

    const formatTime = (timeString?: string) => {
        if (!timeString) return 'TBA';
        try {
            const [hours, minutes] = timeString.split(':');
            const h = parseInt(hours, 10);
            const m = parseInt(minutes, 10);
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
        } catch (e) {
            return timeString;
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-20 px-6">
            <div className="max-w-7xl mx-auto">

                {/* Back Button */}
                <Link to="/events" className="inline-flex items-center text-gray-500 hover:text-white mb-8 text-xs font-bold tracking-widest uppercase transition-colors">
                    ← Back to Catalogue
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Left Column (Poster & Quick Stats) - Sticky on Desktop */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 space-y-6">
                        {/* Poster */}
                        <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 bg-[#151516] relative shadow-2xl group">
                            {event.poster ? (
                                <img src={event.poster} alt={event.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm font-medium">No Poster Available</div>
                            )}

                            {event.isCollaboration && (
                                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-white">Collaboration</span>
                                </div>
                            )}
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-[#151516] border border-white/5 flex flex-col items-center text-center gap-2">
                                <FiUsers className="text-gray-500" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Team Size</p>
                                    <p className="text-lg font-bold text-white">{event.groupSizeMin === event.groupSizeMax ? event.groupSizeMin : `${event.groupSizeMin}-${event.groupSizeMax}`}</p>
                                </div>
                            </div>
                            <div className="p-4 rounded-xl bg-[#151516] border border-white/5 flex flex-col items-center text-center gap-2">
                                <FiDollarSign className="text-gray-500" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Entry Fee</p>
                                    <p className="text-lg font-bold text-white">{event.fee > 0 ? `₹${event.fee}` : 'Free'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Details & Registration) */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {/* Header Info */}
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-white leading-[1.1]">
                                {event.name}
                            </h1>

                            <div className="flex flex-wrap gap-4 md:gap-8 border-b border-white/10 pb-8">
                                {/* Start Info */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-green-500/10 text-green-400"><FiCalendar /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Starts</p>
                                        <p className="text-sm font-semibold text-white">
                                            {formatDate(event.startDate)}
                                            <span className="text-gray-500 mx-1">•</span>
                                            {formatTime(event.startTime)}
                                        </p>
                                    </div>
                                </div>

                                {/* End Info */}
                                {event.endDate && (
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-red-500/10 text-red-400"><FiClock /></div>
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Ends</p>
                                            <p className="text-sm font-semibold text-white">
                                                {formatDate(event.endDate)}
                                                <span className="text-gray-500 mx-1">•</span>
                                                {formatTime(event.endTime)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Venue */}
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><FiMapPin /></div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Venue</p>
                                        <p className="text-sm font-semibold text-white">{event.venue || "TBA"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">About Event</h3>
                            <div className="prose prose-lg prose-invert text-gray-300 leading-relaxed font-light max-w-none">
                                <p className="whitespace-pre-line">{event.description || "No description provided."}</p>
                            </div>
                        </div>

                        {/* Organizers */}
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Organized By</h3>
                            <div className="flex flex-wrap gap-3">
                                {event.clubs.map((c: any, i) => (
                                    <span key={i} className="px-4 py-2 rounded-lg bg-[#151516] border border-white/10 text-sm font-medium text-white hover:border-white/30 transition-colors">
                                        {typeof c === 'string' ? c : c.name}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Coordinators Contact */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {event.facultyCoordinators && event.facultyCoordinators.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Faculty Coordinators</h3>
                                    <div className="space-y-3">
                                        {event.facultyCoordinators.map((c, i) => (
                                            <div key={i} className="flex flex-col">
                                                <span className="text-white font-medium">{c.name}</span>
                                                {c.phone && <a href={`tel:${c.phone}`} className="text-sm text-gray-400 hover:text-white transition-colors">{c.phone}</a>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {event.studentCoordinators && event.studentCoordinators.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-4">Student Coordinators</h3>
                                    <div className="space-y-3">
                                        {event.studentCoordinators.map((c, i) => (
                                            <div key={i} className="flex flex-col">
                                                <span className="text-white font-medium">{c.name}</span>
                                                {c.phone && <a href={`tel:${c.phone}`} className="text-sm text-gray-400 hover:text-white transition-colors">{c.phone}</a>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Registration Section */}
                        <div className="mt-4 pt-10 border-t border-white/10">
                            <h2 className="text-2xl font-bold text-white mb-6">Registration</h2>

                            {registrationStatus !== 'not_registered' ? (
                                <div className="bg-[#151516] p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center gap-6 justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center text-2xl">
                                            <FiCheck />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">Application Received</h3>
                                            <p className="text-gray-400">Status: <span className="text-white capitalize">{registrationStatus}</span></p>
                                        </div>
                                    </div>
                                    <Link to="/dashboard" className="px-8 py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors whitespace-nowrap">
                                        View Ticket
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-[#151516] p-8 rounded-2xl border border-white/5 shadow-xl">
                                    {event.groupSizeMax > 1 && (
                                        <div className="mb-8 max-w-xl">
                                            <div className="flex justify-between items-center mb-4">
                                                <label className="text-sm font-bold text-gray-400 uppercase tracking-wide">Team Members</label>
                                                <span className="text-xs text-gray-500">{teamEmails.length + 1} / {event.groupSizeMax} Slots Filled</span>
                                            </div>

                                            <div className="space-y-3 mb-4">
                                                {/* Self */}
                                                <div className="flex items-center gap-4 p-4 rounded-xl bg-black/40 border border-white/5">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">ME</div>
                                                    <div className="flex-1">
                                                        <p className="text-xs text-gray-500 font-bold uppercase">Team Leader</p>
                                                        <p className="text-sm text-white font-medium">{user?.email}</p>
                                                    </div>
                                                </div>

                                                {teamEmails.map((email, idx) => (
                                                    <div key={idx} className="flex gap-2">
                                                        <input
                                                            className="flex-1 bg-[#0A0A0A] border-none rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-white/20 placeholder-gray-600"
                                                            placeholder={`Member ${idx + 2} Email`}
                                                            value={email}
                                                            onChange={e => handleEmailChange(idx, e.target.value)}
                                                        />
                                                        <button
                                                            onClick={() => handleRemoveTeammate(idx)}
                                                            className="px-4 text-gray-500 hover:text-red-400 hover:bg-white/5 rounded-xl transition-all"
                                                        >
                                                            <FiX />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>

                                            {teamEmails.length + 1 < event.groupSizeMax && (
                                                <button
                                                    onClick={handleAddTeammate}
                                                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                                                >
                                                    <div className="w-5 h-5 rounded hover:bg-white/20 flex items-center justify-center border border-gray-600">+</div>
                                                    Add Teammate
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-col md:flex-row gap-6 items-center border-t border-white/5 pt-8">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-400 mb-1">Total Fee</p>
                                            <p className="text-3xl font-bold text-white">{event.fee > 0 ? `₹${event.fee}` : 'Free'}</p>
                                        </div>
                                        <button
                                            onClick={handleRegister}
                                            className="w-full md:w-auto px-10 py-4 bg-white text-black font-bold rounded-xl text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-white/10"
                                        >
                                            Complete Registration
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-4 text-center md:text-left">
                                        By clicking register, you agree to the TechnoVIT Code of Conduct.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
