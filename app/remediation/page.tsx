'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    CheckSquare,
    AlertTriangle,
    Calendar,
    ArrowRight,
    Filter,
    Plus,
    Loader2,
    ShieldAlert,
    Clock,
    User,
    CheckCircle2
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface Gap {
    id: string;
    title: string;
    severity: string;
    status: string;
    description: string;
    remediationPlan?: string;
    timeline?: string;
}

interface Action {
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string;
    assignedTo?: string;
    risk?: { narrative: string };
    control?: { title: string };
    incident?: { title: string };
}

export default function RemediationPage() {
    const { t } = useLanguage();
    const [gaps, setGaps] = useState<Gap[]>([]);
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/remediation');
            const data = await res.json();
            setGaps(data.gaps || []);
            setActions(data.actions || []);
        } catch (error) {
            console.error('Failed to fetch remediation data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getStatusIcon = (status: string) => {
        if (status === 'completed') return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
        if (status === 'in_progress') return <Loader2 className="w-5 h-5 text-blue-400 animate-spin-slow" />;
        return <Clock className="w-5 h-5 text-slate-400" />;
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
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Risk Treatment</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Remediation Center
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                Track and manage corrective actions, compliance gaps, and risk treatment plans.
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95">
                            <Plus className="w-5 h-5" />
                            New Action Plan
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
                            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Open Gaps</h3>
                            <div className="text-3xl font-black text-white">{gaps.length}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
                            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Active Actions</h3>
                            <div className="text-3xl font-black text-blue-400">{actions.length}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
                            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Critical Issues</h3>
                            <div className="text-3xl font-black text-red-500">
                                {gaps.filter(g => g.severity === 'critical').length + actions.filter(a => a.priority === 'critical').length}
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
                            <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Remediation Rate</h3>
                            <div className="text-3xl font-black text-emerald-400">72%</div>
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                        {/* Compliance Gaps */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                    Compliance Gaps
                                </h3>
                                <span className="bg-white/5 text-slate-400 text-xs font-bold px-2 py-1 rounded-lg">{gaps.length} Open</span>
                            </div>
                            <div className="p-6 space-y-4 flex-1 overflow-auto max-h-[600px]">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />)}
                                    </div>
                                ) : gaps.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">No active compliance gaps found. Great job!</div>
                                ) : (
                                    gaps.map(gap => (
                                        <div key={gap.id} className="bg-slate-950/50 border border-white/5 rounded-xl p-4 hover:border-primary/30 transition-all group">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{gap.title}</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityColor(gap.severity)}`}>
                                                    {gap.severity}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-400 mb-3 line-clamp-2">{gap.description}</p>
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                {gap.timeline && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {gap.timeline}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <CheckSquare className="w-3 h-3" /> {gap.status}
                                                </span>
                                            </div>
                                            {gap.remediationPlan && (
                                                <div className="mt-3 pt-3 border-t border-white/5">
                                                    <p className="text-xs text-slate-300 font-medium">Plan: <span className="text-slate-400 font-normal">{gap.remediationPlan}</span></p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Corrective Actions */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
                            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <CheckSquare className="w-5 h-5 text-blue-400" />
                                    Corrective Actions
                                </h3>
                                <button className="text-xs font-bold text-primary hover:text-primary/80">View All</button>
                            </div>
                            <div className="p-6 space-y-4 flex-1 overflow-auto max-h-[600px]">
                                {loading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 animate-pulse rounded-xl" />)}
                                    </div>
                                ) : actions.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">No active corrective actions.</div>
                                ) : (
                                    actions.map(action => (
                                        <div key={action.id} className="bg-slate-950/50 border border-white/5 rounded-xl p-4 hover:border-blue-500/30 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(action.status)}
                                                    <h4 className="font-bold text-white">{action.title}</h4>
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityColor(action.priority)}`}>
                                                    {action.priority}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {action.risk && <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400">Risk: {action.risk.narrative}</span>}
                                                {action.control && <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400">Control: {action.control.title}</span>}
                                                {action.incident && <span className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-slate-400">Incident: {action.incident.title}</span>}
                                            </div>

                                            <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
                                                <div className="flex items-center gap-3">
                                                    {action.assignedTo && (
                                                        <span className="flex items-center gap-1">
                                                            <User className="w-3 h-3" /> {action.assignedTo}
                                                        </span>
                                                    )}
                                                    {action.dueDate && (
                                                        <span className={`flex items-center gap-1 ${new Date(action.dueDate) < new Date() ? 'text-red-400' : ''}`}>
                                                            <Calendar className="w-3 h-3" /> {new Date(action.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <button className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                                                    Update <ArrowRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
