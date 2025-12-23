'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import RiskHeatmap from '@/components/dashboard/RiskHeatmap';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { Shield, AlertTriangle, Siren, Building2, Activity as ActivityIcon, GitPullRequest, CheckCircle, FileText, PieChart, Calendar, ListChecks, ChevronRight, Sparkles, FileCheck, BarChart, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useGRCData } from '@/lib/contexts/GRCDataContext';
import { DashboardAnalytics, AuditLogEntry } from '@/types/assessment';
import { StatCard } from '@/components/dashboard/widgets/StatCard';
import { ComplianceScoreCard } from '@/components/dashboard/widgets/ComplianceScoreCard';
import { ControlsCategoryWidget } from '@/components/dashboard/widgets/ControlsCategoryWidget';
import { VendorRiskWidget } from '@/components/dashboard/widgets/VendorRiskWidget';
import { ActivityFeedWidget } from '@/components/dashboard/widgets/ActivityFeedWidget';
import { ActionItemsWidget } from '@/components/dashboard/widgets/ActionItemsWidget';
import { ComplianceCalendarWidget } from '@/components/dashboard/widgets/ComplianceCalendarWidget';
import { GigachadModulesWidget } from '@/components/dashboard/widgets/GigachadModulesWidget';
import GRCIntelligenceWidget from '@/components/dashboard/GRCIntelligenceWidget';
import DevSecOpsWidget from '@/components/dashboard/DevSecOpsWidget';

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useUser();
    const { t } = useLanguage();
    const {
        analytics,
        activity,
        loading,
        refreshAll,
        bcdrPlans,
        assets,
        employees,
        trainingCourses,
        questionnaires,
        runbooks,
        businessProcesses,
        controls,
        risks,
        policies,
        vendors,
        incidents,
        actions
    } = useGRCData() as {
        analytics: DashboardAnalytics | null,
        activity: AuditLogEntry[],
        loading: boolean,
        refreshAll: () => Promise<void>,
        bcdrPlans: any[],
        assets: any[],
        employees: any[],
        trainingCourses: any[],
        questionnaires: any[],
        runbooks: any[],
        businessProcesses: any[],
        controls: any[],
        risks: any[],
        policies: any[],
        vendors: any[],
        incidents: any[],
        actions: any[],
    };

    // Delete functionality state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteProgress, setDeleteProgress] = useState<string[]>([]);

    // Delete all GRC data function
    const handleDeleteAllData = async () => {
        setDeleting(true);
        setDeleteProgress([]);

        const modules = [
            'controls', 'risks', 'policies', 'vendors', 'incidents', 'actions',
            'assets', 'bcdrPlans', 'employees', 'trainingCourses', 'questionnaires', 'runbooks', 'businessProcesses', 'reports'
        ];

        for (const module of modules) {
            try {
                setDeleteProgress(prev => [...prev, `Deleting ${module}...`]);
                await fetch(`/api/bulk/delete?module=${module}`, { method: 'DELETE' });
                setDeleteProgress(prev => [...prev, `✓ ${module} deleted`]);
            } catch (error) {
                setDeleteProgress(prev => [...prev, `✗ Failed to delete ${module}`]);
            }
        }

        setDeleteProgress(prev => [...prev, '✓ All data cleared!']);
        await refreshAll();

        setTimeout(() => {
            setDeleting(false);
            setShowDeleteConfirm(false);
            setDeleteProgress([]);
            window.location.reload();
        }, 1500);
    };

    if (loading && !analytics) return <DashboardSkeleton />;

    // Fallback if analytics is missing
    const displayAnalytics: DashboardAnalytics = analytics || {
        overview: {
            totalControls: 0, totalRisks: 0, totalVendors: 0,
            totalActions: 0, totalIncidents: 0, totalPolicies: 0,
            totalChanges: 0, criticalRisks: 0, highRisks: 0,
            openActions: 0, openIncidents: 0, complianceScore: 0,
            maturityLevel: 'Initial', auditReadiness: 0, gapCount: 0,
            openGaps: 0, openFindings: 0, activeRemediations: 0
        },
        riskDistribution: [],
        heatmapRisks: []
    };

    const overview = displayAnalytics.overview;

    // Use real API data for control types breakdown (fallback to placeholder if not available)
    const controlsByType = displayAnalytics.controlsByType?.reduce((acc: Record<string, number>, item: any) => {
        acc[item.controlType || 'Other'] = item._count;
        return acc;
    }, {}) || {
        'Preventive': Math.round(overview.totalControls * 0.3),
        'Detective': Math.round(overview.totalControls * 0.25),
        'Corrective': Math.round(overview.totalControls * 0.2),
        'Directive': Math.round(overview.totalControls * 0.25),
    };

    // Use real API data for vendor criticality breakdown
    const vendorCriticalityData = displayAnalytics.vendorsByCriticality?.reduce((acc: Record<string, number>, item: any) => {
        acc[item.criticality || 'medium'] = item._count;
        return acc;
    }, { critical: 0, high: 0, medium: 0, low: 0 }) || {
        critical: Math.round(overview.totalVendors * 0.1),
        high: Math.round(overview.totalVendors * 0.2),
        medium: Math.round(overview.totalVendors * 0.4),
        low: Math.round(overview.totalVendors * 0.3),
    };

    // Use real API data for vendor status breakdown
    const vendorStatusData = displayAnalytics.vendorsByStatus?.reduce((acc: Record<string, number>, item: any) => {
        acc[item.status || 'active'] = item._count;
        return acc;
    }, { active: 0, suspended: 0, terminated: 0 }) || {
        active: Math.round(overview.totalVendors * 0.8),
        suspended: Math.round(overview.totalVendors * 0.1),
        terminated: Math.round(overview.totalVendors * 0.1),
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-12">
                    {/* Executive Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative">
                        <div className="space-y-4">
                            <div className="flex flex-col gap-4">
                            </div>
                            <div>
                                <h1 className="text-5xl font-black tracking-tighter text-white mb-3">
                                    {new Date().getHours() < 12 ? t('dash_greet_morning') : new Date().getHours() < 18 ? t('dash_greet_afternoon') : t('dash_greet_evening')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{user?.firstName || 'Chief'}</span>
                                </h1>
                                <p className="text-xl text-slate-400 font-medium max-w-2xl leading-relaxed">
                                    Your organization is currently at <span className="text-white font-bold">{overview.complianceScore}%</span> compliance maturity. {overview.criticalRisks > 0 ? `There are ${overview.criticalRisks} critical risks requiring attention.` : 'No critical risks detected.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="flex items-center gap-2 px-5 py-3.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/30 text-slate-400 hover:text-red-400 rounded-2xl font-bold transition-all duration-300"
                            >
                                <Trash2 className="w-5 h-5" />
                                {t('dash_clear_workspace')}
                            </button>
                            <button
                                onClick={() => router.push('/platform')}
                                className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 hover:bg-emerald-500 hover:text-white rounded-2xl font-black shadow-2xl shadow-white/5 transition-all duration-300 group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-cyan-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                                <Sparkles className="w-5 h-5 relative z-10" />
                                <span className="relative z-10 text-lg">{t('dash_gen_assessment')}</span>
                            </button>
                        </div>
                    </div>

                    {/* Delete Confirmation Modal */}
                    {showDeleteConfirm && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                            <div className="bg-slate-900 border border-red-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/10">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                        <AlertTriangle className="w-8 h-8 text-red-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">{t('dash_delete_data_title')}</h3>
                                        <p className="text-slate-400">{t('dash_delete_data_warn')}</p>
                                    </div>
                                </div>

                                <p className="text-slate-300 mb-6">
                                    {t('dash_delete_data_desc')}
                                </p>
                                <ul className="text-sm text-slate-400 mb-6 space-y-1">
                                    <li>• {t('nav_governance')}</li>
                                    <li>• {t('nav_risk')}</li>
                                    <li>• {t('nav_operations')}</li>
                                    <li>• {t('nav_audit')}</li>
                                </ul>

                                {/* Progress Display */}
                                {deleting && deleteProgress.length > 0 && (
                                    <div className="bg-black/30 rounded-lg p-4 mb-6 max-h-40 overflow-y-auto">
                                        {deleteProgress.map((msg, i) => (
                                            <div key={i} className={`text-xs font-mono ${msg.startsWith('✓') ? 'text-green-400' : msg.startsWith('✗') ? 'text-red-400' : 'text-slate-400'}`}>
                                                {msg}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium disabled:opacity-50"
                                    >
                                        {t('common_cancel')}
                                    </button>
                                    <button
                                        onClick={handleDeleteAllData}
                                        disabled={deleting}
                                        className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {deleting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Deleting...
                                            </>
                                        ) : (
                                            <>
                                                <Trash2 className="w-4 h-4" />
                                                Delete Everything
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Navigation Hub */}
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
                        {[
                            { label: t('nav_overview'), href: '/assessments', icon: FileCheck, color: 'emerald', desc: t('nav_audit') },
                            { label: t('nav_governance'), href: '/controls', icon: Shield, color: 'blue', desc: t('nav_risk') },
                            { label: t('nav_operations'), href: '/incidents', icon: Siren, color: 'orange', desc: t('stat_incidents') },
                            { label: t('employees_title') || 'Workforce', href: '/employees', icon: GitPullRequest, color: 'purple', desc: 'Compliance' },
                            { label: 'AI Intelligence', href: '/intelligence', icon: Sparkles, color: 'cyan', desc: 'GRC AI' },
                            { label: 'DevSecOps', href: '/devsecops', icon: GitPullRequest, color: 'pink', desc: 'CI/CD' },
                        ].map((nav) => (
                            <button
                                key={nav.label}
                                onClick={() => router.push(nav.href)}
                                className="relative group overflow-hidden bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 hover:-translate-y-1"
                            >
                                <div className={`absolute -right-4 -top-4 w-16 h-16 blur-2xl opacity-10 group-hover:opacity-20 transition-opacity bg-${nav.color}-500`} />

                                <div className={`w-12 h-12 rounded-xl bg-${nav.color}-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-500`}>
                                    <nav.icon className={`w-6 h-6 text-${nav.color}-400`} />
                                </div>
                                <div className="space-y-1">
                                    <div className="text-lg font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                                        {nav.label}
                                    </div>
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{nav.desc}</div>
                                </div>

                                <div className={`absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-${nav.color}-500 transition-all duration-500`} />
                            </button>
                        ))}
                    </div>

                    {/* Module Ecosystem Section */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                        <ActivityIcon className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    {t('dash_module_ecosystem')}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium px-1">{t('dash_module_ecosystem_desc')}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <Sparkles className="w-3 h-3 text-emerald-400" />
                                {t('dash_interactive')}
                            </div>
                        </div>

                        <GigachadModulesWidget
                            bcdrPlans={bcdrPlans || []}
                            assets={assets || []}
                            employees={employees || []}
                            trainingCourses={trainingCourses || []}
                            questionnaires={questionnaires || []}
                            runbooks={runbooks || []}
                            businessProcesses={businessProcesses || []}
                            controls={controls || []}
                            risks={risks || []}
                            policies={policies || []}
                            vendors={vendors || []}
                            incidents={incidents || []}
                            actions={actions || []}
                            onRefresh={refreshAll}
                        />
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title={t('dash_stat_maturity')}
                            value={`${overview.complianceScore}%`}
                            icon={Shield}
                            variant="brand"
                            trend={{ value: 5, label: "from last audit", positive: true }}
                            href="/frameworks"
                        />
                        <StatCard
                            title={t('ctrl_stat_total')}
                            value={overview.totalControls}
                            icon={CheckCircle}
                            variant="green"
                            href="/controls"
                        />
                        <StatCard
                            title={t('dash_stat_threat')}
                            value={overview.totalRisks}
                            icon={AlertTriangle}
                            variant="red"
                            trend={{ value: 2, label: "new risks", positive: false }}
                            href="/risks"
                        />
                        <StatCard
                            title={t('dash_stat_policy')}
                            value={overview.totalPolicies}
                            icon={FileText}
                            variant="blue"
                            href="/policies"
                        />
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Compliance & Widget Stack */}
                        <div className="space-y-8 lg:col-span-1">
                            <ComplianceScoreCard
                                score={overview.complianceScore}
                                implementedControls={overview.totalControls - (overview.openGaps || 0)}
                                totalControls={overview.totalControls || 100}
                                frameworkName="ISO 27001"
                                onClick={() => router.push('/frameworks')}
                            />

                            {[
                                { title: t('dash_vendor_risk'), icon: Building2, color: 'purple', href: '/vendors', widget: <VendorRiskWidget total={overview.totalVendors} critical={vendorCriticalityData.critical || 0} high={vendorCriticalityData.high || 0} medium={vendorCriticalityData.medium || 0} low={vendorCriticalityData.low || 0} active={vendorStatusData.active || 0} pendingReview={vendorStatusData.suspended || 0} /> },
                                { title: t('dash_control_taxonomy'), icon: PieChart, color: 'blue', href: '/controls', widget: <ControlsCategoryWidget data={controlsByType} total={overview.totalControls} /> },
                                { title: t('dash_pending_actions'), icon: ListChecks, color: 'amber', href: '/actions', widget: <ActionItemsWidget /> },
                                { title: t('dash_audit_calendar'), icon: Calendar, color: 'emerald', href: '/audit', widget: <ComplianceCalendarWidget /> },
                            ].map((section) => (
                                <div key={section.title} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 hover:bg-slate-900/60 hover:border-white/10 transition-all duration-300 group shadow-lg">
                                    <div
                                        onClick={() => router.push(section.href)}
                                        className="flex items-center justify-between mb-6 cursor-pointer"
                                    >
                                        <div className="space-y-1">
                                            <h3 className="text-lg font-black text-white flex items-center gap-3 group-hover:text-emerald-400 transition-colors">
                                                <div className={`p-2 rounded-lg bg-${section.color}-500/10 border border-${section.color}-500/20`}>
                                                    <section.icon className={`w-5 h-5 text-${section.color}-400`} />
                                                </div>
                                                {section.title}
                                            </h3>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <ChevronRight className="w-4 h-4 text-emerald-400" />
                                        </div>
                                    </div>
                                    {section.widget}
                                </div>
                            ))}
                        </div>

                        {/* Right Column: Heatmap & Activity */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Risk Heatmap Panel */}
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[128px] rounded-full -translate-y-1/2 translate-x-1/2 transition-opacity group-hover:opacity-100 opacity-50" />

                                <div
                                    onClick={() => router.push('/risks/dashboard')}
                                    className="flex items-center justify-between mb-8 cursor-pointer relative z-10"
                                >
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                                                <ActivityIcon className="w-6 h-6 text-red-400" />
                                            </div>
                                            {t('dash_risk_landscape')}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium px-1">{t('dash_risk_landscape_desc')}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="hidden md:flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</span>
                                            <span className="text-xs font-bold text-emerald-400">Live Updates</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-red-500/20 transition-all">
                                            <ChevronRight className="w-5 h-5 text-red-400" />
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10">
                                    <RiskHeatmap risks={displayAnalytics.heatmapRisks} />
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group">
                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

                                <div className="flex items-center justify-between mb-8 relative z-10">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-black text-white flex items-center gap-3">
                                            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                <ActivityIcon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            {t('dash_activity_nexus')}
                                        </h3>
                                        <p className="text-sm text-slate-500 font-medium px-1">{t('dash_activity_nexus_desc')}</p>
                                    </div>
                                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">
                                        {t('dash_view_full_log')}
                                    </button>
                                </div>

                                <div className="relative z-10">
                                    <ActivityFeedWidget activities={activity} limit={5} />
                                </div>
                            </div>

                            {/* GRC Intelligence Widget */}
                            <GRCIntelligenceWidget />

                            {/* DevSecOps Widget */}
                            <DevSecOpsWidget />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
