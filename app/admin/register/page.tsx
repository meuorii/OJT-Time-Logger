'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, ShieldCheck, Database } from 'lucide-react';

// --- REGISTRATION LOADING MODAL ---
const RegisterModal = ({ status }: { status: { message: string, isError: boolean } }) => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center bg-[#020617]/90 backdrop-blur-xl"
    >
        <div className="relative p-8 flex flex-col items-center max-w-sm w-full text-center">
            {/* Pulsing Aura */}
            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute w-64 h-64 bg-emerald-500 rounded-full blur-[80px]"
            />
            
            <div className={`relative w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                status.message.toLowerCase().includes('success') 
                    ? 'bg-emerald-500 rotate-360 shadow-[0_0_50px_rgba(16,185,129,0.5)]' 
                    : 'bg-slate-800 border border-emerald-500/30'
            }`}>
                {status.message.toLowerCase().includes('success') ? (
                    <ShieldCheck className="text-white" size={40} />
                ) : (
                    <Database className="text-emerald-500 animate-bounce" size={40} />
                )}
            </div>

            <div className="mt-10 relative z-10">
                <motion.h3 
                    key={status.message}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white font-black tracking-tighter text-xl"
                >
                    {status.message || "Initializing Account..."}
                </motion.h3>
                <p className="text-slate-500 font-mono text-[10px] uppercase tracking-[0.3em] mt-4">
                    Writing to Secure Sector 7G
                </p>
            </div>
        </div>
    </motion.div>
);

// --- REGISTRATION PAGE SKELETON ---
const RegisterSkeleton = () => (
    <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl bg-white rounded-[3rem] h-175 flex overflow-hidden border border-slate-100 animate-pulse">
            <div className="hidden md:block w-[45%] bg-slate-200" />
            <div className="w-full md:w-[55%] p-16 space-y-10">
                <div className="h-10 bg-slate-100 w-1/3 rounded-xl" />
                <div className="space-y-6">
                    <div className="h-14 bg-slate-50 w-full rounded-2xl" />
                    <div className="h-14 bg-slate-50 w-full rounded-2xl" />
                    <div className="h-14 bg-slate-50 w-full rounded-2xl" />
                </div>
                <div className="h-14 bg-slate-200 w-full rounded-2xl mt-10" />
            </div>
        </div>
    </div>
);

export default function PremiumRegister() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ message: '', isError: false });
    const [loading, setLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => setIsInitialLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const getPasswordStrength = () => {
        if (!formData.password) return 0;
        let score = 0;
        if (formData.password.length > 8) score += 1;
        if (/[A-Z]/.test(formData.password)) score += 1;
        if (/[0-9]/.test(formData.password)) score += 1;
        return score;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setStatus({ message: '', isError: false });
        
        try {
            const res = await fetch('/api/admin/register', {
                method: 'POST',
                body: JSON.stringify(formData),
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();
            if (res.ok) {
                setStatus({ message: 'Success! Redirecting to login...', isError: false });
                setTimeout(() => router.push('/admin/login'), 1500);
            } else {
                setStatus({ message: data.error || 'Registration failed', isError: true });
            }
        } catch {
            setStatus({ message: 'Server error. Please try again.', isError: true });
        } finally {
            setLoading(false);
        }
    };

    if (isInitialLoading) return <RegisterSkeleton />;

    return (
        <div className="h-screen w-full bg-[#f8fafc] flex items-center justify-center p-4 sm:p-8 font-sans text-slate-900 overflow-hidden">

            <AnimatePresence>
                {loading && <RegisterModal status={status} />}
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-5xl bg-white rounded-4xl sm:rounded-[3rem] shadow-[0_20px_70px_-10px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row max-h-[90vh] border border-slate-100"
            >
                {/* LEFT COLUMN: CCIT DEPARTMENT BRANDING */}
                <div className="hidden md:flex md:w-[45%] bg-[#020617] p-12 flex-col justify-between relative overflow-hidden">
                    
                    {/* Sophisticated Aurora Mesh Gradients */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Top Right Main Glow */}
                        <motion.div 
                            animate={{ 
                                scale: [1, 1.2, 1],
                                opacity: [0.15, 0.25, 0.15] 
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[-20%] right-[-10%] w-full h-[70%] bg-emerald-600 rounded-full blur-[130px]" 
                        />
                        
                        {/* Bottom Left Deep Support Glow */}
                        <div className="absolute bottom-[-15%] left-[-20%] w-[80%] h-[60%] bg-emerald-950/40 rounded-full blur-[110px]" />
                        
                        {/* Subtle Center Accent Flare */}
                        <div className="absolute top-[40%] left-[20%] w-40 h-40 bg-emerald-400/10 rounded-full blur-[80px]" />
                    </div>

                    <div className="relative z-10">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            transition={{ delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                            className="w-16 h-16 bg-white rounded-2xl mb-10 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.25)] border border-emerald-500/20 overflow-hidden group"
                        >
                            <Image 
                                src="/ccit-logo.png" 
                                alt="CCIT Logo" 
                                width={52} 
                                height={52} 
                                className="object-contain transition-transform group-hover:scale-110" 
                                priority 
                            />
                        </motion.div>

                        <h2 className="text-5xl font-black text-white leading-[1.05] tracking-tighter">
                            CCIT <br /> 
                            <span className="text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                                OJT Portal.
                            </span>
                        </h2>
                        
                        <p className="text-slate-400 mt-8 text-lg font-light leading-relaxed max-w-sm">
                            Elevating the internship experience through <span className="font-semibold text-emerald-400/90 tracking-tight">intelligent tracking</span> and administrative excellence.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex gap-1.5">
                                {[1, 2, 3].map(i => (
                                    <motion.div 
                                        key={i} 
                                        initial={i === 1 ? { opacity: 0.5 } : {}}
                                        animate={i === 1 ? { opacity: [0.5, 1, 0.5] } : {}}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className={`h-1.5 w-8 rounded-full ${i === 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} 
                                    />
                                ))}
                            </div>
                            <span className="text-[10px] text-emerald-500/60 font-mono animate-pulse uppercase tracking-[0.2em]">Live Status</span>
                        </div>
                        
                        <div className="space-y-1">
                            <p className="text-slate-200 text-xs font-bold tracking-widest uppercase">
                                College of Computer and Information Technology
                            </p>
                            <p className="text-slate-500 text-[10px] font-mono tracking-widest">
                                SYSTEM CORE V2.6 // SECURE_NODE
                            </p>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: REGISTRATION FORM */}
                <div className="w-full md:w-[55%] p-8 sm:p-12 flex flex-col justify-center overflow-y-auto">
                    <div className="max-w-md mx-auto w-full">
                        <header className="mb-8">
                            <h1 className="text-3xl font-black tracking-tight text-slate-900">Register</h1>
                            <p className="text-slate-500 mt-2 font-medium">Create your department admin account.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <AnimatePresence>
                                {status.isError && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="flex items-center gap-3 p-4 rounded-2xl text-sm font-semibold border bg-red-50 border-red-100 text-red-600 mb-4"
                                    >
                                        <AlertCircle size={18} />
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
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-emerald-600 transition-colors">Email Address</label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-600 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-[6px] focus:ring-emerald-600/5 focus:border-emerald-600 transition-all outline-none font-medium text-slate-800"
                                        placeholder="dept@institution.edu"
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <div className="flex justify-between items-end mb-1">
                                    <label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-emerald-600 transition-colors">Password</label>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${['text-red-400', 'text-orange-400', 'text-emerald-500'][getPasswordStrength()]}`}>
                                        {['WEAK', 'FAIR', 'STRONG'][getPasswordStrength()]}
                                    </span>
                                </div>
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
                                className="w-full bg-[#0f172a] text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-900/10 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 tracking-tight"
                            >
                                SIGN UP
                            </motion.button>
                        </form>

                        <footer className="mt-8 text-center">
                            <p className="text-sm text-slate-400 font-medium">
                                Already registered?{' '}
                                <Link href="/admin/login" className="text-emerald-600 hover:text-emerald-700 font-black transition-colors underline underline-offset-4">
                                    Log In
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}