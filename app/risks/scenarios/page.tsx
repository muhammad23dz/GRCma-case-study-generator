'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Sparkles,
    TrendingDown,
    TrendingUp,
    AlertTriangle,
    Shield,
    ChevronRight,
    Play,
    RotateCcw,
    Target,
    Zap
} from 'lucide-react';

interface RiskScenario {
    id: string;
    category: string;
    narrative: string;
    currentScore: number;
    currentLikelihood: number;
    currentImpact: number;
    status: string;
    scenarios: {
        bestCase: { score: number; description: string; reduction: number };
        worstCase: { score: number; description: string; increase: number };
        likelyCase: { score: number; description: string };
    };
    linkedControls: number;
    linkedAssets: number;
    potentialReduction: number;
}

interface Stats {
    totalRisks: number;
    averageScore: number;
    criticalRisks: number;
    highRisks: number;
    potentialSavings: number;
}

const SCORE_COLORS: Record<string, string> = {
    critical: 'text-red-400 bg-red-500/10',
    high: 'text-orange-400 bg-orange-500/10',
    medium: 'text-amber-400 bg-amber-500/10',
    low: 'text-emerald-400 bg-emerald-500/10',
};

function getScoreLevel(score: number): string {
    if (score >= 15) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
}

export default function RiskScenariosPage() {
    const router = useRouter();
    const [scenarios, setScenarios] = useState<RiskScenario[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedRisk, setSelectedRisk] = useState<string | null>(null);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/risks/scenarios');
                if (res.ok) {
                    const data = await res.json();
                    setScenarios(data.scenarios || []);
                    setStats(data.stats || null);
                }
            } catch (error) {
                console.error('Failed to fetch risk scenarios:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const runSimulation = async (riskId: string) => {
        setSimulating(true);
        setSelectedRisk(riskId);
        // Simulation would be run here
        setTimeout(() => setSimulating(false), 1500);
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
                                <Sparkles className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Advanced Analytics</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Risk Scenarios
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                What-if analysis and predictive risk modeling powered by Gigachad GRC.
                            </p>
                        </div>
                        <button
                            onClick={() => router.push('/risks/reports')}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Target className="w-5 h-5" />
                            Executive Reports
                        </button>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-white">{stats.totalRisks}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Total Risks</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-amber-400">{stats.averageScore}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Avg Score</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-red-400">{stats.criticalRisks}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Critical</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-orange-400">{stats.highRisks}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">High</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-emerald-400">-{stats.potentialSavings}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Potential Reduction</div>
                            </div>
                        </div>
                    )}

                    {/* Scenario Cards */}
                    {loading ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-64 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : scenarios.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <Sparkles className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Risk Scenarios Available</h3>
                            <p className="text-slate-400 mb-6">Add risks to start running what-if analysis.</p>
                            <button
                                onClick={() => router.push('/risks')}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Go to Risk Register
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {scenarios.map(scenario => {
                                const scoreLevel = getScoreLevel(scenario.currentScore);
                                const isSelected = selectedRisk === scenario.id;

                                return (
                                    <div
                                        key={scenario.id}
                                        className={`bg-slate-900/40 backdrop-blur-md border rounded-2xl p-6 transition-all ${isSelected ? 'border-primary/50 ring-1 ring-primary/30' : 'border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        {/* Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${SCORE_COLORS[scoreLevel]}`}>
                                                    {scoreLevel} Risk
                                                </span>
                                                <h3 className="text-lg font-bold text-white mt-2 line-clamp-1">
                                                    {scenario.category.replace(/_/g, ' ')}
                                                </h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-white">{scenario.currentScore}</div>
                                                <div className="text-xs text-slate-500">Current Score</div>
                                            </div>
                                        </div>

                                        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{scenario.narrative}</p>

                                        {/* Scenario Comparison */}
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                                                <TrendingDown className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                                <div className="text-lg font-bold text-emerald-400">{scenario.scenarios.bestCase.score}</div>
                                                <div className="text-[10px] text-slate-500">Best Case</div>
                                                <div className="text-xs text-emerald-400">-{scenario.scenarios.bestCase.reduction}%</div>
                                            </div>
                                            <div className="bg-amber-500/10 rounded-lg p-3 text-center">
                                                <Target className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                                                <div className="text-lg font-bold text-amber-400">{scenario.scenarios.likelyCase.score}</div>
                                                <div className="text-[10px] text-slate-500">Likely</div>
                                            </div>
                                            <div className="bg-red-500/10 rounded-lg p-3 text-center">
                                                <TrendingUp className="w-4 h-4 text-red-400 mx-auto mb-1" />
                                                <div className="text-lg font-bold text-red-400">{scenario.scenarios.worstCase.score}</div>
                                                <div className="text-[10px] text-slate-500">Worst Case</div>
                                                <div className="text-xs text-red-400">+{scenario.scenarios.worstCase.increase}%</div>
                                            </div>
                                        </div>

                                        {/* Footer */}
                                        <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-4 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Shield className="w-3 h-3" />
                                                    {scenario.linkedControls} Controls
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <AlertTriangle className="w-3 h-3" />
                                                    {scenario.linkedAssets} Assets
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => runSimulation(scenario.id)}
                                                disabled={simulating}
                                                className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50"
                                            >
                                                {simulating && isSelected ? (
                                                    <><RotateCcw className="w-3 h-3 animate-spin" /> Running...</>
                                                ) : (
                                                    <><Play className="w-3 h-3" /> Simulate</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
