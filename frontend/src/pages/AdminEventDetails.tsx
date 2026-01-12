import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';

interface Participant {
    registrationId: string;
    userId: string;
    name: string;
    email: string;
    regNo: string;
    phone: string;
    isVITian: boolean;
    paymentStatus: string;
}

export default function AdminEventDetails() {
    const { id } = useParams<{ id: string }>();
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [eventName, setEventName] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDetails() {
            try {
                const res = await client.get(`/admin/events/${id}/participants`);
                if (res.data.success) {
                    setParticipants(res.data.data);
                    setEventName(res.data.event.name);
                }
            } catch (error) {
                console.error("Failed to fetch participants", error);
            } finally {
                setLoading(false);
            }
        }
        if (id) fetchDetails();
    }, [id]);

    const downloadCSV = () => {
        if (!participants.length) return;

        const headers = ['Name', 'Email', 'RegNo', 'Phone', 'Is VITian', 'Payment Status', 'Registration ID'];
        const csvContent = [
            headers.join(','),
            ...participants.map(p => [
                `"${p.name}"`,
                `"${p.email}"`,
                `"${p.regNo}"`,
                `"${p.phone}"`,
                p.isVITian ? 'Yes' : 'No',
                p.paymentStatus,
                p.registrationId
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${eventName.replace(/\s+/g, '_')}_participants.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-10 text-center">Loading details...</div>;

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link to="/admin/events" className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
                        <FiArrowLeft className="w-6 h-6 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{eventName}</h1>
                        <p className="text-gray-500">Participant List</p>
                    </div>
                </div>
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                >
                    <FiDownload /> Export CSV
                </button>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Reg No</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Phone</th>
                                <th className="px-6 py-3">VITian</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                        No participants found.
                                    </td>
                                </tr>
                            ) : (
                                participants.map((p, i) => (
                                    <tr key={i} className="border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                        <td className="px-6 py-4">{p.regNo || '-'}</td>
                                        <td className="px-6 py-4">{p.email}</td>
                                        <td className="px-6 py-4">{p.phone || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${p.isVITian ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {p.isVITian ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs ${p.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {p.paymentStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
