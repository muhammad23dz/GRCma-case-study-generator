'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    ArrowLeft, AlertTriangle, ShieldAlert, Activity,
    CheckSquare, Link as LinkIcon, AlertCircle, TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface Incident {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    reportedBy: string;
    rootCause: string | null;
    remediation: string | null;
    createdAt: string;
    incidentControls: Array<{
        id: string;
        bypassType: string;
        notes: string | null;
        control: {
            id: string;
            title: string;
            controlType: string;
        };
    }>;
    incidentRisks: Array<{
        id: string;
        impactType: string;
        risk: {
            id: string;
            category: string;
            score: number;
        };
    }>;
    actions: Array<{
        id: string;
        title: string;
        status: string;
        priority: string;
    }>;
}

export default function IncidentDetailPage() {
    const params = useParams();
    const incidentId = params.id as string;
    const [incident, setIncident] = useState<Incident | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (incidentId) {
            fetchIncident();
        }
    }, [incidentId]);

    const fetchIncident = async () => {
        try {
            const res = await fetch(`/api/incidents/${incidentId}`);
            const data = await res.json();
            setIncident(data.incident);
        } catch (error) {
            console.error('Error fetching incident:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/10 text-red-500 border-red-500/20';
            case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
            case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
            </div>
        );
    }

    if (!incident) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Incident not found</h2>
                    <Link href="/incidents" className="text-red-400 hover:underline">← Back to Incidents</Link>
                </div>
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
                    <div className="mb-8">
                        <Link
                            href="/incidents"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Incidents
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-black text-white">{incident.title}</h1>
                                    <div className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase ${getSeverityColor(incident.severity)}`}>
                                        {incident.severity}
                                    </div>
                                    <div className="px-3 py-1 rounded-lg border border-white/10 text-slate-300 text-xs font-bold uppercase">
                                        {incident.status}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-lg mb-4">{incident.description}</p>

                                <div className="flex items-center gap-6 text-sm text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" />
                                        Reported by: <span className="text-white">{incident.reportedBy}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        Date: <span className="text-white">{new Date(incident.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Overview & Root Cause', icon: AlertTriangle },
                            { id: 'bypassed', label: 'Bypassed Controls', icon: ShieldAlert },
                            { id: 'actions', label: 'Remediation Actions', icon: CheckSquare },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab.id
                                        ? 'border-red-500 text-red-500'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-8">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4">Root Cause Analysis</h3>
                                        {incident.rootCause ? (
                                            <p className="text-slate-300 leading-relaxed">{incident.rootCause}</p>
                                        ) : (
                                            <p className="text-slate-500 italic">No root cause analysis recorded yet.</p>
                                        )}
                                    </div>

                                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4">Remediation Strategy</h3>
                                        {incident.remediation ? (
                                            <p className="text-slate-300 leading-relaxed">{incident.remediation}</p>
                                        ) : (
                                            <p className="text-slate-500 italic">No specific remediation strategy recorded.</p>
                                        )}
                                    </div>

                                    {/* Linked Risks */}
                                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-orange-400" />
                                            Risk Impact
                                        </h3>
                                        {incident.incidentRisks.length > 0 ? (
                                            <div className="space-y-3">
                                                {incident.incidentRisks.map(ir => (
                                                    <div key={ir.id} className="p-3 bg-white/5 rounded-lg flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold text-white">{ir.risk.category} Risk</div>
                                                            <div className="text-xs text-slate-400 mt-1">Impact Type: <span className="text-orange-300 capitalize">{ir.impactType}</span></div>
                                                        </div>
                                                        <div className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-bold rounded">
                                                            Score: {ir.risk.score}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-slate-500 italic">No specific risk impacts linked.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'bypassed' && (
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <ShieldAlert className="w-5 h-5 text-red-500" />
                                        Controls Failed or Bypassed
                                    </h3>

                                    {incident.incidentControls.length === 0 ? (
                                        <div className="text-center py-12 text-slate-500">
                                            <ShieldAlert className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <h4 className="text-lg font-medium text-white mb-2">No Control Failures</h4>
                                            <p>No controls were explicitly linked as bypassed or failed in this incident.</p>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {incident.incidentControls.map(ic => (
                                                <div key={ic.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex gap-4">
                                                    <div className="pt-1">
                                                        <ShieldAlert className="w-5 h-5 text-red-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-white text-lg">{ic.control.title}</h4>
                                                            <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-xs font-bold uppercase">
                                                                {ic.bypassType}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-400 mb-2">
                                                            Notes: {ic.notes || 'No analysis provided'}
                                                        </p>
                                                        <Link href={`/controls/${ic.control.id}`} className="text-xs text-blue-400 hover:underline flex items-center gap-1">
                                                            View Control <LinkIcon className="w-3 h-3" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'actions' && (
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                        <CheckSquare className="w-5 h-5 text-blue-400" />
                                        Corrective Actions
                                    </h3>

                                    {incident.actions.length === 0 ? (
                                        <p className="text-slate-500 italic">No corrective actions logged.</p>
                                    ) : (
                                        <div className="space-y-3">
                                            {incident.actions.map(action => (
                                                <div key={action.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                                                    <div>
                                                        <div className="font-bold text-white">{action.title}</div>
                                                        <div className="text-sm text-slate-400 capitalize mt-1">priority: {action.priority}</div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${action.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' :
                                                            'bg-yellow-500/10 text-yellow-500'
                                                        }`}>
                                                        {action.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar Stats */}
                        <div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 sticky top-32">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Incident Stats</h4>
                                <div className="space-y-6">
                                    <div>
                                        <div className="text-3xl font-black text-white">{incident.incidentControls.length}</div>
                                        <div className="text-xs text-slate-500 uppercase font-bold mt-1">Controls Bypassed</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-black text-white">{incident.actions.length}</div>
                                        <div className="text-xs text-slate-500 uppercase font-bold mt-1">Actions Taken</div>
                                    </div>
                                    <div>
                                        <div className="text-3xl font-black text-white">{incident.incidentRisks.length}</div>
                                        <div className="text-xs text-slate-500 uppercase font-bold mt-1">Risks Impacted</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
