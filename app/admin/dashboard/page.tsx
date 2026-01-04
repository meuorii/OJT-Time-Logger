'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Users, LogIn, UserX, Clock, Zap, Calendar, RefreshCcw, Loader2 
} from 'lucide-react';

// 1. Define Interfaces to fix "Unexpected any"
interface IStudent {
    _id: string;
    fullName: string;
    studentId: string;
}

interface ITimeLog {
    _id: string;
    studentId: string;
    fullName: string;
    date: string;
    timeIn: string;
    timeOut?: string;
}

export default function AdminOverview() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalOJTs: 0,
        loggedInToday: 0,
        lateToday: 0,
        totalHoursToday: 0,
        overtimeToday: 0
    });

    // Clock Timer
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentRes, logRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/time-log')
            ]);

            const students = await studentRes.json();
            const logs = await logRes.json();

            // 2. Assign proper types to the lists
            const studentList: IStudent[] = students.data || [];
            const logList: ITimeLog[] = logs.data || [];

            // Calculate Stats
            const totalOJTs = studentList.length;
            const loggedInToday = logList.length;

            // 3. Updated Filter logic with ITimeLog type
            const lateToday = logList.filter((log: ITimeLog) => {
                const timeIn = new Date(log.timeIn);
                // Late if after 8:00 AM
                return timeIn.getHours() >= 8 && timeIn.getMinutes() > 0;
            }).length;

            // 4. Updated forEach logic with ITimeLog type
            let totalMins = 0;
            logList.forEach((log: ITimeLog) => {
                if (log.timeIn && log.timeOut) {
                    const start = new Date(log.timeIn).getTime();
                    const end = new Date(log.timeOut).getTime();
                    totalMins += (end - start) / (1000 * 60);
                }
            });

            const totalHours = Math.floor(totalMins / 60);

            setStats({
                totalOJTs,
                loggedInToday,
                lateToday,
                totalHoursToday: totalHours,
                overtimeToday: totalHours > 8 ? totalHours - 8 : 0
            });

        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const statCards = [
        { label: 'Total OJTs', value: stats.totalOJTs, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Logged In Today', value: stats.loggedInToday, icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Late Today', value: stats.lateToday, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-50' },
        { label: 'OJT Hours Today', value: `${stats.totalHoursToday}h`, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Overtime Today', value: `${stats.overtimeToday}h`, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8">
            <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
                        Admin <span className="text-emerald-600">Overview</span>
                    </h1>
                    <button 
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 mt-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-xs uppercase tracking-widest disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                        Sync System Data
                    </button>
                </div>

                <div className="bg-[#020617] p-1 pr-6 rounded-2xl flex items-center gap-4 shadow-xl border border-slate-800">
                    <div className="bg-emerald-600 p-3 rounded-xl text-white">
                        <Calendar size={24} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-white font-black tracking-tighter text-lg leading-none">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <span className="text-emerald-500 text-[10px] font-bold tracking-widest uppercase mt-1">
                            {currentTime.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm relative overflow-hidden group"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}>
                            <stat.icon size={22} />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {loading ? "..." : stat.value}
                        </h3>
                    </motion.div>
                ))}
            </div>

            <div className="w-full bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Logs</h2>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Live Connection</span>
                </div>
                
                <div className="h-48 border-2 border-dashed border-slate-100 rounded-4xl flex items-center justify-center flex-col text-slate-400">
                    <div className="animate-pulse bg-slate-50 p-4 rounded-full mb-3">
                        <Zap size={24} className="text-slate-200" />
                    </div>
                    <p className="text-sm font-medium">Real-time attendance feed will appear here.</p>
                </div>
            </div>
        </div>
    );
}