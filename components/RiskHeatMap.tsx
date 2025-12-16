'use client';

import React from 'react';

interface RiskData {
    id: string;
    narrative: string;
    likelihood: number;
    impact: number;
    score: number;
    status: string;
}

interface Props {
    risks: RiskData[];
    onRiskClick?: (risk: RiskData) => void;
}

export default function RiskHeatmap({ risks, onRiskClick }: Props) {
    // Calculate risk distribution across the 5x5 matrix
    const getCell = (likelihood: number, impact: number) => {
        return risks.filter(r =>
            Math.ceil(r.likelihood / 20) === likelihood &&
            Math.ceil(r.impact / 20) === impact
        );
    };

    const getCellColor = (likelihood: number, impact: number) => {
        const score = likelihood * impact;
        if (score >= 16) return 'bg-red-500/30 hover:bg-red-500/50 border-red-500/30';
        if (score >= 9) return 'bg-orange-500/30 hover:bg-orange-500/50 border-orange-500/30';
        if (score >= 4) return 'bg-yellow-500/30 hover:bg-yellow-500/50 border-yellow-500/30';
        return 'bg-emerald-500/30 hover:bg-emerald-500/50 border-emerald-500/30';
    };

    const likelihoodLabels = ['Rare', 'Unlikely', 'Possible', 'Likely', 'Certain'];
    const impactLabels = ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'];

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Risk Heatmap</h3>

            <div className="flex">
                {/* Y-Axis Label */}
                <div className="flex flex-col justify-center items-center w-6 mr-2">
                    <span className="text-xs text-slate-400 transform -rotate-90 whitespace-nowrap">
                        ← Likelihood →
                    </span>
                </div>

                <div className="flex-1">
                    {/* Matrix Grid */}
                    <div className="grid grid-cols-5 gap-1">
                        {[5, 4, 3, 2, 1].map(likelihood => (
                            [1, 2, 3, 4, 5].map(impact => {
                                const cellRisks = getCell(likelihood, impact);
                                return (
                                    <div
                                        key={`${likelihood}-${impact}`}
                                        className={`aspect-square rounded-lg border transition-all cursor-pointer flex items-center justify-center ${getCellColor(likelihood, impact)}`}
                                        onClick={() => cellRisks.length > 0 && onRiskClick?.(cellRisks[0])}
                                        title={`L${likelihood} x I${impact}: ${cellRisks.length} risks`}
                                    >
                                        {cellRisks.length > 0 && (
                                            <span className="text-white font-bold text-lg">
                                                {cellRisks.length}
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        ))}
                    </div>

                    {/* X-Axis Label */}
                    <div className="text-center mt-2 text-xs text-slate-400">
                        ← Impact →
                    </div>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 mt-6 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-emerald-500/30 border border-emerald-500/30"></div>
                    <span className="text-slate-400">Low</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-yellow-500/30 border border-yellow-500/30"></div>
                    <span className="text-slate-400">Medium</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-orange-500/30 border border-orange-500/30"></div>
                    <span className="text-slate-400">High</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded bg-red-500/30 border border-red-500/30"></div>
                    <span className="text-slate-400">Critical</span>
                </div>
            </div>
        </div>
    );
}
