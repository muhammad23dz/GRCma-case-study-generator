'use client';

import { useState } from 'react';

interface Risk {
    id: string;
    likelihood: number;
    impact: number;
    category: string;
    narrative: string;
    status: string;
}

interface RiskHeatMapProps {
    risks: Risk[];
    onRiskClick?: (risk: Risk) => void;
}

export default function RiskHeatMap({ risks, onRiskClick }: RiskHeatMapProps) {
    const [hoveredCell, setHoveredCell] = useState<string | null>(null);

    // Calculate risk score and color
    const getRiskLevel = (likelihood: number, impact: number): { level: string; color: string; bgColor: string } => {
        const score = likelihood * impact;
        if (score >= 16) return { level: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/50' };
        if (score >= 10) return { level: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/20 border-orange-500/50' };
        if (score >= 5) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/50' };
        return { level: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/50' };
    };

    // Group risks by cell
    const getRisksInCell = (likelihood: number, impact: number) => {
        return risks.filter(r => r.likelihood === likelihood && r.impact === impact);
    };

    // Get background color for cell
    const getCellStyle = (likelihood: number, impact: number) => {
        const score = likelihood * impact;
        const cellRisks = getRisksInCell(likelihood, impact);
        const isHovered = hoveredCell === `${likelihood}-${impact}`;

        let baseColor = '';
        if (score >= 16) baseColor = 'bg-red-500/30 border-red-500/60';
        else if (score >= 10) baseColor = 'bg-orange-500/30 border-orange-500/60';
        else if (score >= 5) baseColor = 'bg-yellow-500/30 border-yellow-500/60';
        else baseColor = 'bg-green-500/30 border-green-500/60';

        return `${baseColor} ${cellRisks.length > 0 ? 'ring-2 ring-white/20' : ''} ${isHovered ? 'ring-4 ring-emerald-400' : ''}`;
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Risk Heat Map</h2>
                <p className="text-gray-400 text-sm">Interactive Likelihood × Impact Matrix</p>
            </div>

            <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                    {/* Grid Container */}
                    <div className="grid" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
                        {/* Top-left corner */}
                        <div className="p-4"></div>

                        {/* Impact headers (1-5) */}
                        {[1, 2, 3, 4, 5].map(impact => (
                            <div key={`impact-${impact}`} className="p-4 text-center font-bold text-emerald-400 text-sm">
                                {impact}
                            </div>
                        ))}

                        {/* Rows (Likelihood 5 down to 1) */}
                        {[5, 4, 3, 2, 1].map(likelihood => (
                            <>
                                {/* Likelihood label */}
                                <div key={`likelihood-${likelihood}`} className="p-4 flex items-center justify-center font-bold text-emerald-400 text-sm">
                                    {likelihood}
                                </div>

                                {/* Cells for each impact level */}
                                {[1, 2, 3, 4, 5].map(impact => {
                                    const cellRisks = getRisksInCell(likelihood, impact);
                                    const { level } = getRiskLevel(likelihood, impact);
                                    const cellKey = `${likelihood}-${impact}`;

                                    return (
                                        <div
                                            key={cellKey}
                                            className={`relative p-4 border-2 transition-all duration-200 cursor-pointer ${getCellStyle(likelihood, impact)}`}
                                            onMouseEnter={() => setHoveredCell(cellKey)}
                                            onMouseLeave={() => setHoveredCell(null)}
                                            onClick={() => {
                                                if (cellRisks.length === 1 && onRiskClick) {
                                                    onRiskClick(cellRisks[0]);
                                                }
                                            }}
                                        >
                                            {/* Cell content */}
                                            <div className="text-center">
                                                <div className="text-xs font-semibold text-gray-300 mb-1">{level}</div>
                                                {cellRisks.length > 0 && (
                                                    <div className="flex items-center justify-center">
                                                        <span className="bg-white/20 rounded-full px-2 py-1 text-xs font-bold text-white">
                                                            {cellRisks.length}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Tooltip on hover */}
                                            {hoveredCell === cellKey && cellRisks.length > 0 && (
                                                <div className="absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-white/20 rounded-lg p-3 shadow-xl">
                                                    <div className="text-xs text-white font-semibold mb-2">
                                                        {cellRisks.length} Risk{cellRisks.length > 1 ? 's' : ''}
                                                    </div>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {cellRisks.map(risk => (
                                                            <div key={risk.id} className="text-xs text-gray-300 border-b border-white/10 pb-1">
                                                                <div className="font-medium">{risk.category}</div>
                                                                <div className="text-gray-400 truncate">{risk.narrative.substring(0, 50)}...</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        ))}
                    </div>

                    {/* Axis Labels */}
                    <div className="mt-4 flex justify-between items-center text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="transform -rotate-90 origin-center">
                                <span className="font-semibold text-emerald-400">LIKELIHOOD →</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center">
                            <span className="font-semibold text-emerald-400">IMPACT →</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 flex flex-wrap gap-4 justify-center">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500/30 border-2 border-green-500/60 rounded"></div>
                            <span className="text-xs text-gray-300">Low (1-4)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-yellow-500/30 border-2 border-yellow-500/60 rounded"></div>
                            <span className="text-xs text-gray-300">Medium (5-9)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-orange-500/30 border-2 border-orange-500/60 rounded"></div>
                            <span className="text-xs text-gray-300">High (10-15)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500/30 border-2 border-red-500/60 rounded"></div>
                            <span className="text-xs text-gray-300">Critical (16-25)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
