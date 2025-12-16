'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import {
    FileText, Shield, Users, CheckCircle2, Clock, AlertCircle,
    Search, Filter, ChevronDown
} from 'lucide-react';

interface PolicyAttestation {
    id: string;
    attestedAt: string;
    attestedBy: string;
    status: string;
}

interface PolicyData {
    id: string;
    title: string;
    version: string;
    status: string;
    scope: string | null;
    department: string | null;
    updatedAt: string;
    attestations: PolicyAttestation[];
    _count: {
        policyControls: number;
    };
}

export default function PolicyDistributionPage() {
    const [policies, setPolicies] = useState<PolicyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const res = await fetch('/api/policies?include=attestations');
            const data = await res.json();
            setPolicies(data.policies || []);
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'draft': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'review': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'archived': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getComplianceRate = (policy: PolicyData) => {
        if (!policy.attestations || policy.attestations.length === 0) return 0;
        const acknowledged = policy.attestations.filter(a => a.status === 'acknowledged').length;
        return Math.round((acknowledged / policy.attestations.length) * 100);
    };

    const filteredPolicies = policies.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.department?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    // Stats
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const draftPolicies = policies.filter(p => p.status === 'draft').length;
    const avgCompliance = policies.length > 0
        ? Math.round(policies.reduce((acc, p) => acc + getComplianceRate(p), 0) / policies.length)
        : 0;

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
                        <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                            <FileText className="w-10 h-10 text-blue-500" />
                            Policy Distribution Tracker
                        </h1>
                        <p className="text-slate-400">Monitor policy distribution, attestation rates, and compliance across departments.</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all"></div>
                            <div className="relative z-10">
                                <div className="text-sm text-slate-400 font-bold uppercase mb-1">Total Policies</div>
                                <div className="text-4xl font-black text-white">{totalPolicies}</div>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all"></div>
                            <div className="relative z-10">
                                <div className="text-sm text-slate-400 font-bold uppercase mb-1">Active</div>
                                <div className="text-4xl font-black text-emerald-400">{activePolicies}</div>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl group-hover:bg-yellow-500/30 transition-all"></div>
                            <div className="relative z-10">
                                <div className="text-sm text-slate-400 font-bold uppercase mb-1">Drafts</div>
                                <div className="text-4xl font-black text-yellow-400">{draftPolicies}</div>
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
                            <div className="absolute right-[-10px] top-[-10px] w-24 h-24 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/30 transition-all"></div>
                            <div className="relative z-10">
                                <div className="text-sm text-slate-400 font-bold uppercase mb-1">Avg Attestation</div>
                                <div className="text-4xl font-black text-purple-400">{avgCompliance}%</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-4 items-center mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by title or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-slate-900/40 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-blue-500/50"
                        >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="review">Under Review</option>
                            <option value="archived">Archived</option>
                        </select>
                    </div>

                    {/* Policy Table */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-950/50 text-slate-400 text-xs uppercase tracking-wider border-b border-white/10">
                                        <th className="p-4">Policy</th>
                                        <th className="p-4 w-24">Version</th>
                                        <th className="p-4 w-32">Status</th>
                                        <th className="p-4 w-32 text-center">Controls</th>
                                        <th className="p-4 w-40 text-center">Attestation Rate</th>
                                        <th className="p-4 w-32">Last Updated</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPolicies.map(policy => {
                                        const complianceRate = getComplianceRate(policy);
                                        return (
                                            <tr key={policy.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                                <td className="p-4">
                                                    <Link href={`/policies/${policy.id}`} className="block">
                                                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                                                            {policy.title}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {policy.department || policy.scope || 'No department assigned'}
                                                        </div>
                                                    </Link>
                                                </td>
                                                <td className="p-4 font-mono text-slate-400">{policy.version}</td>
                                                <td className="p-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusColor(policy.status)}`}>
                                                        {policy.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-center">
                                                    <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded font-bold text-xs">
                                                        {policy._count?.policyControls || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full rounded-full transition-all ${complianceRate >= 80 ? 'bg-emerald-500' : complianceRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                                style={{ width: `${complianceRate}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-400 w-10 text-right">{complianceRate}%</span>
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        {policy.attestations?.length || 0} attestations
                                                    </div>
                                                </td>
                                                <td className="p-4 text-xs text-slate-400">
                                                    {new Date(policy.updatedAt).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {filteredPolicies.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="p-12 text-center text-slate-500">
                                                No policies found matching your criteria.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
