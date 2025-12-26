'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { canDeleteRecords } from '@/lib/permissions';
import {
    GitPullRequest,
    AlertTriangle,
    CheckCircle,
    Clock,
    Calendar,
    ArrowRight,
    Shield,
    Activity,
    Lock
} from 'lucide-react';

interface ChangeRequest {
    id: string;
    changeNumber: string;
    title: string;
    status: string;
    changeType: string;
    priority: string;
    riskScore: number;
    requestedDate: string;
    requestedBy: string;
    plannedStartDate?: string;
}

export default function ChangesPage() {
    const router = useRouter();
    const [changes, setChanges] = useState<ChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        fetchChanges();
    }, []);

    const fetchChanges = async () => {
        try {
            const res = await fetch('/api/changes');
            if (res.ok) {
                const data = await res.json();
                setChanges(data.changes || []);
            }
        } catch (error) {
            console.error('Failed to fetch changes', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'reviewing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case 'draft': return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    const getRiskBadge = (score: number) => {
        if (score >= 20) return <span className="flex items-center gap-1 text-xs font-bold text-red-400"><Shield className="w-3 h-3" /> CRITICAL</span>;
        if (score >= 12) return <span className="flex items-center gap-1 text-xs font-bold text-orange-400"><AlertTriangle className="w-3 h-3" /> HIGH</span>;
        if (score >= 6) return <span className="flex items-center gap-1 text-xs font-bold text-yellow-400"><Activity className="w-3 h-3" /> MEDIUM</span>;
        return <span className="flex items-center gap-1 text-xs font-bold text-emerald-400"><CheckCircle className="w-3 h-3" /> LOW</span>;
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <Header />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-32">


                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Change Management</h1>
                        <p className="text-slate-400">Governance for Enterprise Modifications (ITIL v4 Aligned)</p>
                    </div>

                    <div className="flex gap-2">
                        {/* Delete All - Admin Only */}
                        {changes.length > 0 && canDeleteRecords((user?.publicMetadata as any)?.role) && (
                            <button
                                onClick={async () => {
                                    if (!confirm(`Are you sure you want to delete ALL ${changes.length} change requests? This cannot be undone.`)) return;
                                    try {
                                        await Promise.all(changes.map(c => fetch(`/api/changes/${c.id}`, { method: 'DELETE' })));
                                        fetchChanges();
                                    } catch (error) {
                                        console.error('Error deleting changes:', error);
                                    }
                                }}
                                className="px-4 py-2 bg-red-950/30 text-red-400 border border-red-500/20 hover:bg-red-900/50 rounded-lg font-medium transition-all"
                            >
                                Delete All
                            </button>
                        )}

                        {/* New Change Request - Available to All Authenticated Users (Self Service) */}
                        <button
                            onClick={() => router.push('/changes/new')}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg font-medium shadow-lg shadow-blue-500/25 transition-all flex items-center gap-2"
                        >
                            <GitPullRequest className="w-4 h-4" />
                            New Change Request
                        </button>
                    </div>
                </div>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Open Requests</span>
                            <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{changes.filter(c => c.status !== 'completed' && c.status !== 'rejected').length}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Pending Approval</span>
                            <Lock className="w-4 h-4 text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{changes.filter(c => c.status === 'reviewing').length}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">Scheduled</span>
                            <Calendar className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{changes.filter(c => c.status === 'scheduled').length}</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-slate-400 text-sm">High Risk</span>
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">{changes.filter(c => c.riskScore >= 12).length}</div>
                    </div>
                </div>

                {/* Changes List */}
                <div className="bg-slate-900/50 border border-white/5 rounded-xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Recent Change Requests</h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center text-slate-500">Loading changes...</div>
                    ) : changes.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GitPullRequest className="w-8 h-8 text-slate-500" />
                            </div>
                            <h3 className="text-white font-medium mb-1">No Changes Found</h3>
                            <p className="text-slate-400 text-sm mb-4">Start by creating your first change request</p>
                            <button
                                onClick={() => router.push('/changes/new')}
                                className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                            >
                                Create Request
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/5 bg-white/5">
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Reference</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Risk Score</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Requester</th>
                                        <th className="px-6 py-3 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {changes.map((change) => (
                                        <tr key={change.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-4 text-sm font-mono text-slate-400">{change.changeNumber}</td>
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{change.title}</div>
                                                <div className="text-xs text-slate-500">{new Date(change.requestedDate).toLocaleDateString()}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(change.status)} uppercase`}>
                                                    {change.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300 capitalize">{change.changeType}</td>
                                            <td className="px-6 py-4">
                                                {getRiskBadge(change.riskScore)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{change.requestedBy}</td>
                                            <td className="px-6 py-4 flex items-center gap-2">
                                                <button
                                                    onClick={() => router.push(`/changes/${change.id}`)}
                                                    className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                                {canDeleteRecords((user?.publicMetadata as any)?.role) && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (confirm('Delete this change request?')) {
                                                                fetch(`/api/changes/${change.id}`, { method: 'DELETE' }).then(() => fetchChanges());
                                                            }
                                                        }}
                                                        className="p-2 hover:bg-red-500/10 rounded-lg text-slate-500 hover:text-red-400 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <div className="w-4 h-4">
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                        </div>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
