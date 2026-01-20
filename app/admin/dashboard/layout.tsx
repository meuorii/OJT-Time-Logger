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
    Loader2
} from 'lucide-react';
import Image from 'next/image';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const pathname = usePathname();

    const menuItems = [
        { name: 'Admin Overview', icon: LayoutDashboard, href: '/admin/dashboard' },
        { name: 'OJT Management', icon: Briefcase, href: '/admin/dashboard/ojt' },
        { name: 'Time Log Management', icon: Clock, href: '/admin/dashboard/timelogs' },
        { name: 'Attendance & Reports', icon: ClipboardCheck, href: '/admin/dashboard/reports' },
    ];

    const handleLogout = async () => {
        if (isLoggingOut) return;
        
        setIsLoggingOut(true);
        try {
            const res = await fetch('/api/admin/logout', { 
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                window.location.href = '/admin/login';
            }
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#f8fafc]">
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

                {/* FOOTER ACTION - Clean & Professional Logout */}
                <div className="mt-auto pt-6 border-t border-slate-800/60">
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 px-4 py-3.5 w-full text-slate-500 hover:text-rose-400 bg-slate-900/50 hover:bg-rose-500/5 rounded-xl transition-all duration-300 group border border-slate-800/50 hover:border-rose-500/20 disabled:opacity-50"
                    >
                        <div className="p-1.5 rounded-lg bg-slate-800 group-hover:bg-rose-500/10 transition-colors">
                            {isLoggingOut ? (
                                <Loader2 size={16} className="animate-spin text-emerald-500" />
                            ) : (
                                <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            )}
                        </div>
                        <span className="font-bold text-xs uppercase tracking-widest">
                            {isLoggingOut ? 'Terminating...' : 'Sign Out'}
                        </span>
                    </button>
                    
                    {/* Subtle System Status */}
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