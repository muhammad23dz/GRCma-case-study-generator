'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    AlertTriangle,
    TrendingUp,
    ShieldCheck,
    Activity,
    ArrowRight,
    BarChart3,
    PieChart,
    RefreshCw
} from 'lucide-react';

interface RiskStats {
    total: number;
    byLevel: Record<string, number>;
    byCategory: Record<string, number>;
    openRisks: number;
    mitigatedRisks: number;
    criticalCount: number;
}

export default function RiskDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<RiskStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRiskData() {
            try {
                const res = await fetch('/api/analytics/overview');
                const data = await res.json();

                // Derive stats from overview
                const risks = data.heatmapRisks || [];
                const byLevel = { low: 0, medium: 0, high: 0, critical: 0 };
                const byCategory: Record<string, number> = {};

                risks.forEach((r: any) => {
                    const score = r.score || (r.likelihood * r.impact);
                    if (score >= 15) byLevel.critical++;
                    else if (score >= 10) byLevel.high++;
                    else if (score >= 5) byLevel.medium++;
                    else byLevel.low++;

                    byCategory[r.category] = (byCategory[r.category] || 0) + 1;
                });

                setStats({
                    total: risks.length,
                    byLevel,
                    byCategory,
                    openRisks: risks.filter((r: any) => r.status === 'open').length,
                    mitigatedRisks: risks.filter((r: any) => r.status === 'mitigated' || r.status === 'closed').length,
                    criticalCount: byLevel.critical
                });
            } catch (error) {
                console.error('Failed to fetch risk data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchRiskData();
    }, []);

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
                                <Activity className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Enterprise Risk Analytics</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Risk Dashboard
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                Real-time visibility into organizational risk posture, control effectiveness, and compliance status.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/risks')}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            View All Risks
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-32 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {/* Executive Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <ExecutiveCard
                                    label="Total Risks"
                                    value={stats?.total || 0}
                                    icon={AlertTriangle}
                                    color="text-blue-400"
                                    trend={{ value: stats?.openRisks || 0, label: 'open' }}
                                />
                                <ExecutiveCard
                                    label="Critical Risks"
                                    value={stats?.criticalCount || 0}
                                    icon={TrendingUp}
                                    color="text-red-400"
                                    trend={{ value: 0, label: 'this week', positive: true }}
                                />
                                <ExecutiveCard
                                    label="Mitigated"
                                    value={stats?.mitigatedRisks || 0}
                                    icon={ShieldCheck}
                                    color="text-emerald-400"
                                />
                                <ExecutiveCard
                                    label="High Priority"
                                    value={stats?.byLevel?.high || 0}
                                    icon={Activity}
                                    color="text-orange-400"
                                />
                            </div>

                            {/* Charts Row */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Risk by Level */}
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <BarChart3 className="w-5 h-5 text-primary" />
                                            Risk Distribution by Severity
                                        </h3>
                                        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                                            <RefreshCw className="w-4 h-4 text-slate-400" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {Object.entries(stats?.byLevel || {}).reverse().map(([level, count]) => (
                                            <div key={level} className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-slate-400 capitalize font-medium">{level}</span>
                                                    <span className="text-white font-bold">{count}</span>
                                                </div>
                                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${level === 'critical' ? 'bg-red-500' : level === 'high' ? 'bg-orange-500' : level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                        style={{ width: `${stats?.total ? (count / (stats.total)) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Risk by Category */}
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <PieChart className="w-5 h-5 text-purple-400" />
                                            Risk Distribution by Category
                                        </h3>
                                    </div>
                                    {Object.keys(stats?.byCategory || {}).length > 0 ? (
                                        <div className="space-y-3">
                                            {Object.entries(stats?.byCategory || {}).slice(0, 6).map(([category, count], idx) => (
                                                <div key={category} className="flex items-center gap-3">
                                                    <div className={`w-3 h-3 rounded-full ${['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-red-500', 'bg-cyan-500'][idx % 6]}`} />
                                                    <span className="text-sm text-slate-400 flex-1">{category}</span>
                                                    <span className="text-sm font-bold text-white">{count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-slate-500">
                                            <PieChart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                            <p className="text-sm">No category data available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <ActionCard
                                    title="Risk Heatmap"
                                    description="Visualize risks by likelihood and impact"
                                    href="/dashboard"
                                    icon={Activity}
                                />
                                <ActionCard
                                    title="Audit Findings"
                                    description="Review open findings from recent audits"
                                    href="/audits/findings"
                                    icon={AlertTriangle}
                                />
                                <ActionCard
                                    title="Evidence Library"
                                    description="Access compliance artifacts and proofs"
                                    href="/evidence"
                                    icon={ShieldCheck}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function ExecutiveCard({ label, value, icon: Icon, color, trend }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
            <div className="text-3xl font-black text-white mb-1">{value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</div>
            {trend && (
                <div className={`mt-3 text-xs ${trend.positive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {trend.value} {trend.label}
                </div>
            )}
        </div>
    );
}

function ActionCard({ title, description, href, icon: Icon }: any) {
    const router = useRouter();
    return (
        <button
            onClick={() => router.push(href)}
            className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-left hover:bg-slate-800/60 transition-all group"
        >
            <Icon className="w-6 h-6 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h4 className="text-white font-bold mb-1 group-hover:text-primary transition-colors">{title}</h4>
            <p className="text-sm text-slate-500">{description}</p>
        </button>
    );
}
