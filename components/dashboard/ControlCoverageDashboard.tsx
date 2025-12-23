'use client';

import { Shield, AlertTriangle, TrendingDown, Target, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { useGRCData } from '@/lib/contexts/GRCDataContext';
import { useRouter } from 'next/navigation';

interface ControlCoverageData {
    summary: {
        totalRisks: number;
        coveredRisks: number;
        uncoveredRisks: number;
        coveragePercentage: number;
        avgResidualRisk: number;
    };
    effectiveness: Array<{
        level: string;
        count: number;
    }>;
    gaps: {
        highRisksWithoutControls: Array<{
            id: string;
            narrative: string;
            score: number;
            category: string;
        }>;
    };
}

export default function ControlCoverageDashboard() {
    const router = useRouter();
    const { coverage: data, loading } = useGRCData() as { coverage: ControlCoverageData | null, loading: boolean };

    if (loading && !data) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
                <div className="h-32 bg-slate-800/50 rounded-2xl"></div>
            </div>
        );
    }

    if (!data) return null;

    const { summary, effectiveness, gaps } = data;

    // Data for Pie Chart
    const pieData = [
        { name: 'Covered', value: summary.coveredRisks, color: '#10b981' },
        { name: 'Uncovered', value: summary.uncoveredRisks, color: '#ef4444' },
    ];

    // Get effectiveness color
    const getEffectivenessColor = (level: string) => {
        switch (level) {
            case 'effective': return 'text-emerald-400 bg-emerald-500/10';
            case 'partial': return 'text-yellow-400 bg-yellow-500/10';
            case 'ineffective': return 'text-red-400 bg-red-500/10';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    const getCoverageColor = (percentage: number) => {
        if (percentage >= 80) return 'text-emerald-400';
        if (percentage >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="space-y-6">
            {/* Top Section: Donut Chart + Key Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Visual Coverage Chart (Donut) */}
                <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center relative min-h-[250px]">
                    <h3 className="absolute top-4 left-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Coverage Ratio</h3>
                    <div className="w-full h-48 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className={`text-3xl font-black ${getCoverageColor(summary.coveragePercentage)}`}>
                                {summary.coveragePercentage}%
                            </span>
                            <span className="text-[10px] text-slate-500 uppercase tracking-wider">Covered</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => router.push('/risks?filter=uncovered')}
                        className="relative px-5 py-4 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-red-500/20 transition-all group overflow-hidden flex flex-col justify-between cursor-pointer"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <AlertTriangle className="w-6 h-6 text-red-500 mb-3" />
                            <div className="text-2xl font-black text-white">{summary.uncoveredRisks}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Risk Gaps</div>
                        </div>
                    </div>

                    {/* Avg Residual Risk */}
                    <div className="relative px-5 py-4 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-blue-500/20 transition-all group overflow-hidden flex flex-col justify-between">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10">
                            <TrendingDown className="w-6 h-6 text-blue-500 mb-3" />
                            <div className="text-2xl font-black text-white">{summary.avgResidualRisk}</div>
                            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Avg Residual</div>
                        </div>
                    </div>

                    {/* Control Effectiveness Breakdown (Mini list) */}
                    <div className="col-span-2 bg-slate-950/50 border border-white/5 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-bold text-slate-400 uppercase">Control Health</span>
                        </div>
                        <div className="flex gap-2">
                            {effectiveness.map((eff) => (
                                <div key={eff.level} className={`flex-1 px-2 py-2 rounded-lg text-center border border-white/5 ${getEffectivenessColor(eff.level)}`}>
                                    <div className="text-sm font-black">{eff.count}</div>
                                    <div className="text-[10px] opacity-70 capitalize">{eff.level}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* High-Risk Gaps */}
            {gaps.highRisksWithoutControls.length > 0 && (
                <div className="bg-slate-950/30 border border-red-500/20 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-[50px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
                    <div className="flex items-center gap-2 mb-4 relative z-10">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        <h3 className="text-lg font-bold text-white">Critical Gaps</h3>
                        <span className="ml-auto text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full font-semibold border border-red-500/20">
                            {gaps.highRisksWithoutControls.length} Priority Actions
                        </span>
                    </div>
                    <div className="space-y-3 relative z-10">
                        {gaps.highRisksWithoutControls.map((risk) => (
                            <div
                                key={risk.id}
                                className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-white/5 hover:border-red-500/30 transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
                                    <div>
                                        <div className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors">{risk.narrative}</div>
                                        <div className="text-xs text-slate-500 flex items-center gap-2">
                                            <span>{risk.category}</span>
                                            <span className="text-slate-700">•</span>
                                            <span className="text-red-400">Score: {risk.score}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => router.push(`/controls`)}
                                    className="text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors border border-white/5"
                                >
                                    Assign Control
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
