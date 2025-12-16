'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { ShieldCheck, ShieldAlert, Book, Download, Plus, Check, Loader2, RefreshCw } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface FrameworkStat {
    id: string;
    name: string;
    version: string;
    totalRequirements: number;
    coveredRequirements: number;
    coverage: number;
    gap: number;
}

export default function FrameworksPage() {
    const [frameworks, setFrameworks] = useState<FrameworkStat[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);

    useEffect(() => {
        fetchFrameworks();
    }, []);

    const fetchFrameworks = async () => {
        try {
            const res = await fetch('/api/frameworks/stats');
            const data = await res.json();
            setFrameworks(data.stats || []);
        } catch (error) {
            console.error('Error fetching frameworks:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSeed = async () => {
        setSeeding(true);
        try {
            // Seed common frameworks
            const common = [
                { name: 'ISO 27001', version: '2022', description: 'Information Security Management' },
                { name: 'SOC 2', version: 'Type II', description: 'Service Organization Control' },
                { name: 'NIST CSF', version: '2.0', description: 'Cybersecurity Framework' },
                { name: 'GDPR', version: 'EU 2016/679', description: 'General Data Protection Regulation' }
            ];

            await Promise.all(common.map(fw =>
                fetch('/api/frameworks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(fw)
                })
            ));

            fetchFrameworks();
        } catch (error) {
            console.error('Error seeding frameworks:', error);
        } finally {
            setSeeding(false);
        }
    };

    const getCoverageColor = (coverage: number) => {
        if (coverage >= 90) return 'text-emerald-500 stroke-emerald-500';
        if (coverage >= 70) return 'text-emerald-400 stroke-emerald-400';
        if (coverage >= 50) return 'text-yellow-500 stroke-yellow-500';
        if (coverage >= 30) return 'text-orange-500 stroke-orange-500';
        return 'text-red-500 stroke-red-500';
    };

    const ComplianceShield = ({ stat }: { stat: FrameworkStat }) => {
        const radius = 60;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (stat.coverage / 100) * circumference;

        return (
            <div className="relative group cursor-pointer">
                {/* Glow Effect */}
                <div className={`absolute inset-0 rounded-full blur-[40px] opacity-20 group-hover:opacity-40 transition-opacity ${stat.coverage > 50 ? 'bg-emerald-500' : 'bg-red-500'
                    }`}></div>

                {/* SVG Ring */}
                <svg className="w-48 h-48 transform -rotate-90 relative z-10 mx-auto">
                    {/* Background Ring */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        className="stroke-slate-800"
                        strokeWidth="12"
                        fill="transparent"
                    />
                    {/* Progress Ring */}
                    <circle
                        cx="96"
                        cy="96"
                        r={radius}
                        className={`${getCoverageColor(stat.coverage)} transition-all duration-1000 ease-out`}
                        strokeWidth="12"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                    <span className={`text-4xl font-black ${getCoverageColor(stat.coverage).replace('stroke-', '')}`}>
                        {stat.coverage}%
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Matched</span>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <PageTransition className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-12 flex items-end justify-between">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight flex items-center gap-3">
                                <ShieldCheck className="w-10 h-10 text-emerald-500" />
                                Framework Intelligence
                            </h1>
                            <p className="text-slate-400">Gap analysis and compliance monitoring across {frameworks.length} frameworks.</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSeed}
                                disabled={seeding}
                                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl border border-emerald-400/20 flex items-center gap-2 font-bold transition-all shadow-lg shadow-emerald-500/20"
                            >
                                {seeding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                Activate Common Frameworks
                            </button>
                            <button className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-white/10 flex items-center gap-2 font-bold transition-all">
                                <Download className="w-4 h-4" /> Export Report
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Active Frameworks</div>
                            <div className="text-3xl font-black text-white">{frameworks.length}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Total Controls Mapped</div>
                            <div className="text-3xl font-black text-emerald-400">
                                {frameworks.reduce((acc, curr) => acc + curr.coveredRequirements, 0)}
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Open Gaps</div>
                            <div className="text-3xl font-black text-red-500">
                                {frameworks.reduce((acc, curr) => acc + (curr.totalRequirements - curr.coveredRequirements), 0)}
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-2">Avg Compliance</div>
                            <div className="text-3xl font-black text-blue-400">
                                {Math.round(frameworks.reduce((acc, curr) => acc + curr.coverage, 0) / (frameworks.length || 1))}%
                            </div>
                        </div>
                    </div>

                    {/* Framework Cards */}
                    {frameworks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {frameworks.map((fw) => (
                                <div key={fw.id} className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:border-emerald-500/30 transition-all hover:bg-slate-900/60 group relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none"></div>

                                    <div className="flex justify-between items-start mb-8 relative z-10">
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-1">{fw.name}</h2>
                                            <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded inline-block border border-emerald-500/20">{fw.version}</div>
                                        </div>
                                        <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                                            <Book className="w-5 h-5" />
                                        </div>
                                    </div>

                                    <div className="flex justify-center mb-8 relative z-10">
                                        <ComplianceShield stat={fw} />
                                    </div>

                                    <div className="space-y-4 relative z-10">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400">Gap Analysis</span>
                                            <span className="font-bold text-red-400">{fw.gap}% Open</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-red-500 h-full rounded-full"
                                                style={{ width: `${fw.gap}%` }}
                                            ></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-slate-500 pt-2 border-t border-white/5">
                                            <span>Requirements: {fw.totalRequirements}</span>
                                            <span>Mapped: {fw.coveredRequirements}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-slate-900/20 rounded-3xl border border-dashed border-white/10">
                            <div className="bg-slate-800/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Book className="w-10 h-10 text-slate-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">No Active Frameworks</h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">Activate the standard compliance library to begin mapping controls and analyzing gaps.</p>
                            <button
                                onClick={handleSeed}
                                disabled={seeding}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                            >
                                {seeding ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" /> Activating Library...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" /> Activate Common Frameworks
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                </PageTransition>
            </div>
        </div>
    );
}
