import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { FiCalendar, FiMapPin, FiDownload } from 'react-icons/fi';
import type { Registration, Event } from '../types';
import { toPng } from 'html-to-image';
import { toast } from '../lib/toast';

interface TicketCardProps {
    registration: Registration;
    onClose: () => void;
}

export default function TicketCard({ registration, onClose }: TicketCardProps) {
    const ticketRef = useRef<HTMLDivElement>(null);
    const event = registration.event as Event; // Assuming the viewer is the creator or one of the team members. Ideally pass the actual logged in user but for now showing Creator/Reg details.

    const handleDownload = async () => {
        if (!ticketRef.current) return;

        try {
            const dataUrl = await toPng(ticketRef.current, { cacheBust: true, pixelRatio: 2 });

            const link = document.createElement('a');
            link.download = `Ticket_${event.name.replace(/\s+/g, '_')}_${registration._id.slice(-6)}.png`;
            link.href = dataUrl;
            link.click();
            toast.success("Ticket saved to device!");
        } catch (error) {
            console.error("Failed to download ticket", error);
            toast.error("Failed to download ticket.");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-transparent animate-in zoom-in duration-300 my-auto">

                {/* Actions Bar */}
                <div className="absolute -top-14 left-0 right-0 flex justify-between items-center px-2">
                    <h2 className="text-white text-lg font-bold">Your Ticket</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDownload}
                            className="bg-white text-black px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-white/10"
                        >
                            <FiDownload />
                            Save
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-[#1F1F21] text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-white/10 transition-colors border border-white/10"
                        >
                            Close
                        </button>
                    </div>
                </div>

                {/* Ticket Container - Designed to look like a physical event pass */}
                <div
                    ref={ticketRef}
                    className="bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[350px]"
                >
                    {/* Left Side: Visuals & Core Info */}
                    <div className="md:w-[65%] bg-[#0A0A0B] text-white p-8 relative flex flex-col justify-between overflow-hidden">

                        {/* Background Noise/Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-purple-900/40 z-0"></div>
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 z-0 mix-blend-overlay"></div>

                        {/* Circle Punches (Decorative) */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-black rounded-full z-10"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full z-10 hidden md:block"></div>

                        {/* Content */}
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <span className="px-3 py-1 rounded bg-white/10 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-blue-200">
                                    Official Entry Pass
                                </span>
                                <span className="font-mono text-xs text-gray-500">#{registration._id.slice(-6).toUpperCase()}</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl font-black leading-none tracking-tight mb-2 uppercase break-words">
                                {event.name}
                            </h1>
                            <p className="text-gray-400 text-sm line-clamp-2 mb-8">{event.description || "Join us for an unforgettable experience at TechnoVIT."}</p>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1 mb-1">
                                        <FiCalendar /> Date & Time
                                    </label>
                                    <p className="text-sm font-bold text-white">{new Date(event.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    <p className="text-xs text-gray-400">{event.startTime || '10:00 AM'}</p>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-gray-500 flex items-center gap-1 mb-1">
                                        <FiMapPin /> Venue
                                    </label>
                                    <p className="text-sm font-bold text-white max-w-[150px]">{event.venue || 'Main Auditorium'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Footer Info */}
                        <div className="relative z-10 mt-8 pt-6 border-t border-white/10 flex justify-between items-end">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 block">Registered To</label>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-xs font-bold">
                                        {(registration.creator?.name || 'U').charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold leading-none">{registration.creator?.name || "Attendee"}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">{registration.creator?.registrationNumber || registration.creator?.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side / Bottom (Mobile): QR & Validation - White Theme */}
                    <div className="md:w-[35%] bg-white text-black p-8 flex flex-col items-center justify-center relative border-l-2 border-dashed border-gray-200">
                        {/* Punch Holes for Mobile */}
                        <div className="absolute top-[-12px] left-1/2 -translate-x-1/2 w-6 h-6 bg-black rounded-full md:hidden"></div>
                        <div className="absolute bottom-[-12px] left-1/2 -translate-x-1/2 w-6 h-6 bg-black rounded-full md:hidden"></div>

                        <div className="w-full h-full flex flex-col items-center justify-center space-y-6">

                            <div className="bg-white p-2 border-4 border-black rounded-xl">
                                <QRCode
                                    value={JSON.stringify({
                                        id: registration._id,
                                        evt: event._id,
                                        u: registration.creator?._id,
                                        valid: true
                                    })}
                                    size={140}
                                />
                            </div>

                            <div className="text-center">
                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Scan for Entry</span>
                                <div className="inline-block px-3 py-1 bg-black text-white text-xs font-mono font-bold rounded">
                                    PAID
                                </div>
                            </div>

                            <div className="w-full border-t border-gray-100 pt-4">
                                <div className="flex justify-between items-center text-[10px] font-medium text-gray-400 uppercase">
                                    <span>Admit One</span>
                                    <span>Non-Transferable</span>
                                </div>

                                {/* Team Members List (Mini) if > 1 */}
                                {registration.teamMembers && registration.teamMembers.length > 1 && (
                                    <div className="mt-4">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase mb-1 block">Team ({registration.teamMembers.length})</span>
                                        <div className="flex flex-wrap gap-1">
                                            {registration.teamMembers.slice(0, 5).map((m: any) => (
                                                <span key={m._id} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200">
                                                    {m.name.split(' ')[0]}
                                                </span>
                                            ))}
                                            {registration.teamMembers.length > 5 && <span className="text-[9px] text-gray-400">+More</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-6 text-white/40 text-xs">
                    Show this ticket at the venue entry. Screenshots are accepted.
                </div>
            </div>
        </div>
    );
}
