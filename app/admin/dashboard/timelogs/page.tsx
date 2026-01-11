'use client';

import { useState, useEffect } from 'react';
import { Clock, User, Loader2, CheckCircle2, History } from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion'; // Dagdag para sa animations

// 1. Typescript Definitions (Fixes the 'never' errors)
interface TimeLog {
    _id: string;
    studentId: string;
    fullName: string;
    amIn?: string;
    amOut?: string;
    pmIn?: string;
    pmOut?: string;
    otIn?: string;
    otOut?: string;
    totalHours?: number;
    status: string;
}

interface Student {
    _id: string;
    studentId: string;
    fullName: string;
}

interface TimeTagProps {
    label: string;
    in?: string | null;  // Pwedeng string, pwedeng wala (undefined), o null
    out?: string | null;
}

export default function AttendancePage() {
    // 2. Explicitly define types in useState
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [todayLogs, setTodayLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const loadData = async () => {
        try {
            const [resStudents, resLogs] = await Promise.all([
                fetch('/api/students'),
                fetch('/api/time-log')
            ]);
            const sData = await resStudents.json();
            const lData = await resLogs.json();
            setStudents(sData.data || []);
            setTodayLogs(lData.data || []);
        } catch  {
            toast.error("Failed to sync data with server");
        } finally {
            setFetching(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    // 3. Finding current log is now safe because of types
    const currentLog = todayLogs.find((l: TimeLog) => l.studentId === selectedId);

    const getButtonConfig = () => {
        if (!selectedId) return { label: "Select OJT Name", color: "bg-slate-400", disabled: true };
        if (loading) return { label: "Processing...", color: "bg-slate-600", disabled: true };

        if (!currentLog) return { label: "Time In (AM)", color: "bg-emerald-600", disabled: false };
        
        if (currentLog.amIn && !currentLog.amOut) return { label: "Time Out (AM)", color: "bg-orange-500", disabled: false };
        if (!currentLog.pmIn) return { label: "Time In (PM)", color: "bg-blue-600", disabled: false };
        if (currentLog.pmIn && !currentLog.pmOut) return { label: "Time Out (PM)", color: "bg-indigo-600", disabled: false };
        if (!currentLog.otIn) return { label: "Start Overtime", color: "bg-purple-600", disabled: false };
        if (currentLog.otIn && !currentLog.otOut) return { label: "End Overtime", color: "bg-rose-600", disabled: false };

        return { label: "Duty Completed", color: "bg-slate-800", disabled: true };
    };

    const config = getButtonConfig();

    const handleTap = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/time-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId: selectedId })
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || result.message);
            toast.success(result.message || "Log recorded successfully!");
            await loadData();
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "An Unexpected error occured");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans">
            <Toaster position="top-right" />
            
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
                {/* --- LEFT SIDE --- */}
                <div className="lg:col-span-5 space-y-6">
                    <motion.div 
                        whileHover={{ boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                        className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-white"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <Clock className="text-emerald-600" size={24} />
                            <h1 className="text-2xl font-black text-slate-900 italic uppercase">Smart Attendance</h1>
                        </div>

                        <div className="space-y-6">
                        {/* DROPDOWN WITH USER ICON */}
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                                OJT Name Selection
                            </label>
                            <div className="relative">
                                {/* User Icon positioned inside the select box */}
                                <User 
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" 
                                    size={18} 
                                />
                                <select 
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-slate-700 appearance-none outline-none focus:border-emerald-500 transition-colors"
                                >
                                    <option value="">Choose your name...</option>
                                    {students.map((s) => (
                                        <option key={s._id} value={s.studentId}>{s.fullName}</option>
                                    ))}
                                </select>
                                {/* Custom arrow for the dropdown */}
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M2 4L6 8L10 4" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* SMART BUTTON */}
                        <motion.button
                            whileHover={{ scale: config.disabled ? 1 : 1.02 }}
                            whileTap={{ scale: config.disabled ? 1 : 0.95 }}
                            disabled={config.disabled}
                            onClick={handleTap}
                            className={`w-full py-12 rounded-[2.5rem] ${config.color} text-white flex flex-col items-center gap-3 shadow-lg transition-colors`}
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={40} />
                            ) : (
                                <div className="bg-white/20 p-4 rounded-full">
                                    <CheckCircle2 size={32} />
                                </div>
                            )}
                            <span className="text-2xl font-black uppercase italic tracking-tighter">
                                {config.label}
                            </span>
                        </motion.button>
                    </div>
                    </motion.div>
                </div>

                {/* --- RIGHT SIDE --- */}
                <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 shadow-xl border border-white overflow-hidden">
                    <h2 className="text-lg font-black mb-8 flex items-center gap-2 uppercase italic">
                        <History size={20} /> Logs Today
                    </h2>

                    <div className="space-y-3 max-h- overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode='popLayout'>
                            {/* CHECK FETCHING STATE FIRST */}
                            {fetching ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3"
                                >
                                    <Loader2 className="animate-spin text-emerald-500" size={32} />
                                    <p className="font-bold italic text-sm">Syncing logs...</p>
                                </motion.div>
                            ) : todayLogs.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-slate-400 font-bold italic text-sm"
                                >
                                    No logs found for today.
                                </motion.div>
                            ) : (
                                todayLogs.map((log) => (
                                    <motion.div 
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        key={log._id} 
                                        className="p-5 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between hover:border-emerald-200 transition-colors"
                                    >
                                        <div className="space-y-2">
                                            <p className="font-black text-slate-800 uppercase text-sm">{log.fullName}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <TimeTag label="AM" in={log.amIn} out={log.amOut} />
                                                <TimeTag label="PM" in={log.pmIn} out={log.pmOut} />
                                                {log.otIn && <TimeTag label="OT" in={log.otIn} out={log.otOut} />}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase mb-1 ${log.status === 'Complete' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {log.status}
                                            </div>
                                            <p className="text-lg font-black text-slate-900">{log.totalHours || '0.00'}</p>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function TimeTag({ label, in: tIn, out: tOut }: TimeTagProps) {
    return (
        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-1 gap-2">
            <span className="text-[9px] font-black text-slate-600">{label}</span>
            <span className="text-[10px] font-bold text-slate-500">{tIn || '--'} | {tOut || '--'}</span>
        </div>
    );
}