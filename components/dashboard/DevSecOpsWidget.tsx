'use client';

import Link from 'next/link';
import { useGRCData } from '@/lib/contexts/GRCDataContext';
import {
    Shield,
    FileCode,
    FileText,
    AlertTriangle,
    Building2,
    ArrowRight,
    Zap,
    CheckCircle2,
} from 'lucide-react';

export default function DevSecOpsWidget() {
    const {
        controls,
        risks,
        policies,
        vendors,
        loading,
    } = useGRCData() as any;

    // Calculate real metrics
    const metrics = {
        controls: {
            total: controls?.length || 0,
            implemented: controls?.filter((c: any) => c.status === 'implemented').length || 0,
        },
        risks: {
            total: risks?.length || 0,
            high: risks?.filter((r: any) => (r.likelihood || 1) * (r.impact || 1) >= 15).length || 0,
        },
        policies: {
            total: policies?.length || 0,
            approved: policies?.filter((p: any) => p.status === 'approved').length || 0,
        },
        vendors: {
            total: vendors?.length || 0,
            active: vendors?.filter((v: any) => v.status === 'active').length || 0,
        },
    };

    const implementationRate = metrics.controls.total > 0
        ? Math.round((metrics.controls.implemented / metrics.controls.total) * 100)
        : 0;

    if (loading) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-white/10 p-6">
                <div className="flex items-center justify-center h-32">
                    <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-800/50 border border-white/10 group hover:border-cyan-500/30 transition-all duration-500">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700" />

            <div className="relative p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 group-hover:scale-110 transition-transform duration-500">
                            <Zap className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">DevSecOps</h3>
                            <p className="text-xs text-gray-500">Config as Code</p>
                        </div>
                    </div>
                    <Link
                        href="/devsecops"
                        className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        View All
                        <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {/* Metrics Grid - Real Data */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Controls */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-gray-400">Controls</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">{metrics.controls.total}</span>
                            <span className="text-xs text-emerald-400">{implementationRate}%</span>
                        </div>
                    </div>

                    {/* Risks */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="w-4 h-4 text-orange-400" />
                            <span className="text-xs text-gray-400">Risks</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">{metrics.risks.total}</span>
                            {metrics.risks.high > 0 && (
                                <span className="text-xs text-red-400">{metrics.risks.high} high</span>
                            )}
                        </div>
                    </div>

                    {/* Policies */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <FileText className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-gray-400">Policies</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">{metrics.policies.total}</span>
                            <span className="text-xs text-gray-500">{metrics.policies.approved} approved</span>
                        </div>
                    </div>

                    {/* Vendors */}
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Building2 className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-gray-400">Vendors</span>
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-bold text-white">{metrics.vendors.total}</span>
                            <span className="text-xs text-gray-500">{metrics.vendors.active} active</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <Link
                        href="/devsecops?tab=config"
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all"
                    >
                        <FileCode className="w-3.5 h-3.5" />
                        Export Config
                    </Link>
                    <Link
                        href="/devsecops?tab=resources"
                        className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium hover:bg-purple-500/20 transition-all"
                    >
                        <Shield className="w-3.5 h-3.5" />
                        Resources
                    </Link>
                </div>
            </div>
        </div>
    );
}
