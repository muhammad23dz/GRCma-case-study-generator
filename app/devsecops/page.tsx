'use client';

import { useState, useEffect } from 'react';
import { useGRCData } from '@/lib/contexts/GRCDataContext';
import {
    GitBranch,
    Upload,
    Download,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    FileCode,
    Shield,
    Activity,
    Zap,
    Server,
    GitPullRequest,
    Eye,
    Copy,
    Check,
    AlertTriangle,
    FileText,
    Users,
    Building2,
} from 'lucide-react';

export default function DevSecOpsPage() {
    const {
        controls,
        risks,
        policies,
        vendors,
        incidents,
        loading: grcLoading,
        refreshAll,
    } = useGRCData() as any;

    const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'git-sync' | 'resources'>('overview');
    const [configContent, setConfigContent] = useState('');
    const [configFormat, setConfigFormat] = useState<'yaml' | 'json'>('yaml');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [importMode, setImportMode] = useState(false);
    const [importContent, setImportContent] = useState('');
    const [importResult, setImportResult] = useState<any>(null);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        loadConfig();
    }, [configFormat]);

    async function loadConfig() {
        setLoading(true);
        try {
            const res = await fetch(`/api/integrations/config-as-code?format=${configFormat}&resources=controls,policies,frameworks,risks,vendors`);
            const data = await res.json();
            setConfigContent(data.content || '');
        } catch (error) {
            console.error('Failed to load config:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleExport() {
        const link = document.createElement('a');
        link.href = `/api/integrations/config-as-code?format=${configFormat}&resources=controls,policies,frameworks,risks,vendors&download=true`;
        link.download = `grc-config.${configFormat}`;
        link.click();
    }

    async function handleImport() {
        if (!importContent.trim()) return;

        setSyncing(true);
        try {
            const res = await fetch('/api/integrations/config-as-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'import',
                    format: configFormat,
                    content: importContent,
                    dryRun: false,
                    overwriteExisting: true,
                }),
            });
            const result = await res.json();
            setImportResult(result);
            if (result.success) {
                await refreshAll();
                await loadConfig();
            }
        } catch (error) {
            console.error('Import failed:', error);
        } finally {
            setSyncing(false);
        }
    }

    async function handleValidate() {
        if (!importContent.trim()) return;

        try {
            const res = await fetch('/api/integrations/config-as-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'validate',
                    format: configFormat,
                    content: importContent,
                }),
            });
            const result = await res.json();
            setImportResult(result);
        } catch (error) {
            console.error('Validation failed:', error);
        }
    }

    function copyToClipboard() {
        navigator.clipboard.writeText(configContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    // Calculate real metrics from GRC data
    const metrics = {
        controls: {
            total: controls?.length || 0,
            implemented: controls?.filter((c: any) => c.status === 'implemented').length || 0,
            inProgress: controls?.filter((c: any) => c.status === 'in_progress').length || 0,
            draft: controls?.filter((c: any) => c.status === 'draft').length || 0,
        },
        risks: {
            total: risks?.length || 0,
            high: risks?.filter((r: any) => r.likelihood * r.impact >= 15).length || 0,
            medium: risks?.filter((r: any) => r.likelihood * r.impact >= 8 && r.likelihood * r.impact < 15).length || 0,
            low: risks?.filter((r: any) => r.likelihood * r.impact < 8).length || 0,
        },
        policies: {
            total: policies?.length || 0,
            approved: policies?.filter((p: any) => p.status === 'approved').length || 0,
            draft: policies?.filter((p: any) => p.status === 'draft').length || 0,
        },
        vendors: {
            total: vendors?.length || 0,
            active: vendors?.filter((v: any) => v.status === 'active').length || 0,
            highRisk: vendors?.filter((v: any) => v.riskLevel === 'high' || v.riskLevel === 'critical').length || 0,
        },
        incidents: {
            total: incidents?.length || 0,
            open: incidents?.filter((i: any) => i.status === 'open' || i.status === 'investigating').length || 0,
            resolved: incidents?.filter((i: any) => i.status === 'resolved' || i.status === 'closed').length || 0,
        },
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: Activity },
        { id: 'config', label: 'Config as Code', icon: FileCode },
        { id: 'git-sync', label: 'Git Sync', icon: GitPullRequest },
        { id: 'resources', label: 'Resources', icon: Server },
    ];

    if (grcLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="text-gray-400">Loading GRC Data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="mb-4">
                        <a href="/dashboard" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors">
                            ← Back to Dashboard
                        </a>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                                <Zap className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">DevSecOps Center</h1>
                                <p className="text-sm text-gray-400">Configuration Management • Git Sync • Resource Overview</p>
                            </div>
                        </div>
                        <button
                            onClick={() => { refreshAll(); loadConfig(); }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-4 overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Overview Tab - Real Data */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Main Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            {/* Controls */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <Shield className="w-8 h-8 text-blue-400" />
                                    <span className="text-2xl font-bold text-blue-400">{metrics.controls.total}</span>
                                </div>
                                <h3 className="text-white font-semibold">Controls</h3>
                                <p className="text-sm text-gray-400">
                                    {metrics.controls.implemented} implemented
                                </p>
                            </div>

                            {/* Risks */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <AlertTriangle className="w-8 h-8 text-orange-400" />
                                    <span className="text-2xl font-bold text-orange-400">{metrics.risks.total}</span>
                                </div>
                                <h3 className="text-white font-semibold">Risks</h3>
                                <p className="text-sm text-gray-400">
                                    {metrics.risks.high} high priority
                                </p>
                            </div>

                            {/* Policies */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <FileText className="w-8 h-8 text-purple-400" />
                                    <span className="text-2xl font-bold text-purple-400">{metrics.policies.total}</span>
                                </div>
                                <h3 className="text-white font-semibold">Policies</h3>
                                <p className="text-sm text-gray-400">
                                    {metrics.policies.approved} approved
                                </p>
                            </div>

                            {/* Vendors */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <Building2 className="w-8 h-8 text-emerald-400" />
                                    <span className="text-2xl font-bold text-emerald-400">{metrics.vendors.total}</span>
                                </div>
                                <h3 className="text-white font-semibold">Vendors</h3>
                                <p className="text-sm text-gray-400">
                                    {metrics.vendors.active} active
                                </p>
                            </div>

                            {/* Incidents */}
                            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20">
                                <div className="flex items-center justify-between mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                    <span className="text-2xl font-bold text-red-400">{metrics.incidents.total}</span>
                                </div>
                                <h3 className="text-white font-semibold">Incidents</h3>
                                <p className="text-sm text-gray-400">
                                    {metrics.incidents.open} open
                                </p>
                            </div>
                        </div>

                        {/* Control Status Breakdown */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-blue-400" />
                                    Control Status
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            <span className="text-gray-300">Implemented</span>
                                        </div>
                                        <span className="text-white font-bold">{metrics.controls.implemented}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-yellow-400" />
                                            <span className="text-gray-300">In Progress</span>
                                        </div>
                                        <span className="text-white font-bold">{metrics.controls.inProgress}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-300">Draft</span>
                                        </div>
                                        <span className="text-white font-bold">{metrics.controls.draft}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                                    Risk Distribution
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                        <span className="text-red-400">High Risk</span>
                                        <span className="text-white font-bold">{metrics.risks.high}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                        <span className="text-yellow-400">Medium Risk</span>
                                        <span className="text-white font-bold">{metrics.risks.medium}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <span className="text-emerald-400">Low Risk</span>
                                        <span className="text-white font-bold">{metrics.risks.low}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Items */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Controls */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Controls</h3>
                                <div className="space-y-2">
                                    {controls?.slice(0, 5).map((control: any) => (
                                        <div key={control.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <div>
                                                <p className="text-white font-medium text-sm">{control.name}</p>
                                                <p className="text-xs text-gray-500">{control.category}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${control.status === 'implemented'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : control.status === 'in_progress'
                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                    : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {control.status}
                                            </span>
                                        </div>
                                    ))}
                                    {(!controls || controls.length === 0) && (
                                        <p className="text-gray-500 text-sm">No controls found</p>
                                    )}
                                </div>
                            </div>

                            {/* Recent Policies */}
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Policies</h3>
                                <div className="space-y-2">
                                    {policies?.slice(0, 5).map((policy: any) => (
                                        <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                                            <div>
                                                <p className="text-white font-medium text-sm">{policy.name}</p>
                                                <p className="text-xs text-gray-500">v{policy.version || '1.0'}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs ${policy.status === 'approved'
                                                ? 'bg-emerald-500/20 text-emerald-400'
                                                : 'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {policy.status}
                                            </span>
                                        </div>
                                    ))}
                                    {(!policies || policies.length === 0) && (
                                        <p className="text-gray-500 text-sm">No policies found</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Config as Code Tab */}
                {activeTab === 'config' && (
                    <div className="space-y-6">
                        {/* Format Toggle & Actions */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setConfigFormat('yaml')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${configFormat === 'yaml'
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'text-gray-400 hover:text-white bg-white/5'
                                        }`}
                                >
                                    YAML
                                </button>
                                <button
                                    onClick={() => setConfigFormat('json')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all ${configFormat === 'json'
                                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        : 'text-gray-400 hover:text-white bg-white/5'
                                        }`}
                                >
                                    JSON
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setImportMode(!importMode)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${importMode
                                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                        : 'text-gray-400 hover:text-white bg-white/5 border border-white/10'
                                        }`}
                                >
                                    <Upload className="w-4 h-4" />
                                    Import
                                </button>
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>

                        {/* Resource Counts */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            <p className="text-sm text-gray-400">
                                Exporting: <span className="text-white">{metrics.controls.total}</span> controls,
                                <span className="text-white ml-1">{metrics.policies.total}</span> policies,
                                <span className="text-white ml-1">{metrics.risks.total}</span> risks,
                                <span className="text-white ml-1">{metrics.vendors.total}</span> vendors
                            </p>
                        </div>

                        {/* Import Mode */}
                        {importMode && (
                            <div className="p-6 rounded-2xl bg-purple-500/10 border border-purple-500/30">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-purple-400" />
                                    Import Configuration
                                </h3>
                                <textarea
                                    value={importContent}
                                    onChange={(e) => setImportContent(e.target.value)}
                                    placeholder={`Paste your ${configFormat.toUpperCase()} configuration here...`}
                                    className="w-full h-64 p-4 rounded-xl bg-black/30 border border-white/10 text-gray-300 font-mono text-sm resize-none focus:outline-none focus:border-purple-500/50"
                                />
                                <div className="flex items-center gap-3 mt-4">
                                    <button
                                        onClick={handleValidate}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Validate
                                    </button>
                                    <button
                                        onClick={handleImport}
                                        disabled={syncing}
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                                    >
                                        {syncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                        Apply Changes
                                    </button>
                                </div>
                                {importResult && (
                                    <div className={`mt-4 p-4 rounded-xl ${importResult.success || importResult.valid ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-red-500/10 border border-red-500/30'}`}>
                                        {importResult.valid !== undefined && (
                                            <p className={importResult.valid ? 'text-emerald-400' : 'text-red-400'}>
                                                {importResult.valid ? '✓ Configuration is valid' : '✗ Configuration has errors'}
                                            </p>
                                        )}
                                        {importResult.summary && (
                                            <p className="text-gray-300">
                                                Created: {importResult.summary.created}, Updated: {importResult.summary.updated}, Unchanged: {importResult.summary.unchanged}
                                            </p>
                                        )}
                                        {importResult.errors?.length > 0 && (
                                            <ul className="mt-2 text-sm text-red-400">
                                                {importResult.errors.map((err: any, i: number) => (
                                                    <li key={i}>{typeof err === 'string' ? err : `${err.path}: ${err.message}`}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Config Preview */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <FileCode className="w-5 h-5 text-cyan-400" />
                                    Current Configuration ({configFormat.toUpperCase()})
                                </h3>
                                <button
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 hover:text-white transition-all"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <pre className="p-4 rounded-xl bg-black/30 border border-white/10 overflow-auto max-h-[500px] text-sm">
                                <code className="text-gray-300 font-mono">{loading ? 'Loading...' : configContent || 'No data to export'}</code>
                            </pre>
                        </div>
                    </div>
                )}

                {/* Git Sync Tab */}
                {activeTab === 'git-sync' && (
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <GitPullRequest className="w-5 h-5 text-cyan-400" />
                                Git Repository Sync
                            </h3>
                            <p className="text-gray-400 mb-6">
                                Sync your GRC configuration with a Git repository. Export your current state or import configurations from version control.
                            </p>

                            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 mb-4">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                                    <div>
                                        <p className="text-white font-medium">Ready for Git Integration</p>
                                        <p className="text-sm text-gray-400">
                                            Current state: {metrics.controls.total} controls, {metrics.policies.total} policies, {metrics.risks.total} risks exportable
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                    <div className="text-left">
                                        <p className="font-medium">Export to File</p>
                                        <p className="text-xs text-gray-400">Download as {configFormat.toUpperCase()}</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => { setActiveTab('config'); setImportMode(true); }}
                                    className="flex items-center justify-center gap-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:bg-purple-500/20 transition-all"
                                >
                                    <Upload className="w-5 h-5" />
                                    <div className="text-left">
                                        <p className="font-medium">Import from File</p>
                                        <p className="text-xs text-gray-400">Upload {configFormat.toUpperCase()} config</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Resources Tab - Detailed View */}
                {activeTab === 'resources' && (
                    <div className="space-y-6">
                        {/* Controls Table */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">All Controls ({metrics.controls.total})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {controls?.map((control: any) => (
                                            <tr key={control.id} className="border-b border-white/5 hover:bg-white/5">
                                                <td className="py-3 px-4 text-white">{control.name}</td>
                                                <td className="py-3 px-4 text-gray-400">{control.category}</td>
                                                <td className="py-3 px-4">
                                                    <span className={`px-2 py-1 rounded text-xs ${control.status === 'implemented'
                                                        ? 'bg-emerald-500/20 text-emerald-400'
                                                        : control.status === 'in_progress'
                                                            ? 'bg-yellow-500/20 text-yellow-400'
                                                            : 'bg-gray-500/20 text-gray-400'
                                                        }`}>
                                                        {control.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {(!controls || controls.length === 0) && (
                                    <p className="text-gray-500 text-center py-8">No controls in the system</p>
                                )}
                            </div>
                        </div>

                        {/* Risks Table */}
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                            <h3 className="text-lg font-semibold text-white mb-4">All Risks ({metrics.risks.total})</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Name</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Category</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Score</th>
                                            <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {risks?.map((risk: any) => {
                                            const score = (risk.likelihood || 1) * (risk.impact || 1);
                                            return (
                                                <tr key={risk.id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="py-3 px-4 text-white">{risk.name}</td>
                                                    <td className="py-3 px-4 text-gray-400">{risk.category}</td>
                                                    <td className="py-3 px-4">
                                                        <span className={`px-2 py-1 rounded text-xs ${score >= 15
                                                            ? 'bg-red-500/20 text-red-400'
                                                            : score >= 8
                                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                                : 'bg-emerald-500/20 text-emerald-400'
                                                            }`}>
                                                            {score}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-gray-400">{risk.status}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {(!risks || risks.length === 0) && (
                                    <p className="text-gray-500 text-center py-8">No risks in the system</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
