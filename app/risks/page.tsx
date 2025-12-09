'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { AlertTriangle, TrendingUp, BarChart, Trash2, Plus, Search, Activity, Target, X, Filter, ArrowUpDown } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface Risk {
    id: string;
    assetId?: string;
    likelihood: number;
    impact: number;
    score: number;
    category: string;
    narrative: string;
    status: string;
    control?: {
        title: string;
    };
    _count: {
        evidences: number;
    };
}

export default function RisksPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialSearch = searchParams.get('search') || '';
    const initialSort = searchParams.get('sort') || '';

    const [risks, setRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssessModal, setShowAssessModal] = useState(false);
    const [assessmentData, setAssessmentData] = useState({
        assetId: '',
        evidenceItems: ['']
    });
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [sort, setSort] = useState(initialSort);

    useEffect(() => {
        setSearchTerm(initialSearch);
        setSort(initialSort);
    }, [initialSearch, initialSort]);

    useEffect(() => {
        fetchRisks();
    }, []);

    const fetchRisks = async () => {
        try {
            const res = await fetch('/api/risks');
            const data = await res.json();
            setRisks(data.risks || []);
        } catch (error) {
            console.error('Error fetching risks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssessRisk = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/risks/assess', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(assessmentData)
            });
            if (res.ok) {
                setShowAssessModal(false);
                setAssessmentData({ assetId: '', evidenceItems: [''] });
                fetchRisks();
            }
        } catch (error) {
            console.error('Error assessing risk:', error);
        }
    };

    const handleDeleteRisk = async (id: string) => {
        if (!confirm('Are you sure you want to delete this risk?')) return;

        try {
            const res = await fetch(`/api/risks/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchRisks();
            }
        } catch (error) {
            console.error('Error deleting risk:', error);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Critical': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'High': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
            case 'Medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'Low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 76) return 'text-red-500';
        if (score >= 51) return 'text-orange-500';
        if (score >= 26) return 'text-yellow-500';
        return 'text-emerald-500';
    };

    const filteredRisks = risks
        .filter(risk => {
            const term = searchTerm.toLowerCase();
            return (
                risk.category.toLowerCase().includes(term) ||
                risk.narrative.toLowerCase().includes(term) ||
                risk.assetId?.toLowerCase().includes(term) ||
                risk.status.toLowerCase().includes(term)
            );
        })
        .sort((a, b) => {
            if (sort === 'score') {
                return b.score - a.score; // Descending
            }
            return 0;
        });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const criticalRisks = risks.filter(r => r.category === 'Critical').length;
    const highRisks = risks.filter(r => r.category === 'High').length;
    const avgScore = risks.length > 0 ? Math.round(risks.reduce((sum, r) => sum + r.score, 0) / risks.length) : 0;

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header onNavChange={(view: any) => {
                router.push('/');
            }} />

            <div className="relative z-10 p-8">
                <PageTransition className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Risk Dashboard</h1>
                            <p className="text-slate-400">Real-time AI risk assessment and monitoring</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search or filter..."
                                    className="pl-9 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl w-64 text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => { setSearchTerm(''); router.push('/risks'); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {risks.length > 0 && (
                                <button
                                    onClick={async () => {
                                        if (!confirm(`Are you sure you want to delete all ${risks.length} risks? This cannot be undone.`)) return;
                                        try {
                                            await Promise.all(risks.map(risk => fetch(`/api/risks/${risk.id}`, { method: 'DELETE' })));
                                            fetchRisks();
                                        } catch (error) {
                                            console.error('Error deleting all risks:', error);
                                        }
                                    }}
                                    className="px-6 py-3 bg-red-950/50 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-900/50 hover:border-red-500/50 transition-all font-bold group"
                                >
                                    Delete All ({risks.length})
                                </button>
                            )}
                            <button
                                onClick={() => setShowAssessModal(true)}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 font-bold flex items-center gap-2 group"
                            >
                                <Activity className="w-5 h-5 group-hover:animate-pulse" />
                                + Assess Risk
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-red-500 mb-1">{criticalRisks}</div>
                            <div className="text-slate-400 text-sm font-medium">Critical Risks</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500 group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-orange-500 mb-1">{highRisks}</div>
                            <div className="text-slate-400 text-sm font-medium">High Risks</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                                    <BarChart className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-400 mb-1">{risks.length}</div>
                            <div className="text-slate-400 text-sm font-medium">Total Risks</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:scale-110 transition-transform">
                                    <Target className="w-6 h-6" />
                                </div>
                            </div>
                            <div className={`text-3xl font-bold ${getScoreColor(avgScore)} scale-110 origin-left`}>{avgScore}</div>
                            <div className="text-slate-400 text-sm font-medium">Avg Risk Score</div>
                        </div>
                    </div>

                    {/* Filter Banner */}
                    {(searchTerm || sort) && (
                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Filter className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Active Filter</div>
                                    <div className="text-xs text-slate-400 flex gap-2">
                                        {searchTerm && <span>Search: "{searchTerm}"</span>}
                                        {sort && <span>Sort: {sort === 'score' ? 'Highest Risk Score' : sort}</span>}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { setSearchTerm(''); setSort(''); router.push('/risks'); }}
                                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                            >
                                Clear Filter
                            </button>
                        </div>
                    )}

                    {/* Risks Table */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Risk Register
                            </h2>
                            <div className="text-sm text-slate-500">
                                Showing {filteredRisks.length} of {risks.length} risks
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-slate-950/20">
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Asset/System</th>
                                        <th
                                            className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors flex items-center gap-1"
                                            onClick={() => {
                                                const newSort = sort === 'score' ? '' : 'score';
                                                setSort(newSort);
                                                // Optional: Keep search param in URL
                                                const url = new URL(window.location.href);
                                                if (newSort) url.searchParams.set('sort', newSort);
                                                else url.searchParams.delete('sort');
                                                router.replace(url.pathname + url.search);
                                            }}
                                        >
                                            Score <ArrowUpDown className="w-3 h-3" />
                                        </th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Narrative</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredRisks.map((risk) => (
                                        <tr key={risk.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-white">{risk.assetId || 'N/A'}</div>
                                                {risk.control && <div className="text-xs text-slate-400 mt-1 flex items-center gap-1"><Target className="w-3 h-3" /> {risk.control.title}</div>}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className={`text-xl font-bold ${getScoreColor(risk.score)}`}>{risk.score}</div>
                                                <div className="text-[10px] text-slate-500 font-mono tracking-tight">L:{risk.likelihood} × I:{risk.impact}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wide ${getCategoryColor(risk.category)}`}>
                                                    {risk.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm text-slate-300 max-w-2xl">{risk.narrative}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border uppercase tracking-wide ${risk.status === 'open' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                    risk.status === 'mitigated' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                    {risk.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-slate-300 font-mono">{risk._count.evidences}</td>
                                            <td className="px-6 py-5">
                                                <button
                                                    onClick={() => handleDeleteRisk(risk.id)}
                                                    className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredRisks.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-slate-500">
                                                No risks found matching "{searchTerm}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </PageTransition>
                {/* Assess Risk Modal - Moved outside PageTransition */}
                {showAssessModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Assess New Risk</h2>
                                <p className="text-slate-400 text-sm">Use AI to analyze and score risk scenarios.</p>
                            </div>
                            <form onSubmit={handleAssessRisk}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Asset/System ID</label>
                                        <input
                                            type="text"
                                            value={assessmentData.assetId}
                                            onChange={(e) => setAssessmentData({ ...assessmentData, assetId: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                            placeholder="e.g., prod-database-01"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Evidence Items (one per line)</label>
                                        <textarea
                                            value={assessmentData.evidenceItems.join('\n')}
                                            onChange={(e) => setAssessmentData({ ...assessmentData, evidenceItems: e.target.value.split('\n') })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 resize-none font-mono text-sm"
                                            rows={6}
                                            placeholder="e.g.,&#10;Vulnerability scan shows 3 critical CVEs&#10;Patch management behind by 2 months&#10;No MFA enabled on admin accounts"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-500 hover:to-orange-500 transition-all font-bold shadow-lg shadow-red-500/20 animate-pulse"
                                    >
                                        Assess with AI
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAssessModal(false)}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
