import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client';
import { toast } from '../lib/toast';

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        registrationNumber: '',
        phoneNumber: '',
        collegeName: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Backend expects role, default to student for signup
            // AuthProvider enum: credentials, google.
            const payload = {
                ...formData,
                role: 'student',
                authProvider: 'credentials'
            };

            await client.post('/auth/signup', payload);
            toast.success('Registration successful! Please sign in.');
            navigate('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'An error occurred during registration.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-lg text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Create an Account</h1>
                <p className="text-gray-500 mb-8">For Non-VITian participants.</p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="name" type="text" placeholder="Full Name" required onChange={handleChange} className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm text-gray-900" />
                        <input name="email" type="email" placeholder="Email Address" required onChange={handleChange} className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm text-gray-900" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="registrationNumber" type="text" placeholder="Registration Number" required onChange={handleChange} className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm text-gray-900" />
                        <input name="phoneNumber" type="tel" placeholder="Phone Number" required onChange={handleChange} className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm text-gray-900" />
                    </div>
                    <input name="collegeName" type="text" placeholder="College Name" required onChange={handleChange} className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm text-gray-900" />
                    <input name="password" type="password" placeholder="Password" required onChange={handleChange} className="w-full px-4 py-3 bg-white border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm text-gray-900" />

                    <button type="submit" disabled={loading} className="w-full py-3 mt-4 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 cursor-pointer">
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <p className="text-sm text-center text-gray-500 mt-8">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold hover:text-blue-600 transition-colors">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
