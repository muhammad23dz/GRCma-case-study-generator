'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    ClipboardList,
    Plus,
    Search,
    Edit,
    Trash2,
    X,
    FileQuestion,
    CheckCircle,
    Users
} from 'lucide-react';

interface Questionnaire {
    id: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    version: string;
    owner: string;
    createdAt: string;
}

const QUESTIONNAIRE_TYPES = ['vendor', 'internal', 'compliance', 'security', 'onboarding'];
const STATUS_OPTIONS = ['draft', 'active', 'archived'];

export default function QuestionnairesPage() {
    const router = useRouter();
    const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingQuestionnaire, setEditingQuestionnaire] = useState<Questionnaire | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        title: '', description: '', type: 'vendor', status: 'draft', version: '1.0'
    });

    useEffect(() => {
        fetchQuestionnaires();
    }, []);

    const fetchQuestionnaires = async () => {
        try {
            const res = await fetch('/api/questionnaires');
            if (res.ok) {
                const data = await res.json();
                setQuestionnaires(data.questionnaires || []);
            }
        } catch (error) {
            console.error('Failed to fetch questionnaires:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingQuestionnaire ? `/api/questionnaires/${editingQuestionnaire.id}` : '/api/questionnaires';
            const method = editingQuestionnaire ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                setEditingQuestionnaire(null);
                resetForm();
                fetchQuestionnaires();
            }
        } catch (error) {
            console.error('Failed to save questionnaire:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this questionnaire?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/questionnaires/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchQuestionnaires();
            }
        } catch (error) {
            console.error('Failed to delete questionnaire:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (questionnaire: Questionnaire) => {
        setEditingQuestionnaire(questionnaire);
        setFormData({
            title: questionnaire.title, description: questionnaire.description || '',
            type: questionnaire.type, status: questionnaire.status, version: questionnaire.version
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', type: 'vendor', status: 'draft', version: '1.0' });
    };

    const filteredQuestionnaires = questionnaires.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || q.type === filterType;
        return matchesSearch && matchesType;
    });

    const TYPE_LABELS: Record<string, string> = {
        vendor: 'Vendor Assessment',
        internal: 'Internal',
        compliance: 'Compliance',
        security: 'Security',
        onboarding: 'Onboarding'
    };

    const TYPE_COLORS: Record<string, string> = {
        vendor: 'text-purple-400 bg-purple-500/10',
        internal: 'text-blue-400 bg-blue-500/10',
        compliance: 'text-amber-400 bg-amber-500/10',
        security: 'text-red-400 bg-red-500/10',
        onboarding: 'text-emerald-400 bg-emerald-500/10'
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
                                <ClipboardList className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Assessments</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Questionnaires</h1>
                            <p className="text-lg text-slate-400">Create and manage assessment questionnaires</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setEditingQuestionnaire(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Create Questionnaire
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-white">{questionnaires.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-emerald-400">{questionnaires.filter(q => q.status === 'active').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Active</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-amber-400">{questionnaires.filter(q => q.status === 'draft').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Drafts</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-purple-400">{questionnaires.filter(q => q.type === 'vendor').length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Vendor</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search questionnaires..."
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
                            {QUESTIONNAIRE_TYPES.map(type => (
                                <option key={type} value={type} className="bg-slate-900">{TYPE_LABELS[type]}</option>
                            ))}
                        </select>
                    </div>

                    {/* Questionnaires Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredQuestionnaires.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <ClipboardList className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Questionnaires</h3>
                            <p className="text-slate-400 mb-6">Create your first assessment questionnaire.</p>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Create First Questionnaire
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredQuestionnaires.map(questionnaire => (
                                <div
                                    key={questionnaire.id}
                                    className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                                            <ClipboardList className="w-5 h-5 text-pink-400" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(questionnaire)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(questionnaire.id)}
                                                disabled={deleting === questionnaire.id}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{questionnaire.title}</h3>
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{questionnaire.description || 'No description'}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[questionnaire.type]}`}>
                                            {TYPE_LABELS[questionnaire.type] || questionnaire.type}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${questionnaire.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {questionnaire.status}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                        <span>Owner: {questionnaire.owner}</span>
                                        <span>v{questionnaire.version}</span>
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
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingQuestionnaire ? 'Edit Questionnaire' : 'Create Questionnaire'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingQuestionnaire(null); }} className="text-slate-400 hover:text-white">
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
                                        {QUESTIONNAIRE_TYPES.map(type => (
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
                                <label className="block text-sm font-medium text-slate-400 mb-1">Version</label>
                                <input
                                    type="text"
                                    value={formData.version}
                                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingQuestionnaire(null); }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                                >
                                    {editingQuestionnaire ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
