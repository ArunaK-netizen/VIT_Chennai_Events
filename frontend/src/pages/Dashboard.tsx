import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import type { Registration, Event } from '../types';
import { Link } from 'react-router-dom';
import { toast } from '../lib/toast';
import { FiCreditCard, FiTag } from 'react-icons/fi';
import TicketCard from '../components/TicketCard';

export default function Dashboard() {
    const { user } = useAuth();
    const [myRegistrations, setMyRegistrations] = useState<Registration[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);

    const fetchRegistrations = async () => {
        try {
            const res = await client.get('/registrations/');
            const allRegistrations: Registration[] = res.data;

            const myRegs = allRegistrations.filter(reg =>
                reg.teamMembers?.some(member => member._id === user?._id)
            );
            setMyRegistrations(myRegs);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchRegistrations();
    }, [user]);

    const handlePay = async (regId: string) => {
        try {
            await client.post(`/registrations/${regId}/pay`);
            toast.success("Payment confirmed");
            fetchRegistrations();
        } catch (e: any) {
            toast.error(e.response?.data?.detail || "Payment Failed");
        }
    };

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-gray-500">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-12 px-6 max-w-7xl mx-auto">
            <div className="mb-12">
                <h1 className="text-4xl font-bold tracking-tight mb-2">Command Center</h1>
                <p className="text-gray-500">Welcome back, {(user?.name || 'Member').split(' ')[0]}.</p>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Profile Widget */}
                <div className="bg-[#151516] p-8 rounded-[32px] border border-white/5 flex flex-col justify-between h-80 group hover:border-white/10 transition-colors">
                    <div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#2C2C2E] to-black border border-white/5 flex items-center justify-center text-2xl font-bold text-gray-300 mb-6">
                            {(user?.name || 'M').charAt(0)}
                        </div>
                        <h2 className="text-2xl font-bold mt-1 text-white">{user?.name || 'Member'}</h2>
                        <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                    </div>
                    <div>
                        <span className="inline-block px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-400 border border-white/5 uppercase tracking-wide">
                            {user?.role === 'user' ? 'Student Account' : user?.role.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* My Events Widget */}
                <div className="md:col-span-2 bg-[#151516] p-8 rounded-[32px] border border-white/5 min-h-80 overflow-hidden relative group">
                    <span className="text-xs font-bold text-gray-500 uppercase block mb-6 tracking-widest z-10 relative">My Tickets</span>

                    {myRegistrations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                            {myRegistrations.map(reg => {
                                const event = reg.event as Event;
                                const isPaid = reg.paymentStatus === 'paid';

                                return (
                                    <div key={reg._id} className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-all group/card">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-white text-lg leading-tight">{event.name}</h3>
                                                <p className="text-xs text-gray-400 mt-1">{event.startDate ? new Date(event.startDate).toLocaleDateString() : 'Date TBA'}</p>
                                            </div>
                                            {isPaid ? (
                                                <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Active</span>
                                            ) : (
                                                <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-1 rounded uppercase">Unpaid</span>
                                            )}
                                        </div>

                                        <div className="flex gap-2 mt-4">
                                            {isPaid ? (
                                                <button
                                                    onClick={() => setSelectedTicket(reg)}
                                                    className="flex-1 bg-white text-black py-2 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                                                >
                                                    <FiTag size={14} />
                                                    VIEW TICKET
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handlePay(reg._id)}
                                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300"></div>
                                                    <FiCreditCard size={14} />
                                                    <span>PAY ₹{event.fee}</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-600 text-sm relative z-10">
                            <p className="mb-4">No active events.</p>
                            <Link to="/events" className="px-5 py-2 bg-white text-black text-xs font-bold rounded-full hover:opacity-90 transition-opacity">
                                Browse Catalogue
                            </Link>
                        </div>
                    )}

                    {/* Decorative Blob */}
                    <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-colors duration-700"></div>
                </div>

            </div>

            {/* Ticket Modal */}
            {selectedTicket && (
                <TicketCard
                    registration={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                />
            )}
        </div>
    );
}
