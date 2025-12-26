'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import { applyReportToPlatform } from '@/app/actions';
import { useGRCData } from '@/lib/contexts/GRCDataContext';
import {
    FileCheck, Calendar, Building2, Shield, AlertTriangle,
    Users, Siren, ChevronRight, Plus, Trash2, Eye,
    Download, RefreshCw, Target, Clock, Database, ArrowLeft,
    Search, FileText, CheckCircle, Loader2, CheckSquare, Square
} from 'lucide-react';

interface Assessment {
    id: string;
    sections: {
        executiveSummary?: {
            problemStatement?: string;
            context?: string;
            scope?: string;
            recommendations?: string;
        };
        companyName?: string;
        controls?: any[];
        risks?: any[];
        vendors?: any[];
        incidents?: any[];
        gaps?: any[];
        policies?: any[];
    };
    timestamp: string;
}

export default function AssessmentsPage() {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const { refreshAll } = useGRCData();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPushing, setIsPushing] = useState(false);
    const [pushSuccess, setPushSuccess] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (isLoaded && user) {
            fetchAssessments();
        }
    }, [isLoaded, user]);

    const fetchAssessments = async () => {
        try {
            const res = await fetch('/api/reports', {
                cache: 'no-store',
                headers: {
                    'Pragma': 'no-cache',
                    'Cache-Control': 'no-cache'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setAssessments(data.reports || []);
            }
        } catch (error) {
            console.error('Failed to fetch assessments:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAssessment = async (id: string) => {
        if (!confirm('Are you sure you want to delete this assessment?')) return;
        try {
            const token = await getToken();
            const res = await fetch(`/api/reports/${id}`, {
                method: 'DELETE',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'include'
            });
            if (res.ok) {
                setAssessments(prev => prev.filter(a => a.id !== id));
                if (selectedAssessment?.id === id) setSelectedAssessment(null);
                setSelectedIds(prev => prev.filter(i => i !== id));
            }
        } catch (error) {
            console.error('Failed to delete assessment:', error);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        if (!confirm(`Delete ${selectedIds.length} selected assessments?`)) return;

        setIsDeleting(true);
        try {
            const token = await getToken();
            for (const id of selectedIds) {
                await fetch(`/api/reports/${id}`, {
                    method: 'DELETE',
                    headers: {
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    credentials: 'include'
                });
            }
            setAssessments(prev => prev.filter(a => !selectedIds.includes(a.id)));
            if (selectedIds.includes(selectedAssessment?.id || '')) {
                setSelectedAssessment(null);
            }
            setSelectedIds([]);
        } catch (error) {
            console.error('Failed to bulk delete:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePushToDashboard = async () => {
        if (!selectedAssessment || !user?.primaryEmailAddress?.emailAddress) return;

        setIsPushing(true);
        try {
            await applyReportToPlatform(
                { id: selectedAssessment.id, sections: selectedAssessment.sections, timestamp: selectedAssessment.timestamp },
                false,
                user.primaryEmailAddress.emailAddress
            );
            setPushSuccess(true);
            refreshAll();
            setTimeout(() => router.push('/dashboard'), 2000);
        } catch (error: any) {
            alert('Push failed: ' + error.message);
        } finally {
            setIsPushing(false);
        }
    };

    const handleExportPDF = () => {
        window.print();
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredAssessments.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredAssessments.map(a => a.id));
        }
    };

    const toggleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getAssessmentName = (assessment: Assessment) => {
        const summary = assessment.sections?.executiveSummary;
        if (summary?.problemStatement) {
            return summary.problemStatement.substring(0, 50) + '...';
        }
        return `Assessment - ${formatDate(assessment.timestamp)}`;
    };

    // Filter assessments based on search query
    const filteredAssessments = assessments.filter(a => {
        if (!searchQuery) return true;
        const searchLower = searchQuery.toLowerCase();
        const name = getAssessmentName(a).toLowerCase();
        const hasMatchingControl = a.sections?.controls?.some(c => c.title?.toLowerCase().includes(searchLower));
        const hasMatchingRisk = a.sections?.risks?.some(r => r.narrative?.toLowerCase().includes(searchLower));
        return name.includes(searchLower) || hasMatchingControl || hasMatchingRisk;
    });

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Back Navigation */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2">Assessment Reports</h1>
                            <p className="text-slate-400">View and manage your GRC compliance assessments</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {selectedIds.length > 0 && (
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={isDeleting}
                                    className="px-4 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-medium rounded-xl transition-all flex items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    Delete ({selectedIds.length})
                                </button>
                            )}
                            <Link
                                href="/platform"
                                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                New Assessment
                            </Link>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500" />
                        </div>
                    ) : assessments.length === 0 ? (
                        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-12 text-center">
                            <FileCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Assessments Yet</h3>
                            <p className="text-slate-400 mb-6">Generate your first assessment to get started with compliance.</p>
                            <Link
                                href="/platform"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all"
                            >
                                <Plus className="w-5 h-5" />
                                Generate Assessment
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Assessment List */}
                            <div className="lg:col-span-1 space-y-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search assessments..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-emerald-400" />
                                        Assessments ({filteredAssessments.length})
                                    </h2>
                                    {filteredAssessments.length > 0 && (
                                        <button
                                            onClick={toggleSelectAll}
                                            className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                                        >
                                            {selectedIds.length === filteredAssessments.length ? (
                                                <CheckSquare className="w-4 h-4" />
                                            ) : (
                                                <Square className="w-4 h-4" />
                                            )}
                                            Select All
                                        </button>
                                    )}
                                </div>

                                {filteredAssessments.map((assessment) => (
                                    <div
                                        key={assessment.id}
                                        className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedAssessment?.id === assessment.id
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-slate-900/40 border-white/5 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleSelect(assessment.id);
                                                }}
                                                className="mt-1 text-slate-500 hover:text-white"
                                            >
                                                {selectedIds.includes(assessment.id) ? (
                                                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                                                ) : (
                                                    <Square className="w-4 h-4" />
                                                )}
                                            </button>
                                            <div
                                                className="flex-1"
                                                onClick={() => setSelectedAssessment(assessment)}
                                            >
                                                <div className="text-sm text-slate-400 flex items-center gap-2 mb-2">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(assessment.timestamp)}
                                                </div>
                                                <div className="flex gap-2 flex-wrap">
                                                    <span className="text-xs px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                                                        {assessment.sections?.controls?.length || 0} Controls
                                                    </span>
                                                    <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-400 rounded">
                                                        {assessment.sections?.risks?.length || 0} Risks
                                                    </span>
                                                    {(assessment.sections?.vendors?.length || 0) > 0 && (
                                                        <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded">
                                                            {assessment.sections.vendors!.length} Vendors
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteAssessment(assessment.id);
                                                }}
                                                className="p-2 text-slate-500 hover:text-red-400 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Assessment Detail */}
                            <div className="lg:col-span-2">
                                {selectedAssessment ? (
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 space-y-6 print:bg-white print:text-black">
                                        <div className="flex flex-wrap justify-between items-start gap-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-white print:text-black">
                                                    Assessment Details
                                                </h2>
                                                <span className="text-sm text-slate-400">
                                                    {formatDate(selectedAssessment.timestamp)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 print:hidden">
                                                <button
                                                    onClick={handleExportPDF}
                                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center gap-2 text-sm"
                                                >
                                                    <Download className="w-4 h-4" />
                                                    PDF
                                                </button>
                                                {!pushSuccess ? (
                                                    <button
                                                        onClick={handlePushToDashboard}
                                                        disabled={isPushing}
                                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {isPushing ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Database className="w-4 h-4" />
                                                        )}
                                                        {isPushing ? 'Pushing...' : 'Push to Dashboard'}
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
                                                        <CheckCircle className="w-4 h-4" />
                                                        <span className="font-bold">Success! Redirecting...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Executive Summary */}
                                        {selectedAssessment.sections?.executiveSummary && (
                                            <div className="bg-slate-950/50 p-6 rounded-xl border border-emerald-500/20">
                                                <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                                                    <Target className="w-5 h-5" />
                                                    Executive Summary
                                                </h3>
                                                {selectedAssessment.sections.executiveSummary.problemStatement && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-bold text-orange-400 uppercase mb-1">Problem Statement</h4>
                                                        <p className="text-white">{selectedAssessment.sections.executiveSummary.problemStatement}</p>
                                                    </div>
                                                )}
                                                {selectedAssessment.sections.executiveSummary.context && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-bold text-blue-400 uppercase mb-1">Context</h4>
                                                        <p className="text-slate-300">{selectedAssessment.sections.executiveSummary.context}</p>
                                                    </div>
                                                )}
                                                {selectedAssessment.sections.executiveSummary.scope && (
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-bold text-purple-400 uppercase mb-1">Scope</h4>
                                                        <p className="text-slate-300">{selectedAssessment.sections.executiveSummary.scope}</p>
                                                    </div>
                                                )}
                                                {selectedAssessment.sections.executiveSummary.recommendations && (
                                                    <div>
                                                        <h4 className="text-sm font-bold text-emerald-400 uppercase mb-1">Recommendations</h4>
                                                        <p className="text-emerald-100">{selectedAssessment.sections.executiveSummary.recommendations}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-slate-800/50 border border-emerald-500/20 rounded-xl p-4 text-center">
                                                <Shield className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-white">{selectedAssessment.sections?.controls?.length || 0}</div>
                                                <div className="text-xs text-slate-400">Controls</div>
                                            </div>
                                            <div className="bg-slate-800/50 border border-orange-500/20 rounded-xl p-4 text-center">
                                                <AlertTriangle className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-white">{selectedAssessment.sections?.risks?.length || 0}</div>
                                                <div className="text-xs text-slate-400">Risks</div>
                                            </div>
                                            <div className="bg-slate-800/50 border border-blue-500/20 rounded-xl p-4 text-center">
                                                <Users className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-white">{selectedAssessment.sections?.vendors?.length || 0}</div>
                                                <div className="text-xs text-slate-400">Vendors</div>
                                            </div>
                                            <div className="bg-slate-800/50 border border-red-500/20 rounded-xl p-4 text-center">
                                                <Siren className="w-6 h-6 text-red-400 mx-auto mb-2" />
                                                <div className="text-2xl font-bold text-white">{selectedAssessment.sections?.incidents?.length || 0}</div>
                                                <div className="text-xs text-slate-400">Incidents</div>
                                            </div>
                                        </div>

                                        {/* Controls List */}
                                        {selectedAssessment.sections?.controls && selectedAssessment.sections.controls.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                    <Shield className="w-5 h-5 text-emerald-400" />
                                                    Controls
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedAssessment.sections.controls.map((ctrl: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-950/50 p-4 rounded-lg border border-white/5">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-white">{ctrl.title}</h4>
                                                                    <p className="text-sm text-slate-400 mt-1">{ctrl.description}</p>
                                                                </div>
                                                                <span className={`px-2 py-1 text-xs font-bold rounded ${ctrl.controlType === 'preventive' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                    ctrl.controlType === 'detective' ? 'bg-blue-500/20 text-blue-400' :
                                                                        ctrl.controlType === 'corrective' ? 'bg-orange-500/20 text-orange-400' :
                                                                            'bg-purple-500/20 text-purple-400'
                                                                    }`}>
                                                                    {ctrl.controlType || 'unknown'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Risks List */}
                                        {selectedAssessment.sections?.risks && selectedAssessment.sections.risks.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                                    Risks
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedAssessment.sections.risks.map((risk: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-950/50 p-4 rounded-lg border border-white/5">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                                                                    {risk.category}
                                                                </span>
                                                                <span className="text-sm text-white font-mono">
                                                                    Score: {(risk.likelihood || 3) * (risk.impact || 3)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-300">{risk.narrative}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Vendors List */}
                                        {selectedAssessment.sections?.vendors && selectedAssessment.sections.vendors.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                    <Users className="w-5 h-5 text-blue-400" />
                                                    Vendors
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {selectedAssessment.sections.vendors.map((vendor: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-950/50 p-4 rounded-lg border border-white/5">
                                                            <h4 className="font-bold text-white">{vendor.name}</h4>
                                                            <p className="text-sm text-slate-400">{vendor.services || vendor.category}</p>
                                                            {vendor.riskScore && (
                                                                <div className="mt-2 text-xs text-blue-400">Risk Score: {vendor.riskScore}</div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Incidents List */}
                                        {selectedAssessment.sections?.incidents && selectedAssessment.sections.incidents.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                    <Siren className="w-5 h-5 text-red-400" />
                                                    Incidents
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedAssessment.sections.incidents.map((incident: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-950/50 p-4 rounded-lg border border-white/5">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-white">{incident.title}</h4>
                                                                    <p className="text-sm text-slate-400 mt-1">{incident.description}</p>
                                                                </div>
                                                                <span className={`px-2 py-1 text-xs font-bold rounded ${incident.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                                    incident.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                                        incident.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                                            'bg-green-500/20 text-green-400'
                                                                    }`}>
                                                                    {incident.severity || 'unknown'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Gaps List */}
                                        {selectedAssessment.sections?.gaps && selectedAssessment.sections.gaps.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                    <AlertTriangle className="w-5 h-5 text-yellow-400" />
                                                    Compliance Gaps
                                                </h3>
                                                <div className="space-y-2">
                                                    {selectedAssessment.sections.gaps.map((gap: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-950/50 p-4 rounded-lg border border-yellow-500/20">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <h4 className="font-bold text-white">{gap.title}</h4>
                                                                <span className={`px-2 py-1 text-xs font-bold rounded ${gap.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                                                                    gap.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                                                        'bg-yellow-500/20 text-yellow-400'
                                                                    }`}>
                                                                    {gap.severity}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-400">{gap.description}</p>
                                                            {gap.remediationPlan && (
                                                                <div className="mt-2 text-sm text-emerald-400">
                                                                    <strong>Remediation:</strong> {gap.remediationPlan}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Policies List */}
                                        {selectedAssessment.sections?.policies && selectedAssessment.sections.policies.length > 0 && (
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                                    <FileText className="w-5 h-5 text-purple-400" />
                                                    Policies
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                    {selectedAssessment.sections.policies.map((policy: any, idx: number) => (
                                                        <div key={idx} className="bg-slate-950/50 p-4 rounded-lg border border-purple-500/20">
                                                            <h4 className="font-bold text-white">{policy.title}</h4>
                                                            <p className="text-sm text-slate-400">{policy.description || policy.category}</p>
                                                            <span className={`mt-2 inline-block px-2 py-1 text-xs rounded ${policy.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                                policy.status === 'draft' ? 'bg-slate-500/20 text-slate-400' :
                                                                    'bg-yellow-500/20 text-yellow-400'
                                                                }`}>
                                                                {policy.status || 'draft'}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-12 text-center">
                                        <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <h3 className="text-lg font-bold text-white mb-2">Select an Assessment</h3>
                                        <p className="text-slate-400">Click on an assessment from the list to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
