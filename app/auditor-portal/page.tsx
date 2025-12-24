'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Shield, FileText, CheckCircle, Clock, AlertTriangle,
    Download, MessageSquare, Calendar, Building2, User
} from 'lucide-react';

interface AuditData {
    auditor: { name: string; email: string; firm?: string };
    organization: string;
    audit: {
        id: string;
        title: string;
        auditType: string;
        framework?: string;
        scope?: string;
        status: string;
        startDate: string;
        endDate?: string;
        findingsCount: number;
        testsCount: number;
    };
    requests: any[];
    expiresAt: string;
}

export default function AuditorPortalPage() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');

    const [data, setData] = useState<AuditData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!code) {
            setError('No access code provided');
            setLoading(false);
            return;
        }

        async function verifyAccess() {
            try {
                const res = await fetch(`/api/audit-portal/verify?code=${code}`);
                if (res.ok) {
                    const data = await res.json();
                    setData(data);
                } else {
                    const err = await res.json();
                    setError(err.error || 'Invalid access code');
                }
            } catch (err) {
                setError('Failed to verify access');
            } finally {
                setLoading(false);
            }
        }

        verifyAccess();
    }, [code]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-white">Verifying access...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                    <p className="text-slate-400">{error}</p>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const statusColors: Record<string, string> = {
        open: 'text-slate-400',
        in_progress: 'text-blue-400',
        submitted: 'text-amber-400',
        under_review: 'text-purple-400',
        approved: 'text-emerald-400',
        rejected: 'text-red-400'
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            {/* Header */}
            <header className="bg-slate-900/80 border-b border-white/5 px-8 py-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Shield className="w-8 h-8 text-emerald-400" />
                        <div>
                            <h1 className="font-bold text-lg">{data.organization}</h1>
                            <p className="text-sm text-slate-400">Audit Portal</p>
                        </div>
                    </div>
                    <div className="text-right text-sm">
                        <div className="text-slate-400">Logged in as</div>
                        <div className="font-semibold">{data.auditor.name}</div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8">
                {/* Audit Info */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold mb-4">{data.audit.title}</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</div>
                            <div className="font-medium">{data.audit.auditType}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Framework</div>
                            <div className="font-medium">{data.audit.framework || 'N/A'}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Status</div>
                            <div className="font-medium capitalize">{data.audit.status}</div>
                        </div>
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Period</div>
                            <div className="font-medium">
                                {new Date(data.audit.startDate).toLocaleDateString()} - {data.audit.endDate ? new Date(data.audit.endDate).toLocaleDateString() : 'Ongoing'}
                            </div>
                        </div>
                    </div>
                    {data.audit.scope && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Scope</div>
                            <div className="text-slate-300">{data.audit.scope}</div>
                        </div>
                    )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-emerald-400">{data.audit.testsCount}</div>
                        <div className="text-sm text-slate-500">Control Tests</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-amber-400">{data.audit.findingsCount}</div>
                        <div className="text-sm text-slate-500">Findings</div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/5 rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-blue-400">{data.requests.length}</div>
                        <div className="text-sm text-slate-500">Requests</div>
                    </div>
                </div>

                {/* Requests */}
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            Document Requests
                        </h3>
                    </div>

                    {data.requests.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            No document requests yet
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {data.requests.map((req: any) => (
                                <div key={req.id} className="p-6 hover:bg-white/5 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-white">{req.title}</h4>
                                            <p className="text-sm text-slate-400 mt-1">{req.description}</p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                <span className="capitalize bg-white/5 px-2 py-1 rounded">{req.category.replace('_', ' ')}</span>
                                                {req.dueDate && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        Due {new Date(req.dueDate).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`text-sm font-medium capitalize ${statusColors[req.status] || 'text-slate-400'}`}>
                                                {req.status.replace('_', ' ')}
                                            </span>
                                            {req.attachments?.length > 0 && (
                                                <div className="mt-2 text-xs text-slate-500">
                                                    {req.attachments.length} attachment(s)
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Session Info */}
                <div className="mt-8 text-center text-sm text-slate-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Access expires {new Date(data.expiresAt).toLocaleDateString()}
                </div>
            </main>
        </div>
    );
}
