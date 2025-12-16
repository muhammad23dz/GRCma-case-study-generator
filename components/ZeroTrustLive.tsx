'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Smartphone,
    Globe,
    Database,
    Server,
    Lock,
    CheckCircle,
    AlertTriangle,
    ArrowRight,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Zap,
    Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface ZeroTrustMetrics {
    identity: {
        score: number;
        issues: number;
        controls: number;
        status: 'healthy' | 'warning' | 'critical';
        recentRisks: string[];
    };
    device: {
        score: number;
        issues: number;
        vendors: number;
        status: 'healthy' | 'warning' | 'critical';
        recentRisks: string[];
    };
    network: {
        score: number;
        issues: number;
        controls: number;
        status: 'healthy' | 'warning' | 'critical';
        recentRisks: string[];
    };
    application: {
        score: number;
        issues: number;
        changes: number;
        status: 'healthy' | 'warning' | 'critical';
        recentRisks: string[];
    };
    data: {
        score: number;
        issues: number;
        evidence: number;
        status: 'healthy' | 'warning' | 'critical';
        recentRisks: string[];
    };
}

export default function ZeroTrustLive() {
    const router = useRouter();
    const { t } = useLanguage();
    const [metrics, setMetrics] = useState<ZeroTrustMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [animateRefresh, setAnimateRefresh] = useState(false);

    const fetchMetrics = async () => {
        try {
            setAnimateRefresh(true);

            // Fetch metrics from the dedicated server-side API for verifiable relations
            const res = await fetch('/api/analytics/zero-trust');
            const data = await res.json();

            if (data.success && data.pillars) {
                setMetrics(data.pillars);
            }

            setLastUpdate(new Date());
        } catch (error) {
            console.error('Error fetching Zero Trust metrics:', error);
        } finally {
            setLoading(false);
            setTimeout(() => setAnimateRefresh(false), 500);
        }
    };

    useEffect(() => {
        fetchMetrics();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchMetrics, 30000);
        return () => clearInterval(interval);
    }, []);

    const steps = [
        {
            id: 'identity',
            title: t('zt_step_id_title'),
            description: t('zt_step_id_desc'),
            icon: Shield,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            glow: 'shadow-blue-500/20',
            link: '/admin/users',
            metricKey: 'identity' as const
        },
        {
            id: 'device',
            title: t('zt_step_dev_title'),
            description: t('zt_step_dev_desc'),
            icon: Smartphone,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            glow: 'shadow-purple-500/20',
            link: '/vendors',
            metricKey: 'device' as const
        },
        {
            id: 'network',
            title: t('zt_step_net_title'),
            description: t('zt_step_net_desc'),
            icon: Globe,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            glow: 'shadow-emerald-500/20',
            link: '/controls',
            metricKey: 'network' as const
        },
        {
            id: 'app',
            title: t('zt_step_app_title'),
            description: t('zt_step_app_desc'),
            icon: Server,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            glow: 'shadow-orange-500/20',
            link: '/changes',
            metricKey: 'application' as const
        },
        {
            id: 'data',
            title: t('zt_step_data_title'),
            description: t('zt_step_data_desc'),
            icon: Database,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/20',
            glow: 'shadow-pink-500/20',
            link: '/evidence',
            metricKey: 'data' as const
        }
    ];

    const getStatusColor = (status: 'healthy' | 'warning' | 'critical') => {
        switch (status) {
            case 'healthy': return 'bg-emerald-500';
            case 'warning': return 'bg-yellow-500';
            case 'critical': return 'bg-red-500 animate-pulse';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-yellow-400';
        return 'text-red-400';
    };

    const overallScore = metrics
        ? Math.round((metrics.identity.score + metrics.device.score + metrics.network.score + metrics.application.score + metrics.data.score) / 5)
        : 0;

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Header with Live Indicator */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                        <Lock className="w-3 h-3" /> {t('zt_badge')}
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-widest">
                        <Activity className="w-3 h-3 animate-pulse" /> LIVE
                    </div>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                    {t('zt_title_pre')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">{t('zt_title_highlight')}</span>
                </h2>

                {/* Overall Score */}
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-slate-900/80 border border-white/10 rounded-2xl mt-4">
                    <div className="text-center">
                        <div className={`text-4xl font-black ${getScoreColor(overallScore)}`}>
                            {loading ? '...' : overallScore}
                        </div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">Trust Score</div>
                    </div>
                    <div className="w-px h-12 bg-white/10"></div>
                    <div className="text-left">
                        <div className="text-sm text-slate-400">
                            {metrics && (Object.values(metrics).reduce((sum, m) => sum + m.issues, 0))} Open Issues
                        </div>
                        <div className="text-xs text-slate-500">
                            Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                        </div>
                    </div>
                    <button
                        onClick={fetchMetrics}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Refresh"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-400 ${animateRefresh ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Roadmap Grid */}
            <div className="relative">
                {/* Connecting Line */}
                <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-900/50 via-emerald-900/50 to-pink-900/50 -translate-y-1/2 rounded-full" />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
                    {steps.map((step, index) => {
                        const pillarMetrics = metrics?.[step.metricKey];

                        return (
                            <div key={step.id} className="group relative">
                                {/* Status Indicator - Pulsing dot */}
                                {pillarMetrics && (
                                    <div className={`absolute -top-2 -left-2 w-4 h-4 rounded-full ${getStatusColor(pillarMetrics.status)} z-20 shadow-lg`}>
                                        {pillarMetrics.status === 'critical' && (
                                            <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-50"></div>
                                        )}
                                    </div>
                                )}

                                {/* Card */}
                                <div
                                    onClick={() => router.push(step.link)}
                                    className={`
                                        h-full p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer
                                        ${step.bg} ${step.border} 
                                        hover:scale-105 hover:shadow-2xl ${step.glow} hover:border-white/20
                                        ${pillarMetrics?.status === 'critical' ? 'ring-2 ring-red-500/50' : ''}
                                    `}
                                >
                                    <div className={`
                                        w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6
                                        bg-slate-950 border border-white/10 ${step.color} shadow-lg
                                    `}>
                                        <step.icon className="w-6 h-6" />
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                        {step.title}
                                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-slate-400" />
                                    </h3>

                                    {/* Live Score */}
                                    {pillarMetrics && (
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className={`text-2xl font-black ${getScoreColor(pillarMetrics.score)}`}>
                                                {pillarMetrics.score}
                                            </div>
                                            {pillarMetrics.score >= 70 ? (
                                                <TrendingUp className="w-4 h-4 text-emerald-400" />
                                            ) : (
                                                <TrendingDown className="w-4 h-4 text-red-400" />
                                            )}
                                        </div>
                                    )}

                                    {/* Issues Badge */}
                                    {pillarMetrics && pillarMetrics.issues > 0 && (
                                        <div className="flex items-center gap-2 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-lg mb-3">
                                            <AlertTriangle className="w-3 h-3 text-red-400" />
                                            <span className="text-xs font-bold text-red-400">
                                                {pillarMetrics.issues} Issue{pillarMetrics.issues > 1 ? 's' : ''}
                                            </span>
                                        </div>
                                    )}

                                    {/* Recent Risks (if any) */}
                                    {pillarMetrics && pillarMetrics.recentRisks.length > 0 && (
                                        <div className="space-y-1 mb-3">
                                            {pillarMetrics.recentRisks.slice(0, 2).map((risk, i) => (
                                                <div key={i} className="text-[10px] text-slate-500 truncate bg-slate-950/50 px-2 py-1 rounded border border-white/5">
                                                    <Zap className="w-2 h-2 inline mr-1 text-yellow-500" />
                                                    {risk}...
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Metrics */}
                                    <div className="space-y-2 mt-auto">
                                        {pillarMetrics && (
                                            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-white/5">
                                                <CheckCircle className={`w-3 h-3 ${pillarMetrics.score >= 70 ? 'text-emerald-500' : 'text-slate-600'}`} />
                                                {step.metricKey === 'identity' && `${'controls' in pillarMetrics ? pillarMetrics.controls : 0} Controls`}
                                                {step.metricKey === 'device' && `${'vendors' in pillarMetrics ? pillarMetrics.vendors : 0} Vendors`}
                                                {step.metricKey === 'network' && `${'controls' in pillarMetrics ? pillarMetrics.controls : 0} Controls`}
                                                {step.metricKey === 'application' && `${'changes' in pillarMetrics ? pillarMetrics.changes : 0} Changes`}
                                                {step.metricKey === 'data' && `${'evidence' in pillarMetrics ? pillarMetrics.evidence : 0} Evidence`}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Step Number */}
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-500 shadow-xl group-hover:scale-110 transition-transform">
                                    {index + 1}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-wrap justify-center gap-4">
                <button
                    onClick={() => router.push('/gap-analysis')}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all group"
                >
                    <Zap className="w-5 h-5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Run Gap Analysis</span>
                </button>
                <button
                    onClick={() => router.push('/risks')}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl transition-all group"
                >
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-bold">View All Risks</span>
                </button>
                <button
                    onClick={() => router.push('/platform?view=input')}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl transition-all group"
                >
                    <Activity className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-400 font-bold">New Assessment</span>
                </button>
            </div>
        </div>
    );
}
