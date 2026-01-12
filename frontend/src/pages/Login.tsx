import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { toast } from '../lib/toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [role, setRole] = useState('VITian');
    const [email, setEmail] = useState(''); // Handles both username/email
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('username', email); // OAuth2 expects username field
            formData.append('password', password);

            const response = await client.post('/auth/login', formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });

            login(response.data.access_token);
            toast.success("Logged in successfully!");
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.detail || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none"></div>

            <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Welcome Back</h1>
                    <p className="text-gray-500 text-sm">Sign in to continue to TechnoVIT</p>
                </div>

                {/* Glass Card */}
                <div className="bg-[#151516]/80 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] shadow-2xl">

                    {/* Role Switcher */}
                    <div className="w-full p-1 bg-black/40 rounded-xl flex justify-between items-center mb-6 border border-white/5">
                        <button
                            onClick={() => setRole('VITian')}
                            className={`w-1/2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${role === 'VITian' ? 'bg-[#2C2C2E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                            VITian
                        </button>
                        <button
                            onClick={() => setRole('Non-VITian')}
                            className={`w-1/2 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${role === 'Non-VITian' ? 'bg-[#2C2C2E] text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
                            Guest
                        </button>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                className="w-full bg-[#0A0A0A] border-none rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:ring-1 focus:ring-white/20 transition-all text-sm font-medium"
                                placeholder={role === 'VITian' ? 'VIT Email (example@vit.ac.in)' : 'Email Address'}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#0A0A0A] border-none rounded-xl px-4 py-3.5 text-white placeholder-gray-600 focus:ring-1 focus:ring-white/20 transition-all text-sm font-medium"
                            />
                        </div>

                        <div className="flex justify-end relative">
                            <Link to="/forgot-password" className="text-xs text-gray-500 hover:text-white transition-colors">
                                Forgot Password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-white text-black font-bold rounded-xl text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-xl shadow-white/5"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="my-6 flex items-center gap-4">
                        <div className="h-px bg-white/5 flex-1"></div>
                        <span className="text-[10px] uppercase font-bold text-gray-600 tracking-widest">Or continue with</span>
                        <div className="h-px bg-white/5 flex-1"></div>
                    </div>

                    <div className="flex justify-center">
                        <div className="overflow-hidden rounded-lg">
                            <GoogleLogin
                                theme="filled_black"
                                shape="pill"
                                onSuccess={async (credentialResponse) => {
                                    try {
                                        const response = await client.post('/auth/google', {
                                            token: credentialResponse.credential
                                        });
                                        login(response.data.access_token);
                                        toast.success("Logged in with Google!");
                                        navigate('/dashboard');
                                    } catch (error) {
                                        console.error("Google login failed", error);
                                        toast.error("Google login failed");
                                    }
                                }}
                                onError={() => {
                                    toast.error('Google Login Failed');
                                }}
                            />
                        </div>
                    </div>
                </div>

                {role === 'Non-VITian' && (
                    <p className="text-center text-sm text-gray-500 mt-8">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-white font-bold hover:underline">
                            Create Account
                        </Link>
                    </p>
                )}
            </div>
        </div>
    );
}
