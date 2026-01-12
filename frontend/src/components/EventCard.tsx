import { Link } from 'react-router-dom';
import type { Event } from '../types';

interface EventCardProps {
    event: Event;
    registrationStatus: string;
}

export default function EventCard({ event }: EventCardProps) {
    // Redesigned: Text-First "Ticket/Widget" Style
    // No large abstract images/icons. Pure data presentation.

    return (
        <Link
            to={`/events/${event._id}`}
            className="group block"
        >
            <div className="aspect-[4/3] bg-[#151516] border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:border-white/20 hover:bg-[#1A1A1C]">

                {/* Top Row: Date & Status */}
                <div className="flex justify-between items-start z-10">
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
                        {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>

                    {event.isCollaboration && (
                        <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-white border border-white/5">
                            Collab
                        </span>
                    )}
                </div>

                {/* Middle: Title */}
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold text-white leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {event.name}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-1">
                        {event.clubs.map((c: any) => (typeof c === 'string' ? c : c.name)).join(', ')}
                    </p>
                </div>

                {/* Bottom: Fee */}
                <div className="z-10 pt-4 border-t border-white/5 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium text-gray-400">Entry</span>
                    <span className="text-sm font-bold text-white">
                        {event.fee > 0 ? `₹${event.fee}` : 'Free'}
                    </span>
                </div>

                {/* Ornamental Background Elements (Subtle) */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-[50px] pointer-events-none -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors duration-500"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/50 rounded-full blur-[40px] pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
            </div>
        </Link>
    );
}
