'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Shield, Brain, Zap, AlertTriangle, FileText, Activity, ArrowLeft, ShieldCheck } from 'lucide-react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

export default function VendorDNA({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/vendors/${id}`)
            .then(res => res.json())
            .then(json => {
                setData(json);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-purple-500">Deciphering DNA...</div>;

    if (data?.error || !data?.vendor) return (
        <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Vendor DNA Not Found</h1>
            <p className="text-slate-400 mb-6">The requested vendor profile could not be located in the constellation.</p>
            <button onClick={() => router.back()} className="px-6 py-2 bg-slate-800 rounded-lg hover:bg-slate-700">Return to Grid</button>
        </div>
    );

    const { vendor, radarMetrics = { security: 0, privacy: 0, legal: 0, availability: 0, financial: 0, reputation: 0 } } = data;

    const radarData = {
        labels: ['Security', 'Privacy', 'Legal', 'Availability', 'Financial', 'Reputation'],
        datasets: [
            {
                label: 'Risk Exposure',
                data: [
                    radarMetrics.security,
                    radarMetrics.privacy,
                    radarMetrics.legal,
                    radarMetrics.availability,
                    radarMetrics.financial,
                    radarMetrics.reputation,
                ],
                backgroundColor: 'rgba(239, 68, 68, 0.2)', // Red
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 2,
            },
            {
                label: 'Control Coverage', // Simulated inverse
                data: [
                    100 - radarMetrics.security,
                    100 - radarMetrics.privacy,
                    100 - radarMetrics.legal,
                    100 - radarMetrics.availability,
                    100 - radarMetrics.financial,
                    100 - radarMetrics.reputation,
                ],
                backgroundColor: 'rgba(16, 185, 129, 0.2)', // Emerald
                borderColor: 'rgba(16, 185, 129, 1)',
                borderWidth: 2,
            },
        ],
    };

    const radarOptions = {
        scales: {
            r: {
                angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                grid: { color: 'rgba(255, 255, 255, 0.1)' },
                pointLabels: { color: '#94a3b8', font: { size: 12 } },
                ticks: { display: false, backdropColor: 'transparent' }
            },
        },
        plugins: {
            legend: { labels: { color: '#cbd5e1' } }
        },
        maintainAspectRatio: false
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white selection:bg-purple-500/30 font-sans">
            <Header />

            <main className="max-w-7xl mx-auto px-6 py-8 pt-32">
                {/* Navigation */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 hover:-translate-x-1 transition-transform"
                >
                    <ArrowLeft className="w-4 h-4" /> Return to Constellation
                </button>

                {/* Identity Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 border-b border-white/10 pb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-purple-500 text-sm tracking-widest uppercase">ID: {vendor.id.slice(-6)}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${vendor.status === 'active' ? 'border-emerald-500 text-emerald-500' : 'border-slate-500 text-slate-500'}`}>
                                {vendor.status}
                            </span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tight mb-2 flex items-center gap-4">
                            {vendor.name}
                            <span className={`text-lg px-3 py-1 rounded-full border ${vendor.criticality === 'critical' ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-blue-500 bg-blue-500/10 text-blue-500'}`}>
                                {vendor.criticality || 'Medium'} Impact
                            </span>
                        </h1>
                        <p className="text-slate-400 max-w-2xl text-lg">{vendor.services}</p>
                    </div>
                    <div className="text-right mt-6 md:mt-0">
                        <div className="text-sm text-slate-500 uppercase tracking-widest mb-1">Composite Risk Score</div>
                        <div className={`text-6xl font-black ${vendor.riskScore > 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {vendor.riskScore || 0}
                        </div>
                    </div>
                </div>

                {/* DNA Dashboard */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left: Risk Radar */}
                    <div className="lg:col-span-1 bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent pointer-events-none" />
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-purple-400" /> Risk Vector Analysis
                        </h3>
                        <div className="h-[300px] w-full">
                            <Radar data={radarData} options={radarOptions} />
                        </div>
                        <div className="mt-4 text-center text-xs text-slate-500 font-mono">
                            Live telemetry from {vendor._count.assessments} data points
                        </div>
                    </div>

                    {/* Middle: AI Narrative */}
                    <div className="lg:col-span-1 bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-400" /> AI Risk Narrative
                        </h3>
                        <div className="prose prose-invert prose-sm">
                            <p className="text-slate-300 leading-relaxed">
                                <span className="text-purple-400 font-bold">Analysis:</span> {vendor.name} presents a
                                {vendor.riskScore > 50 ? ' significant ' : ' moderate '} risk profile, primarily driven by
                                <span className="text-red-400"> Data Privacy </span> and <span className="text-red-400"> Availability </span> vectors.
                            </p>
                            <p className="text-slate-300 leading-relaxed mt-4">
                                Recent signals indicate stability in financial health, but third-party sub-processor controls remain a gap.
                                Recommended action: <span className="text-emerald-400 font-bold">Enhance audit frequency to Quarterly.</span>
                            </p>
                        </div>

                        <div className="mt-8 space-y-3">
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400">Data Sensitivity</span>
                                <span className="text-sm font-bold text-white">High (PII/PHI)</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                <span className="text-sm text-slate-400">Jurisdiction</span>
                                <span className="text-sm font-bold text-white">EU / US Safe Harbor</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Compliance Shield */}
                    <div className="lg:col-span-1 bg-slate-900/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
                        <div className="relative mb-6">
                            <Shield className="w-24 h-24 text-emerald-500/20" />
                            <ShieldCheck className="w-12 h-12 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">94%</h2>
                        <div className="text-emerald-400 text-sm font-bold uppercase tracking-wider mb-6">Compliance Adherence</div>

                        <div className="w-full space-y-4">
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>ISO 27001</span>
                                    <span>Verified</span>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-full bg-emerald-500" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-xs text-slate-400 mb-1">
                                    <span>SOC 2 Type II</span>
                                    <span>Pending Renewal</span>
                                </div>
                                <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full w-[80%] bg-yellow-500" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Connection Activity */}
                <div className="mt-8 bg-slate-900/50 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-bold mb-6 text-white">Linked Risk Activity</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {vendor.vendorRisks?.map((vr: any) => (
                            <div key={vr.id} className="p-4 bg-slate-950 border border-white/10 rounded-xl flex items-start gap-4">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white mb-1">{vr.risk.narrative}</div>
                                    <div className="text-xs text-slate-500">
                                        Score: {vr.risk.score} | {vr.risk.category}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {(!vendor.vendorRisks || vendor.vendorRisks.length === 0) && (
                            <div className="col-span-3 text-center py-8 text-slate-500 italic">No linked enterprise risks found.</div>
                        )}
                    </div>
                </div>

            </main>
        </div>
    );
}
