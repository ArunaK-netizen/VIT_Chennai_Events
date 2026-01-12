import { useState, useEffect } from 'react';
import { toast } from '../lib/toast';
import client from '../api/client';

import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';

export default function AdminCoordinators() {
    const { user } = useAuth();

    // Strict Role Check
    if (user?.role === 'coordinator') {
        return <NotFound />;
    }
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'coordinator',
        school: '',
        club: '',
        phoneNumber: ''
    });
    const [clubs, setClubs] = useState<any[]>([]);

    useEffect(() => {
        client.get('/clubs/').then(res => setClubs(res.data)).catch(console.error);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await client.post('/users/admin/create', {
                ...formData,
                club: formData.club || undefined,
                school: formData.school || undefined
            });
            toast.success('Coordinator created successfully');
            setFormData({
                name: '', email: '', password: '', role: 'coordinator', school: '', club: '', phoneNumber: ''
            });
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Failed to create user');
        }
    };

    const handleChange = (e: any) => {
        setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
    };

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-8 text-white tracking-tight">Add New Coordinator</h1>

            <form onSubmit={handleSubmit} className="bg-[#151516] p-8 rounded-[24px] border border-white/5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                        <input name="name" value={formData.name} onChange={handleChange} required className="w-full bg-[#0A0A0A] border-none rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary" placeholder="John Doe" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full bg-[#0A0A0A] border-none rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary" placeholder="john@vit.ac.in" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                        <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full bg-[#0A0A0A] border-none rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary" placeholder="••••••••" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                        <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-[#0A0A0A] border-none rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary">
                            <option value="coordinator">Coordinator</option>
                            <option value="super_coordinator">Super Coordinator</option>
                            <option value="merch_coordinator">Merch Coordinator</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">Phone Number</label>
                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} className="w-full bg-[#0A0A0A] border-none rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary" placeholder="+91..." />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">School (Optional)</label>
                        <select name="school" value={formData.school} onChange={handleChange} className="w-full bg-[#0A0A0A] border-none rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary">
                            <option value="">None</option>
                            {['sense', 'select', 'scope', 'sas', 'ssl', 'smec', 'vfit', 'sce', 'vitsol'].map(s => (
                                <option key={s} value={s}>{s.toUpperCase()}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Club (Optional)</label>
                        <select name="club" value={formData.club} onChange={handleChange} className="w-full bg-[#0A0A0A] border-none rounded-lg px-4 py-3 text-white focus:ring-1 focus:ring-primary">
                            <option value="">None</option>
                            {clubs.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="pt-6">
                    <button type="submit" className="w-full bg-white text-black py-4 rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-white/5">
                        Create User Account
                    </button>
                </div>
            </form>
        </div>
    );
}
