'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Analytics {
    overview: {
        totalControls: number;
        totalRisks: number;
        totalVendors: number;
        totalActions: number;
        totalIncidents: number;
        totalPolicies: number;
        criticalRisks: number;
        openActions: number;
        openIncidents: number;
        complianceScore: number;
    };
    riskTrends: Array<{ category: string; _count: number }>;
}

export default function DashboardPage() {
    const router = useRouter();
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await fetch('/api/analytics/overview');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            setAnalytics(null);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading dashboard...</div>
            </div>
        );
    }

    if (!analytics || !analytics.overview) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-red-400 text-xl">Failed to load dashboard data. Please try again later.</div>
            </div>
        );
    }

    const { overview } = analytics;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Executive Dashboard</h1>
                            <p className="text-gray-400">Real-time GRC metrics and compliance posture</p>
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
                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Reset Dashboard
                        </button>
                    </div>

                    {/* Compliance Score */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-8 mb-8">
                        <div className="text-center">
                            <div className="text-6xl font-bold text-white mb-2">{overview.complianceScore}%</div>
                            <div className="text-xl text-emerald-100">Compliance Posture Score</div>
                            <div className="text-sm text-emerald-200 mt-2">
                                {overview.totalControls > 0
                                    ? `${Math.round((overview.totalControls - (overview.totalControls * overview.complianceScore / 100)))} controls need evidence`
                                    : 'No controls defined'}
                            </div>
                        </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-red-400">{overview.criticalRisks}</div>
                            <div className="text-gray-400 text-sm">Critical Risks</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-orange-400">{overview.openActions}</div>
                            <div className="text-gray-400 text-sm">Open Actions</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-yellow-400">{overview.openIncidents}</div>
                            <div className="text-gray-400 text-sm">Open Incidents</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-blue-400">{overview.totalVendors}</div>
                            <div className="text-gray-400 text-sm">Vendors</div>
                        </div>
                    </div>

                    {/* Module Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Controls & Frameworks</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Controls</span>
                                    <span className="text-white font-bold">{overview.totalControls}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Risks</span>
                                    <span className="text-white font-bold">{overview.totalRisks}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Governance</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Policies</span>
                                    <span className="text-white font-bold">{overview.totalPolicies}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Incidents</span>
                                    <span className="text-white font-bold">{overview.totalIncidents}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                            <h3 className="text-xl font-bold text-white mb-4">Workflow</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Actions</span>
                                    <span className="text-white font-bold">{overview.totalActions}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Open</span>
                                    <span className="text-orange-400 font-bold">{overview.openActions}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button
                            onClick={() => router.push('/controls')}
                            className="px-6 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all"
                        >
                            Controls
                        </button>
                        <button
                            onClick={() => router.push('/risks')}
                            className="px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 transition-all"
                        >
                            Risks
                        </button>
                        <button
                            onClick={() => router.push('/vendors')}
                            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-500 hover:to-pink-500 transition-all"
                        >
                            Vendors
                        </button>
                        <button
                            onClick={() => router.push('/policies')}
                            className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
                        >
                            Policies
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
