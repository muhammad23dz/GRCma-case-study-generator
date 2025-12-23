'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { FindingList } from '@/components/audits/FindingList';
import { FindingForm } from '@/components/audits/FindingForm';
import { Plus, Search, Filter, AlertCircle, ShieldAlert, CheckCircle2, History } from 'lucide-react';

export default function AuditFindingsPage() {
    const [findings, setFindings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        resolved: 0,
        critical: 0
    });

    const fetchFindings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/audit-findings');
            const data = await res.json();
            setFindings(data.data || []);

            // Calculate basic stats
            const list = data.data || [];
            setStats({
                total: list.length,
                open: list.filter((f: any) => f.status === 'open').length,
                resolved: list.filter((f: any) => f.status === 'resolved').length,
                critical: list.filter((f: any) => f.severity === 'critical').length
            });
        } catch (error) {
            console.error('Failed to fetch findings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFindings();
    }, []);

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Hero Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldAlert className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Audit Management</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Audit Findings
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                Track, manage, and remediate deficiencies identified during internal and external audit cycles.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Report Finding
                        </button>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatBox label="Total Findings" value={stats.total} icon={History} color="text-blue-400" />
                        <StatBox label="Open Issues" value={stats.open} icon={AlertCircle} color="text-red-400" />
                        <StatBox label="Critical Severity" value={stats.critical} icon={ShieldAlert} color="text-purple-400" />
                        <StatBox label="Successfully Resolved" value={stats.resolved} icon={CheckCircle2} color="text-emerald-400" />
                    </div>

                    {/* Filters & Content */}
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                                <input
                                    placeholder="Search findings by title, description, or control..."
                                    className="w-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/5 transition-all">
                                    <Filter className="w-4 h-4" />
                                    Filter
                                </button>
                                <button className="px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/5 transition-all">
                                    Export CSV
                                </button>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-slate-900/40 animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : (
                            <FindingList findings={findings} />
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showForm && (
                <FindingForm
                    onClose={() => setShowForm(false)}
                    onSuccess={fetchFindings}
                />
            )}
        </div>
    );
}

function StatBox({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
                <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <div className="text-3xl font-black text-white">{value}</div>
        </div>
    );
}
