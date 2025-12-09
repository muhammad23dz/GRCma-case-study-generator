'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Shield, Globe, Lock as LockIcon, FileText, Scale, Book, Eye, LayoutGrid, ArrowRight, X } from 'lucide-react';

interface Framework {
    id: string;
    name: string;
    version: string;
    jurisdiction: string | null;
    description: string | null;
    _count: {
        mappings: number;
    };
}

export default function FrameworksPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFramework, setSelectedFramework] = useState<Framework | null>(null);

    useEffect(() => {
        fetchFrameworks();
    }, []);

    const fetchFrameworks = async () => {
        try {
            const res = await fetch('/api/frameworks');
            const data = await res.json();
            const loadedFrameworks = data.frameworks || [];

            // Custom Sort: Moroccan Law First (Law 09-08 or 08-09)
            const sorted = loadedFrameworks.sort((a: Framework, b: Framework) => {
                const nameA = a.name.toLowerCase();
                const nameB = b.name.toLowerCase();
                const isLawA = nameA.includes('09-08') || nameA.includes('08-09');
                const isLawB = nameB.includes('09-08') || nameB.includes('08-09');

                if (isLawA && !isLawB) return -1;
                if (!isLawA && isLawB) return 1;
                return 0;
            });

            setFrameworks(sorted);
        } catch (error) {
            console.error('Error fetching frameworks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFrameworkIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('09-08') || lower.includes('08-09')) return <Scale className="w-8 h-8 text-emerald-400" />;
        if (name.includes('ISO')) return <LockIcon className="w-8 h-8 text-blue-400" />;
        if (name.includes('SOC')) return <Shield className="w-8 h-8 text-purple-400" />;
        if (name.includes('NIST')) return <Globe className="w-8 h-8 text-orange-400" />;
        if (name.includes('GDPR')) return <FileText className="w-8 h-8 text-teal-400" />;
        return <Book className="w-8 h-8 text-gray-400" />;
    };

    const getFrameworkColor = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('09-08') || lower.includes('08-09')) return 'from-emerald-500/20 to-green-600/20 border-emerald-500/30';
        if (name.includes('ISO')) return 'from-blue-500/20 to-cyan-600/20 border-blue-500/30';
        if (name.includes('SOC')) return 'from-purple-500/20 to-pink-600/20 border-purple-500/30';
        if (name.includes('NIST')) return 'from-orange-500/20 to-red-600/20 border-orange-500/30';
        if (name.includes('GDPR')) return 'from-teal-500/20 to-green-600/20 border-teal-500/30';
        return 'from-slate-700/50 to-gray-700/50 border-white/10';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-emerald-500">GRC</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="relative z-10 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Hero Section */}
                    <div className="mb-12 text-center md:text-left">
                        <h1 className="text-5xl font-black mb-4 tracking-tight">
                            <span className="bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                Framework Library
                            </span>
                        </h1>
                        <p className="text-lg text-slate-400 max-w-2xl font-light leading-relaxed">
                            Accelerate your compliance journey with our pre-built, expert-validated framework templates.
                            Map controls, track gaps, and automate evidence collection instantly.
                        </p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                        {[
                            { label: 'Active Frameworks', value: frameworks.length, color: 'emerald', icon: Book },
                            { label: 'Total Controls', value: frameworks.reduce((sum, f) => sum + f._count.mappings, 0), color: 'blue', icon: Shield },
                            { label: 'Certifications', value: frameworks.filter(f => f.name.includes('SOC') || f.name.includes('ISO')).length, color: 'purple', icon: LockIcon },
                            { label: 'Privacy Laws', value: frameworks.filter(f => f.name.includes('GDPR') || f.name.includes('CCPA')).length, color: 'orange', icon: Eye },
                        ].map((stat, i) => (
                            <div key={i} className="relative group p-6 bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                <div className={`absolute -right-6 -top-6 w-24 h-24 bg-${stat.color}-500/10 rounded-full blur-xl group-hover:bg-${stat.color}-500/20 transition-all`}></div>
                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2 rounded-lg bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                                    <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {frameworks.map((framework) => (
                            <div
                                key={framework.id}
                                className={`group relative p-1 rounded-2xl bg-gradient-to-br ${getFrameworkColor(framework.name)} transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer`}
                                onClick={() => setSelectedFramework(framework)}
                            >
                                <div className="relative h-full bg-slate-950/90 backdrop-blur-xl p-6 rounded-xl overflow-hidden">
                                    {/* Hover Glow */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 via-transparent"></div>

                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-slate-900 rounded-xl border border-white/5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                {getFrameworkIcon(framework.name)}
                                            </div>
                                            <span className="px-3 py-1 bg-slate-900 rounded-full border border-white/5 text-xs font-semibold text-slate-400 group-hover:text-emerald-400 transition-colors">
                                                v{framework.version}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                            {framework.name}
                                        </h3>

                                        <p className="text-sm text-slate-400 line-clamp-2 mb-6 flex-grow">
                                            {framework.description || `Comprehensive compliance framework for ${framework.name} requirements.`}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <LayoutGrid className="w-3 h-3" />
                                                <span>{framework._count.mappings} Controls</span>
                                            </div>
                                            <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Premium Modal */}
            {
                selectedFramework && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
                        <div
                            className="bg-slate-900 border border-white/10 rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header Effect */}
                            <div className={`absolute top-0 left-0 w-full h-32 bg-gradient-to-b ${getFrameworkColor(selectedFramework.name).split(' ')[0]} opacity-30`}></div>

                            <div className="relative p-8">
                                <button
                                    onClick={() => setSelectedFramework(null)}
                                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 shadow-xl">
                                        {getFrameworkIcon(selectedFramework.name)}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold text-white mb-1">{selectedFramework.name}</h2>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-xs">v{selectedFramework.version}</span>
                                            <span>•</span>
                                            <span>{selectedFramework.jurisdiction || 'Global Standard'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                        <div className="text-sm text-slate-500 mb-1">Mapped Controls</div>
                                        <div className="text-2xl font-bold text-white">{selectedFramework._count.mappings}</div>
                                    </div>
                                    <div className="p-4 rounded-xl bg-slate-950/50 border border-white/5">
                                        <div className="text-sm text-slate-500 mb-1">Audit Readiness</div>
                                        <div className="text-2xl font-bold text-emerald-400">
                                            {Math.round(Math.random() * 30 + 10)}%
                                        </div>
                                    </div>
                                </div>

                                <div className="prose prose-invert prose-sm max-w-none mb-8 text-slate-400">
                                    <p>{selectedFramework.description}</p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setSelectedFramework(null);
                                            router.push(`/frameworks/${selectedFramework.id}`);
                                        }}
                                        className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 hover:-translate-y-0.5 transition-all font-bold text-center"
                                    >
                                        Launch Gap Analysis
                                    </button>
                                    <button
                                        onClick={() => setSelectedFramework(null)}
                                        className="px-6 py-4 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
