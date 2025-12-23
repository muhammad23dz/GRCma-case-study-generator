'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    BookMarked,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Clock,
    Play,
    CheckCircle,
    ListOrdered
} from 'lucide-react';

interface Runbook {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    triggerCondition?: string;
    estimatedTime?: number;
    owner: string;
    version: string;
    createdAt: string;
}

const RUNBOOK_TYPES = ['incident_response', 'disaster_recovery', 'security', 'operational', 'escalation'];
const STATUS_OPTIONS = ['draft', 'active', 'archived'];

export default function RunbooksPage() {
    const router = useRouter();
    const [runbooks, setRunbooks] = useState<Runbook[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingRunbook, setEditingRunbook] = useState<Runbook | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '', description: '', type: 'incident_response', status: 'draft',
        triggerCondition: '', estimatedTime: '', version: '1.0'
    });

    useEffect(() => {
        fetchRunbooks();
    }, []);

    const fetchRunbooks = async () => {
        try {
            const res = await fetch('/api/runbooks');
            if (res.ok) {
                const data = await res.json();
                setRunbooks(data.runbooks || []);
            }
        } catch (error) {
            console.error('Failed to fetch runbooks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingRunbook ? `/api/runbooks/${editingRunbook.id}` : '/api/runbooks';
            const method = editingRunbook ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    estimatedTime: formData.estimatedTime ? parseInt(formData.estimatedTime) : null
                })
            });

            if (res.ok) {
                setShowModal(false);
                setEditingRunbook(null);
                resetForm();
                fetchRunbooks();
            }
        } catch (error) {
            console.error('Failed to save runbook:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this runbook?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/runbooks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchRunbooks();
            }
        } catch (error) {
            console.error('Failed to delete runbook:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (runbook: Runbook) => {
        setEditingRunbook(runbook);
        setFormData({
            title: runbook.title, description: runbook.description || '', type: runbook.type,
            status: runbook.status, triggerCondition: runbook.triggerCondition || '',
            estimatedTime: runbook.estimatedTime?.toString() || '', version: runbook.version
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '', description: '', type: 'incident_response', status: 'draft',
            triggerCondition: '', estimatedTime: '', version: '1.0'
        });
    };

    const filteredRunbooks = runbooks.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || r.type === filterType;
        return matchesSearch && matchesType;
    });

    const TYPE_LABELS: Record<string, string> = {
        incident_response: 'Incident Response',
        disaster_recovery: 'Disaster Recovery',
        security: 'Security',
        operational: 'Operational',
        escalation: 'Escalation'
    };

    const TYPE_COLORS: Record<string, string> = {
        incident_response: 'text-red-400 bg-red-500/10',
        disaster_recovery: 'text-purple-400 bg-purple-500/10',
        security: 'text-amber-400 bg-amber-500/10',
        operational: 'text-blue-400 bg-blue-500/10',
        escalation: 'text-orange-400 bg-orange-500/10'
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <BookMarked className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Operations</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Runbooks</h1>
                            <p className="text-lg text-slate-400">Standardized operational procedures</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setEditingRunbook(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Create Runbook
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-white">{runbooks.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Runbooks</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-400">{runbooks.filter(r => r.status === 'active').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Active</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-amber-400">{runbooks.filter(r => r.status === 'draft').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Drafts</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-blue-400">{runbooks.reduce((a, r) => a + (r.estimatedTime || 0), 0)}m</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Time</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search runbooks..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">All Types</option>
                            {RUNBOOK_TYPES.map(type => (
                                <option key={type} value={type} className="bg-slate-900">{TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Runbooks Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredRunbooks.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <BookMarked className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Runbooks</h3>
                            <p className="text-slate-400 mb-6">Create your first operational runbook.</p>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Create First Runbook
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredRunbooks.map(runbook => (
                                <div
                                    key={runbook.id}
                                    className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                            <BookMarked className="w-5 h-5 text-cyan-400" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(runbook)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(runbook.id)}
                                                disabled={deleting === runbook.id}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{runbook.title}</h3>
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{runbook.description || 'No description'}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[runbook.type]}`}>
                                            {TYPE_LABELS[runbook.type] || runbook.type}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${runbook.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {runbook.status}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {runbook.estimatedTime || 0} min
                                        </span>
                                        <span>v{runbook.version}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingRunbook ? 'Edit Runbook' : 'Create Runbook'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingRunbook(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {RUNBOOK_TYPES.map(type => (
                                            <option key={type} value={type} className="bg-slate-900">{TYPE_LABELS[type]}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status} className="bg-slate-900">{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Trigger Condition</label>
                                <input
                                    type="text"
                                    value={formData.triggerCondition}
                                    onChange={(e) => setFormData({ ...formData, triggerCondition: e.target.value })}
                                    placeholder="e.g., Security incident detected"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Estimated Time (min)</label>
                                    <input
                                        type="number"
                                        value={formData.estimatedTime}
                                        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Version</label>
                                    <input
                                        type="text"
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingRunbook(null); }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                                >
                                    {editingRunbook ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
