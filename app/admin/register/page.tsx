'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion'; // Ensure framer-motion is installed
import { Eye, EyeOff, User, Mail, Lock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'; // Optional: npm i lucide-react

export default function PremiumRegister() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState({ message: '', isError: false });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Password strength logic
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
        setTimeout(() => setLoading(false), 2000); 
    };

    return (
        <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-0 sm:p-6 lg:p-12 font-sans text-slate-900 overflow-hidden">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-5xl bg-white rounded-none sm:rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row min-h-175"
            >
                {/* LEFT COLUMN: BRANDING (Desktop Only) */}
                <div className="hidden md:flex md:w-1/2 bg-blue-600 p-12 flex-col justify-between relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl mb-8 flex items-center justify-center">
                            <CheckCircle2 className="text-white w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-bold text-white leading-tight">
                            Streamline your <br /> OJT Management.
                        </h2>
                        <p className="text-blue-100 mt-4 text-lg">
                            The premium solution for tracking student attendance and professional growth.
                        </p>
                    </div>

                    {/* Decorative Background Element */}
                    <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500 rounded-full blur-3xl opacity-50" />
                    <div className="absolute top-1/2 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-3xl opacity-30 transform -translate-y-1/2" />
                    
                    <div className="relative z-10 text-blue-200 text-sm font-medium">
                        © 2026 Admin Portal v2.0
                    </div>
                </div>

                {/* RIGHT COLUMN: REGISTRATION FORM */}
                <div className="w-full md:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center">
                    <div className="max-w-md mx-auto w-full">
                        <header className="mb-10">
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h1>
                            <p className="text-slate-500 mt-2">Get started with your administrative access.</p>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Status Messages */}
                            <AnimatePresence>
                                {status.message && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`flex items-center gap-2 p-4 rounded-xl text-sm font-medium border ${
                                            status.isError ? 'bg-red-50 border-red-100 text-red-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                        }`}
                                    >
                                        {status.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                        {status.message}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Username Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Username</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all outline-none"
                                        placeholder="admin_dev"
                                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Email Input */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all outline-none"
                                        placeholder="name@company.com"
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
                                    <span className="text-[10px] font-bold uppercase text-slate-400">Strength: {['Weak', 'Fair', 'Strong'][getPasswordStrength()]}</span>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/5 focus:border-blue-600 transition-all outline-none"
                                        placeholder="••••••••"
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {/* Password Strength Bar */}
                                <div className="flex gap-1 mt-2 px-1">
                                    {[0, 1, 2].map((step) => (
                                        <div 
                                            key={step} 
                                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                                                getPasswordStrength() > step ? 'bg-blue-600' : 'bg-slate-200'
                                            }`} 
                                        />
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                            </motion.button>
                        </form>

                        <footer className="mt-8 text-center">
                            <p className="text-sm text-slate-500 font-medium">
                                Already have an account?{' '}
                                <Link href="/admin/login" className="text-blue-600 hover:text-blue-700 font-bold transition-colors underline underline-offset-4">
                                    Log in
                                </Link>
                            </p>
                        </footer>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}