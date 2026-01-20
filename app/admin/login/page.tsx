'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
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
                credentials: 'include', 
            });
            
            const data = await res.json();

            if (res.ok) {
                setStatus({ message: 'Identity verified. Redirecting to terminal...', isError: false });
                
                setTimeout(() => {
                    router.push('/admin/dashboard');
                    router.refresh(); 
                }, 1000);
            } else {
                setStatus({ message: data.error || 'Access Denied: Invalid Credentials', isError: true });
            }
        } catch {
            setStatus({ message: 'Uplink failed. Check your connection.', isError: true });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-8 font-sans text-slate-900 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl bg-white rounded-4xl sm:rounded-[3rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row-reverse max-h-[90vh] border border-slate-100"
            >
                {/* BRANDING COLUMN: CCIT BRANDING (Matching Register Page) */}
                <div className="hidden md:flex md:w-[45%] bg-[#020617] p-12 flex-col justify-between relative overflow-hidden">
                    
                    {/* Synchronized Aurora Mesh Gradients */}
                    <div className="absolute inset-0 pointer-events-none">
                        <motion.div 
                            animate={{ 
                                x: [0, 40, -20, 0],
                                y: [0, -30, 20, 0],
                                scale: [1, 1.2, 1],
                                opacity: [0.2, 0.35, 0.2] 
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                            className="absolute top-[-10%] left-[-10%] w-full h-[70%] bg-emerald-600 rounded-full blur-[120px]" 
                        />
                        <div className="absolute bottom-[-15%] right-[-10%] w-[80%] h-[60%] bg-emerald-950/50 rounded-full blur-[110px]" />
                        <div className="absolute top-[40%] right-[20%] w-40 h-40 bg-emerald-400/10 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10">
                        <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white transition-colors mb-10 text-sm font-medium gap-2 group">
                            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                            Back to Portal
                        </Link>

                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05, rotate: -2 }}
                            transition={{ delay: 0.4 }}
                            className="w-16 h-16 bg-white rounded-2xl mb-10 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-emerald-500/20 overflow-hidden"
                        >
                            <Image 
                                src="/ccit-logo.png" 
                                alt="CCIT Logo" 
                                width={52} 
                                height={52} 
                                className="object-contain" 
                                priority 
                            />
                        </motion.div>

                        <h2 className="text-5xl font-black text-white leading-[1.05] tracking-tighter">
                            Secure <br /> 
                            <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                Admin Access.
                            </span>
                        </h2>
                        <p className="text-slate-400 mt-8 text-lg font-light leading-relaxed">
                            Please authenticate to manage <span className="text-emerald-400/90 font-medium">student internships</span> and administrative logs.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <p className="text-slate-500 text-[10px] font-mono tracking-[0.3em] uppercase">
                            Secure Node // Access Level 4
                        </p>
                    </div>
                </div>

                {/* LOGIN FORM COLUMN */}
                <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white overflow-y-auto">
                    <div className="max-w-md mx-auto w-full">
                        <header className="mb-10">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Sign In</h1>
                            <p className="text-slate-500 mt-2 font-medium">Department Management Portal</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {status.message && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-semibold border ${
                                            status.isError ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                        }`}
                                    >
                                        {status.isError ? <AlertCircle size={18} /> : <Loader2 className="animate-spin" size={18} />}
                                        {status.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-emerald-600 transition-colors">Username</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-emerald-600/5 focus:border-emerald-600 transition-all outline-none font-medium text-slate-800"
                                        placeholder="Admin Username"
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-emerald-600 transition-colors">Password</label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-emerald-600/5 focus:border-emerald-600 transition-all outline-none font-medium text-slate-800"
                                        placeholder="••••••••"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-900/10 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 tracking-tight"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <><LogIn size={20} /> SIGN IN</>}
                            </motion.button>
                        </form>

                        <footer className="mt-10 text-center">
                            <p className="text-sm text-slate-400 font-medium">
                                New administrator?{' '}
                                <Link href="/admin/register" className="text-emerald-600 hover:text-emerald-700 font-black transition-colors underline underline-offset-4">
                                    Create Account
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}