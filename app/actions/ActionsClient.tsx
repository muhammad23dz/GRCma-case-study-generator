'use client';


import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { CheckSquare, Clock, Plus, Trash2, Calendar, User, ArrowRight } from 'lucide-react';

interface Action {
    id: string;
    type: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    assignee?: string;
    dueDate?: string;
    control?: { title: string };
}

export default function ActionsClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightStatus = searchParams.get('status');

    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'remediation',
        priority: 'medium',
        assignee: '',
        dueDate: '',
        severity: 'medium'
    });

    useEffect(() => {
        fetchActions();
    }, []);

    const fetchActions = async () => {
        try {
            const res = await fetch('/api/actions');
            if (res.status === 401) {
                // User not authenticated - redirect to sign-in
                router.push('/sign-in');
                return;
            }
            if (!res.ok) {
                console.error(`Error fetching actions: ${res.status}`);
                setActions([]);
                return;
            }
            const text = await res.text();
            try {
                const data = JSON.parse(text);
                setActions(data.actions || []);
            } catch (e) {
                console.error('Failed to parse actions JSON:', text.substring(0, 100));
                setActions([]);
            }
        } catch (error) {
            console.error('Error fetching actions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setErrorMessage(null);
        try {
            const res = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                setShowModal(false);
                setFormData({
                    title: '',
                    description: '',
                    type: 'remediation',
                    priority: 'medium',
                    assignee: '',
                    dueDate: '',
                    severity: 'medium'
                });
                fetchActions();
            } else {
                setErrorMessage(data.error || 'Failed to create task. Please try again.');
            }
        } catch (error: any) {
            console.error('Error creating action:', error);
            setErrorMessage('Network error. Please check your connection.');
        } finally {
            setCreating(false);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    // Kanban Columns
    const columns = {
        open: actions.filter(a => a.status === 'open'),
        in_progress: actions.filter(a => a.status === 'in_progress'),
        completed: actions.filter(a => a.status === 'completed')
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this action?')) return;
        try {
            const res = await fetch(`/api/actions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setActions(actions.filter(a => a.id !== id));
            } else {
                alert('Failed to delete action');
            }
        } catch (error) {
            console.error('Error deleting action:', error);
        }
    };

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto w-full">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Action Center</h1>
                            <p className="text-slate-400">Track remediation tasks and compliance workflows</p>
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 font-bold flex items-center gap-2 group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                Create Task
                            </button>
                        </div>
                    </div>

                    {/* Kanban Board */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
                        {(Object.keys(columns) as Array<keyof typeof columns>).map((status) => {
                            const isHighlighted = highlightStatus === status;
                            return (
                                <div
                                    key={status}
                                    className={`bg-slate-900/40 backdrop-blur-md rounded-2xl p-6 border shadow-xl transition-all ${isHighlighted
                                        ? 'border-emerald-500/50 ring-1 ring-emerald-500/30 shadow-emerald-500/10'
                                        : 'border-white/5'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="uppercase text-sm font-bold text-slate-400 tracking-wider flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${status === 'open' ? 'bg-orange-500' :
                                                status === 'in_progress' ? 'bg-blue-500' :
                                                    'bg-emerald-500'
                                                } shadow-[0_0_10px_rgba(255,255,255,0.3)]`}></div>
                                            {status.replace('_', ' ')}
                                        </h3>
                                        <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-colors ${isHighlighted
                                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                            : 'bg-white/5 text-white border-white/5'
                                            }`}>
                                            {columns[status].length}
                                        </span>
                                    </div>

                                    <div className="space-y-4">
                                        {columns[status].map((action) => (
                                            <div key={action.id} className="bg-slate-950/50 border border-white/5 rounded-xl p-5 hover:border-emerald-500/30 hover:bg-slate-900/80 transition-all cursor-pointer group relative shadow-md hover:shadow-emerald-500/5">
                                                <div className="flex justify-between items-start mb-3">
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded border ${getPriorityColor(action.priority)}`}>
                                                        {action.priority}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        {action.dueDate && (
                                                            <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-white/5">
                                                                <Calendar className="w-3 h-3" />
                                                                {new Date(action.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleDelete(e, action.id)}
                                                            className="text-slate-600 hover:text-red-400 p-1 rounded hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <h4 className="text-white font-bold mb-2 group-hover:text-emerald-400 transition-colors text-sm leading-snug">
                                                    {action.title}
                                                </h4>
                                                <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-3">
                                                    {action.description}
                                                </p>
                                                <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-white/5 text-[10px]">
                                                            {(action.assignee?.[0] || 'U').toUpperCase()}
                                                        </div>
                                                        <span className="text-slate-500 truncate max-w-[80px]">{action.assignee || 'Unassigned'}</span>
                                                    </div>
                                                    <span className="text-slate-600 capitalize bg-slate-900 px-2 py-0.5 rounded text-[10px] border border-white/5">{action.type}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {columns[status].length === 0 && (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-600 border-2 border-dashed border-white/5 rounded-xl bg-slate-950/20">
                                                <CheckSquare className="w-8 h-8 mb-2 opacity-20" />
                                                <span className="text-xs font-medium">No tasks</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-2">Create New Task</h2>
                            <p className="text-slate-400 text-sm">Assign a new action item or remediation task.</p>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Title</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 resize-none font-mono text-sm"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Priority</label>
                                        <select
                                            value={formData.priority}
                                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all appearance-none"
                                        >
                                            <option value="remediation">Remediation</option>
                                            <option value="review">Review</option>
                                            <option value="attestation">Attestation</option>
                                            <option value="assessment">Assessment</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Assignee (Email)</label>
                                        <input
                                            type="email"
                                            value={formData.assignee}
                                            onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                            placeholder="user@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Due Date</label>
                                        <input
                                            type="date"
                                            value={formData.dueDate}
                                            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all calendar-picker-indicator:invert"
                                        />
                                    </div>
                                </div>
                            </div>
                            {/* Error Display */}
                            {errorMessage && (
                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                                    {errorMessage}
                                </div>
                            )}
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {creating ? (
                                        <>
                                            <span className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        'Create Task'
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setErrorMessage(null); }}
                                    disabled={creating}
                                    className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
