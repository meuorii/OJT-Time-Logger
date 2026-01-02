'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Lock, LogIn, AlertCircle, Loader2, ChevronLeft } from 'lucide-react';

export default function AdminLogin() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ message: '', isError: false });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ message: '', isError: false });

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (res.ok) {
                setStatus({ message: 'Login successful! Entering dashboard...', isError: false });
                setTimeout(() => router.push('/admin/dashboard'), 1500);
            } else {
                setStatus({ message: data.error || 'Invalid credentials', isError: true });
            }
        } catch (err) {
            setStatus({ message: 'Connection error. Please try again.', isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-0 sm:p-6 lg:p-12 font-sans text-slate-900">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-5xl bg-white rounded-none sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden flex flex-col md:flex-row-reverse min-h-[650px]"
            >
                {/* LEFT COLUMN: BRANDING (Swapped for variety) */}
                <div className="hidden md:flex md:w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-12 text-sm font-medium gap-2">
                            <ChevronLeft size={16} /> Back to Student Portal
                        </Link>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Welcome Back, <br /> Administrator.
                        </h2>
                        <p className="text-slate-400 mt-4 text-lg max-w-xs">
                            Access your dashboard to monitor student logs and manage OJT records.
                        </p>
                    </div>

                    {/* Subtle Abstract Background */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-500 rounded-full blur-[120px]" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-indigo-500 rounded-full blur-[120px]" />
                    </div>
                    
                    <div className="relative z-10 text-slate-500 text-xs font-mono tracking-widest">
                        SECURE ACCESS PORTAL L-202
                    </div>
                </div>

                {/* RIGHT COLUMN: LOGIN FORM */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white">
                    <div className="max-w-md mx-auto w-full">
                        <header className="mb-10 text-center md:text-left">
                            <div className="md:hidden flex justify-center mb-6">
                                <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
                                    <LogIn className="text-white w-6 h-6" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Sign In</h1>
                            <p className="text-slate-500 mt-2">Enter your admin credentials to continue.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {status.message && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className={`flex items-center gap-2 p-4 rounded-2xl text-sm font-medium border ${
                                            status.isError ? 'bg-red-50 border-red-100 text-red-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                                        }`}
                                    >
                                        {status.isError ? <AlertCircle size={18} /> : <Loader2 className="animate-spin" size={18} />}
                                        {status.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400 ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-slate-900 placeholder-slate-400"
                                        placeholder="Enter username"
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">Password</label>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-slate-900/5 focus:border-slate-900 transition-all outline-none text-slate-900 placeholder-slate-400"
                                        placeholder="••••••••"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-900 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-2xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={20} /> Sign In</>}
                            </motion.button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-sm text-slate-500">
                                Don&apos;t have an admin account?{' '}
                                <Link href="/admin/register" className="text-slate-900 hover:text-blue-600 font-bold transition-colors underline underline-offset-4">
                                    Register here
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}