'use client';

import { useState, useEffect, memo, useRef } from 'react';
import { Clock, User, Loader2, CheckCircle2, History, ChevronDown} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import { motion, AnimatePresence} from 'framer-motion'; 

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

// Gamitin ang ganitong pattern para mawala ang ESLint error sa memo
const AnimatedNumber = memo(function AnimatedNumber({ value }: { value: string }) {
    return (
        <div className="flex justify-end tabular-nums font-mono tracking-tighter">
            {value.split('').map((char, index) => (
                <div 
                    key={index} 
                    /* 1. Importante: Siguraduhin na ang width ay saktong 0.6em para sa digits para hindi gumagalaw ang layout */
                    className={`relative h-6 overflow-hidden flex justify-center ${char === ':' ? 'w-[0.3em]' : 'w-[0.6em]'}`}
                >
                    <AnimatePresence mode="popLayout">
                        <motion.span
                            /* 2. Gamitin ang char bilang bahagi ng key para ma-trigger ang exit/enter animation */
                            key={`${index}-${char}`}
                            initial={{ y: 15, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -15, opacity: 0 }}
                            transition={{ 
                                duration: 0.2,
                                ease: [0.23, 1, 0.32, 1] 
                            }}
                            className="absolute inset-0 flex justify-center items-center"
                        >
                            {char}
                        </motion.span>
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
});

AnimatedNumber.displayName = "AnimatedNumber";

export default function AttendancePage() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [todayLogs, setTodayLogs] = useState<TimeLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [, setTick] = useState(0);

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

    const tickRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {

        loadData(); 

        const dbSync = setInterval(loadData, 15000);

        // Accurate Ticker Logic
        const startTicker = () => {
            const tick = () => {
                setTick(t => t + 1);
                const now = new Date();
                const delay = 1000 - now.getMilliseconds();
                tickRef.current = setTimeout(tick, delay);
            };
            
            const initialDelay = 1000 - new Date().getMilliseconds();
            tickRef.current = setTimeout(tick, initialDelay);
        };

        startTicker();

        return () => {
            clearInterval(dbSync);
            if (tickRef.current) clearTimeout(tickRef.current);
        };
    }, []); // Empty dependency array para tumakbo lang sa mount

    const currentLog = todayLogs.find((l: TimeLog) => l.studentId === selectedId);

    const getButtonConfig = () => {
        if (!selectedId) return { label: "Select OJT Name", color: "bg-slate-400", disabled: true };
        if (loading) return { label: "Processing...", color: "bg-slate-600", disabled: true };

        if (!currentLog) return { label: "Time In (AM)", color: "bg-emerald-600", disabled: false };
        
        if (currentLog.amIn && !currentLog.amOut) return { label: "Time Out (AM)", color: "bg-red-500", disabled: false };
        if (!currentLog.pmIn) return { label: "Time In (PM)", color: "bg-green-600", disabled: false };
        if (currentLog.pmIn && !currentLog.pmOut) return { label: "Time Out (PM)", color: "bg-red-700", disabled: false };
        if (!currentLog.otIn) return { label: "Start Overtime", color: "bg-green-600", disabled: false };
        if (currentLog.otIn && !currentLog.otOut) return { label: "End Overtime", color: "bg-red-700", disabled: false };

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
    
    const calculateStudentLiveHours = (log: TimeLog) => {
        const parseTimeToDate = (timeString: string | null | undefined) => {
            if (!timeString) return null;
            try {
                const [time, modifier] = timeString.split(' ');
                const [hoursRaw, minutes] = time.split(':').map(Number);
                let hours = hoursRaw;
                
                if (modifier === 'PM' && hours < 12) hours += 12;
                if (modifier === 'AM' && hours === 12) hours = 0;

                const d = new Date();
                d.setHours(hours, minutes, 0, 0); 
                return d;
            } catch { return null; }
        };

        const formatTime = (ms: number) => {
            const totalSeconds = Math.max(0, Math.floor(ms / 1000));
            const h = Math.floor(totalSeconds / 3600);
            const m = Math.floor((totalSeconds % 3600) / 60);
            const s = totalSeconds % 60;
            return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        };

        let totalMs = 0;
        
        const shifts = [
            { in: log.amIn, out: log.amOut },
            { in: log.pmIn, out: log.pmOut },
            { in: log.otIn, out: log.otOut }
        ];

        shifts.forEach(shift => {
            const tIn = parseTimeToDate(shift.in);
            const tOut = parseTimeToDate(shift.out);
            if (tIn && tOut) {
                totalMs += (tOut.getTime() - tIn.getTime());
            }
        });

        if (log.status !== 'Complete') {
            const activeInTimeStr = 
                (log.otIn && !log.otOut) ? log.otIn : 
                (log.pmIn && !log.pmOut) ? log.pmIn : 
                (log.amIn && !log.amOut) ? log.amIn : null;

            if (activeInTimeStr) {
                const activeInDate = parseTimeToDate(activeInTimeStr);
                if (activeInDate) {
                    const diff = Date.now() - activeInDate.getTime();
                    if (diff > 0) totalMs += diff;
                }
            }
        }

        return formatTime(totalMs);
    };

   return (
        <div className="space-y-8 p-2 font-sans">
            <Toaster position="top-right" />
            
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
                        Time Log <span className="text-emerald-600">Management</span>
                    </h1>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Monitor real-time attendance and rendered hours.</p>
                </div>
                
                <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-2xl shadow-sm border border-slate-100 self-start md:self-center">
                    <div className={`w-2 h-2 rounded-full ${todayLogs.length > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {todayLogs.length} Active OJT Today
                    </span>
                </div>
            </div>

            {/* --- TOP SECTION: ATTENDANCE ACTION --- */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-100 shadow-sm relative overflow-hidden"
            >
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-600 p-2.5 rounded-2xl shadow-lg shadow-emerald-200">
                                <Clock className="text-white" size={24} strokeWidth={2.5} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Smart Check-in</h2>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 block">
                                Identify Yourself
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                    <User size={20} strokeWidth={2.5} />
                                </div>

                                <select 
                                    value={selectedId}
                                    onChange={(e) => setSelectedId(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-14 pr-12 py-4 text-slate-700 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold appearance-none disabled:opacity-50"
                                    disabled={fetching}
                                >
                                    <option value="">Select your name from the list...</option>
                                    {students.map((s) => (
                                        <option key={s._id} value={s.studentId}>{s.fullName}</option>
                                    ))}
                                </select>

                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={20} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center md:justify-end">
                        <motion.button
                                whileHover={{ scale: config.disabled || fetching ? 1 : 1.02 }}
                                whileTap={{ scale: config.disabled || fetching ? 1 : 0.98 }}
                                disabled={config.disabled || fetching}
                                onClick={handleTap}
                                // Ginamit na natin ang canonical class na rounded-4xl
                                className={`w-full max-w-sm py-10 rounded-4xl ${config.color} text-white flex flex-col items-center gap-2 shadow-xl shadow-slate-200 transition-all duration-300 disabled:grayscale disabled:opacity-70`}
                            >
                            {loading || fetching ? <Loader2 className="animate-spin" size={36} /> : <CheckCircle2 size={36} />}
                            <span className="text-2xl font-black uppercase italic tracking-tighter">
                                {fetching ? "Loading..." : config.label}
                            </span>
                            
                            {selectedId && currentLog && !fetching && (
                                <div className="bg-black/10 px-4 py-1 rounded-full mt-2 backdrop-blur-md">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/90">
                                        Rendered: {calculateStudentLiveHours(currentLog)} hrs
                                    </span>
                                </div>
                            )}
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* --- BOTTOM SECTION: TABLE --- */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                    <h2 className="text-[10px] font-black flex items-center gap-2 uppercase tracking-[0.2em] text-slate-400">
                        <History size={14} /> Activity Logs
                    </h2>
                    {fetching && <Loader2 size={14} className="animate-spin text-slate-400" />}
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white border-b border-slate-50">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">OJT Details</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">AM Shift</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">PM Shift</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Overtime</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Total Hours</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode='popLayout'>
                                {todayLogs.map((log) => (
                                    <motion.tr 
                                        layout
                                        key={log._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-700 uppercase text-sm tracking-tight">{log.fullName}</div>
                                            <div className={`inline-flex items-center gap-1.5 text-[9px] font-black px-2 py-0.5 rounded-full mt-1 border ${
                                                log.status === 'Complete' 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : 'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                <div className={`w-1 h-1 rounded-full ${log.status === 'Complete' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                {log.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center text-[11px] font-bold text-slate-500 tabular-nums">
                                            {log.amIn || '--'} <span className="text-slate-300 mx-1">/</span> {log.amOut || '--'}
                                        </td>
                                        <td className="px-8 py-5 text-center text-[11px] font-bold text-slate-500 tabular-nums">
                                            {log.pmIn || '--'} <span className="text-slate-300 mx-1">/</span> {log.pmOut || '--'}
                                        </td>
                                        <td className="px-8 py-5 text-center text-[11px] font-bold text-slate-500 tabular-nums">
                                            {log.otIn || '--'} <span className="text-slate-300 mx-1">/</span> {log.otOut || '--'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                                                <AnimatedNumber value={calculateStudentLiveHours(log)} />
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {/* --- EMPTY STATE / LOADING STATE --- */}
                    {todayLogs.length === 0 && (
                        <div className="py-24 text-center space-y-3">
                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                                {fetching ? (
                                    <Loader2 className="animate-spin text-emerald-500" size={24} />
                                ) : (
                                    <History className="text-slate-300" size={24} />
                                )}
                            </div>
                            <div className="space-y-1">
                                <p className="text-slate-400 font-black italic text-xs uppercase tracking-widest">
                                    {fetching ? "Synchronizing records..." : "No logs recorded today"}
                                </p>
                                {!fetching && <p className="text-slate-300 text-[10px] uppercase font-medium">Waiting for the first check-in</p>}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

