'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    ShieldAlert,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    Calendar,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface BCDRPlan {
    id: string;
    title: string;
    type: string;
    status: string;
    description?: string;
    rto?: number;
    rpo?: number;
    mtpd?: number;
    owner: string;
    lastTested?: string;
    nextTestDate?: string;
    version: string;
    createdAt: string;
}

const PLAN_TYPES = ['BCP', 'DRP', 'COOP', 'Crisis'];
const STATUS_OPTIONS = ['draft', 'active', 'review', 'archived'];

export default function BCDRPage() {
    const router = useRouter();
    const [plans, setPlans] = useState<BCDRPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingPlan, setEditingPlan] = useState<BCDRPlan | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '', type: 'BCP', status: 'draft', description: '',
        rto: '', rpo: '', mtpd: '', nextTestDate: '', version: '1.0'
    });

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const res = await fetch('/api/bcdr/plans');
            if (res.ok) {
                const data = await res.json();
                setPlans(data.plans || []);
            }
        } catch (error) {
            console.error('Failed to fetch plans:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingPlan ? `/api/bcdr/plans/${editingPlan.id}` : '/api/bcdr/plans';
            const method = editingPlan ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    rto: formData.rto ? parseInt(formData.rto) : null,
                    rpo: formData.rpo ? parseInt(formData.rpo) : null,
                    mtpd: formData.mtpd ? parseInt(formData.mtpd) : null
                })
            });

            if (res.ok) {
                setShowModal(false);
                setEditingPlan(null);
                resetForm();
                fetchPlans();
            }
        } catch (error) {
            console.error('Failed to save plan:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this BCDR plan?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/bcdr/plans/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchPlans();
            }
        } catch (error) {
            console.error('Failed to delete plan:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (plan: BCDRPlan) => {
        setEditingPlan(plan);
        setFormData({
            title: plan.title, type: plan.type, status: plan.status,
            description: plan.description || '', rto: plan.rto?.toString() || '',
            rpo: plan.rpo?.toString() || '', mtpd: plan.mtpd?.toString() || '',
            nextTestDate: plan.nextTestDate ? plan.nextTestDate.split('T')[0] : '', version: plan.version
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            title: '', type: 'BCP', status: 'draft', description: '',
            rto: '', rpo: '', mtpd: '', nextTestDate: '', version: '1.0'
        });
    };

    const filteredPlans = plans.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || p.type === filterType;
        return matchesSearch && matchesType;
    });

    const TYPE_COLORS: Record<string, string> = {
        BCP: 'text-blue-400 bg-blue-500/10',
        DRP: 'text-red-400 bg-red-500/10',
        COOP: 'text-purple-400 bg-purple-500/10',
        Crisis: 'text-amber-400 bg-amber-500/10',
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
                                <ShieldAlert className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">BCDR</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Business Continuity</h1>
                            <p className="text-lg text-slate-400">Manage disaster recovery and continuity plans</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setEditingPlan(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Create Plan
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-white">{plans.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Plans</div>
                        </div>
                        {PLAN_TYPES.map(type => (
                            <div key={type} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className={`text-2xl font-bold ${TYPE_COLORS[type]?.split(' ')[0] || 'text-white'}`}>
                                    {plans.filter(p => p.type === type).length}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">{type}</div>
                            </div>
                        )).slice(0, 3)}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search plans..."
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
                            {PLAN_TYPES.map(type => (
                                <option key={type} value={type} className="bg-slate-900">{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Plans Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredPlans.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <ShieldAlert className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No BCDR Plans</h3>
                            <p className="text-slate-400 mb-6">Create your first business continuity plan.</p>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Create First Plan
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPlans.map(plan => (
                                <div
                                    key={plan.id}
                                    className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[plan.type]}`}>
                                            {plan.type}
                                        </span>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(plan)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(plan.id)}
                                                disabled={deleting === plan.id}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{plan.title}</h3>
                                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{plan.description || 'No description'}</p>

                                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-sm font-bold text-white">{plan.rto || '-'}h</div>
                                            <div className="text-[10px] text-slate-500">RTO</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-sm font-bold text-white">{plan.rpo || '-'}h</div>
                                            <div className="text-[10px] text-slate-500">RPO</div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-2">
                                            <div className="text-sm font-bold text-white">{plan.mtpd || '-'}h</div>
                                            <div className="text-[10px] text-slate-500">MTPD</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                        <span className={`px-2 py-0.5 rounded ${plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'}`}>
                                            {plan.status}
                                        </span>
                                        <span>v{plan.version}</span>
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
                            <h2 className="text-xl font-bold text-white">{editingPlan ? 'Edit Plan' : 'Create BCDR Plan'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingPlan(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Plan Title *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                                        {PLAN_TYPES.map(type => (
                                            <option key={type} value={type} className="bg-slate-900">{type}</option>
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
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
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
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">MTPD (hours)</label>
                                    <input
                                        type="number"
                                        value={formData.mtpd}
                                        onChange={(e) => setFormData({ ...formData, mtpd: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Next Test Date</label>
                                    <input
                                        type="date"
                                        value={formData.nextTestDate}
                                        onChange={(e) => setFormData({ ...formData, nextTestDate: e.target.value })}
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
                                    onClick={() => { setShowModal(false); setEditingPlan(null); }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                                >
                                    {editingPlan ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
