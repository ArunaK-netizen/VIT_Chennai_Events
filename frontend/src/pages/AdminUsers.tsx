import { useState, useEffect } from 'react';
import client from '../api/client';
import { toast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';
import { FiSearch, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    registrationNumber?: string;
    phoneNumber?: string;
    isVITian: boolean;
}

export default function AdminUsers() {
    const { user } = useAuth();
    const canManage = user?.role === 'admin' || user?.role === 'super_coordinator';

    // Strict Role Check
    if (user?.role === 'coordinator') {
        return <NotFound />;
    }

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Edit Modal State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [editForm, setEditForm] = useState<Partial<User>>({});

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await client.get('/users/');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await client.delete(`/users/${userId}`);
            toast.success("User deleted");
            setUsers(prev => prev.filter(u => u._id !== userId));
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Delete failed");
        }
    };

    const startEdit = (user: User) => {
        setEditingUser(user);
        setEditForm({ ...user });
    };

    const saveEdit = async () => {
        if (!editingUser || !editForm) return;
        try {
            const res = await client.put(`/users/${editingUser._id}`, editForm);
            setUsers(prev => prev.map(u => u._id === editingUser._id ? res.data : u));
            toast.success("User updated");
            setEditingUser(null);
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Update failed");
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-10 text-gray-500">Loading users...</div>;

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-white tracking-tight">Users</h1>
                    <div className="px-3 py-1 bg-[#1F1F21] rounded-full text-xs font-medium text-gray-400">
                        Total: <span className="text-white ml-1">{users.length}</span>
                    </div>
                </div>

                <div className="relative group">
                    <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="bg-[#1F1F21] w-full md:w-64 pl-10 pr-4 py-2.5 rounded-lg text-sm focus:bg-[#2C2C2E] transition-colors text-gray-200"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-1">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5">
                    <div className="col-span-4">User</div>
                    <div className="col-span-3 hidden md:block">Stats</div>
                    <div className="col-span-3 text-right">Role</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {filteredUsers.map((u) => (
                    <div key={u._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center rounded-xl hover:bg-[#151516] transition-colors duration-200 group">
                        {/* Name & Email */}
                        <div className="col-span-4">
                            <p className="font-medium text-white">{u.name}</p>
                            <p className="text-xs text-gray-500 truncate">{u.email}</p>
                        </div>

                        {/* Details */}
                        <div className="col-span-3 hidden md:block">
                            <p className="text-xs text-gray-400 font-mono">{u.registrationNumber || '---'}</p>
                            <p className="text-xs text-gray-600">{u.phoneNumber || ''}</p>
                        </div>

                        {/* Role */}
                        <div className="col-span-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                ${u.role.includes('admin') ? 'text-purple-400 bg-purple-500/10' :
                                    u.role === 'coordinator' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 bg-white/5'}`}>
                                {u.role.replace('_', ' ')}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 text-right flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {canManage && (
                                <>
                                    <button onClick={() => startEdit(u)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10" title="Edit">
                                        <FiEdit2 size={14} />
                                    </button>
                                    <button onClick={() => handleDelete(u._id)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10" title="Delete">
                                        <FiTrash2 size={14} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="bg-[#151516] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Edit User</h2>
                            <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-white"><FiX size={20} /></button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                                <input
                                    className="glass-input w-full"
                                    value={editForm.name || ''}
                                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role</label>
                                <select
                                    className="glass-input w-full"
                                    value={editForm.role}
                                    onChange={e => setEditForm(prev => ({ ...prev, role: e.target.value }))}
                                >
                                    <option value="student">Student</option>
                                    <option value="coordinator">Coordinator</option>
                                    <option value="super_coordinator">Super Coordinator</option>
                                    {user?.role === 'admin' && <option value="admin">Admin</option>}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Reg No</label>
                                    <input
                                        className="glass-input w-full"
                                        value={editForm.registrationNumber || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Phone</label>
                                    <input
                                        className="glass-input w-full"
                                        value={editForm.phoneNumber || ''}
                                        onChange={e => setEditForm(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 cursor-pointer mt-2">
                                    <input
                                        type="checkbox"
                                        checked={editForm.isVITian || false}
                                        onChange={e => setEditForm(prev => ({ ...prev, isVITian: e.target.checked }))}
                                        className="rounded border-gray-600 bg-black/40 text-primary"
                                    />
                                    <span className="text-sm text-gray-300">Is VITian</span>
                                </label>
                            </div>

                            <button onClick={saveEdit} className="w-full py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-hover mt-4 flex items-center justify-center gap-2">
                                <FiCheck /> Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
