'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import SecurityMesh from '@/components/SecurityMesh';
import PageTransition from '@/components/PageTransition';
import { GRCProvider, useGRCData } from '@/lib/contexts/GRCDataContext';
import RiskHeatmap from '@/components/dashboard/RiskHeatmap';
import ComplianceTrend from '@/components/dashboard/ComplianceTrend';
import { Shield, AlertTriangle, BarChart, Target, RefreshCw } from 'lucide-react';

interface FrameworkStats {
    id: string;
    name: string;
    version: string;
    totalRequirements: number;
    coveredRequirements: number;
    compliantCount: number;
    nonCompliantCount: number;
    partialCount: number;
    coverage: number;
    complianceScore: number;
    gap: number;
    status: 'ready' | 'in-progress' | 'needs-work';
    topGaps: { id: string; reference: string; description: string }[];
}

function GapAnalysisContent() {
    const { risks, controls, coverage, loading: grcLoading } = useGRCData();
    const { user } = useUser();
    const router = useRouter();
    const [stats, setStats] = useState<FrameworkStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/frameworks/stats');
            const data = await res.json();
            setStats(data.stats || []);
        } catch (error) {
            console.error('Error fetching framework stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'text-green-400 bg-green-500/20 border-green-500/50';
            case 'in-progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
            case 'needs-work': return 'text-red-400 bg-red-500/20 border-red-500/50';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ready': return '✅ Audit Ready';
            case 'in-progress': return '🔸 In Progress';
            case 'needs-work': return '⚠️ Needs Work';
            default: return 'Not Started';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl animate-pulse">Loading compliance posture...</div>
            </div>
        );
    }

    const totalMappings = stats.reduce((sum, f) => sum + f.coveredRequirements, 0);
    const avgCoverage = stats.length > 0
        ? Math.round(stats.reduce((sum, f) => sum + f.complianceScore, 0) / stats.length)
        : 0;

    return (
        <div className="min-h-screen text-white flex flex-col selection:bg-emerald-500/30">
            <PremiumBackground />
            <SecurityMesh />
            <Header />

            <div className="flex-grow p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Compliance Posture & Gap Analysis</h1>
                            <p className="text-gray-400">Real-time control validation against regulatory requirements</p>
                        </div>
                        <div className="text-right text-sm text-emerald-400/80 italic">
                            Generated from live GRC data
                        </div>
                    </div>

                    {/* Overall Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-center sm:text-left">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-6 shadow-lg shadow-emerald-900/10">
                            <div className="text-3xl font-bold text-emerald-400">{stats.length}</div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider font-medium">Frameworks</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6 shadow-lg shadow-blue-900/10">
                            <div className="text-3xl font-bold text-blue-400">{totalMappings}</div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider font-medium">Mapped Controls</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6 shadow-lg shadow-purple-900/10">
                            <div className="text-3xl font-bold text-purple-400">{avgCoverage}%</div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider font-medium">Global Posture</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-xl p-6 shadow-lg shadow-yellow-900/10">
                            <div className="text-3xl font-bold text-yellow-400">
                                {stats.filter(f => f.status === 'ready').length}
                            </div>
                            <div className="text-gray-400 text-sm uppercase tracking-wider font-medium">Audit Ready</div>
                        </div>
                    </div>

                    {/* Framework Gap Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {stats.map((framework) => {
                            return (
                                <div
                                    key={framework.id}
                                    className="bg-slate-800/60 backdrop-blur-md border border-white/5 rounded-2xl p-8 hover:border-emerald-500/30 transition-all group relative overflow-hidden"
                                >
                                    {/* Background Accent */}
                                    <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full transition-all group-hover:opacity-10 ${framework.status === 'ready' ? 'bg-green-500' :
                                        framework.status === 'in-progress' ? 'bg-yellow-500' : 'bg-red-500'
                                        }`} />

                                    {/* Framework Header */}
                                    <div className="flex items-start justify-between mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{framework.name}</h3>
                                            <p className="text-sm text-gray-500">Edition {framework.version}</p>
                                        </div>
                                        <span className={`px-4 py-1 rounded-full text-xs font-bold tracking-wide border shadow-sm ${getStatusColor(framework.status)}`}>
                                            {getStatusLabel(framework.status)}
                                        </span>
                                    </div>

                                    {/* Compliance Score Integration */}
                                    <div className="mb-8 relative z-10">
                                        <div className="flex justify-between items-end mb-3">
                                            <span className="text-sm font-semibold text-gray-400 uppercase tracking-tighter">Compliance Maturity</span>
                                            <span className="text-3xl font-black text-white italic">{framework.complianceScore}%</span>
                                        </div>
                                        <div className="w-full bg-slate-900/50 rounded-full h-4 p-1 shadow-inner">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${framework.complianceScore >= 80 ? 'bg-gradient-to-r from-green-600 to-emerald-400' :
                                                    framework.complianceScore >= 50 ? 'bg-gradient-to-r from-yellow-600 to-amber-400' :
                                                        'bg-gradient-to-r from-red-600 to-orange-400'
                                                    }`}
                                                style={{ width: `${framework.complianceScore}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* GRC Logic Breakdown */}
                                    <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5">
                                            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status Distribution</div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-emerald-400 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Compliant
                                                    </span>
                                                    <span className="text-white font-bold">{framework.compliantCount}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-yellow-400 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" /> Partial
                                                    </span>
                                                    <span className="text-white font-bold">{framework.partialCount}</span>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-red-400 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Gaps
                                                    </span>
                                                    <span className="text-white font-bold">{framework.nonCompliantCount}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900/40 p-4 rounded-xl border border-white/5 flex flex-col justify-center">
                                            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-2">Residual Risk</div>
                                            <div className="flex items-center gap-2">
                                                <div className={`text-xl font-bold ${framework.complianceScore >= 80 ? 'text-green-400' :
                                                    framework.complianceScore >= 50 ? 'text-yellow-400' : 'text-red-400'
                                                    }`}>
                                                    {framework.complianceScore >= 80 ? 'Low' :
                                                        framework.complianceScore >= 50 ? 'Moderate' : 'Critical'}
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((level) => {
                                                        const riskLevel = framework.complianceScore >= 80 ? 1 : (framework.complianceScore >= 50 ? 3 : 5);
                                                        return (
                                                            <div key={level} className={`w-1 h-3 rounded-full ${level <= riskLevel
                                                                ? (riskLevel === 1 ? 'bg-green-500' : riskLevel === 3 ? 'bg-yellow-500' : 'bg-red-500')
                                                                : 'bg-slate-800'
                                                                }`} />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Top Gaps Section */}
                                    {framework.topGaps.length > 0 && (
                                        <div className="mb-8 relative z-10">
                                            <div className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                                                <span className="w-1 h-1 bg-red-400 rounded-full animate-ping" />
                                                Primary Remediation Gaps
                                            </div>
                                            <div className="space-y-2">
                                                {framework.topGaps.map(gap => (
                                                    <div key={gap.id} className="text-[11px] bg-red-500/5 border border-red-500/10 p-2 rounded-lg text-red-200/70 hover:bg-red-500/10 transition-colors">
                                                        <span className="font-bold text-red-400 mr-2">{gap.reference}:</span>
                                                        {gap.description.length > 60 ? gap.description.substring(0, 60) + '...' : gap.description}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3 relative z-10 text-center sm:text-left">
                                        <button
                                            onClick={() => router.push('/mapping')}
                                            className="flex-1 px-4 py-3 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-xl hover:bg-emerald-600 hover:text-white transition-all text-xs font-bold uppercase tracking-tight"
                                        >
                                            Strengthen Controls
                                        </button>
                                        <button
                                            onClick={() => router.push(`/frameworks/${framework.id}`)}
                                            className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-xl hover:bg-slate-600 transition-all text-xs font-bold uppercase tracking-tight"
                                        >
                                            Audit Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Intelligent Recommendations */}
                    <div className="bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-8 shadow-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="p-3 bg-indigo-500/20 rounded-lg">
                                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                            <h2 className="text-2xl font-bold text-white tracking-tight">Governance Intelligence Recommendations</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                {stats
                                    .filter(f => f.status === 'needs-work')
                                    .map(f => (
                                        <div key={f.id} className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0 animate-pulse" />
                                            <div className="text-sm">
                                                <span className="text-red-400 font-bold block mb-1">High Priority Remediation</span>
                                                <span className="text-gray-300">
                                                    <strong>{f.name}</strong> exposes the organization to critical regulatory risk with {f.gap}% compliance deficiency.
                                                    Prioritize control mapping for {f.nonCompliantCount} non-compliant requirements.
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                            <div className="space-y-4">
                                {stats
                                    .filter(f => f.status === 'in-progress')
                                    .map(f => (
                                        <div key={f.id} className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-xl flex items-start gap-3">
                                            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                                            <div className="text-sm">
                                                <span className="text-yellow-400 font-bold block mb-1">Audit Optimization</span>
                                                <span className="text-gray-300">
                                                    <strong>{f.name}</strong> is in advanced implementation state.
                                                    Closing <strong>{80 - f.complianceScore}%</strong> of remaining gaps will push this framework to Audit Ready status.
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                {stats.length === 0 && (
                                    <div className="col-span-2 text-center py-12 text-gray-500 italic">
                                        No frameworks currently under governance. Start by adding a framework to your registry.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GapAnalysisPage() {
    return (
        <GRCProvider>
            <GapAnalysisContent />
        </GRCProvider>
    );
}
