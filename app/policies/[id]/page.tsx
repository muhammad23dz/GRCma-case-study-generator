'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    ArrowLeft, FileText, Shield, History, Users,
    Calendar, CheckCircle, Clock, Link as LinkIcon, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface Policy {
    id: string;
    title: string;
    version: string;
    content: string;
    status: string;
    owner: string;
    description?: string;
    reviewDate: string | null;
    approvedBy: string | null;
    policyControls: Array<{
        relationship: string;
        control: {
            id: string;
            title: string;
            controlType: string;
        };
    }>;
    versions: Array<{
        id: string;
        version: string;
        changeSummary: string;
        createdAt: string;
        user: { name: string };
    }>;
    attestations: Array<{
        id: string;
        attestedBy: string;
        attestedAt: string;
    }>;
}

export default function PolicyDetailPage() {
    const params = useParams();
    const policyId = params.id as string;
    const [policy, setPolicy] = useState<Policy | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (policyId) {
            fetchPolicy();
        }
    }, [policyId]);

    const fetchPolicy = async () => {
        try {
            const res = await fetch(`/api/policies/${policyId}`);
            const data = await res.json();
            setPolicy(data.policy);
        } catch (error) {
            console.error('Error fetching policy:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!policy) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-4">Policy not found</h2>
                    <Link href="/policies" className="text-blue-400 hover:underline">← Back to Policies</Link>
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
                            href="/policies"
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Policies
                        </Link>

                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-black text-white">{policy.title}</h1>
                                    <div className="px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase">
                                        v{policy.version}
                                    </div>
                                    <div className={`px-3 py-1 rounded-lg border text-xs font-bold uppercase ${policy.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                        }`}>
                                        {policy.status}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mt-4">
                                    <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Owner: <span className="text-white">{policy.owner}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        Next Review: <span className="text-white">
                                            {policy.reviewDate ? new Date(policy.reviewDate).toLocaleDateString() : 'Not Set'}
                                        </span>
                                    </div>
                                    {policy.approvedBy && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                            Approved by {policy.approvedBy}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto">
                        {[
                            { id: 'overview', label: 'Policy Content', icon: FileText },
                            { id: 'controls', label: 'Linked Controls', icon: Shield },
                            { id: 'history', label: 'Version History', icon: History },
                            { id: 'attestations', label: 'Attestations', icon: Users }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 pb-3 px-2 text-sm font-bold capitalize transition-colors border-b-2 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-400'
                                        : 'border-transparent text-slate-400 hover:text-white'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="grid grid-cols-1 gap-8">
                        {activeTab === 'overview' && (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8">
                                <div className="prose prose-invert max-w-none">
                                    <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                                        {policy.content}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'controls' && (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    Controls Enforced by this Policy
                                </h3>

                                {policy.policyControls.length === 0 ? (
                                    <div className="text-center py-12 text-slate-500">
                                        <LinkIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <h4 className="text-lg font-medium text-white mb-2">No Controls Linked</h4>
                                        <p>This policy is not currently linked to any controls.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {policy.policyControls.map(pc => (
                                            <div key={pc.control.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-white text-lg">{pc.control.title}</span>
                                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase">
                                                            {pc.control.controlType}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm text-slate-400">
                                                        Relationship: <span className="text-blue-300 font-medium capitalize">{pc.relationship}</span>
                                                    </div>
                                                </div>
                                                <Link href={`/controls/${pc.control.id}`} className="p-2 hover:bg-white/10 rounded-lg group">
                                                    <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                <div className="space-y-8">
                                    {policy.versions.map((version, idx) => (
                                        <div key={version.id} className="relative pl-8 border-l-2 border-white/10 last:border-0">
                                            <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-slate-800 border-2 border-blue-500"></div>
                                            <div className="mb-1 flex items-center gap-3">
                                                <span className="text-lg font-bold text-white">v{version.version}</span>
                                                <span className="text-sm text-slate-400">{new Date(version.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="text-sm text-slate-300 mb-2">
                                                Changed by <span className="font-bold text-white">{version.user.name}</span>
                                            </div>
                                            <div className="p-3 bg-white/5 rounded-lg text-sm text-slate-400 italic">
                                                "{version.changeSummary || 'No change summary provided'}"
                                            </div>
                                        </div>
                                    ))}
                                    {policy.versions.length === 0 && (
                                        <p className="text-slate-500 italic">No version history available.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'attestations' && (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-blue-400" />
                                    Employee Attestations ({policy.attestations.length})
                                </h3>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-white/10 text-slate-400 text-sm uppercase">
                                                <th className="py-3 px-4">Employee</th>
                                                <th className="py-3 px-4">Attested At</th>
                                                <th className="py-3 px-4">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {policy.attestations.map(att => (
                                                <tr key={att.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                    <td className="py-3 px-4 font-medium text-white">{att.attestedBy}</td>
                                                    <td className="py-3 px-4 text-slate-400">{new Date(att.attestedAt).toLocaleString()}</td>
                                                    <td className="py-3 px-4">
                                                        <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs font-bold">
                                                            Confirmed
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                            {policy.attestations.length === 0 && (
                                                <tr>
                                                    <td colSpan={3} className="py-8 text-center text-slate-500">
                                                        No attestations recorded yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
