'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Workflow,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Clock,
    AlertTriangle,
    CheckCircle,
    Link
} from 'lucide-react';

interface BusinessProcess {
    id: string;
    name: string;
    description?: string;
    owner: string;
    criticality: string;
    status: string;
    rto?: number;
    rpo?: number;
    dependencies?: string;
    stakeholders?: string;
    bcdrPlanId?: string;
    createdAt: string;
}

const CRITICALITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['active', 'inactive', 'under_review'];

export default function ProcessesPage() {
    const router = useRouter();
    const [processes, setProcesses] = useState<BusinessProcess[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterCriticality, setFilterCriticality] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingProcess, setEditingProcess] = useState<BusinessProcess | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', description: '', criticality: 'medium', status: 'active',
        rto: '', rpo: '', dependencies: '', stakeholders: ''
    });

    useEffect(() => {
        fetchProcesses();
    }, []);

    const fetchProcesses = async () => {
        try {
            const res = await fetch('/api/processes');
            if (res.ok) {
                const data = await res.json();
                setProcesses(data.processes || []);
            }
        } catch (error) {
            console.error('Failed to fetch processes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingProcess ? `/api/processes/${editingProcess.id}` : '/api/processes';
            const method = editingProcess ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    rto: formData.rto ? parseInt(formData.rto) : null,
                    rpo: formData.rpo ? parseInt(formData.rpo) : null
                })
            });

            if (res.ok) {
                setShowModal(false);
                setEditingProcess(null);
                resetForm();
                fetchProcesses();
            }
        } catch (error) {
            console.error('Failed to save process:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this business process?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/processes/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchProcesses();
            }
        } catch (error) {
            console.error('Failed to delete process:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (process: BusinessProcess) => {
        setEditingProcess(process);
        setFormData({
            name: process.name, description: process.description || '',
            criticality: process.criticality, status: process.status,
            rto: process.rto?.toString() || '', rpo: process.rpo?.toString() || '',
            dependencies: process.dependencies || '', stakeholders: process.stakeholders || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', description: '', criticality: 'medium', status: 'active',
            rto: '', rpo: '', dependencies: '', stakeholders: ''
        });
    };

    const filteredProcesses = processes.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCriticality = !filterCriticality || p.criticality === filterCriticality;
        return matchesSearch && matchesCriticality;
    });

    const CRITICALITY_COLORS: Record<string, string> = {
        critical: 'text-red-400 bg-red-500/10',
        high: 'text-orange-400 bg-orange-500/10',
        medium: 'text-amber-400 bg-amber-500/10',
        low: 'text-emerald-400 bg-emerald-500/10',
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
                                <Workflow className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Operations</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Business Processes</h1>
                            <p className="text-lg text-slate-400">Critical processes and their recovery objectives</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setEditingProcess(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Add Process
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-white">{processes.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Processes</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-red-400">{processes.filter(p => p.criticality === 'critical').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Critical</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-orange-400">{processes.filter(p => p.criticality === 'high').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">High</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-400">{processes.filter(p => p.status === 'active').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Active</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search processes..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select
                            value={filterCriticality}
                            onChange={(e) => setFilterCriticality(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">All Criticality</option>
                            {CRITICALITY_LEVELS.map(level => (
                                <option key={level} value={level} className="bg-slate-900">{level}</option>
                            ))}
                        </select>
                    </div>

                    {/* Processes Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredProcesses.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <Workflow className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Business Processes</h3>
                            <p className="text-slate-400 mb-6">Document your critical business processes.</p>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Add First Process
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProcesses.map(process => (
                                <div
                                    key={process.id}
                                    className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${CRITICALITY_COLORS[process.criticality]}`}>
                                            {process.criticality}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(process)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(process.id)}
                                                disabled={deleting === process.id}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{process.name}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{process.description || 'No description'}</p>

                                    <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-sm font-bold text-white">{process.rto || '-'}h</div>
                                            <div className="text-[10px] text-slate-500">RTO</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-sm font-bold text-white">{process.rpo || '-'}h</div>
                                            <div className="text-[10px] text-slate-500">RPO</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                        <span>Owner: {process.owner}</span>
                                        <span className={`px-2 py-0.5 rounded ${process.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                            {process.status}
                                        </span>
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
                            <h2 className="text-xl font-bold text-white">{editingProcess ? 'Edit Process' : 'Add Business Process'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingProcess(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Process Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Criticality</label>
                                    <select
                                        value={formData.criticality}
                                        onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {CRITICALITY_LEVELS.map(level => (
                                            <option key={level} value={level} className="bg-slate-900">{level}</option>
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
                                            <option key={status} value={status} className="bg-slate-900">{status.replace('_', ' ')}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">RTO (hours)</label>
                                    <input
                                        type="number"
                                        value={formData.rto}
                                        onChange={(e) => setFormData({ ...formData, rto: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">RPO (hours)</label>
                                    <input
                                        type="number"
                                        value={formData.rpo}
                                        onChange={(e) => setFormData({ ...formData, rpo: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Stakeholders</label>
                                <input
                                    type="text"
                                    value={formData.stakeholders}
                                    onChange={(e) => setFormData({ ...formData, stakeholders: e.target.value })}
                                    placeholder="e.g., CEO, CTO, IT Team"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingProcess(null); }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                                >
                                    {editingProcess ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
