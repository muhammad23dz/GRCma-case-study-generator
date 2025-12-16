'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    ArrowLeft, Shield, FileText, AlertCircle, CheckCircle2,
    Lock, AlertTriangle, Link as LinkIcon, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Control {
    id: string;
    title: string;
    description: string;
    controlType: string;
    controlRisk: string | null;
    owner: string | null;
    policyControls: Array<{
        policy: {
            id: string;
            title: string;
            status: string;
        };
        relationship: string;
    }>;
    auditFindings: Array<{
        id: string;
        title: string;
        severity: string;
        status: string;
        audit: {
            id: string;
            title: string;
        };
    }>;
    incidentControls: Array<{
        id: string;
        bypassType: string;
        incident: {
            id: string;
            title: string;
            severity: string;
        };
    }>;
    risks: Array<{
        id: string;
        category: string;
        score: number;
    }>;
}

export default function ControlDetailPage() {
    const params = useParams();
    const controlId = params.id as string;
    const [control, setControl] = useState<Control | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (controlId) {
            fetchControl();
        }
    }, [controlId]);

    const fetchControl = async () => {
        try {
            const res = await fetch(`/api/controls/${controlId}`);
            const data = await res.json();
            setControl(data.control);
        } catch (error) {
            console.error('Error fetching control:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    if (!control) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Control not found</h2>
                    <Link href="/controls" className="text-emerald-400 hover:underline">← Back to Controls</Link>
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
                            href="/controls"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Controls
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <h1 className="text-4xl font-black text-white">{control.title}</h1>
                                    <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
                                        {control.controlType}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-lg">{control.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto">
                        {['overview', 'policies', 'compliance', 'incidents'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`pb-3 px-2 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab
                                        ? 'border-emerald-500 text-emerald-400'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Main Content Area */}
                        <div className="md:col-span-2 space-y-6">

                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-emerald-400" />
                                            Risk Mitigation
                                        </h3>
                                        {control.risks.length === 0 ? (
                                            <p className="text-slate-500 italic">No risks linked to this control directly.</p>
                                        ) : (
                                            <div className="grid gap-3">
                                                {control.risks.map(risk => (
                                                    <div key={risk.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                                                        <span className="text-slate-300 font-medium capitalize">{risk.category} Risk</span>
                                                        <span className="px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs font-bold">
                                                            Score: {risk.score}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'policies' && (
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        Linked Policies
                                    </h3>
                                    {control.policyControls.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <LinkIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                            No policies linked to this control
                                        </div>
                                    ) : (
                                        <div className="grid gap-4">
                                            {control.policyControls.map(pc => (
                                                <div key={pc.policy.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all">
                                                    <div>
                                                        <div className="font-bold text-white mb-1">{pc.policy.title}</div>
                                                        <div className="flex gap-2">
                                                            <span className="text-xs text-slate-400 capitalize bg-slate-800 px-2 py-0.5 rounded">
                                                                {pc.relationship}
                                                            </span>
                                                            <span className="text-xs text-slate-400 capitalize bg-slate-800 px-2 py-0.5 rounded">
                                                                {pc.policy.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <Link href={`/policies/${pc.policy.id}`} className="p-2 hover:bg-white/10 rounded-lg">
                                                        <ExternalLink className="w-4 h-4 text-blue-400" />
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'compliance' && (
                                <div className="space-y-6">
                                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-purple-400" />
                                            Audit Findings
                                        </h3>
                                        {control.auditFindings.length === 0 ? (
                                            <p className="text-slate-500 italic">No audit findings recorded against this control.</p>
                                        ) : (
                                            <div className="grid gap-4">
                                                {control.auditFindings.map(finding => (
                                                    <div key={finding.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <h4 className="font-bold text-white">{finding.title}</h4>
                                                            <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${finding.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                                                                    finding.severity === 'major' ? 'bg-orange-500/10 text-orange-400' :
                                                                        'bg-blue-500/10 text-blue-400'
                                                                }`}>
                                                                {finding.severity}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-slate-400 mb-2">
                                                            Audit: <span className="text-slate-300">{finding.audit.title}</span>
                                                        </div>
                                                        <Link href={`/audit/${finding.audit.id}`} className="text-xs text-purple-400 hover:underline">
                                                            View Audit Details →
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'incidents' && (
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                        Control Bypasses / Incidents
                                    </h3>
                                    {control.incidentControls.length === 0 ? (
                                        <p className="text-slate-500 italic">No incidents linked to this control.</p>
                                    ) : (
                                        <div className="grid gap-4">
                                            {control.incidentControls.map(ic => (
                                                <div key={ic.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="font-bold text-white">{ic.incident.title}</h4>
                                                        <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded ${ic.incident.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                                                                'bg-orange-500/10 text-orange-400'
                                                            }`}>
                                                            {ic.incident.severity}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        Bypass Type: <span className="text-red-300 font-medium capitalize">{ic.bypassType}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                <h4 className="text-sm font-bold text-slate-400 uppercase mb-4">Control Status</h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500">Risk Level</label>
                                        <div className={`mt-1 font-bold capitalize ${!control.controlRisk ? 'text-slate-400' :
                                                control.controlRisk === 'high' ? 'text-red-400' :
                                                    control.controlRisk === 'medium' ? 'text-yellow-400' :
                                                        'text-emerald-400'
                                            }`}>
                                            {control.controlRisk || 'Not Assessed'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500">Owner</label>
                                        <div className="mt-1 font-medium text-white">
                                            {control.owner || 'Unassigned'}
                                        </div>
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
