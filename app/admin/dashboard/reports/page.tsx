'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
    Search, FileText, 
    Calendar as CalendarIcon, User, Loader2, ArrowRight, FileDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportsSkeleton = () => (
    <div className="space-y-8 p-2 animate-pulse">
        {/* Header Skeleton */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-3">
                <div className="h-10 bg-slate-200 w-80 rounded-xl" />
                <div className="h-4 bg-slate-100 w-64 rounded-md" />
            </div>
            <div className="h-12 bg-slate-200 w-40 rounded-2xl" />
        </header>

        {/* Filter Card Skeleton */}
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-3 bg-slate-100 w-20 rounded ml-1" />
                        <div className="h-12 bg-slate-50 rounded-2xl border border-slate-100" />
                    </div>
                ))}
                <div className="h-12 bg-slate-200 rounded-2xl mt-auto" />
            </div>
        </section>

        {/* Summary & Table Skeleton */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
            {/* Results Breakdown Header */}
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                <div className="space-y-2">
                    <div className="h-6 bg-slate-200 w-48 rounded-lg" />
                    <div className="h-3 bg-slate-100 w-32 rounded" />
                </div>
                <div className="text-right space-y-2">
                    <div className="h-3 bg-slate-100 w-24 rounded ml-auto" />
                    <div className="h-10 bg-slate-200 w-20 rounded-xl ml-auto" />
                </div>
            </div>

            {/* Table Rows */}
            <div className="p-8 space-y-6">
                {[1, 2, 3, 4, 5].map((row) => (
                    <div key={row} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                        <div className="h-6 bg-slate-100 w-24 rounded-full" />
                        <div className="space-y-2 flex-1 px-12 hidden md:block">
                            <div className="h-4 bg-slate-200 w-40 rounded" />
                            <div className="h-2 bg-slate-100 w-24 rounded" />
                        </div>
                        <div className="h-4 bg-slate-100 w-32 rounded hidden lg:block" />
                        <div className="h-8 bg-slate-200 w-16 rounded-lg" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);
interface jsPDFCustom extends jsPDF {
    lastAutoTable: {
        finalY: number;
    }
}

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

export default function ReportsPage() {
    const [logs, setLogs] = useState<ITimeLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        studentId: '',
        startDate: '',
        endDate: ''
    });
    const [initialFetch, setInitialFetch] = useState(true);

    const handleExportPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4') as jsPDFCustom;
        const pageWidth = 297;
        const centerX = pageWidth / 2;
        const prmsuLogo = "/prmsu.png"; 
        const ccitLogo = "/ccit-logo.png";

        // 2. REUSABLE HEADER (Removed [cite] markers and fixed unused 'data' warning)
        const drawHeader = () => {
            doc.addImage(prmsuLogo, 'PNG', 40, 12, 20, 20);
            doc.addImage(ccitLogo, 'PNG', 237, 12, 20, 20);

            doc.setFont("times", "normal");
            doc.setFontSize(10);
            doc.text("Republic of the Philippines", centerX, 18, { align: "center" });

            doc.setFont("times", "bold");
            doc.setFontSize(11);
            doc.text("PRESIDENT RAMON MAGSAYSAY STATE UNIVERSITY", centerX, 23, { align: "center" });

            doc.setFont("times", "normal");
            doc.setFontSize(10);
            doc.text("Iba, Zambales Philippines", centerX, 28, { align: "center" });

            doc.setFontSize(11);
            // Dynamic period text based on filters
            const period = filters.startDate && filters.endDate 
                ? `${filters.startDate} to ${filters.endDate}` 
                : "__________________________________________";
            
            doc.text("Office/Department:____________________________________________________________", 22, 45);
            doc.text(`Period: ${period}`, 22, 53);
        };

        const sortedLogs = [...logs].sort((a, b) => 
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const tableData = sortedLogs.map(log => [
            log.date, 
            log.fullName, 
            log.amIn || '', log.amOut || '', '', 
            log.pmIn || '', log.pmOut || '', '', 
            log.otIn || '', log.otOut || '', ''  
        ]); 

        while (tableData.length < 20) {
            tableData.push(['', '', '', '', '', '', '', '', '', '', '']);
        }

        autoTable(doc, {
            startY: 60,
            margin: { left: 22, right: 22, top: 60 },
            head: [
                [
                    { content: 'Date', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'Name', rowSpan: 2, styles: { valign: 'middle', halign: 'center' } },
                    { content: 'A.M', colSpan: 3, styles: { halign: 'center' } }, 
                    { content: 'P.M', colSpan: 3, styles: { halign: 'center' } }, 
                    { content: 'Overtime', colSpan: 3, styles: { halign: 'center' } } 
                ],
                [
                    'In', 'Out', 'Signature', 
                    'In', 'Out', 'Signature', 
                    'In', 'Out', 'Signature'
                ]
            ],
            body: tableData,
            theme: 'grid',
            styles: { 
                font: "times", 
                fontSize: 10, 
                cellPadding: 2, 
                lineColor: [0, 0, 0], 
                lineWidth: 0.1,
                textColor: [0, 0, 0]
            },
            headStyles: { 
                fillColor: [255, 255, 255], 
                fontStyle: 'bold',
                halign: 'center' 
            },
            columnStyles: {
                0: { cellWidth: 22 },
                1: { 
                    cellWidth: 60, 
                    overflow: 'linebreak' 
                },
            },
            // 3. FIXED: Properly type the callback and call drawHeader
            didDrawPage: () => {
                drawHeader();
            }
        });

        doc.save(`PRMSU_DTR_Report.pdf`);
    };

    const calculateRowTotal = (log: ITimeLog) => {
        const calc = (start?: string, end?: string) => {
            if (!start || !end) return 0;
            const s = new Date(`2026-01-01 ${start}`);
            const e = new Date(`2026-01-01 ${end}`);
            const diff = (e.getTime() - s.getTime()) / 3600000;
            return diff < 0 ? diff + 24 : diff;
        };

        const actualTotal = calc(log.amIn, log.amOut) + calc(log.pmIn, log.pmOut) + calc(log.otIn, log.otOut);
        
        const cappedTotal = Math.min(actualTotal, 8); 
        
        return cappedTotal.toFixed(2);
    };

    const fetchReports = useCallback(async () => { // 2. I-wrap ito
        setLoading(true);
        try {
            const query = new URLSearchParams(filters).toString();
            const res = await fetch(`/api/reports?${query}`);
            const data = await res.json();
            setLogs(data.data || []);
        } catch (error) {
            console.error("Report Error:", error);
        } finally {
            setLoading(false);
            setInitialFetch(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports])

    const totalAccumulatedHours = useMemo(() => {
        return logs.reduce((acc, log) => acc + parseFloat(calculateRowTotal(log)), 0).toFixed(2);
    }, [logs]);

    if (initialFetch) return <ReportsSkeleton />;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-2"
        >
            {/* Header */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
                        Attendance <span className="text-emerald-600">Reports</span>
                    </h1>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
                        Generate and export OJT performance data
                    </p>
                </div>
                <div className="flex gap-3">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 bg-[#020617] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase hover:bg-slate-800 transition-all shadow-lg"
                    >
                        <FileDown size={16} /> Export PDF
                    </motion.button>
                </div>
            </header>

            {/* Filter Card */}
            <motion.section 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                            <User size={12} /> Student ID
                        </label>
                        <input 
                            type="text" 
                            placeholder="Enter Student ID..."
                            className="w-full bg-slate-50 border text-slate-500 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                            onChange={(e) => setFilters({...filters, studentId: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                            <CalendarIcon size={12} /> Start Date
                        </label>
                        <input 
                            type="date" 
                            className="w-full bg-slate-50 border text-slate-500 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500"
                            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 flex items-center gap-2">
                            <CalendarIcon size={12} /> End Date
                        </label>
                        <input 
                            type="date" 
                            className="w-full bg-slate-50 border text-slate-500 border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:border-emerald-500"
                            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                        />
                    </div>

                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={fetchReports}
                        disabled={loading}
                        className="bg-emerald-600 text-white h-13 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-emerald-200 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Search size={18} />}
                        Generate Log
                    </motion.button>
                </div>
            </motion.section>

            {/* Summary & Table */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden print:border-none print:shadow-none"
            >
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h2 className="text-lg font-black text-slate-900 uppercase">Results Breakdown</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Found {logs.length} Log Entries</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-emerald-600 uppercase">Total Hours for Period</p>
                        <motion.p 
                            key={totalAccumulatedHours}
                            initial={{ scale: 1.1, color: '#10b981' }}
                            animate={{ scale: 1, color: '#0f172a' }}
                            className="text-3xl font-black text-slate-900 tracking-tighter"
                        >
                            {totalAccumulatedHours}h
                        </motion.p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white">
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">AM Log</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">PM Log</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">OT Log</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {logs.length > 0 ? logs.map((log, index) => (
                                    <motion.tr 
                                        key={log._id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="hover:bg-slate-50/80 transition-colors group"
                                    >
                                        <td className="px-8 py-4">
                                            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{log.date}</span>
                                        </td>
                                        <td className="px-8 py-4">
                                            <p className="text-xs font-black text-slate-900 uppercase">{log.fullName}</p>
                                            <p className="text-[9px] font-bold text-slate-400 tracking-tight">{log.studentId}</p>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <p className="text-[10px] font-bold text-slate-600 tracking-tighter">
                                                {log.amIn || '--'} <ArrowRight size={10} className="inline mx-1 text-slate-300" /> {log.amOut || '--'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <p className="text-[10px] font-bold text-slate-600 tracking-tighter">
                                                {log.pmIn || '--'} <ArrowRight size={10} className="inline mx-1 text-slate-300" /> {log.pmOut || '--'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <p className={`text-[10px] font-black tracking-tighter ${log.otIn ? 'text-rose-500' : 'text-slate-300'}`}>
                                                {log.otIn || '--'} - {log.otOut || '--'}
                                            </p>
                                        </td>
                                        <td className="px-8 py-4 text-right">
                                            <span className="text-sm font-black text-emerald-600 tracking-tighter group-hover:scale-110 transition-transform inline-block">
                                                {calculateRowTotal(log)}h
                                            </span>
                                        </td>
                                    </motion.tr>
                                )) : (
                                    <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                        <td colSpan={6} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-2 opacity-20">
                                                <FileText size={48} />
                                                <p className="text-xs font-black uppercase tracking-[0.2em]">No logs found</p>
                                            </div>
                                        </td>
                                    </motion.tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </motion.div>
    );
}