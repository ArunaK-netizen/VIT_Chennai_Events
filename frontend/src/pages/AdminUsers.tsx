import { useState, useEffect } from 'react';
import client from '../api/client';
import { toast } from '../lib/toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    regNo?: string;
    phoneNumber?: string;
    isVITian: boolean;
}

import { useAuth } from '../context/AuthContext';
import NotFound from './NotFound';
import { FiSearch } from 'react-icons/fi';

export default function AdminUsers() {
    const { user } = useAuth();

    // Strict Role Check
    if (user?.role === 'coordinator') {
        return <NotFound />;
    }

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
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
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.regNo?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="text-center py-10 text-gray-500">Loading users...</div>;

    return (
        <div className="space-y-6">
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
                    <div className="col-span-5 md:col-span-4">User</div>
                    <div className="col-span-3 hidden md:block">Stats</div>
                    <div className="col-span-4 md:col-span-3 text-right">Role</div>
                    <div className="col-span-3 md:col-span-2 text-right">VITian</div>
                </div>

                {filteredUsers.map((user) => (
                    <div key={user._id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center rounded-xl hover:bg-[#151516] transition-colors duration-200">
                        {/* Name & Email */}
                        <div className="col-span-5 md:col-span-4">
                            <p className="font-medium text-white">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>

                        {/* Details */}
                        <div className="col-span-3 hidden md:block">
                            <p className="text-xs text-gray-400 font-mono">{user.regNo || '---'}</p>
                            <p className="text-xs text-gray-600">{user.phoneNumber || ''}</p>
                        </div>

                        {/* Role */}
                        <div className="col-span-4 md:col-span-3 text-right">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                ${user.role.includes('admin') ? 'text-purple-400 bg-purple-500/10' :
                                    user.role === 'coordinator' ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 bg-white/5'}`}>
                                {user.role.replace('_', ' ')}
                            </span>
                        </div>

                        {/* VITian Status */}
                        <div className="col-span-3 md:col-span-2 text-right">
                            {user.isVITian ? (
                                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                            ) : (
                                <span className="w-2 h-2 rounded-full bg-gray-700 inline-block"></span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
