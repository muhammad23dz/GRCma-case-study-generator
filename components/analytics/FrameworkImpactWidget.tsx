'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Layers, ShieldAlert } from 'lucide-react';

interface ImpactData {
    frameworkName: string;
    affectedControlsCount: number;
    affectedRisksCount: number;
    totalResidualRiskExposure: number;
    criticalControls: {
        id: string;
        name: string;
        effectiveness: string;
        linkedRisksCount: number;
    }[];
    highRisksExposed: {
        id: string;
        narrative: string;
        score: number;
    }[];
}

export default function FrameworkImpactWidget({ frameworkId }: { frameworkId: string }) {
    const [data, setData] = useState<ImpactData | null>(null);
    const [loading, setLoading] = useState(false);
    const [simulated, setSimulated] = useState(false);

    const runSimulation = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/analytics/impact/${frameworkId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setSimulated(true);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (!simulated && !loading) {
        return (
            <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-8 flex flex-col items-center justify-center text-center">
                <Layers className="w-12 h-12 text-slate-600 mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Regulatory Change Simulator</h3>
                <p className="text-slate-400 mb-6 max-w-md">
                    Simulate a catastrophic failure or revocation of this framework to see the cascading impact on your risk posture.
                </p>
                <button
                    onClick={runSimulation}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-500/20"
                >
                    Run Impact Analysis
                </button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-8 flex items-center justify-center h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-slate-400 animate-pulse">Tracing dependencies...</span>
                </div>
            </div>
        );
    }

    if (!data) return <div className="p-4 text-red-400">Analysis failed or no data found.</div>;

    return (
        <div className="bg-slate-950/50 border border-white/5 rounded-2xl overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>

            <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <ShieldAlert className="w-5 h-5 text-orange-500" />
                            Blast Radius: {data.frameworkName}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">Cascading failure simulation results</p>
                    </div>
                    <button onClick={() => setSimulated(false)} className="text-xs text-slate-500 hover:text-white transition-colors">
                        Reset
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-3xl font-black text-white mb-1">{data.affectedControlsCount}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest">Controls Invalidated</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                        <div className="text-3xl font-black text-orange-400 mb-1">{data.affectedRisksCount}</div>
                        <div className="text-xs text-slate-400 uppercase tracking-widest">Risks Exposed</div>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-xl border border-red-500/20">
                        <div className="text-3xl font-black text-red-500 mb-1">{data.totalResidualRiskExposure}</div>
                        <div className="text-xs text-red-400 uppercase tracking-widest">Score Increase</div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Critical Control Failures</h4>
                        <div className="space-y-2">
                            {data.criticalControls.map(c => (
                                <div key={c.id} className="flex items-center justify-between p-3 bg-slate-900/80 rounded-lg border border-white/5 hover:border-red-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        <span className="text-sm font-medium text-slate-200">{c.name}</span>
                                    </div>
                                    <div className="text-xs text-slate-500">{c.linkedRisksCount} Linked Risks</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">High Risk Exposure</h4>
                        <div className="space-y-2">
                            {data.highRisksExposed.map(r => (
                                <div key={r.id} className="flex items-center justify-between p-3 bg-red-500/5 rounded-lg border border-red-500/10 hover:border-red-500/30 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-4 h-4 text-red-500" />
                                        <div className="text-sm font-medium text-slate-200">{r.narrative}</div>
                                    </div>
                                    <div className="text-xs font-bold text-red-400">Score: {r.score}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
