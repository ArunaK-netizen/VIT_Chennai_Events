import { useState, useEffect } from 'react';
import { toast } from '../lib/toast';
import client from '../api/client';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

interface IClub {
    _id: string;
    name: string;
    facultyCoordinators: any[];
    studentCoordinators: any[];
}

interface IUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    phoneNumber?: string;
}

import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';

export default function AdminClubs() {
    const { user } = useAuth();

    // Strict Role Check
    if (user?.role === 'coordinator') {
        return <NotFound />;
    }
    const [clubs, setClubs] = useState<IClub[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClub, setEditingClub] = useState<IClub | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        facultyCoordinators: [] as any[],
        studentCoordinators: [] as any[]
    });
    const [coordinators, setCoordinators] = useState<IUser[]>([]);

    useEffect(() => {
        fetchClubs();
        fetchCoordinators();
    }, []);

    const fetchClubs = async () => {
        try {
            const res = await client.get('/clubs/');
            setClubs(res.data);
        } catch (error) {
            toast.error('Failed to load clubs');
        } finally {
            setLoading(false);
        }
    };

    const fetchCoordinators = async () => {
        try {
            const res = await client.get('/users/');
            const coords = res.data.filter((u: IUser) => ['coordinator', 'super_coordinator'].includes(u.role));
            setCoordinators(coords);
        } catch (error) {
            console.error('Failed to fetch coords');
        }
    };

    const handleEdit = (club: IClub) => {
        setEditingClub(club);
        setFormData({
            name: club.name,
            facultyCoordinators: club.facultyCoordinators || [],
            studentCoordinators: club.studentCoordinators || []
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this club?')) return;
        try {
            await client.delete(`/clubs/${id}`);
            setClubs(prev => prev.filter(c => c._id !== id));
            toast.success('Club deleted');
        } catch (error) {
            toast.error('Failed to delete club');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...formData };

            if (editingClub) {
                await client.put(`/clubs/${editingClub._id}`, payload);
                toast.success('Club updated');
            } else {
                await client.post('/clubs/', payload);
                toast.success('Club created');
            }

            setIsModalOpen(false);
            setEditingClub(null);
            setFormData({ name: '', facultyCoordinators: [], studentCoordinators: [] });
            fetchClubs();
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Operation failed');
        }
    };

    // Helper for student coord management in form
    const addStudentCoord = () => {
        setFormData(p => ({ ...p, studentCoordinators: [...p.studentCoordinators, { name: '', phone: '', email: '' }] }));
    };

    const updateStudentCoord = (idx: number, field: string, val: string) => {
        const list = [...formData.studentCoordinators];
        list[idx] = { ...list[idx], [field]: val };
        setFormData(p => ({ ...p, studentCoordinators: list }));
    };

    const removeStudentCoord = (idx: number) => {
        setFormData(p => ({ ...p, studentCoordinators: p.studentCoordinators.filter((_, i) => i !== idx) }));
    };

    if (loading) return <div className="text-gray-500 text-center py-10">Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white tracking-tight">Clubs</h1>
                <button
                    onClick={() => { setEditingClub(null); setFormData({ name: '', facultyCoordinators: [], studentCoordinators: [] }); setIsModalOpen(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-lg text-sm hover:opacity-90 transition-opacity"
                >
                    <FiPlus />
                    <span>Add Club</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clubs.map(club => (
                    <div key={club._id} className="bg-[#151516] p-6 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-white">{club.name}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => handleEdit(club)} className="text-gray-500 hover:text-white transition-colors"><FiEdit2 size={16} /></button>
                                <button onClick={() => handleDelete(club._id)} className="text-gray-500 hover:text-red-500 transition-colors"><FiTrash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs uppercase font-bold text-gray-500 mb-2">Faculty Lead</p>
                                <div className="flex flex-wrap gap-2">
                                    {(club.facultyCoordinators && club.facultyCoordinators.length > 0) ? (
                                        club.facultyCoordinators.map((c, i) => (
                                            <span key={i} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-xs text-gray-300">
                                                {c.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-600 text-xs italic">None assigned</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-[#1C1C1E] border border-white/10 rounded-2xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">{editingClub ? 'Edit Club' : 'Add Club'}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><FiX size={24} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Club Name</label>
                                <input
                                    className="w-full bg-[#151516] border border-white/10 rounded-lg px-4 py-2 text-white focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    required
                                />
                            </div>

                            {/* Faculty Select */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Faculty Coordinators</label>
                                <select
                                    className="w-full bg-[#151516] border border-white/10 rounded-lg px-4 py-2 text-white mb-3"
                                    onChange={(e) => {
                                        const u = coordinators.find(c => c._id === e.target.value);
                                        if (u && !formData.facultyCoordinators.find(fv => fv._id === u._id)) {
                                            setFormData(p => ({ ...p, facultyCoordinators: [...p.facultyCoordinators, { _id: u._id, name: u.name, email: u.email, phone: u.phoneNumber }] }));
                                        }
                                    }}
                                    value=""
                                >
                                    <option value="">+ Add Faculty...</option>
                                    {coordinators.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                <div className="flex flex-wrap gap-2">
                                    {formData.facultyCoordinators.map((c, i) => (
                                        <span key={i} className="bg-primary/20 text-primary border border-primary/20 px-2 py-1.5 rounded-lg text-sm flex items-center gap-2">
                                            {c.name}
                                            <button type="button" onClick={() => setFormData(p => ({ ...p, facultyCoordinators: p.facultyCoordinators.filter((_, idx) => idx !== i) }))} className="hover:text-white">×</button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Student Coords */}
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Student Coordinators</label>
                                <div className="space-y-2 mb-3">
                                    {formData.studentCoordinators.map((c, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input placeholder="Name" className="flex-1 bg-[#151516] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={c.name} onChange={e => updateStudentCoord(i, 'name', e.target.value)} />
                                            <input placeholder="Phone" className="w-32 bg-[#151516] border border-white/10 rounded-lg px-3 py-2 text-white text-sm" value={c.phone} onChange={e => updateStudentCoord(i, 'phone', e.target.value)} />
                                            <button type="button" onClick={() => removeStudentCoord(i)} className="text-red-500 hover:text-red-400 p-2"><FiTrash2 /></button>
                                        </div>
                                    ))}
                                </div>
                                <button type="button" onClick={addStudentCoord} className="text-primary text-sm font-bold hover:underline">+ Add Student Coord</button>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:opacity-90 transition-opacity">{editingClub ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
