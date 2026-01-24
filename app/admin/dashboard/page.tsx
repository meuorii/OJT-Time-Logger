'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, LogIn, Zap, Calendar, RefreshCcw, Loader2, Hourglass, TrendingUp 
} from 'lucide-react';

const OverviewSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
                <div className="h-10 bg-slate-200 w-64 rounded-xl mb-3" />
                <div className="h-4 bg-slate-100 w-32 rounded-md" />
            </div>
            <div className="bg-slate-100 h-20 w-64 rounded-2xl border border-slate-200" />
        </header>

        {/* Stat Cards Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100" />
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-50 w-20 rounded" />
                        <div className="h-8 bg-slate-100 w-24 rounded-lg" />
                    </div>
                </div>
            ))}
        </div>

        {/* History Table Skeleton */}
        <div className="w-full bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="h-7 bg-slate-200 w-48 rounded-lg" />
                <div className="h-6 bg-slate-50 w-24 rounded-full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                        <div className="flex justify-between">
                            <div className="h-4 bg-slate-200 w-24 rounded" />
                            <div className="h-4 bg-slate-200 w-12 rounded" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-2 bg-slate-100 w-full rounded" />
                            <div className="h-2 bg-slate-100 w-full rounded" />
                            <div className="h-2 bg-slate-100 w-2/3 rounded" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);
interface ITimeLog {
    _id: string;
    studentId: string;
    fullName: string;
    date: string;
    amIn?: string; amOut?: string;
    pmIn?: string; pmOut?: string;
    otIn?: string; otOut?: string;
    totalHours?: string;
}

// 1. Helper function para sa computation (Client-side version)
const computeLogHours = (log: ITimeLog) => {
    const calculate = (start?: string, end?: string) => {
        if (!start || !end) return 0;
        const s = new Date(`2026-01-01 ${start}`);
        const e = new Date(`2026-01-01 ${end}`);
        const diff = (e.getTime() - s.getTime()) / 3600000;
        return diff < 0 ? diff + 24 : diff;
    };

    const am = calculate(log.amIn, log.amOut);
    const pm = calculate(log.pmIn, log.pmOut);
    const ot = calculate(log.otIn, log.otOut);
    
    const actualTotal = am + pm + ot;

    return {
        total: Math.min(actualTotal, 8), 
        ot: ot,
        isCapped: actualTotal > 8 
    };
};

export default function AdminOverview() {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [loading, setLoading] = useState(true);
    const [allLogs, setAllLogs] = useState<ITimeLog[]>([]);
    const [activeOjtIndex, setActiveOjtIndex] = useState(0);
    const [stats, setStats] = useState({
        totalOJTs: 0,
        loggedInToday: 0,
        overallHours: 0,
        overallOT: 0
    });

    // 2. Updated Memo to use real-time computation
    const studentAccumulatedHours = useMemo(() => {
        const map = new Map<string, { name: string, total: number }>();
        allLogs.forEach(log => {
            const current = map.get(log.studentId) || { name: log.fullName, total: 0 };
            const { total } = computeLogHours(log); // Compute instead of log.totalHours
            map.set(log.studentId, {
                name: log.fullName,
                total: current.total + total
            });
        });
        return Array.from(map.values());
    }, [allLogs]);

    useEffect(() => {
        if (studentAccumulatedHours.length > 0) {
            const interval = setInterval(() => {
                setActiveOjtIndex((prev) => (prev + 1) % studentAccumulatedHours.length);
            }, 4000); 
            return () => clearInterval(interval);
        }
    }, [studentAccumulatedHours]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentRes, logRes] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/time-log') 
            ]);

            const students = await studentRes.json();
            const logsData = await logRes.json();
            const logList: ITimeLog[] = logsData.data || [];
            const todayStr = new Date().toLocaleDateString('en-CA');

            const logsToday = logList.filter(log => log.date === todayStr);

            // 3. Re-calculate overall stats manually to ensure accuracy
            let totalHours = 0;
            let totalOT = 0;

            logList.forEach(log => {
                const { total, ot } = computeLogHours(log);
                totalHours += total;
                totalOT += ot;
            });

            setAllLogs(logList);
            setStats({
                totalOJTs: students.data?.length || 0,
                loggedInToday: logsToday.length,
                overallHours: Number(totalHours.toFixed(2)),
                overallOT: Number(totalOT.toFixed(2))
            });

        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, [fetchData]);

    const statCards = [
        { label: 'Registered OJTs', value: stats.totalOJTs, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Active Today', value: stats.loggedInToday, icon: LogIn, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Overall Total Hours', value: `${stats.overallHours}h`, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Total Accumulated OT', value: `${stats.overallOT}h`, icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    if (loading) return <OverviewSkeleton />;

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
                        className="flex items-center gap-2 mt-2 text-slate-500 hover:text-emerald-600 transition-colors font-bold text-xs uppercase tracking-widest"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                        Sync Historical Data
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
                        className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm"
                    >
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            <stat.icon size={22} />
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                            {loading ? "..." : stat.value}
                        </h3>
                    </motion.div>
                ))}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white p-6 rounded-4xl border border-slate-100 shadow-sm overflow-hidden relative"
                >
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                        <Hourglass size={22} />
                    </div>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Student Total Hours</p>
                    
                    <div className="h-8 relative">
                        <AnimatePresence mode="wait">
                            {studentAccumulatedHours.length > 0 ? (
                                <motion.div
                                    key={studentAccumulatedHours[activeOjtIndex].name}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0"
                                >
                                    <h3 className="text-xl font-black text-slate-900 tracking-tight truncate">
                                        {studentAccumulatedHours[activeOjtIndex].total.toFixed(2)}h
                                    </h3>
                                    <p className="text-[9px] font-bold text-emerald-600 uppercase truncate">
                                        {studentAccumulatedHours[activeOjtIndex].name}
                                    </p>
                                </motion.div>
                            ) : (
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">0.00h</h3>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            <div className="w-full bg-white rounded-[3rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Recent Historical Activity</h2>
                    <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-3 py-1 rounded-full uppercase tracking-tighter">Synced Database</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {allLogs.slice(0, 6).map((log) => {
                        // 4. Compute for individual cards
                        const { total } = computeLogHours(log);
                        
                        return (
                            <div key={log._id} className="p-5 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-xs font-black text-slate-900 uppercase truncate max-w-37.5">{log.fullName}</p>
                                    <span className="text-[9px] font-bold bg-white px-2 py-1 rounded-lg shadow-sm text-slate-500">{log.date}</span>
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <p className="text-[8px] text-slate-400 font-black uppercase">AM: {log.amIn || '--'} - {log.amOut || '--'}</p>
                                        <p className="text-[8px] text-slate-400 font-black uppercase">PM: {log.pmIn || '--'} - {log.pmOut || '--'}</p>
                                        <p className="text-[8px] text-rose-400 font-black uppercase">OT: {log.otIn || '--'} - {log.otOut || '--'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black text-emerald-600 tracking-tighter group-hover:scale-110 transition-transform">
                                            {total.toFixed(2)}h
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}