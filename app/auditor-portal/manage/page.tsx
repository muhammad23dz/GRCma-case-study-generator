'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Shield, Users, Clock, Copy, CheckCircle, XCircle,
    Plus, Trash2, ExternalLink, Mail, Building2, Calendar
} from 'lucide-react';

interface AuditorAccess {
    id: string;
    auditorEmail: string;
    auditorName: string;
    firmName?: string;
    expiresAt: string;
    isActive: boolean;
    lastAccessedAt?: string;
    accessCount: number;
    _count: { requests: number };
}

interface Audit {
    id: string;
    title: string;
    framework?: string;
    status: string;
}

export default function AuditorPortalPage() {
    const [audits, setAudits] = useState<Audit[]>([]);
    const [selectedAudit, setSelectedAudit] = useState<string>('');
    const [accessList, setAccessList] = useState<AuditorAccess[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [newAccessCode, setNewAccessCode] = useState<string | null>(null);

    // Form state
    const [form, setForm] = useState({
        auditorEmail: '',
        auditorName: '',
        firmName: '',
        expiresInDays: 30
    });

    // Fetch audits
    useEffect(() => {
        async function fetchAudits() {
            try {
                const res = await fetch('/api/audits');
                if (res.ok) {
                    const data = await res.json();
                    setAudits(data.audits || []);
                    if (data.audits?.length > 0) {
                        setSelectedAudit(data.audits[0].id);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch audits:', err);
            }
        }
        fetchAudits();
    }, []);

    // Fetch access list when audit selected
    useEffect(() => {
        if (!selectedAudit) return;

        async function fetchAccess() {
            setLoading(true);
            try {
                const res = await fetch(`/api/audit-portal?auditId=${selectedAudit}`);
                if (res.ok) {
                    const data = await res.json();
                    setAccessList(data.accessList || []);
                }
            } catch (err) {
                console.error('Failed to fetch access list:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchAccess();
    }, [selectedAudit]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/audit-portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auditId: selectedAudit,
                    ...form
                })
            });

            if (res.ok) {
                const data = await res.json();
                setNewAccessCode(data.accessCode);
                setAccessList([data.auditorAccess, ...accessList]);
                setShowCreate(false);
                setForm({ auditorEmail: '', auditorName: '', firmName: '', expiresInDays: 30 });
            }
        } catch (err) {
            console.error('Failed to create access:', err);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm('Revoke this auditor access?')) return;

        try {
            const res = await fetch(`/api/audit-portal?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setAccessList(accessList.map(a =>
                    a.id === id ? { ...a, isActive: false } : a
                ));
            }
        } catch (err) {
            console.error('Failed to revoke access:', err);
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(`${window.location.origin}/auditor-portal?code=${code}`);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Enterprise</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white">Auditor Portal</h1>
                            <p className="text-slate-400 mt-2">Manage external auditor access for SOC 2, ISO 27001, and compliance audits</p>
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Grant Access
                        </button>
                    </div>

                    {/* Audit Selector */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-4">
                        <label className="text-sm text-slate-400 mb-2 block">Select Audit</label>
                        <select
                            value={selectedAudit}
                            onChange={(e) => setSelectedAudit(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            {audits.map(audit => (
                                <option key={audit.id} value={audit.id}>
                                    {audit.title} {audit.framework && `(${audit.framework})`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* New Access Code Alert */}
                    {newAccessCode && (
                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                            <h3 className="text-emerald-400 font-bold mb-2">Access Code Generated!</h3>
                            <p className="text-slate-300 mb-4">Share this link with the auditor. It will expire based on your settings.</p>
                            <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3">
                                <code className="text-emerald-300 flex-1 break-all">
                                    {window.location.origin}/auditor-portal?code={newAccessCode}
                                </code>
                                <button
                                    onClick={() => copyToClipboard(newAccessCode)}
                                    className="p-2 hover:bg-white/10 rounded"
                                >
                                    {copiedCode === newAccessCode ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                                </button>
                            </div>
                            <button
                                onClick={() => setNewAccessCode(null)}
                                className="mt-4 text-sm text-slate-400 hover:text-white"
                            >
                                Dismiss
                            </button>
                        </div>
                    )}

                    {/* Access List */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary" />
                                <h2 className="text-xl font-bold text-white">Active Access Grants</h2>
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-8 text-center text-slate-500">Loading...</div>
                        ) : accessList.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No auditor access granted yet. Click "Grant Access" to invite an auditor.
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {accessList.map(access => (
                                    <div key={access.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${access.isActive && new Date(access.expiresAt) > new Date() ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                                                {access.isActive && new Date(access.expiresAt) > new Date()
                                                    ? <CheckCircle className="w-6 h-6 text-emerald-400" />
                                                    : <XCircle className="w-6 h-6 text-red-400" />
                                                }
                                            </div>
                                            <div>
                                                <div className="font-semibold text-white">{access.auditorName}</div>
                                                <div className="text-sm text-slate-400 flex items-center gap-2">
                                                    <Mail className="w-3 h-3" /> {access.auditorEmail}
                                                </div>
                                                {access.firmName && (
                                                    <div className="text-sm text-slate-500 flex items-center gap-2">
                                                        <Building2 className="w-3 h-3" /> {access.firmName}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-slate-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Expires {new Date(access.expiresAt).toLocaleDateString()}
                                            </div>
                                            <div className="text-xs text-slate-500">
                                                {access.accessCount} visits • {access._count.requests} requests
                                            </div>
                                            <div className="mt-2 flex gap-2 justify-end">
                                                {access.isActive && (
                                                    <button
                                                        onClick={() => handleRevoke(access.id)}
                                                        className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Revoke
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Create Modal */}
                    {showCreate && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Grant Auditor Access</h2>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Auditor Name</label>
                                        <input
                                            type="text"
                                            value={form.auditorName}
                                            onChange={(e) => setForm({ ...form, auditorName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Auditor Email</label>
                                        <input
                                            type="email"
                                            value={form.auditorEmail}
                                            onChange={(e) => setForm({ ...form, auditorEmail: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Firm Name (Optional)</label>
                                        <input
                                            type="text"
                                            value={form.firmName}
                                            onChange={(e) => setForm({ ...form, firmName: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Expires In (Days)</label>
                                        <input
                                            type="number"
                                            min="1"
                                            max="90"
                                            value={form.expiresInDays}
                                            onChange={(e) => setForm({ ...form, expiresInDays: parseInt(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreate(false)}
                                            className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                                        >
                                            Generate Access
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
