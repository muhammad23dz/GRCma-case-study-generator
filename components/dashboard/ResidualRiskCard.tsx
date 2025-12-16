'use client';

import { useEffect, useState } from 'react';
import { Shield, TrendingDown, Activity, CheckCircle } from 'lucide-react';

interface ResidualRiskData {
    riskId: string;
    narrative: string;
    category: string;
    inherentRisk: number;
    residualRisk: number;
    controlCount: number;
    riskReduction: number;
    riskReductionPercentage: number;
    controls: Array<{
        id: string;
        title: string;
        controlType: string;
        effectiveness: string;
        notes?: string;
    }>;
}

interface ResidualRiskCardProps {
    riskId: string;
}

export default function ResidualRiskCard({ riskId }: ResidualRiskCardProps) {
    const [data, setData] = useState<ResidualRiskData | null>(null);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        fetchResidualRisk();
    }, [riskId]);

    const fetchResidualRisk = async () => {
        try {
            const response = await fetch(`/api/risks/${riskId}/residual`);
            if (response.ok) {
                const residualData = await response.json();
                setData(residualData);
            }
        } catch (error) {
            console.error('Error fetching residual risk:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-pulse h-24 bg-slate-800/50 rounded-xl"></div>
        );
    }

    if (!data) return null;

    const getRiskColor = (score: number) => {
        if (score >= 15) return 'text-red-400 bg-red-500/10';
        if (score >= 10) return 'text-orange-400 bg-orange-500/10';
        if (score >= 5) return 'text-yellow-400 bg-yellow-500/10';
        return 'text-emerald-400 bg-emerald-500/10';
    };

    const getEffectivenessIcon = (effectiveness: string) => {
        switch (effectiveness) {
            case 'effective': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
            case 'partial': return <Activity className="w-4 h-4 text-yellow-400" />;
            default: return <Shield className="w-4 h-4 text-red-400" />;
        }
    };

    return (
        <div className="bg-slate-950/50 border border-white/5 rounded-xl p-4 hover:border-emerald-500/20 transition-all">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded">
                            {data.category}
                        </span>
                        <span className="text-xs text-slate-500">
                            {data.controlCount} {data.controlCount === 1 ? 'Control' : 'Controls'}
                        </span>
                    </div>
                    <p className="text-sm text-white font-medium line-clamp-2">{data.narrative}</p>
                </div>
            </div>

            {/* Risk Scores */}
            <div className="grid grid-cols-3 gap-3 mb-3">
                <div className="text-center p-2 bg-slate-900/50 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Inherent</div>
                    <div className={`text-lg font-black ${getRiskColor(data.inherentRisk).split(' ')[0]}`}>
                        {data.inherentRisk}
                    </div>
                </div>
                <div className="text-center p-2 bg-slate-900/50 rounded-lg border border-emerald-500/20">
                    <div className="text-xs text-slate-500 mb-1">Residual</div>
                    <div className={`text-lg font-black ${getRiskColor(data.residualRisk).split(' ')[0]}`}>
                        {data.residualRisk}
                    </div>
                </div>
                <div className="text-center p-2 bg-emerald-500/5 rounded-lg">
                    <div className="text-xs text-slate-500 mb-1">Reduction</div>
                    <div className="text-lg font-black text-emerald-400">
                        -{data.riskReduction}
                    </div>
                </div>
            </div>

            {/* Reduction Percentage */}
            <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${data.riskReductionPercentage}%` }}
                    />
                </div>
                <span className="text-xs font-bold text-emerald-400">
                    {data.riskReductionPercentage}%
                </span>
            </div>

            {/* Controls List (Expandable) */}
            {data.controls.length > 0 && (
                <div>
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors mb-2"
                    >
                        {expanded ? '▼' : '▶'} View Controls ({data.controls.length})
                    </button>
                    {expanded && (
                        <div className="space-y-2 mt-2">
                            {data.controls.map((control) => (
                                <div
                                    key={control.id}
                                    className="p-2 bg-slate-900/50 rounded-lg border border-white/5 text-xs"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {getEffectivenessIcon(control.effectiveness)}
                                        <span className="font-semibold text-white">{control.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500">
                                        <span className="capitalize">{control.controlType}</span>
                                        <span>•</span>
                                        <span className="capitalize">{control.effectiveness}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
