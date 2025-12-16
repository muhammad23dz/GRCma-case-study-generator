'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Risk {
    id: string;
    narrative: string;
    likelihood: number;
    impact: number;
    score: number;
    category: string;
    _count?: {
        controls?: number;
        evidences?: number;
    };
}

interface RiskHeatmapProps {
    risks: Risk[];
}

export default function RiskHeatmap({ risks }: RiskHeatmapProps) {
    const router = useRouter();
    const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

    // Matrix axes (5x5)
    // 5 = Very High, 1 = Very Low
    const grid = Array.from({ length: 5 }, (_, i) => 5 - i); // [5, 4, 3, 2, 1]

    const getCellColor = (impact: number, likelihood: number) => {
        const score = impact * likelihood;
        if (score >= 15) return 'bg-red-900/40 border-red-500/20'; // Critical
        if (score >= 10) return 'bg-orange-900/40 border-orange-500/20'; // High
        if (score >= 5) return 'bg-yellow-900/40 border-yellow-500/20'; // Medium
        return 'bg-emerald-900/40 border-emerald-500/20'; // Low
    };

    const getRisksInCell = (impact: number, likelihood: number) => {
        return risks.filter(r =>
            // Handle float values by rounding or checking range if necessary
            // For now assuming integer 1-5
            Math.round(r.impact) === impact && Math.round(r.likelihood) === likelihood
        );
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                    </svg>
                    Risk Heat Map
                </h3>
            </div>

            <div className="flex-1 min-h-[400px] flex relative">
                {/* Y-Axis Label */}
                <div className="flex items-center justify-center w-8 -rotate-90 text-xs font-bold text-slate-400 tracking-wider">
                    LIKELIHOOD
                </div>

                <div className="flex-1 flex flex-col">
                    {/* Grid */}
                    <div className="flex-1 grid grid-rows-5 gap-1">
                        {grid.map(likelihood => (
                            <div key={likelihood} className="grid grid-cols-5 gap-1 h-full">
                                {[1, 2, 3, 4, 5].map(impact => {
                                    const cellRisks = getRisksInCell(impact, likelihood);
                                    const hasRisks = cellRisks.length > 0;

                                    return (
                                        <div
                                            key={`${likelihood}-${impact}`}
                                            className={`relative border rounded transition-all duration-300 ${getCellColor(impact, likelihood)} hover:opacity-100 opacity-90`}
                                            title={`Impact: ${impact}, Likelihood: ${likelihood}`}
                                        >
                                            {/* Risk Bubbles */}
                                            {hasRisks && (
                                                <div className="absolute inset-0 flex items-center justify-center flex-wrap gap-1 p-1">
                                                    {cellRisks.slice(0, 4).map((risk, i) => (
                                                        <div
                                                            key={risk.id}
                                                            onClick={() => setSelectedRisk(risk)}
                                                            className={`
                                                                w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold cursor-pointer transition-transform hover:scale-125
                                                                ${risk.score >= 15 ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' :
                                                                    risk.score >= 10 ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/50' :
                                                                        risk.score >= 5 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/50' :
                                                                            'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'}
                                                            `}
                                                            title={risk.narrative}
                                                        >
                                                            {cellRisks.length > 4 && i === 3 ? '+' : i + 1}
                                                        </div>
                                                    ))}
                                                    {cellRisks.length > 4 && (
                                                        <div className="absolute -top-1 -right-1 bg-slate-800 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center border border-white/20">
                                                            {cellRisks.length}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>

                    {/* X-Axis Label */}
                    <div className="h-8 flex items-center justify-center text-xs font-bold text-slate-400 tracking-wider mt-2">
                        IMPACT
                    </div>
                </div>
            </div>

            {/* Risk Detail Overlay */}
            {selectedRisk && (
                <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 rounded-xl">
                    <div className="bg-slate-900 border border-white/10 rounded-xl p-6 max-w-sm w-full shadow-2xl relative">
                        <button
                            onClick={() => setSelectedRisk(null)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white"
                        >
                            ✕
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-1 text-xs font-bold rounded-lg ${selectedRisk.score >= 15 ? 'bg-red-500/20 text-red-400' :
                                selectedRisk.score >= 10 ? 'bg-orange-500/20 text-orange-400' :
                                    selectedRisk.score >= 5 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                Score: {selectedRisk.score}
                            </span>
                            <span className="text-xs text-slate-400 border border-white/10 px-2 py-1 rounded-lg">
                                {selectedRisk.category}
                            </span>
                        </div>

                        <h4 className="text-xl font-bold text-white mb-2">{selectedRisk.narrative}</h4>

                        <div className="grid grid-cols-2 gap-4 my-4">
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <div className="text-xs text-slate-400 uppercase">Impact</div>
                                <div className="text-lg font-bold text-white">{selectedRisk.impact}</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                                <div className="text-xs text-slate-400 uppercase">Likelihood</div>
                                <div className="text-lg font-bold text-white">{selectedRisk.likelihood}</div>
                            </div>
                        </div>

                        <button
                            onClick={() => router.push('/risks')}
                            className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white font-semibold hover:from-blue-500 hover:to-indigo-500 transition-all"
                        >
                            View Full Details
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
