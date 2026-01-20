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
    ChevronRight,
    Loader2
} from 'lucide-react';

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

            {/* SIDEBAR */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-[#020617] text-slate-400 p-6 flex flex-col transition-transform duration-300
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 md:static md:inset-0
            `}>
                {/* BRANDING */}
                <div className="flex items-center gap-3 px-2 mb-12">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                        <div className="w-6 h-6 bg-emerald-500 rounded-md" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-black tracking-tighter text-lg leading-none">CCIT</span>
                        <span className="text-[10px] text-emerald-500 font-bold tracking-[0.2em] uppercase mt-1">Admin Panel</span>
                    </div>
                </div>

                {/* NAVIGATION */}
                <nav className="flex-1 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className={`
                                    flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all group relative overflow-hidden
                                    ${isActive 
                                        ? 'text-white bg-emerald-600/10 border border-emerald-500/20' 
                                        : 'hover:bg-slate-800/40 hover:text-slate-200'}
                                `}>
                                    <div className="flex items-center gap-3 z-10">
                                        <item.icon size={20} className={isActive ? 'text-emerald-500' : 'group-hover:text-slate-300'} />
                                        <span className={`text-sm font-bold ${isActive ? 'tracking-tight' : 'font-medium'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                    
                                    {isActive && (
                                        <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-emerald-500 rounded-r-full" />
                                    )}
                                    
                                    {isActive && <ChevronRight size={14} className="text-emerald-500 z-10" />}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-6 border-t border-slate-800/50">
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-2xl transition-all group disabled:opacity-50"
                    >
                        {isLoggingOut ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        )}
                        <span className="font-bold text-sm">
                            {isLoggingOut ? 'Logging out...' : 'Logout'}
                        </span>
                    </button>
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