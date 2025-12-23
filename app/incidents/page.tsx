'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { AlertTriangle, Siren, CheckCircle2, Clock, Plus, Search, Trash2, User, X, Filter, List, History, Activity, ArrowLeft } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import IncidentTimeline from '@/components/dashboard/IncidentTimeline';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface Incident {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    reportedBy: string;
    assignedTo?: string;
    createdAt: string;
    actions: any[];
}

export default function IncidentsPage() {
    const { user } = useUser();
    const router = useRouter();
    const { t } = useLanguage();
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status');
    const initialSearch = searchParams.get('search') || '';

    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'medium',
        assignedTo: ''
    });
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState<string | null>(initialStatus);

    useEffect(() => {
        if (initialStatus) setStatusFilter(initialStatus);
        if (initialSearch) setSearchTerm(initialSearch);
    }, [initialStatus, initialSearch]);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const res = await fetch('/api/incidents');
            const data = await res.json();
            setIncidents(data.incidents || []);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', description: '', severity: 'medium', assignedTo: '' });
                fetchIncidents();
            }
        } catch (error) {
            console.error('Error creating incident:', error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this incident?')) return;
        try {
            const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setIncidents(incidents.filter(i => i.id !== id));
            } else {
                alert('Failed to delete incident');
            }
        } catch (error) {
            console.error('Error deleting incident:', error);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const filteredIncidents = incidents.filter(incident => {
        const matchesSearch = incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incident.severity.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter ? incident.status === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <PageTransition className="max-w-7xl mx-auto">
                    {/* Back to Dashboard */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    {/* Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">{t('inc_title')}</h1>
                            <p className="text-slate-400">{t('inc_subtitle')}</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            {/* Delete All - Available to authenticated users */}
                            {incidents.length > 0 && user && (
                                <button
                                    onClick={async () => {
                                        if (!confirm(`Are you sure you want to delete ALL ${incidents.length} incidents? This cannot be undone.`)) return;
                                        try {
                                            await Promise.all(incidents.map(i => fetch(`/api/incidents/${i.id}`, { method: 'DELETE' })));
                                            fetchIncidents();
                                        } catch (error) {
                                            console.error('Error deleting incidents:', error);
                                        }
                                    }}
                                    className="px-4 py-3 bg-red-950/30 text-red-500 border border-red-500/20 hover:bg-red-900/50 rounded-xl font-bold transition-all text-sm"
                                >
                                    {t('common_delete_all')}
                                </button>
                            )}
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('common_search')}
                                    className="pl-9 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl w-64 text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-500/20 transition-all hover:scale-105 font-bold flex items-center gap-2 group"
                            >
                                <AlertTriangle className="w-5 h-5 group-hover:animate-pulse" />
                                {t('inc_btn_report')}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                                    <Siren className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-red-500 mb-1">{incidents.filter(i => i.severity === 'critical').length}</div>
                            <div className="text-slate-400 text-sm font-medium">{t('inc_stat_critical')}</div>
                        </div>

                        <div
                            className={`bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group cursor-pointer ${statusFilter === 'open' ? 'ring-2 ring-orange-500/50' : ''}`}
                            onClick={() => setStatusFilter(statusFilter === 'open' ? null : 'open')}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 group-hover:scale-110 transition-transform">
                                    <Clock className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-orange-500 mb-1">{incidents.filter(i => i.status === 'open').length}</div>
                            <div className="text-slate-400 text-sm font-medium">{t('inc_stat_open')}</div>
                        </div>

                        {/* ... other stats ... */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                                    <Search className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-yellow-500 mb-1">{incidents.filter(i => i.status === 'investigating').length}</div>
                            <div className="text-slate-400 text-sm font-medium">{t('inc_stat_investigating')}</div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-emerald-400 mb-1">{incidents.filter(i => i.status === 'resolved').length}</div>
                            <div className="text-slate-400 text-sm font-medium">{t('inc_stat_resolved')}</div>
                        </div>
                    </div>

                    {/* Filter Banner */}
                    {(statusFilter || searchTerm) && (
                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Filter className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm font-bold text-white">{t('common_filter_active')}:</span>
                                    {statusFilter && <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-white border border-white/10 uppercase">{statusFilter}</span>}
                                    {searchTerm && <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-white border border-white/10">"{searchTerm}"</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => { setSearchTerm(''); setStatusFilter(null); router.push('/incidents'); }}
                                className="px-3 py-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
                            >

                                {t('common_clear_filter')}
                            </button>
                        </div>
                    )}

                    {/* View Toggles */}
                    <div className="flex justify-end mb-4 gap-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('timeline')}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'timeline' ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white'}`}
                        >
                            <History className="w-5 h-5" />
                        </button>
                    </div>

                    {viewMode === 'timeline' ? (
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-500" /> {t('inc_view_timeline')}
                            </h2>
                            <IncidentTimeline incidents={filteredIncidents} />
                        </div>
                    ) : (
                        /* Incidents Table */
                        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                            <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Siren className="w-5 h-5 text-red-500" />
                                    {t('inc_table_title')}
                                </h2>
                                <div className="text-sm text-slate-500">
                                    {t('common_showing')} {filteredIncidents.length} {t('common_of')} {incidents.length}
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-slate-950/20">
                                            <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inc_table_title')}</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inc_table_sev')}</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inc_table_status')}</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inc_table_assign')}</th>
                                            <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{t('inc_table_reported')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {filteredIncidents.map((incident) => (
                                            <tr key={incident.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="font-bold text-white group-hover:text-red-400 transition-colors">{incident.title}</div>
                                                    <div className="text-xs text-slate-400 max-w-2xl mt-1">{incident.description}</div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide border ${getSeverityColor(incident.severity)}`}>
                                                        {incident.severity}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide border ${incident.status === 'open' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        incident.status === 'investigating' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                            incident.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                        }`}>
                                                        {incident.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5 text-slate-300">
                                                    {incident.assignedTo ? (
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-3 h-3 text-slate-500" />
                                                            <span className="text-sm">{incident.assignedTo}</span>
                                                        </div>
                                                    ) : t('common_unassigned')}
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-400 text-sm font-mono">{new Date(incident.createdAt).toLocaleDateString()}</span>
                                                        <button
                                                            onClick={(e) => handleDelete(e, incident.id)}
                                                            className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 transition-all"
                                                            title="Delete Incident"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {filteredIncidents.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-12 text-slate-500">
                                                    {t('widget_no_activity')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </PageTransition>
                {/* Create Modal - Moved outside PageTransition */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">{t('inc_modal_title')}</h2>
                                <p className="text-slate-400 text-sm">{t('inc_subtitle')}</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">{t('inc_table_title')}</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-600"
                                            placeholder="e.g. Suspicious Login Activity"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">{t('ctrl_field_desc')}</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-600 resize-none font-mono text-sm"
                                            rows={4}
                                            placeholder="Describe what happened..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">{t('inc_table_sev')}</label>
                                        <select
                                            value={formData.severity}
                                            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-all"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">{t('inc_table_assign')} (email)</label>
                                        <input
                                            type="email"
                                            value={formData.assignedTo}
                                            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-red-500/50 transition-all placeholder:text-slate-600"
                                            placeholder="Optional: responder@company.com"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition-all font-bold shadow-lg shadow-red-500/20"
                                    >
                                        {t('inc_btn_report')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold"
                                    >
                                        {t('common_cancel')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
