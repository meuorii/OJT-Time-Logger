'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Briefcase, 
    Clock, 
    ClipboardCheck, 
    LogOut, 
    Menu, 
    X,
    Loader2,
    ShieldCheck,
    Cpu
} from 'lucide-react';
import Image from 'next/image';

const LoadingModal = ({ status }: { status: { message: string, isError: boolean } }) => {
    const isVerified = status.message.toLowerCase().includes('verified') || 
                       status.message.toLowerCase().includes('terminated');

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-110 flex items-center justify-center bg-slate-950/80 backdrop-blur-md"
        >
            <div className="flex flex-col items-center">
                <div className="relative flex items-center justify-center w-20 h-20">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className={`absolute inset-0 rounded-3xl border-2 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent ${isVerified ? 'hidden' : 'block'}`}
                    />
                    <motion.div 
                        initial={false}
                        animate={{ 
                            scale: isVerified ? 1.1 : 1,
                            backgroundColor: isVerified ? "rgba(16, 185, 129, 1)" : "rgba(30, 41, 59, 0.5)" 
                        }}
                        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-slate-700/50 shadow-2xl"
                    >
                        {isVerified ? (
                            <ShieldCheck className="text-white" size={32} strokeWidth={1.5} />
                        ) : (
                            <Cpu className="text-emerald-500" size={28} strokeWidth={1.5} />
                        )}
                    </motion.div>
                </div>

                <div className="mt-8 flex flex-col items-center gap-2">
                    <motion.h3 
                        key={status.message}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-slate-200 font-medium tracking-widest uppercase text-[10px]"
                    >
                        {status.message || "Initializing"}
                    </motion.h3>
                    {!isVerified && (
                        <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                                    className="w-1 h-1 rounded-full bg-emerald-500/50"
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const LogoutModal = ({ isOpen, onClose, onConfirm, isLoading }: { 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void;
    isLoading: boolean;
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
                    {/* Backdrop - High-end Glass Effect */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    
                    {/* Modal Card - Exact Rounded Square Geometry */}
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative w-full max-w-95 aspect-square bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center justify-center overflow-hidden"
                    >
                        {/* Internal Decorative Element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 rounded-full blur-3xl -mr-16 -mt-16" />
                        
                        <div className="relative z-10 w-full text-center">
                            {/* Icon - Squircle Style */}
                            <div className="mx-auto w-20 h-20 bg-rose-50 border border-rose-100 rounded-[1.75rem] flex items-center justify-center mb-6">
                                <LogOut size={32} className="text-rose-600" />
                            </div>

                            {/* Clean Professional Text */}
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                                End <span className="text-rose-600">Session</span>
                            </h3>
                            
                            <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] mt-2 mb-10 leading-relaxed">
                                Confirm logout to secure <br /> your administrator access
                            </p>

                            <div className="space-y-3 w-full">
                                <button 
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-[#020617] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-600 transition-all duration-300 shadow-lg shadow-slate-200 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        'Sign Out'
                                    )}
                                </button>
                                
                                <button 
                                    onClick={onClose}
                                    className="w-full py-3 text-slate-400 hover:text-slate-900 text-[9px] font-black uppercase tracking-[0.2em] transition-colors"
                                >
                                    Stay Logged In
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [logoutStatus, setLogoutStatus] = useState({ message: '', isError: false, isLoading: false });
    const pathname = usePathname();

    const menuItems = [
        { name: 'Admin Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'OJT Management', icon: Briefcase, href: '/admin/dashboard/ojt' },
        { name: 'Time Log Management', icon: Clock, href: '/admin/dashboard/timelogs' },
        { name: 'Attendance & Reports', icon: ClipboardCheck, href: '/admin/dashboard/reports' },
    ];

    const handleLogout = async () => {
        // FIX: Match the state variable name
        setLogoutStatus({ message: 'De-authenticating terminal...', isError: false, isLoading: true });
        
        // Optional: Close the confirmation modal so only the LoadingModal is visible
        setShowLogoutModal(false);

        try {
            const res = await fetch('/api/admin/logout', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setLogoutStatus({ message: 'Session Terminated. Redirecting...', isError: false, isLoading: true });
                setTimeout(() => {
                    window.location.href = '/admin/login';
                }, 1500);
            } else {
                setLogoutStatus({ message: 'Error: Could not terminate session', isError: true, isLoading: false });
            }
        } catch  {
            setLogoutStatus({ message: 'Network Failure: Termination Aborted', isError: true, isLoading: false });
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">

            <AnimatePresence>
                {logoutStatus.isLoading && (
                    <LoadingModal status={{ message: logoutStatus.message, isError: logoutStatus.isError }} />
                )}
            </AnimatePresence>

            <LogoutModal 
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                isLoading={logoutStatus.isLoading} 
            />
            {/* MOBILE MENU BUTTON */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-60 p-2 bg-[#020617] text-white rounded-lg shadow-lg"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0f1d] text-slate-400 p-6 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800/40
                ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                md:translate-x-0 md:static md:inset-0
            `}>
                {/* BRANDING - Premium Glass Effect */}
                <div className="flex items-center gap-4 px-2 mb-10">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-linear-to-tr from-emerald-500 to-blue-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative w-11 h-11 bg-[#161b2c] border border-slate-700/50 rounded-xl flex items-center justify-center overflow-hidden shadow-inner">
                            <Image 
                                src="/ccit-logo.png" 
                                alt="CCIT Logo"
                                width={32}
                                height={32}
                                priority
                                className="object-contain" 
                            />
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-black tracking-tight text-xl leading-none">
                            CCIT<span className="text-emerald-500">.</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold tracking-[0.25em] uppercase mt-1.5">
                            Admin Console
                        </span>
                    </div>
                </div>

                <nav className="flex-1 space-y-1 px-3">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    
                    return (
                    <Link key={item.name} href={item.href} className="relative block group">
                        <div className={`
                        relative flex items-center gap-3 px-4 py-2.5 rounded-xl
                        transition-all duration-300 ease-out
                        ${isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-100'}
                        `}>
                        
                        {/* Active Background - Framer Motion Layout Animation */}
                        {isActive && (
                            <motion.div
                            layoutId="nav-active"
                            className="absolute inset-0 bg-emerald-500/5 border border-emerald-500/20 rounded-xl"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                        )}

                        {/* Indicator Light */}
                        {isActive && (
                            <motion.div 
                            layoutId="nav-indicator"
                            className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-r-full shadow-[0_0_12px_rgba(16,185,129,0.8)]"
                            />
                        )}

                        {/* Icon with subtle scale effect */}
                        <item.icon 
                            size={18} 
                            className={`
                            relative z-10 transition-transform duration-300
                            ${isActive ? 'scale-110 text-emerald-500' : 'group-hover:scale-110 text-slate-500 group-hover:text-slate-300'}
                            `} 
                        />

                        {/* Text with refined letter spacing */}
                        <span className={`
                            relative z-10 text-[0.875rem] tracking-tight transition-all duration-300
                            ${isActive ? 'font-semibold' : 'font-medium'}
                        `}>
                            {item.name}
                        </span>

                        {/* Subtle Hover Glow (Only for non-active items) */}
                        {!isActive && (
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-slate-800/40 rounded-xl transition-opacity duration-300 -z-10" />
                        )}
                        </div>
                    </Link>
                    );
                })}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800/60">
                    <button 
                        onClick={() => setShowLogoutModal(true)} // Trigger modal
                        className="flex items-center gap-3 px-4 py-3.5 w-full text-slate-500 hover:text-rose-400 bg-slate-900/50 hover:bg-rose-500/5 rounded-xl transition-all duration-300 group border border-slate-800/50 hover:border-rose-500/20"
                    >
                        <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-rose-500/10 transition-colors">
                            <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">
                            Sign Out
                        </span>
                    </button>
                    {/* Status Indicator */}
                    <div className="mt-4 px-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">System Operational</span>
                    </div>
                </div>
            </aside>

            {/* OVERLAY FOR MOBILE */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                    />
                )}
            </AnimatePresence>

            {/* MAIN CONTENT CONTAINER */}
            <main className="flex-1 h-screen overflow-y-auto overflow-x-hidden relative">
                <div className="p-4 md:p-8 lg:p-12">
                    {children}
                </div>
            </main>
        </div>
    );
}