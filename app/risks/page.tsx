'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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
    const [risks, setRisks] = useState<Risk[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAssessModal, setShowAssessModal] = useState(false);
    const [assessmentData, setAssessmentData] = useState({
        assetId: '',
        evidenceItems: ['']
    });

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

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'Low': return 'bg-green-500/20 text-green-400 border-green-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 76) return 'text-red-500';
        if (score >= 51) return 'text-orange-500';
        if (score >= 26) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading risks...</div>
            </div>
        );
    }

    const criticalRisks = risks.filter(r => r.category === 'Critical').length;
    const highRisks = risks.filter(r => r.category === 'High').length;
    const avgScore = risks.length > 0 ? Math.round(risks.reduce((sum, r) => sum + r.score, 0) / risks.length) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
                else if (view === 'history') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Risk Dashboard</h1>
                            <p className="text-gray-400">Real-time risk assessment and monitoring</p>
                        </div>
                        <button
                            onClick={() => setShowAssessModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 transition-all shadow-lg"
                        >
                            + Assess Risk
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-red-400">{criticalRisks}</div>
                            <div className="text-gray-400 text-sm">Critical Risks</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-orange-400">{highRisks}</div>
                            <div className="text-gray-400 text-sm">High Risks</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-blue-400">{risks.length}</div>
                            <div className="text-gray-400 text-sm">Total Risks</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                            <div className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>{avgScore}</div>
                            <div className="text-gray-400 text-sm">Avg Risk Score</div>
                        </div>
                    </div>

                    {/* Risk Heatmap */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Risk Heatmap</h2>
                        <div className="grid grid-cols-10 gap-2">
                            {risks.slice(0, 50).map((risk, idx) => (
                                <div
                                    key={risk.id}
                                    className={`h-12 rounded ${getCategoryColor(risk.category)} flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-110 transition-transform`}
                                    title={`${risk.assetId || 'Asset'}: ${risk.score}`}
                                >
                                    {risk.score}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Risks Table */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Asset/System</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Score</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Category</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Narrative</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Evidence</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {risks.map((risk) => (
                                    <tr key={risk.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{risk.assetId || 'N/A'}</div>
                                            {risk.control && <div className="text-sm text-gray-400">{risk.control.title}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`text-2xl font-bold ${getScoreColor(risk.score)}`}>{risk.score}</div>
                                            <div className="text-xs text-gray-400">L:{risk.likelihood} × I:{risk.impact}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs rounded-full border ${getCategoryColor(risk.category)}`}>
                                                {risk.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300 max-w-md truncate">{risk.narrative}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${risk.status === 'open' ? 'bg-red-500/20 text-red-400' :
                                                    risk.status === 'mitigated' ? 'bg-green-500/20 text-green-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {risk.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{risk._count.evidences}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Assess Risk Modal */}
                    {showAssessModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Assess New Risk</h2>
                                <form onSubmit={handleAssessRisk}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Asset/System ID</label>
                                            <input
                                                type="text"
                                                value={assessmentData.assetId}
                                                onChange={(e) => setAssessmentData({ ...assessmentData, assetId: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                                placeholder="e.g., prod-database-01"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Evidence Items (one per line)</label>
                                            <textarea
                                                value={assessmentData.evidenceItems.join('\n')}
                                                onChange={(e) => setAssessmentData({ ...assessmentData, evidenceItems: e.target.value.split('\n') })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                                rows={6}
                                                placeholder="e.g.,&#10;Vulnerability scan shows 3 critical CVEs&#10;Patch management behind by 2 months&#10;No MFA enabled on admin accounts"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 transition-all"
                                        >
                                            Assess with AI
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAssessModal(false)}
                                            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
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
        </div>
    );
}
