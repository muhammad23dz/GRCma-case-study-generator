'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { EvidenceList } from '@/components/evidence/EvidenceList';
import { EvidenceUploadModal } from '@/components/evidence/EvidenceUploadModal';
import {
    Upload,
    Search,
    Filter,
    ShieldCheck,
    Clock,
    FileWarning,
    Database,
    Zap
} from 'lucide-react';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function EvidencePage() {
    const { t } = useLanguage();
    const [evidence, setEvidence] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pendingReview: 0,
        expiringSoon: 0
    });

    const fetchEvidence = async () => {
        setLoading(true);
        try {
            // Fetch evidence list
            const listRes = await fetch('/api/evidence');
            const listData = await listRes.json();
            setEvidence(listData.data || []);

            // Fetch stats
            const statsRes = await fetch('/api/evidence/stats');
            const statsData = await statsRes.json();
            setStats(statsData);
        } catch (error) {
            console.error('Failed to fetch evidence data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvidence();
    }, []);

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Database className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t('nav_evidence')}</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                {t('nav_evidence')}
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                {t('dash_module_ecosystem_desc')}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowUpload(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Upload className="w-5 h-5" />
                            {t('ctrl_stat_evidence')}
                        </button>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <TopStatBox label={t('ctrl_stat_total')} value={stats.total} icon={Database} color="text-blue-400" />
                        <TopStatBox label={t('dash_system_live')} value={stats.approved} icon={ShieldCheck} color="text-emerald-400" />
                        <TopStatBox label={t('dash_pending_actions')} value={stats.pendingReview} icon={Clock} color="text-amber-400" />
                        <TopStatBox label={t('risk_stat_high')} value={stats.expiringSoon} icon={FileWarning} color="text-red-400" />
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                placeholder="Search by filename, description, or control ID..."
                                className="w-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/5 transition-all">
                                <Filter className="w-4 h-4" />
                                Filter
                            </button>
                            <div className="h-10 w-px bg-white/10 mx-2" />
                            <button className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/5 transition-all">
                                <Zap className="w-4 h-4 text-amber-400" />
                                AI Audit
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    ) : (
                        <EvidenceList evidence={evidence} />
                    )}
                </div>
            </div>

            {/* Modals */}
            {showUpload && (
                <EvidenceUploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={fetchEvidence}
                />
            )}
        </div>
    );
}

function TopStatBox({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-white/5 ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">{label}</div>
                <div className="text-2xl font-black text-white">{value}</div>
            </div>
        </div>
    );
}
