'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    ClipboardCheck, Plus, Calendar, AlertCircle, CheckCircle2,
    Clock, FileText, TrendingUp, Search, Filter, X
} from 'lucide-react';
import Link from 'next/link';

interface Audit {
    id: string;
    title: string;
    auditType: string;
    framework: string | null;
    status: string;
    startDate: string;
    endDate: string | null;
    auditorName: string;
    auditorOrg: string | null;
    createdAt: string;
    _count: {
        findings: number;
        tests: number;
    };
}

export default function AuditPage() {
    const { user } = useUser();
    const [audits, setAudits] = useState<Audit[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    useEffect(() => {
        fetchAudits();
    }, []);

    const fetchAudits = async () => {
        try {
            const res = await fetch('/api/audit');
            const data = await res.json();
            setAudits(data.audits || []);
        } catch (error) {
            console.error('Error fetching audits:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAudit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const audit = {
            title: formData.get('title'),
            auditType: formData.get('auditType'),
            framework: formData.get('framework') || null,
            scope: formData.get('scope') || null,
            startDate: formData.get('startDate'),
            auditorName: formData.get('auditorName'),
            auditorOrg: formData.get('auditorOrg') || null
        };

        try {
            const res = await fetch('/api/audit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(audit)
            });

            if (res.ok) {
                setShowCreateModal(false);
                fetchAudits();
                (e.target as HTMLFormElement).reset();
            }
        } catch (error) {
            console.error('Error creating audit:', error);
        }
    };

    const filteredAudits = audits.filter(audit => {
        const matchesSearch = audit.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            audit.auditorName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || audit.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planning': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'fieldwork': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'reporting': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'closed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'planning': return <Calendar className="w-4 h-4" />;
            case 'fieldwork': return <Clock className="w-4 h-4" />;
            case 'reporting': return <FileText className="w-4 h-4" />;
            case 'closed': return <CheckCircle2 className="w-4 h-4" />;
            default: return <AlertCircle className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                Audit Management
                            </h1>
                            <p className="text-slate-400">Plan, execute, and track compliance audits</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            New Audit
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="mb-6 flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search audits..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-slate-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-slate-900/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            >
                                <option value="all">All Status</option>
                                <option value="planning">Planning</option>
                                <option value="fieldwork">Fieldwork</option>
                                <option value="reporting">Reporting</option>
                                <option value="closed">Closed</option>
                            </select>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <ClipboardCheck className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-3xl font-black text-white">{audits.length}</div>
                            </div>
                            <div className="text-sm text-slate-400">Total Audits</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-yellow-500/10 rounded-lg">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {audits.filter(a => a.status === 'fieldwork' || a.status === 'planning').length}
                                </div>
                            </div>
                            <div className="text-sm text-slate-400">In Progress</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {audits.reduce((sum, a) => sum + (a._count?.findings || 0), 0)}
                                </div>
                            </div>
                            <div className="text-sm text-slate-400">Total Findings</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="text-3xl font-black text-white">
                                    {audits.filter(a => a.status === 'closed').length}
                                </div>
                            </div>
                            <div className="text-sm text-slate-400">Completed</div>
                        </div>
                    </div>

                    {/* Audits Grid */}
                    {filteredAudits.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <ClipboardCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No audits found</h3>
                            <p className="text-slate-400 mb-6">
                                {searchTerm || statusFilter !== 'all'
                                    ? 'Try adjusting your filters'
                                    : 'Create your first audit to get started'}
                            </p>
                            {!searchTerm && statusFilter === 'all' && (
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold hover:bg-blue-500/20 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create First Audit
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredAudits.map(audit => (
                                <Link key={audit.id} href={`/audit/${audit.id}`}>
                                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all group cursor-pointer">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                                                    {audit.title}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-slate-400">
                                                    <span>{audit.auditorName}</span>
                                                    {audit.auditorOrg && <span>• {audit.auditorOrg}</span>}
                                                </div>
                                            </div>
                                            <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-xs font-bold uppercase ${getStatusColor(audit.status)}`}>
                                                {getStatusIcon(audit.status)}
                                                {audit.status}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(audit.startDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FileText className="w-4 h-4" />
                                                {audit.auditType}
                                            </div>
                                            {audit.framework && (
                                                <div className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 text-xs font-bold">
                                                    {audit.framework}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-4 h-4 text-red-400" />
                                                <span className="text-sm font-bold text-white">{audit._count?.findings || 0}</span>
                                                <span className="text-xs text-slate-500">Findings</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                <span className="text-sm font-bold text-white">{audit._count?.tests || 0}</span>
                                                <span className="text-xs text-slate-500">Tests</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Audit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl border border-white/10 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-white">Create New Audit</h2>
                            <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateAudit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Audit Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="e.g., SOC 2 Type II Audit 2025"
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Audit Type *</label>
                                    <select
                                        name="auditType"
                                        required
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="internal">Internal</option>
                                        <option value="external">External</option>
                                        <option value="certification">Certification</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Framework</label>
                                    <select
                                        name="framework"
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="">None</option>
                                        <option value="ISO27001">ISO 27001</option>
                                        <option value="SOC2">SOC 2</option>
                                        <option value="PCI-DSS">PCI-DSS</option>
                                        <option value="GDPR">GDPR</option>
                                        <option value="NIST">NIST CSF</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Scope</label>
                                <textarea
                                    name="scope"
                                    rows={3}
                                    placeholder="Define audit scope (systems, processes, teams...)"
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Start Date *</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    required
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Auditor Name *</label>
                                    <input
                                        type="text"
                                        name="auditorName"
                                        required
                                        placeholder="Lead auditor name"
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Auditor Organization</label>
                                    <input
                                        type="text"
                                        name="auditorOrg"
                                        placeholder="e.g., Deloitte, Internal Team"
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                                >
                                    Create Audit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-6 py-3 bg-slate-800 text-slate-300 rounded-xl font-bold hover:bg-slate-700 transition-all"
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
