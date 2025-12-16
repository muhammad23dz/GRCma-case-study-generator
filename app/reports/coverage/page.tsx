'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Shield, CheckCircle2, AlertTriangle, AlertCircle,
    FileText, XCircle, Search, PieChart
} from 'lucide-react';
import Link from 'next/link';

interface Requirement {
    id: string;
    requirementId: string;
    title: string;
    category: string;
    stats: {
        controls: number;
        evidence: number;
        findings: number;
    };
    status: string;
}

interface FrameworkCoverage {
    id: string;
    name: string;
    version: string;
    stats: {
        totalRequirements: number;
        compliantRequirements: number;
        coveragePercentage: number;
    };
    requirements: Requirement[];
}

export default function ComplianceCoveragePage() {
    const [coverageData, setCoverageData] = useState<FrameworkCoverage[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFrameworkId, setActiveFrameworkId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCoverage();
    }, []);

    const fetchCoverage = async () => {
        try {
            const res = await fetch('/api/reporting/coverage');
            const data = await res.json();
            setCoverageData(data.coverage || []);
            if (data.coverage && data.coverage.length > 0) {
                setActiveFrameworkId(data.coverage[0].id);
            }
        } catch (error) {
            console.error('Error fetching coverage:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'compliant': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'non_compliant': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'no_evidence': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'gap': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            default: return 'text-slate-400';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'compliant': return 'Compliant';
            case 'non_compliant': return 'Non-Compliant (Findings)';
            case 'no_evidence': return 'No Evidence';
            case 'gap': return 'Control Gap';
            default: return status;
        }
    };

    const activeFramework = coverageData.find(fw => fw.id === activeFrameworkId);

    // Filter Requirements
    const filteredRequirements = activeFramework?.requirements.filter(req =>
        req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.requirementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.category?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/reports" className="text-slate-400 hover:text-white mb-2 inline-block transition-colors">
                            ← Back to Reports
                        </Link>
                        <h1 className="text-4xl font-black text-white mb-2">Compliance Coverage Matrix</h1>
                        <p className="text-slate-400">Real-time assessment of framework compliance based on implemented controls, evidence, and audit findings.</p>
                    </div>

                    {/* Framework Tabs */}
                    <div className="flex gap-4 border-b border-white/10 mb-8 overflow-x-auto pb-2">
                        {coverageData.map(fw => (
                            <button
                                key={fw.id}
                                onClick={() => setActiveFrameworkId(fw.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg border-b-2 transition-all whitespace-nowrap ${activeFrameworkId === fw.id
                                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                                        : 'border-transparent text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <Shield className="w-4 h-4" />
                                <span className="font-bold">{fw.name}</span>
                                <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full">{fw.stats.coveragePercentage}%</span>
                            </button>
                        ))}
                    </div>

                    {activeFramework && (
                        <div className="space-y-8">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
                                    <div className="relative z-10">
                                        <div className="text-sm text-slate-400 font-bold uppercase mb-1">Total Requirements</div>
                                        <div className="text-4xl font-black text-white">{activeFramework.stats.totalRequirements}</div>
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
                                    <div className="relative z-10">
                                        <div className="text-sm text-slate-400 font-bold uppercase mb-1">Compliant</div>
                                        <div className="text-4xl font-black text-emerald-400">{activeFramework.stats.compliantRequirements}</div>
                                        <div className="text-xs text-emerald-500/80 mt-1 font-bold">Passing Standards</div>
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-red-500/20 rounded-full blur-2xl group-hover:bg-red-500/30 transition-all"></div>
                                    <div className="relative z-10">
                                        <div className="text-sm text-slate-400 font-bold uppercase mb-1">Failing (Findings)</div>
                                        <div className="text-4xl font-black text-red-400">
                                            {activeFramework.requirements.filter(r => r.status === 'non_compliant').length}
                                        </div>
                                        <div className="text-xs text-red-500/80 mt-1 font-bold">Action Required</div>
                                    </div>
                                </div>
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                                    <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl group-hover:bg-yellow-500/30 transition-all"></div>
                                    <div className="relative z-10">
                                        <div className="text-sm text-slate-400 font-bold uppercase mb-1">Control / Evidence Gaps</div>
                                        <div className="text-4xl font-black text-yellow-400">
                                            {activeFramework.requirements.filter(r => r.status === 'gap' || r.status === 'no_evidence').length}
                                        </div>
                                        <div className="text-xs text-yellow-500/80 mt-1 font-bold">Needs Implementation</div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters and Search */}
                            <div className="flex gap-4 items-center">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search by ID, title, or category..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Matrix Table */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                                                <th className="p-4 w-24">ID</th>
                                                <th className="p-4">Requirement</th>
                                                <th className="p-4 w-32 text-center">Controls</th>
                                                <th className="p-4 w-32 text-center">Evidence</th>
                                                <th className="p-4 w-32 text-center">Findings</th>
                                                <th className="p-4 w-40">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredRequirements.map(req => (
                                                <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                    <td className="p-4 font-mono text-slate-400 font-bold">{req.requirementId}</td>
                                                    <td className="p-4">
                                                        <div className="font-bold text-white mb-1">{req.title}</div>
                                                        <div className="text-xs text-slate-500">{req.category}</div>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 rounded font-bold text-xs ${req.stats.controls > 0 ? 'bg-blue-500/10 text-blue-400' : 'text-slate-600'}`}>
                                                            {req.stats.controls}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 rounded font-bold text-xs ${req.stats.evidence > 0 ? 'bg-purple-500/10 text-purple-400' : 'text-slate-600'}`}>
                                                            {req.stats.evidence}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <span className={`px-2 py-1 rounded font-bold text-xs ${req.stats.findings > 0 ? 'bg-red-500/10 text-red-400' : 'text-slate-600'}`}>
                                                            {req.stats.findings}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold uppercase w-full justify-center ${getStatusColor(req.status)}`}>
                                                            {req.status === 'compliant' && <CheckCircle2 className="w-3 h-3" />}
                                                            {req.status === 'non_compliant' && <XCircle className="w-3 h-3" />}
                                                            {req.status === 'no_evidence' && <FileText className="w-3 h-3" />}
                                                            {req.status === 'gap' && <AlertCircle className="w-3 h-3" />}
                                                            {getStatusLabel(req.status)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {filteredRequirements.length === 0 && (
                                                <tr>
                                                    <td colSpan={6} className="p-12 text-center text-slate-500">
                                                        No requirements found matching your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {coverageData.length === 0 && !loading && (
                        <div className="text-center py-20 text-slate-500">
                            <Shield className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <h2 className="text-2xl font-bold text-white mb-2">No Frameworks Mapped</h2>
                            <p>Map frameworks to controls to see coverage data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
