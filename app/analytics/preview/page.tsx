'use client';

import { useState, useEffect } from 'react';
import RiskForecastChart from '@/components/analytics/RiskForecastChart';
import FrameworkImpactWidget from '@/components/analytics/FrameworkImpactWidget';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Search, TrendingUp, AlertTriangle, ArrowRight, BarChart3 } from 'lucide-react';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function AnalyticsPreview() {
    const { t } = useLanguage();
    const [risks, setRisks] = useState<any[]>([]);
    const [selectedRiskId, setSelectedRiskId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchRisks = async () => {
            try {
                const res = await fetch('/api/risks');
                const data = await res.json();
                if (data.risks && data.risks.length > 0) {
                    setRisks(data.risks);
                    // Select the highest impact risk by default
                    const sorted = [...data.risks].sort((a: any, b: any) => b.score - a.score);
                    setSelectedRiskId(sorted[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch risks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRisks();
    }, []);

    const filteredRisks = risks.filter(r =>
        r.narrative?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.assetId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedRisk = risks.find(r => r.id === selectedRiskId);

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    <header className="flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-xs font-bold uppercase tracking-widest">
                                    {t('analytics_beta')}
                                </div>
                            </div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                                {t('analytics_title')}
                            </h1>
                            <p className="text-slate-400">{t('analytics_sub')}</p>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                        </div>
                    ) : risks.length === 0 ? (
                        <div className="text-center py-20 bg-slate-900/40 rounded-3xl border border-white/5">
                            <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">{t('analytics_no_data')}</h3>
                            <p className="text-slate-400">{t('analytics_no_data_sub')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            {/* Sidebar - Risk Selection */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 h-[600px] flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-indigo-400" />
                                        {t('analytics_select_risk')}
                                    </h3>

                                    <div className="relative mb-4">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input
                                            type="text"
                                            placeholder="Search..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50"
                                        />
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {filteredRisks.map(risk => (
                                            <button
                                                key={risk.id}
                                                onClick={() => setSelectedRiskId(risk.id)}
                                                className={`w-full text-left p-4 rounded-xl border transition-all group ${selectedRiskId === risk.id
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                                                    : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/50 hover:border-indigo-500/30'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase ${risk.category === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                        risk.category === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                                            'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                        }`}>
                                                        {risk.category}
                                                    </span>
                                                    <span className="text-xs font-mono text-slate-500">{new Date(risk.createdAt).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-sm font-medium text-slate-200 line-clamp-2 mb-2">
                                                    {risk.narrative}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xs text-slate-500">Score: <span className="text-white font-bold">{risk.score}</span></div>
                                                    {selectedRiskId === risk.id && <ArrowRight className="w-4 h-4 text-indigo-400" />}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Content - Analytics */}
                            <div className="lg:col-span-8 space-y-6">
                                {selectedRiskId && (
                                    <>
                                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-1 overflow-hidden">
                                            <div className="bg-slate-950/50 p-6 rounded-t-xl border-b border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                                                    <h2 className="text-xl font-bold text-white">{t('analytics_risk_projection')}</h2>
                                                </div>
                                                <p className="text-sm text-slate-400">
                                                    {t('analytics_risk_desc')}
                                                </p>
                                            </div>
                                            <div className="p-6">
                                                <RiskForecastChart riskId={selectedRiskId} />
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-1 overflow-hidden">
                                            <div className="bg-slate-950/50 p-6 rounded-t-xl border-b border-white/5">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                                                    <h2 className="text-xl font-bold text-white">{t('analytics_framework_impact')}</h2>
                                                </div>
                                                <p className="text-sm text-slate-400">
                                                    {t('analytics_framework_desc')}
                                                </p>
                                            </div>
                                            <div className="p-6">
                                                <FrameworkImpactWidget frameworkId="ISO27001" /> {/* Using generic ID for demo */}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
