'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import ComplianceTrend from '@/components/dashboard/ComplianceTrend';
import ControlCoverageDashboard from '@/components/dashboard/ControlCoverageDashboard';
import RiskHeatmap from '@/components/dashboard/RiskHeatmap';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { Shield, AlertTriangle, PlayCircle, Siren, Building2, PieChart, Activity, TrendingUp, ArrowRight, Trash2, GitPullRequest } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface Analytics {
    overview: {
        totalControls: number;
        totalRisks: number;
        totalVendors: number;
        totalActions: number;
        totalIncidents: number;

        totalPolicies: number;
        totalChanges: number;
        criticalRisks: number;
        highRisks: number;
        openActions: number;
        openIncidents: number;
        complianceScore: number;
    };
    riskDistribution: Array<{ category: string; _count: number }>;
    heatmapRisks: Array<{
        id: string;
        narrative: string;
        likelihood: number;
        impact: number;
        score: number;
        category: string;
    }>;
}

interface AuditLog {
    id: string;
    userName: string;
    action: string;
    entity: string;
    timestamp: string;
    changes: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const { t } = useLanguage();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [activity, setActivity] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [overviewRes, activityRes] = await Promise.all([
                fetch('/api/analytics/overview'),
                fetch('/api/analytics/activity')
            ]);

            if (overviewRes.ok) {
                const data = await overviewRes.json();
                setAnalytics(data);
            }
            if (activityRes.ok) {
                const data = await activityRes.json();
                setActivity(data.logs || []);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return <DashboardSkeleton />;
    }

    if (!analytics || !analytics.overview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-red-400 text-xl">Failed to load dashboard data. Please try again later.</div>
            </div>
        );
    }

    const { overview, riskDistribution } = analytics;

    // Helper to format timestamps
    const timeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Header */}
                    <div className="mb-10 flex justify-between items-end">
                        <div>
                            <h1 className="text-5xl font-black mb-2 tracking-tight">
                                <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                    {t('dash_title')}
                                </span>
                            </h1>
                            <p className="text-lg text-slate-400 font-light">{t('dash_subtitle')}</p>
                        </div>
                        <button
                            onClick={async () => {
                                if (confirm('Are you sure you want to delete ALL your data? This cannot be undone.')) {
                                    if (confirm('Really sure? All controls, risks, policies, etc. will be lost forever.')) {
                                        try {
                                            const res = await fetch('/api/cleanup', { method: 'DELETE' });
                                            if (res.ok) {
                                                alert('Dashboard cleaned successfully');
                                                window.location.reload();
                                            } else {
                                                alert('Failed to clean dashboard');
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert('Error cleaning dashboard');
                                        }
                                    }
                                }
                            }}
                            className="px-4 py-2 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/20 rounded-lg transition-all text-sm font-medium flex items-center gap-2 hover:border-red-500/40"
                        >
                            <Trash2 className="w-4 h-4" />
                            {t('dash_reset')}
                        </button>
                    </div>

                    {/* Main Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
                        {/* Compliance Score (Large Card) */}
                        <div className="lg:col-span-1 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-50"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/30 transition-all duration-700"></div>

                            <div className="relative z-10 flex flex-col h-full justify-between">
                                <div>
                                    <div className="text-sm text-emerald-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        {t('dash_score')}
                                    </div>
                                    <div className="text-7xl font-black text-white tracking-tighter mb-4">
                                        {overview.complianceScore}<span className="text-4xl text-emerald-500/50">%</span>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-400 font-medium">
                                    {overview.totalControls > 0
                                        ? `${Math.round((overview.totalControls - (overview.totalControls * overview.complianceScore / 100)))} ${t('dash_controls_pending')}`
                                        : t('dash_no_controls')}
                                </div>
                            </div>
                        </div>

                        {/* Stats Grid using standard grid for alignment */}
                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                {
                                    label: t('stat_critical_risks'),
                                    value: overview.criticalRisks,
                                    color: 'red',
                                    icon: AlertTriangle,
                                    route: '/risks?sort=score'
                                },
                                {
                                    label: t('stat_open_actions'),
                                    value: overview.openActions,
                                    color: 'orange',
                                    icon: PlayCircle,
                                    route: '/actions?status=open'
                                },
                                {
                                    label: t('stat_incidents'),
                                    value: overview.openIncidents,
                                    color: 'yellow',
                                    icon: Siren,
                                    route: '/incidents?status=open'
                                },
                                {
                                    label: t('stat_vendors'),
                                    value: overview.totalVendors,
                                    color: 'blue',
                                    icon: Building2,
                                    route: '/vendors'
                                },
                                {
                                    label: t('stat_changes'),
                                    value: overview.totalChanges,
                                    color: 'purple',
                                    icon: GitPullRequest,
                                    route: '/changes'
                                }
                            ].map((stat, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => router.push(stat.route)}
                                    className="relative px-6 py-5 rounded-2xl bg-slate-950/50 border border-white/5 hover:border-emerald-500/20 hover:bg-slate-800/50 transition-all group cursor-pointer overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative z-10">
                                        <div className="flex items-center justify-between mb-3">
                                            <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                                            <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-white/5">Live</span>
                                        </div>
                                        <div className={`text-3xl font-black text-${stat.color}-400 mb-1`}>{stat.value}</div>
                                        <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Interactive Widget: Risk Distribution */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-purple-400" />
                                {t('widget_risk_dist')}
                            </h3>
                            <div className="space-y-4">
                                {riskDistribution.map(item => (
                                    <div
                                        key={item.category}
                                        onClick={() => router.push(`/risks?search=${item.category}`)}
                                        className="group cursor-pointer hover:bg-white/5 p-3 rounded-xl transition-colors"
                                    >
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-slate-300 capitalize font-medium">{item.category}</span>
                                            <span className="text-white font-mono">{item._count}</span>
                                        </div>
                                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-purple-500 h-full rounded-full transition-all duration-1000 group-hover:bg-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.4)]"
                                                style={{ width: `${(item._count / overview.totalRisks) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                                {riskDistribution.length === 0 && (
                                    <div className="text-center text-slate-500 py-12 flex flex-col items-center">
                                        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <AlertTriangle className="w-6 h-6 text-slate-600" />
                                        </div>
                                        {t('widget_no_risk')}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Interactive Widget: Risk Heatmap */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8">
                    <RiskHeatmap risks={analytics.heatmapRisks || []} />
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-8 mb-8">
                {/* Compliance Trend (Moved here for better layout) */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-xl font-bold text-white">{t('widget_comp_trend')}</h2>
                    </div>
                    <ComplianceTrend currentScore={overview.complianceScore} />
                </div>
            </div>

            {/* Control Coverage Dashboard - NEW GRC Enhancement */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-bold text-white">{t('widget_coverage')}</h2>
                    <span className="ml-auto text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full font-semibold">
                        {t('widget_analytics')}
                    </span>
                </div>
                <ControlCoverageDashboard />
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 mb-12">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    {t('widget_activity')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activity.map(log => (
                        <div
                            key={log.id}
                            onClick={() => {
                                const entityRoutes: Record<string, string> = {
                                    'Control': '/controls',
                                    'Risk': '/risks',
                                    'Incident': '/incidents',
                                    'Action': '/actions',
                                    'Policy': '/policies',
                                    'Vendor': '/vendors',
                                    'Framework': '/frameworks',
                                };
                                const route = entityRoutes[log.entity] || '/dashboard';
                                router.push(route);
                            }}
                            className="p-5 bg-slate-950/50 rounded-2xl hover:bg-slate-800/50 transition-colors border border-white/5 hover:border-emerald-500/20 group cursor-pointer"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-white/5">{timeAgo(log.timestamp)}</span>
                                <span className="text-xs text-blue-400 font-semibold bg-blue-500/10 px-2 py-1 rounded-full">{log.action}</span>
                            </div>
                            <p className="text-sm text-white mb-2 font-medium truncate group-hover:text-emerald-400 transition-colors">
                                <span className="text-emerald-400 group-hover:underline underline-offset-4">{log.entity}</span>
                            </p>
                            <p className="text-xs text-slate-400 line-clamp-2 h-8" title={log.changes}>{log.changes}</p>
                            <div className="mt-3 pt-3 border-t border-white/5 text-xs text-slate-500 flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-bold">
                                    {log.userName.charAt(0)}
                                </div>
                                {log.userName}
                            </div>
                        </div>
                    ))}
                </div>
                {activity.length === 0 && (
                    <div className="text-center text-slate-500 py-12">{t('widget_no_activity')}</div>
                )}
            </div>

            <div className="mt-12 mb-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-slate-400">
                    <span>GRCma Platform v1.0</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                    <span>Enterprise Edition</span>
                </div>
            </div>
        </div>


    );
}
