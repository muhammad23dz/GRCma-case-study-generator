'use client';

import { useState, useEffect, use } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { canApprove } from '@/lib/permissions';
import {
    GitPullRequest,
    ArrowLeft,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    User,
    Calendar,
    Shield,
    FileText,
    MessageSquare,
    Play,
    Lock
} from 'lucide-react';

export default function ChangeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [change, setChange] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const [comment, setComment] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchChange();
    }, [id]);

    const fetchChange = async () => {
        try {
            const res = await fetch(`/api/changes/${id}`);
            if (res.ok) {
                const data = await res.json();
                setChange(data.change);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleWorkflowAction = async (action: string) => {
        if (!confirm(`Are you sure you want to ${action} this change?`)) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/changes/${id}/workflow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, comments: comment })
            });

            if (res.ok) {
                fetchChange(); // Refresh
                setComment('');
            } else {
                alert('Action failed');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading details...</div>;
    if (!change) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-red-400">Change not found</div>;

    const getStatusBadge = (status: string) => {
        const colors: any = {
            draft: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            reviewing: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            approved: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            scheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            completed: 'bg-green-500/10 text-green-400 border-green-500/20',
            rejected: 'bg-red-500/10 text-red-400 border-red-500/20',
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${colors[status] || colors.draft}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            <Header />
            <main className="max-w-7xl mx-auto px-4 py-8 pt-32">
                {/* Header */}
                <div className="mb-8">
                    <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4">
                        <ArrowLeft className="w-4 h-4" /> Back to Changes
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-slate-500">{change.changeNumber}</span>
                                {getStatusBadge(change.status)}
                            </div>
                            <h1 className="text-3xl font-bold text-white mb-2">{change.title}</h1>
                        </div>

                        {/* Actions Toolbar */}
                        <div className="flex gap-2">
                            {change.status === 'draft' && (
                                <button
                                    onClick={() => handleWorkflowAction('submit')}
                                    disabled={actionLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4" /> Submit for Review
                                </button>
                            )}
                            {change.status === 'reviewing' && (
                                <>
                                    {/* RBAC Gate - Only Admins/Managers can approve/reject */}
                                    {(() => {
                                        const canApproveChange = canApprove(
                                            (user?.publicMetadata as any)?.role
                                        );
                                        return canApproveChange ? (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleWorkflowAction('approve')}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <CheckCircle className="w-4 h-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleWorkflowAction('reject')}
                                                    disabled={actionLoading}
                                                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <XCircle className="w-4 h-4" /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-xs text-slate-500 bg-slate-900 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-2">
                                                <Lock className="w-3 h-3" /> Waiting for Approval
                                            </div>
                                        );
                                    })()}
                                </>
                            )}
                            {change.status === 'scheduled' && (
                                canApprove((user?.publicMetadata as any)?.role) && (
                                    <button
                                        onClick={() => handleWorkflowAction('implement')}
                                        disabled={actionLoading}
                                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-4 h-4" /> Mark Completed
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description Card */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-400" /> Description
                            </h3>
                            <div className="prose prose-invert max-w-none">
                                <h4 className="text-emerald-400 text-sm font-medium uppercase mt-4">Overview</h4>
                                <p className="text-slate-300">{change.description}</p>

                                <h4 className="text-emerald-400 text-sm font-medium uppercase mt-4">Justification</h4>
                                <p className="text-slate-300">{change.justification}</p>

                                <h4 className="text-emerald-400 text-sm font-medium uppercase mt-4">Implementation Plan</h4>
                                <pre className="bg-slate-950 p-4 rounded-lg text-slate-300 text-sm whitespace-pre-wrap font-sans">{change.implementationPlan}</pre>

                                <h4 className="text-emerald-400 text-sm font-medium uppercase mt-4">Back-out Plan</h4>
                                <p className="text-slate-300">{change.backoutPlan}</p>
                            </div>
                        </div>

                        {/* Impact Assessment */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-400" /> Risk & Impact
                            </h3>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="bg-slate-950 p-4 rounded-lg border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase mb-1">Risk Score</div>
                                    <div className={`text-2xl font-bold ${change.riskScore >= 12 ? 'text-red-400' : 'text-emerald-400'}`}>
                                        {change.riskScore}
                                    </div>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-lg border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase mb-1">Type</div>
                                    <div className="text-lg font-medium text-white capitalize">{change.changeType}</div>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-lg border border-white/5">
                                    <div className="text-slate-400 text-xs uppercase mb-1">Priority</div>
                                    <div className="text-lg font-medium text-white capitalize">{change.priority}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Meta & History */}
                    <div className="space-y-6">
                        {/* Meta Info */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Metadata</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-400 text-sm flex items-center gap-2"><User className="w-4 h-4" /> Requester</span>
                                    <span className="text-white text-sm truncate max-w-[150px]">{change.requestedBy}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-400 text-sm flex items-center gap-2"><Calendar className="w-4 h-4" /> Requested</span>
                                    <span className="text-white text-sm">{new Date(change.requestedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b border-white/5">
                                    <span className="text-slate-400 text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Category</span>
                                    <span className="text-white text-sm capitalize">{change.category}</span>
                                </div>
                            </div>
                        </div>

                        {/* Activity Log */}
                        <div className="bg-slate-900/50 border border-white/5 rounded-xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" /> Activity
                            </h3>
                            <div className="space-y-4 max-h-[400px] overflow-y-auto">
                                {change.comments?.map((comment: any) => (
                                    <div key={comment.id} className="text-sm border-l-2 border-white/10 pl-3 py-1">
                                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                                            <span>{comment.authorName}</span>
                                            <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="text-slate-300">{comment.comment}</div>
                                    </div>
                                ))}
                                {change.comments?.length === 0 && <div className="text-slate-500 text-sm italic">No activity yet.</div>}
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/5">
                                <textarea
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-white mb-2"
                                    placeholder="Add comment..."
                                    rows={2}
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                                <button
                                    onClick={() => handleWorkflowAction('comment')}
                                    disabled={actionLoading || !comment.trim()}
                                    className="w-full py-1 bg-white/5 hover:bg-white/10 text-slate-300 text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Add Note
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            {/* Debug Info */}
            <div className="fixed bottom-0 right-0 p-2 bg-black/80 text-xs text-slate-500 border-t border-l border-white/10 rounded-tl-lg z-50">
                Role: <span className="text-white">{(user?.publicMetadata as any)?.role || 'unknown'}</span> |
                Status: <span className="text-white">{change.status}</span>
            </div>
        </div>
    );
}
