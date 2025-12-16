'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    ArrowLeft, Calendar, FileText, AlertCircle, CheckCircle2,
    Clock, Plus, Edit, Trash2, Save, X, ShieldAlert, Info, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface Finding {
    id: string;
    severity: string;
    title: string;
    description: string;
    recommendation: string | null;
    status: string;
    dueDate: string | null;
    control: {
        id: string;
        title: string;
        controlType: string;
        controlRisk: string | null;
    };
}

interface Test {
    id: string;
    testDate: string;
    result: string;
    sampleSize: number | null;
    notes: string | null;
    control: {
        id: string;
        title: string;
    };
}

interface Audit {
    id: string;
    title: string;
    auditType: string;
    framework: string | null;
    scope: string | null;
    status: string;
    startDate: string;
    endDate: string | null;
    auditorName: string;
    auditorOrg: string | null;
    findings: Finding[];
    tests: Test[];
}

export default function AuditDetailPage() {
    const params = useParams();
    const router = useRouter();
    const auditId = params.id as string;

    const [audit, setAudit] = useState<Audit | null>(null);
    const [loading, setLoading] = useState(true);
    const [showFindingModal, setShowFindingModal] = useState(false);
    const [controls, setControls] = useState<any[]>([]);

    useEffect(() => {
        if (auditId) {
            fetchAudit();
            fetchControls();
        }
    }, [auditId]);

    const fetchAudit = async () => {
        try {
            const res = await fetch(`/api/audit/${auditId}`);
            const data = await res.json();
            setAudit(data.audit);
        } catch (error) {
            console.error('Error fetching audit:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchControls = async () => {
        try {
            const res = await fetch('/api/controls');
            const data = await res.json();
            setControls(data.controls || []);
        } catch (error) {
            console.error('Error fetching controls:', error);
        }
    };

    const handleCreateFinding = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        const finding = {
            controlId: formData.get('controlId'),
            severity: formData.get('severity'),
            title: formData.get('title'),
            description: formData.get('description'),
            recommendation: formData.get('recommendation') || null,
            dueDate: formData.get('dueDate') || null
        };

        try {
            const res = await fetch(`/api/audit/${auditId}/findings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(finding)
            });

            if (res.ok) {
                setShowFindingModal(false);
                fetchAudit();
                (e.target as HTMLFormElement).reset();
            }
        } catch (error) {
            console.error('Error creating finding:', error);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        try {
            const res = await fetch(`/api/audit/${auditId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: newStatus,
                    endDate: newStatus === 'closed' ? new Date().toISOString() : null
                })
            });

            if (res.ok) {
                fetchAudit();
            }
        } catch (error) {
            console.error('Error updating audit status:', error);
        }
    };

    const handleDeleteFinding = async (findingId: string) => {
        if (!confirm('Are you sure you want to delete this finding?')) return;

        try {
            const res = await fetch(`/api/audit/${auditId}/findings/${findingId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchAudit();
            }
        } catch (error) {
            console.error('Error deleting finding:', error);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'major': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'minor': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'observation': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'planning': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'fieldwork': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'reporting': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case 'closed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!audit) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Audit not found</h2>
                    <Link href="/audit" className="text-blue-400 hover:underline">← Back to Audits</Link>
                </div>
            </div>
        );
    }

    const criticalFindings = audit.findings.filter(f => f.severity === 'critical').length;
    const openFindings = audit.findings.filter(f => f.status === 'open').length;

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/audit"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Audits
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-4xl font-black text-white">{audit.title}</h1>
                                    <div className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase ${getStatusColor(audit.status)}`}>
                                        {audit.status}
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(audit.startDate).toLocaleDateString()}
                                        {audit.endDate && ` - ${new Date(audit.endDate).toLocaleDateString()}`}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        {audit.auditType}
                                    </div>
                                    {audit.framework && (
                                        <div className="px-2 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20 text-xs font-bold">
                                            {audit.framework}
                                        </div>
                                    )}
                                </div>
                                <p className="text-slate-400 mt-2">
                                    Auditor: <span className="text-white font-medium">{audit.auditorName}</span>
                                    {audit.auditorOrg && <span> • {audit.auditorOrg}</span>}
                                </p>
                                {audit.scope && (
                                    <p className="text-slate-400 mt-2">
                                        <span className="font-medium text-white">Scope:</span> {audit.scope}
                                    </p>
                                )}
                            </div>

                            {/* Status Actions */}
                            {audit.status !== 'closed' && (
                                <div className="flex flex-wrap gap-2">
                                    {audit.status === 'planning' && (
                                        <button
                                            onClick={() => handleUpdateStatus('fieldwork')}
                                            className="px-4 py-2 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 rounded-xl font-bold hover:bg-yellow-500/20 transition-all"
                                        >
                                            Start Fieldwork
                                        </button>
                                    )}
                                    {audit.status === 'fieldwork' && (
                                        <button
                                            onClick={() => handleUpdateStatus('reporting')}
                                            className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-xl font-bold hover:bg-purple-500/20 transition-all"
                                        >
                                            Begin Reporting
                                        </button>
                                    )}
                                    {audit.status === 'reporting' && (
                                        <button
                                            onClick={() => handleUpdateStatus('closed')}
                                            className="px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-bold hover:bg-emerald-500/20 transition-all"
                                        >
                                            Close Audit
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-500/10 rounded-lg">
                                    <ShieldAlert className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="text-3xl font-black text-white">{criticalFindings}</div>
                            </div>
                            <div className="text-sm text-slate-400">Critical Findings</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-orange-400" />
                                </div>
                                <div className="text-3xl font-black text-white">{openFindings}</div>
                            </div>
                            <div className="text-sm text-slate-400">Open Findings</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg">
                                    <Info className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-3xl font-black text-white">{audit.findings.length}</div>
                            </div>
                            <div className="text-sm text-slate-400">Total Findings</div>
                        </div>
                        <Link
                            href={`/audit/${auditId}/testing`}
                            className="bg-slate-900/40 backdrop-blur-md border border-white/5 hover:border-purple-500/30 rounded-2xl p-6 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                    <CheckCircle2 className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="text-3xl font-black text-white">{audit.tests.length}</div>
                            </div>
                            <div className="text-sm text-slate-400 group-hover:text-purple-400 transition-colors">
                                Control Tests →
                            </div>
                        </Link>
                    </div>

                    {/* Findings Section */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-white">Audit Findings</h2>
                            <button
                                onClick={() => setShowFindingModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold hover:bg-blue-500/20 transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Add Finding
                            </button>
                        </div>

                        {audit.findings.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">No findings recorded</h3>
                                <p className="text-slate-400 mb-6">Add your first audit finding to get started</p>
                                <button
                                    onClick={() => setShowFindingModal(true)}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-xl font-bold hover:bg-blue-500/20 transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add First Finding
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {audit.findings.map(finding => (
                                    <div key={finding.id} className="bg-slate-800/50 border border-white/5 rounded-xl p-6 hover:border-white/10 transition-all">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className={`px-2 py-1 rounded-lg border text-xs font-bold uppercase ${getSeverityColor(finding.severity)}`}>
                                                        {finding.severity}
                                                    </div>
                                                    <div className={`px-2 py-1 rounded-lg border text-xs font-bold uppercase ${finding.status === 'open' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        finding.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                        }`}>
                                                        {finding.status}
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-bold text-white mb-2">{finding.title}</h3>
                                                <p className="text-slate-400 text-sm mb-3">{finding.description}</p>
                                                {finding.recommendation && (
                                                    <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3 mb-3">
                                                        <div className="text-xs font-bold text-blue-400 mb-1">Recommendation</div>
                                                        <div className="text-sm text-slate-300">{finding.recommendation}</div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-4 text-sm">
                                                    <Link href={`/controls/${finding.control.id}`} className="text-blue-400 hover:underline">
                                                        Control: {finding.control.title}
                                                    </Link>
                                                    {finding.dueDate && (
                                                        <div className="flex items-center gap-1 text-slate-400">
                                                            <Clock className="w-4 h-4" />
                                                            Due: {new Date(finding.dueDate).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteFinding(finding.id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Finding Modal */}
            {showFindingModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900 rounded-2xl border border-white/10 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-white">Add Audit Finding</h2>
                            <button onClick={() => setShowFindingModal(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateFinding} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Control *</label>
                                <select
                                    name="controlId"
                                    required
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                >
                                    <option value="">Select a control</option>
                                    {controls.map(control => (
                                        <option key={control.id} value={control.id}>
                                            {control.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Severity *</label>
                                    <select
                                        name="severity"
                                        required
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    >
                                        <option value="critical">Critical</option>
                                        <option value="major">Major</option>
                                        <option value="minor">Minor</option>
                                        <option value="observation">Observation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        name="dueDate"
                                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    required
                                    placeholder="e.g., MFA not enforced for admin accounts"
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Description *</label>
                                <textarea
                                    name="description"
                                    required
                                    rows={4}
                                    placeholder="Detailed description of the finding..."
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Recommendation</label>
                                <textarea
                                    name="recommendation"
                                    rows={3}
                                    placeholder="Recommended remediation steps..."
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                                >
                                    Add Finding
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowFindingModal(false)}
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
