'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Building2,
    Plus,
    Search,
    Filter,
    AlertTriangle,
    ChevronRight,
    ShieldCheck,
    TrendingUp,
    ExternalLink,
    MailOpen
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface Vendor {
    id: string;
    name: string;
    category: string;
    criticality: string;
    status: string;
    services?: string;
    contactEmail?: string;
    riskScore: number;
    vendorRisks?: { risk: { id: string; narrative: string; score: number } }[];
    _count?: { assessments: number; evidences: number };
}

const CRITICALITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    critical: { label: 'vendor_critical', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    high: { label: 'vendor_high', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    medium: { label: 'vendor_medium', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    low: { label: 'vendor_low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
    active: { label: 'vendor_status_active', color: 'text-emerald-400' },
    inactive: { label: 'vendor_status_inactive', color: 'text-slate-400' },
    under_review: { label: 'vendor_status_pending', color: 'text-amber-400' },
    terminated: { label: 'vendor_status_terminated', color: 'text-red-400' },
};

export default function VendorsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchVendors() {
            try {
                const res = await fetch('/api/vendors');
                const data = await res.json();
                setVendors(data.vendors || []);
            } catch (error) {
                console.error('Failed to fetch vendors:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchVendors();
    }, []);

    const filteredVendors = vendors.filter(v =>
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: vendors.length,
        critical: vendors.filter(v => v.criticality === 'critical').length,
        highRisk: vendors.filter(v => v.riskScore >= 70).length,
        active: vendors.filter(v => v.status === 'active').length,
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">{t('dash_vendor_risk')}</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                {t('vendor_directory')}
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                {t('vendor_subtitle')}
                            </p>
                        </div>
                        <button
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            {t('vendor_btn_onboard')}
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <StatBox label={t('vendor_stat_total')} value={stats.total} icon={Building2} color="text-blue-400" />
                        <StatBox label={t('vendor_stat_critical')} value={stats.critical} icon={AlertTriangle} color="text-red-400" />
                        <StatBox label={t('stat_risks')} value={stats.highRisk} icon={TrendingUp} color="text-orange-400" />
                        <StatBox label={t('vendor_stat_active')} value={stats.active} icon={ShieldCheck} color="text-emerald-400" />
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search vendors by name or category..."
                                className="w-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-sm font-bold rounded-xl border border-white/5 transition-all">
                            <Filter className="w-4 h-4" />
                            {t('common_filter')}
                        </button>
                    </div>

                    {/* Vendor Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    ) : filteredVendors.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">{t('vendor_no_found')}</h3>
                            <p className="text-slate-400">{t('vendor_start_onboard')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredVendors.map(vendor => (
                                <div
                                    key={vendor.id}
                                    onClick={() => router.push(`/vendors/${vendor.id}`)}
                                    className="group bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-slate-800/60 transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-primary"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                                            <Building2 className="w-6 h-6 text-primary" />
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${CRITICALITY_CONFIG[vendor.criticality]?.bgColor} ${CRITICALITY_CONFIG[vendor.criticality]?.color}`}>
                                            {t(CRITICALITY_CONFIG[vendor.criticality]?.label)}
                                        </span>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-primary transition-colors">{vendor.name}</h3>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mb-4">{vendor.category}</p>

                                    <div className="space-y-2 mb-4">
                                        {vendor.services && (
                                            <p className="text-sm text-slate-400 line-clamp-2">{vendor.services}</p>
                                        )}
                                        {vendor.contactEmail && (
                                            <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                                <MailOpen className="w-3.5 h-3.5" />
                                                <span className="truncate">{vendor.contactEmail}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-[11px]">
                                            <span className={STATUS_CONFIG[vendor.status]?.color}>{t(STATUS_CONFIG[vendor.status]?.label)}</span>
                                            <span className="text-slate-500">{t('risk_table_score')}: <span className={vendor.riskScore >= 70 ? 'text-red-400 font-bold' : 'text-white'}>{vendor.riskScore}</span></span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                                    </div>

                                    {vendor.vendorRisks && vendor.vendorRisks.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">Linked Risks ({vendor.vendorRisks.length})</p>
                                            <div className="flex flex-wrap gap-1">
                                                {vendor.vendorRisks.slice(0, 2).map(vr => (
                                                    <span key={vr.risk.id} className="px-2 py-0.5 bg-red-500/10 text-red-400 text-[9px] rounded-full truncate max-w-[100px]">
                                                        {vr.risk.narrative.substring(0, 20)}...
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value, icon: Icon, color }: any) {
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
