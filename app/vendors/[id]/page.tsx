'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Building2,
    ArrowLeft,
    AlertTriangle,
    FileText,
    ShieldCheck,
    Clock,
    ExternalLink,
    MailOpen,
    Phone,
    Globe,
    Edit3,
    Trash2
} from 'lucide-react';

const TABS = ['Overview', 'Risks', 'Contracts', 'Assessments'];

const CRITICALITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    critical: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    high: { label: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    medium: { label: 'Medium', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    low: { label: 'Low', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
};

export default function VendorDetailPage() {
    const params = useParams();
    const router = useRouter();
    const vendorId = params.id as string;

    const [vendor, setVendor] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        async function fetchVendor() {
            try {
                const res = await fetch(`/api/vendors/${vendorId}`);
                if (!res.ok) throw new Error('Vendor not found');
                const data = await res.json();
                setVendor(data.vendor || data);
            } catch (error) {
                console.error('Failed to fetch vendor:', error);
            } finally {
                setLoading(false);
            }
        }
        if (vendorId) fetchVendor();
    }, [vendorId]);

    if (loading) {
        return (
            <div className="min-h-screen text-foreground">
                <PremiumBackground />
                <Header />
                <div className="relative z-10 p-8 pt-32 max-w-7xl mx-auto">
                    <div className="h-64 bg-slate-900/40 animate-pulse rounded-2xl" />
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="min-h-screen text-foreground">
                <PremiumBackground />
                <Header />
                <div className="relative z-10 p-8 pt-32 max-w-7xl mx-auto text-center">
                    <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Vendor Not Found</h2>
                    <button onClick={() => router.push('/vendors')} className="text-primary hover:underline">
                        ← Back to Vendors
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Back Button */}
                    <button
                        onClick={() => router.push('/vendors')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Vendors
                    </button>

                    {/* Header Card */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                            <div className="flex items-start gap-6">
                                <div className="p-4 bg-primary/10 rounded-2xl">
                                    <Building2 className="w-10 h-10 text-primary" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-white">{vendor.name}</h1>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${CRITICALITY_CONFIG[vendor.criticality]?.bgColor} ${CRITICALITY_CONFIG[vendor.criticality]?.color}`}>
                                            {vendor.criticality}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm">{vendor.category}</p>
                                    {vendor.services && <p className="text-slate-500 text-sm mt-2 max-w-xl">{vendor.services}</p>}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                                    <Edit3 className="w-5 h-5 text-slate-400" />
                                </button>
                                <button className="p-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition-colors">
                                    <Trash2 className="w-5 h-5 text-red-400" />
                                </button>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="mt-6 pt-6 border-t border-white/5 flex flex-wrap gap-6 text-sm">
                            {vendor.contactEmail && (
                                <div className="flex items-center gap-2 text-slate-400">
                                    <MailOpen className="w-4 h-4 text-slate-500" />
                                    <span>{vendor.contactEmail}</span>
                                </div>
                            )}
                            {vendor.website && (
                                <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
                                    <Globe className="w-4 h-4" />
                                    <span>Website</span>
                                    <ExternalLink className="w-3 h-3" />
                                </a>
                            )}
                            <div className="flex items-center gap-2 text-slate-400">
                                <Clock className="w-4 h-4 text-slate-500" />
                                <span>Created: {new Date(vendor.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 border-b border-white/5 pb-0">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${activeTab === tab ? 'text-primary border-primary' : 'text-slate-400 border-transparent hover:text-white'}`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="space-y-6">
                        {activeTab === 'Overview' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MetricCard label="Risk Score" value={vendor.riskScore} icon={AlertTriangle} color={vendor.riskScore >= 70 ? 'text-red-400' : 'text-emerald-400'} />
                                <MetricCard label="Assessments" value={vendor._count?.assessments || 0} icon={FileText} color="text-blue-400" />
                                <MetricCard label="Evidence" value={vendor._count?.evidences || 0} icon={ShieldCheck} color="text-purple-400" />
                            </div>
                        )}

                        {activeTab === 'Risks' && (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-red-400" />
                                    Linked Risks
                                </h3>
                                {vendor.vendorRisks && vendor.vendorRisks.length > 0 ? (
                                    <div className="space-y-3">
                                        {vendor.vendorRisks.map((vr: any) => (
                                            <div key={vr.risk.id} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
                                                <div>
                                                    <p className="text-white font-medium">{vr.risk.narrative}</p>
                                                    <p className="text-xs text-slate-500 mt-1">Score: {vr.risk.score}</p>
                                                </div>
                                                <button
                                                    onClick={() => router.push(`/risks`)}
                                                    className="text-primary text-sm font-bold hover:underline flex items-center gap-1"
                                                >
                                                    View <ExternalLink className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No risks linked to this vendor.</p>
                                )}
                            </div>
                        )}

                        {activeTab === 'Contracts' && (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center">
                                <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">No Contracts</h3>
                                <p className="text-slate-500 text-sm">Contract management will be available in a future update.</p>
                            </div>
                        )}

                        {activeTab === 'Assessments' && (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 text-center">
                                <ShieldCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-white mb-2">No Assessments</h3>
                                <p className="text-slate-500 text-sm">Begin a vendor assessment to evaluate third-party risk.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, color }: any) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex items-center gap-4">
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
