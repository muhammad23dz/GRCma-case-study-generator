'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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

export default function ActionsPage() {
    const router = useRouter();
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);
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
            const data = await res.json();
            setActions(data.actions || []);
        } catch (error) {
            console.error('Error fetching actions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
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
            }
        } catch (error) {
            console.error('Error creating action:', error);
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
            case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading actions...</div>
            </div>
        );
    }

    // Kanban Columns
    const columns = {
        open: actions.filter(a => a.status === 'open'),
        in_progress: actions.filter(a => a.status === 'in_progress'),
        completed: actions.filter(a => a.status === 'completed')
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto h-full flex flex-col">
                    <div className="mb-8 flex justify-between items-center flex-shrink-0">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Action Center</h1>
                            <p className="text-gray-400">Track tasks, remediation, and workflows</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg"
                        >
                            + Create Task
                        </button>
                    </div>

                    {/* Kanban Board */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow ">
                        {(Object.keys(columns) as Array<keyof typeof columns>).map((status) => (
                            <div key={status} className="bg-slate-900/50 rounded-xl p-4 flex flex-col h-full border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="uppercase text-sm font-bold text-gray-400 tracking-wider">
                                        {status.replace('_', ' ')}
                                    </h3>
                                    <span className="px-2 py-1 bg-white/10 rounded-full text-xs text-white">
                                        {columns[status].length}
                                    </span>
                                </div>

                                <div className="space-y-4 overflow-y-auto flex-grow pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {columns[status].map((action) => (
                                        <div key={action.id} className="bg-slate-800 border border-white/10 rounded-lg p-4 hover:border-blue-500/50 transition-all cursor-pointer group">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(action.priority)}`}>
                                                    {action.priority}
                                                </span>
                                                {action.dueDate && (
                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        {new Date(action.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <h4 className="text-white font-medium mb-1 group-hover:text-blue-400 transition-colors">
                                                {action.title}
                                            </h4>
                                            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                                                {action.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/5 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                                                        {(action.assignee?.[0] || 'U').toUpperCase()}
                                                    </div>
                                                    <span className="text-gray-400">{action.assignee || 'Unassigned'}</span>
                                                </div>
                                                <span className="text-gray-500 capitalize">{action.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {columns[status].length === 0 && (
                                        <div className="text-center py-8 text-gray-600 text-sm border-2 border-dashed border-white/5 rounded-lg">
                                            No tasks
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Create Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Create New Task</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                                                <select
                                                    value={formData.type}
                                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
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
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Assignee (Email)</label>
                                                <input
                                                    type="email"
                                                    value={formData.assignee}
                                                    onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                                    placeholder="user@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Due Date</label>
                                                <input
                                                    type="date"
                                                    value={formData.dueDate}
                                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all"
                                        >
                                            Create Task
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
