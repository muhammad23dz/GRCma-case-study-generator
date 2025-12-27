'use client';

import React from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import SecurityMesh from '@/components/SecurityMesh';
import ZeroTrustLive from '@/components/ZeroTrustLive';
import PageTransition from '@/components/PageTransition';
import { GRCProvider, useGRCData } from '@/lib/contexts/GRCDataContext';
import RiskHeatmap from '@/components/dashboard/RiskHeatmap';
import ControlCoverageDashboard from '@/components/dashboard/ControlCoverageDashboard';
import ComplianceTrend from '@/components/dashboard/ComplianceTrend';
import IncidentTimeline from '@/components/dashboard/IncidentTimeline';
import { VendorRiskWidget } from '@/components/dashboard/widgets/VendorRiskWidget';
import { ActivityFeedWidget } from '@/components/dashboard/widgets/ActivityFeedWidget';
import { Shield, Activity, AlertTriangle, Building2, FileCheck, BarChart } from 'lucide-react';

function ZeroTrustDashboard() {
    const { risks, controls, vendors, incidents, coverage, activity, loading } = useGRCData();

    // Calculate vendor stats
    const vendorStats = {
        total: vendors.length,
        critical: vendors.filter((v: any) => (v.riskScore || 0) >= 80).length,
        high: vendors.filter((v: any) => (v.riskScore || 0) >= 60 && (v.riskScore || 0) < 80).length,
        medium: vendors.filter((v: any) => (v.riskScore || 0) >= 40 && (v.riskScore || 0) < 60).length,
        low: vendors.filter((v: any) => (v.riskScore || 0) < 40).length,
        active: vendors.filter((v: any) => v.status === 'active').length,
        pendingReview: vendors.filter((v: any) => v.status === 'pending_review' || v.status === 'under_review').length,
    };

    // Calculate compliance score
    const complianceScore = coverage?.summary?.coveragePercentage ||
        (controls.length > 0
            ? Math.round((controls.filter((c: any) => c.status === 'implemented').length / controls.length) * 100)
            : 0);

    // Prevent rendering zero/empty if loading
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Zero Trust Pillars */}
            <ZeroTrustLive />

            {/* GRC Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400">{controls.length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Controls</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-400">{risks.filter((r: any) => r.status === 'open').length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Open Risks</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">{vendors.length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Vendors</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-orange-400">{incidents.filter((i: any) => i.status !== 'resolved').length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Active Incidents</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-400">{complianceScore}%</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Coverage</div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-cyan-500/20 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-400">{activity.length}</div>
                    <div className="text-xs text-slate-400 uppercase tracking-wider">Activities</div>
                </div>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Risk Heatmap */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Risk Intelligence Heatmap</h3>
                    </div>
                    <RiskHeatmap risks={risks} />
                </div>

                {/* Control Coverage */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500/20 rounded-lg">
                            <Shield className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Control Coverage Analysis</h3>
                    </div>
                    <ControlCoverageDashboard />
                </div>

                {/* Compliance Trend */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <BarChart className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Compliance Trend</h3>
                    </div>
                    <ComplianceTrend currentScore={complianceScore} />
                </div>

                {/* Incident Timeline */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Activity className="w-5 h-5 text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Incident Timeline</h3>
                    </div>
                    <IncidentTimeline incidents={incidents} />
                </div>
            </div>

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Vendor Risk */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <Building2 className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Vendor Risk Portfolio</h3>
                    </div>
                    <VendorRiskWidget
                        total={vendorStats.total}
                        critical={vendorStats.critical}
                        high={vendorStats.high}
                        medium={vendorStats.medium}
                        low={vendorStats.low}
                        active={vendorStats.active}
                        pendingReview={vendorStats.pendingReview}
                    />
                </div>

                {/* Activity Feed */}
                <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <FileCheck className="w-5 h-5 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Activity Nexus</h3>
                    </div>
                    <ActivityFeedWidget activities={activity} limit={5} />
                </div>
            </div>
        </div>
    );
}

export default function ZeroTrustPage() {
    return (
        <GRCProvider>
            <div className="min-h-screen text-white selection:bg-emerald-500/30">
                <PremiumBackground />
                <SecurityMesh />
                <Header />

                <div className="relative z-10 p-8 pt-32 max-w-[1800px] mx-auto">
                    <PageTransition>
                        <ZeroTrustDashboard />
                    </PageTransition>
                </div>
            </div>
        </GRCProvider>
    );
}
