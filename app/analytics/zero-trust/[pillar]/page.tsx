'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import SecurityMesh from '@/components/SecurityMesh';
import PageTransition from '@/components/PageTransition';
import { GRCProvider, useGRCData } from '@/lib/contexts/GRCDataContext';
import RiskHeatmap from '@/components/dashboard/RiskHeatmap';
import {
    Shield, Smartphone, Globe, Server, Database,
    ArrowLeft, CheckCircle, AlertTriangle, TrendingUp,
    Lock, Users, Key, Monitor, Wifi, Cloud, FileCheck,
    Activity, RefreshCw
} from 'lucide-react';

const pillarConfig: Record<string, {
    title: string;
    description: string;
    icon: any;
    color: string;
    bg: string;
    border: string;
    keywords: string[];
    relatedLinks: { label: string; href: string }[];
}> = {
    identity: {
        title: 'Identity Security',
        description: 'Verify every user, every time. Implement strong authentication, MFA, and least privilege access.',
        icon: Shield,
        color: 'text-blue-400',
        bg: 'bg-blue-500/20',
        border: 'border-blue-500/30',
        keywords: ['mfa', 'identity', 'auth', 'user', 'access', 'sso', 'password', 'credential', 'login'],
        relatedLinks: [
            { label: 'User Management', href: '/admin/users' },
            { label: 'Access Controls', href: '/controls?filter=identity' },
            { label: 'Employee Directory', href: '/employees' },
        ]
    },
    devices: {
        title: 'Device Security',
        description: 'Validate device health and compliance before granting access to resources.',
        icon: Smartphone,
        color: 'text-purple-400',
        bg: 'bg-purple-500/20',
        border: 'border-purple-500/30',
        keywords: ['device', 'endpoint', 'mobile', 'laptop', 'workstation', 'mdm', 'hardware', 'asset'],
        relatedLinks: [
            { label: 'Asset Inventory', href: '/assets' },
            { label: 'Vendor Management', href: '/vendors' },
            { label: 'Device Controls', href: '/controls?filter=device' },
        ]
    },
    network: {
        title: 'Network Security',
        description: 'Segment and control traffic. Implement micro-segmentation and ZTNA.',
        icon: Globe,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        border: 'border-emerald-500/30',
        keywords: ['network', 'firewall', 'segment', 'vpn', 'traffic', 'ztna', 'perimeter', 'dns'],
        relatedLinks: [
            { label: 'Network Controls', href: '/controls?filter=network' },
            { label: 'Incident Response', href: '/incidents' },
            { label: 'Security Policies', href: '/policies' },
        ]
    },
    applications: {
        title: 'Application Security',
        description: 'Secure workloads, APIs, and containerized applications.',
        icon: Server,
        color: 'text-orange-400',
        bg: 'bg-orange-500/20',
        border: 'border-orange-500/30',
        keywords: ['application', 'api', 'container', 'microservice', 'saas', 'cloud', 'workload', 'software'],
        relatedLinks: [
            { label: 'Change Management', href: '/changes' },
            { label: 'Application Controls', href: '/controls?filter=application' },
            { label: 'Business Processes', href: '/processes' },
        ]
    },
    data: {
        title: 'Data Security',
        description: 'Encrypt and classify data. Implement DLP and data governance.',
        icon: Database,
        color: 'text-pink-400',
        bg: 'bg-pink-500/20',
        border: 'border-pink-500/30',
        keywords: ['data', 'encryption', 'database', 'backup', 'privacy', 'dlp', 'classification', 'pii'],
        relatedLinks: [
            { label: 'Evidence Vault', href: '/evidence' },
            { label: 'Data Policies', href: '/policies?filter=data' },
            { label: 'BCDR Plans', href: '/bcdr' },
        ]
    }
};

function PillarContent() {
    const params = useParams();
    const router = useRouter();
    const pillar = params.pillar as string;
    const config = pillarConfig[pillar];

    const { risks, controls, vendors, incidents, loading } = useGRCData();
    const [pillarMetrics, setPillarMetrics] = useState<any>(null);
    const [loadingMetrics, setLoadingMetrics] = useState(true);

    // Filter data based on pillar keywords
    const categorize = (text: string): boolean => {
        if (!config) return false;
        const t = text.toLowerCase();
        return config.keywords.some(keyword => t.includes(keyword));
    };

    const pillarRisks = risks.filter((r: any) => categorize(`${r.narrative || ''} ${r.category || ''}`));
    const pillarControls = controls.filter((c: any) => categorize(`${c.title || ''} ${c.description || ''}`));
    const openRisks = pillarRisks.filter((r: any) => r.status === 'open');
    const implementedControls = pillarControls.filter((c: any) => c.status === 'implemented');

    // Fetch pillar-specific metrics from Zero Trust API
    useEffect(() => {
        async function fetchMetrics() {
            try {
                const res = await fetch('/api/analytics/zero-trust');
                const data = await res.json();
                if (data.success && data.pillars) {
                    const key = pillar === 'devices' ? 'device' : pillar === 'applications' ? 'application' : pillar;
                    setPillarMetrics(data.pillars[key]);
                }
            } catch (error) {
                console.error('Error fetching pillar metrics:', error);
            } finally {
                setLoadingMetrics(false);
            }
        }
        fetchMetrics();
    }, [pillar]);

    if (!config) {
        return (
            <div className="min-h-screen flex items-center justify-center text-white">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Pillar Not Found</h1>
                    <button onClick={() => router.push('/analytics/zero-trust')} className="text-emerald-400 hover:underline">
                        ← Back to Zero Trust
                    </button>
                </div>
            </div>
        );
    }

    const Icon = config.icon;
    const score = pillarMetrics?.score || 0;
    const status = pillarMetrics?.status || 'healthy';

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'healthy': return <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">Healthy</span>;
            case 'warning': return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs font-bold">Warning</span>;
            case 'critical': return <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold animate-pulse">Critical</span>;
            default: return null;
        }
    };

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <SecurityMesh />
            <Header />

            <div className="relative z-10 p-8 pt-32 max-w-[1600px] mx-auto">
                <PageTransition>
                    {/* Back Navigation */}
                    <button
                        onClick={() => router.push('/analytics/zero-trust')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Zero Trust Dashboard
                    </button>

                    {/* Header */}
                    <div className={`${config.bg} ${config.border} border rounded-2xl p-8 mb-8`}>
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-6">
                                <div className={`p-4 rounded-2xl ${config.bg} border ${config.border}`}>
                                    <Icon className={`w-10 h-10 ${config.color}`} />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-black text-white mb-2">{config.title}</h1>
                                    <p className="text-slate-400 text-lg max-w-2xl">{config.description}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className={`text-5xl font-black ${score >= 70 ? 'text-emerald-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {loadingMetrics ? '...' : score}
                                </div>
                                <div className="text-slate-500 text-sm uppercase tracking-wider mb-2">Security Score</div>
                                {getStatusBadge(status)}
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <Shield className="w-5 h-5 text-blue-400" />
                                <span className="text-sm text-slate-400">Controls</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{pillarControls.length}</div>
                            <div className="text-xs text-emerald-400 mt-1">{implementedControls.length} implemented</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                                <span className="text-sm text-slate-400">Risks</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{pillarRisks.length}</div>
                            <div className="text-xs text-red-400 mt-1">{openRisks.length} open</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <CheckCircle className="w-5 h-5 text-purple-400" />
                                <span className="text-sm text-slate-400">Coverage</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {pillarRisks.length > 0 ? Math.round((pillarControls.length / pillarRisks.length) * 100) : 100}%
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Control to Risk ratio</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-5">
                            <div className="flex items-center gap-3 mb-2">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm text-slate-400">Maturity</span>
                            </div>
                            <div className="text-3xl font-bold text-white">
                                {score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low'}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">Based on score</div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        {/* Risk Heatmap - Full Width on Mobile, 2 cols on Desktop */}
                        <div className="lg:col-span-2 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white">{config.title} Risk Heatmap</h3>
                            </div>
                            <RiskHeatmap risks={pillarRisks} />
                        </div>

                        {/* Quick Links */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className={`p-2 ${config.bg} rounded-lg`}>
                                    <Activity className={`w-5 h-5 ${config.color}`} />
                                </div>
                                <h3 className="text-xl font-bold text-white">Quick Actions</h3>
                            </div>
                            <div className="space-y-3">
                                {config.relatedLinks.map((link, i) => (
                                    <button
                                        key={i}
                                        onClick={() => router.push(link.href)}
                                        className={`w-full flex items-center justify-between p-4 ${config.bg} border ${config.border} rounded-xl hover:bg-white/5 transition-colors group`}
                                    >
                                        <span className="text-white font-medium">{link.label}</span>
                                        <ArrowLeft className="w-4 h-4 text-slate-400 rotate-180 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Controls & Risks Lists */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Controls */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Shield className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Related Controls</h3>
                                </div>
                                <button
                                    onClick={() => router.push('/controls')}
                                    className="text-sm text-emerald-400 hover:underline"
                                >
                                    View All →
                                </button>
                            </div>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {pillarControls.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No controls found for this pillar
                                    </div>
                                ) : (
                                    pillarControls.slice(0, 5).map((control: any) => (
                                        <div
                                            key={control.id}
                                            onClick={() => router.push(`/controls/${control.id}`)}
                                            className="p-4 bg-slate-800/50 border border-white/5 rounded-xl hover:border-white/20 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium truncate">{control.title}</span>
                                                <span className={`text-xs px-2 py-1 rounded ${control.status === 'implemented' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {control.status || 'Draft'}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Risks */}
                        <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-lg">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white">Related Risks</h3>
                                </div>
                                <button
                                    onClick={() => router.push('/risks')}
                                    className="text-sm text-emerald-400 hover:underline"
                                >
                                    View All →
                                </button>
                            </div>
                            <div className="space-y-3 max-h-80 overflow-y-auto">
                                {pillarRisks.length === 0 ? (
                                    <div className="text-center py-8 text-slate-500">
                                        No risks found for this pillar
                                    </div>
                                ) : (
                                    pillarRisks.slice(0, 5).map((risk: any) => (
                                        <div
                                            key={risk.id}
                                            onClick={() => router.push(`/risks/${risk.id}`)}
                                            className="p-4 bg-slate-800/50 border border-white/5 rounded-xl hover:border-white/20 cursor-pointer transition-colors"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium truncate flex-1">{risk.narrative}</span>
                                                <span className={`text-xs px-2 py-1 rounded ml-3 ${risk.score >= 15 ? 'bg-red-500/20 text-red-400' :
                                                    risk.score >= 10 ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    Score: {risk.score}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </PageTransition>
            </div>
        </div>
    );
}

export default function PillarPage() {
    return (
        <GRCProvider>
            <PillarContent />
        </GRCProvider>
    );
}
