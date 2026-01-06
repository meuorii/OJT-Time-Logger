'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    UserPlus, Search, Edit2, Trash2, X, Check, Loader2, AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface IStudent {
    _id: string;
    fullName: string;
    studentId: string;
}

export default function OJTManagement() {
    const [students, setStudents] = useState<IStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<IStudent | null>(null);
    const [formData, setFormData] = useState({ fullName: '', studentId: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const fetchStudents = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/students');
            const result = await res.json();
            setStudents(result.data || []);
        } catch (err) {
            console.error("Failed to load students", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    // Open modal function
    const handleOpenModal = (student?: IStudent) => {
        setError('');
        if (student) {
            setEditingStudent(student);
            setFormData({ fullName: student.fullName, studentId: student.studentId });
        } else {
            setEditingStudent(null);
            setFormData({ fullName: '', studentId: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        const method = editingStudent ? 'PATCH' : 'POST';
        const endpoint = '/api/students';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingStudent ? { ...formData, id: editingStudent._id } : formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Something went wrong');

            toast.success(editingStudent ? 'Student updated successfully' : 'Student added successfully')

            setIsModalOpen(false);
            fetchStudents();
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredStudents = students.filter(s => 
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.includes(searchTerm)
    );

    return (
        <div className="space-y-8 p-2">
            {/* TOP HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 uppercase">
                        OJT <span className="text-emerald-600">Management</span>
                    </h1>
                    <p className="text-slate-500 font-medium">Add, update, or remove interns from the system.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="flex items-center justify-center gap-2 bg-[#020617] text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
                >
                    <UserPlus size={18} className="text-emerald-400" />
                    ADD NEW STUDENT
                </button>
            </div>

            {/* SEARCH AREA */}
            <div className="relative max-w-md group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                <input 
                    type="text"
                    placeholder="Search by name or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all shadow-sm"
                />
            </div>

            {/* TABLE CONTAINER */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Student ID</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Full Name</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={3} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-500" /></td></tr>
                            ) : filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                    <tr key={student._id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="font-mono text-sm font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                                {student.studentId}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-bold text-slate-700">{student.fullName}</td>
                                        <td className="px-8 py-5 text-right">
                                            <button 
                                                onClick={() => handleOpenModal(student)}
                                                className="p-2 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-xl transition-all mr-2"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={3} className="py-20 text-center text-slate-400 font-medium">No students found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL OVERLAY */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        />
                        
                        {/* Modal Card */}
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                        >
                            {/* Modal Header Decor */}
                            <div className={`h-2 w-full ${editingStudent ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                                            {editingStudent ? 'Edit Student' : 'Add Student'}
                                        </h2>
                                        <p className="text-slate-500 text-sm font-medium">
                                            {editingStudent ? 'Update existing intern record.' : 'Register a new intern to the system.'}
                                        </p>
                                    </div>
                                    <button onClick={() => setIsModalOpen(false)} className="text-slate-300 hover:text-slate-900 transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    {error && (
                                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl flex items-center gap-3 text-xs font-bold border border-rose-100">
                                            <AlertCircle size={18} /> {error}
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Student ID Number</label>
                                        <input 
                                            required
                                            type="text"
                                            placeholder="Enter Student ID"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-500 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2 mb-2 block">Full Name</label>
                                        <input 
                                            required
                                            type="text"
                                            placeholder="Enter Student Full Name"
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-slate-500 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button 
                                            type="button"
                                            onClick={() => setIsModalOpen(false)}
                                            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                        <button 
                                            disabled={isSubmitting}
                                            type="submit"
                                            className={`flex-1 ${editingStudent ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'} text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2`}
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                                            {editingStudent ? 'UPDATE' : 'REGISTER'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}