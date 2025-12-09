'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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
            setFrameworks(data.frameworks || []);
        } catch (error) {
            console.error('Error fetching frameworks:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFrameworkIcon = (name: string) => {
        if (name.includes('ISO')) return '🔒';
        if (name.includes('SOC')) return '🛡️';
        if (name.includes('NIST')) return '🇺🇸';
        if (name.includes('GDPR')) return '🇪🇺';
        return '📋';
    };

    const getFrameworkColor = (name: string) => {
        if (name.includes('ISO')) return 'from-blue-600 to-cyan-600';
        if (name.includes('SOC')) return 'from-purple-600 to-pink-600';
        if (name.includes('NIST')) return 'from-red-600 to-orange-600';
        if (name.includes('GDPR')) return 'from-green-600 to-teal-600';
        return 'from-gray-600 to-slate-600';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading frameworks...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Compliance Framework Library</h1>
                        <p className="text-gray-400">Pre-built templates for major compliance frameworks</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-emerald-400">{frameworks.length}</div>
                            <div className="text-gray-400 text-sm">Available Frameworks</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-blue-400">
                                {frameworks.reduce((sum, f) => sum + f._count.mappings, 0)}
                            </div>
                            <div className="text-gray-400 text-sm">Control Mappings</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-purple-400">
                                {frameworks.filter(f => f.name.includes('SOC') || f.name.includes('ISO')).length}
                            </div>
                            <div className="text-gray-400 text-sm">Certification Standards</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-yellow-400">
                                {frameworks.filter(f => f.name.includes('GDPR') || f.name.includes('CCPA')).length}
                            </div>
                            <div className="text-gray-400 text-sm">Privacy Regulations</div>
                        </div>
                    </div>

                    {/* Framework Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                        {frameworks.map((framework) => (
                            <div
                                key={framework.id}
                                className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-emerald-500/50 transition-all cursor-pointer group"
                                onClick={() => setSelectedFramework(framework)}
                            >
                                {/* Framework Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`text-4xl bg-gradient-to-br ${getFrameworkColor(framework.name)} bg-clip-text text-transparent`}>
                                            {getFrameworkIcon(framework.name)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                {framework.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">Version {framework.version}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold">
                                            {framework._count.mappings} mappings
                                        </span>
                                    </div>
                                </div>

                                {/* Framework Details */}
                                <div className="space-y-2 mb-4">
                                    {framework.jurisdiction && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-gray-500">📍</span>
                                            <span className="text-gray-300">{framework.jurisdiction}</span>
                                        </div>
                                    )}
                                    {framework.description && (
                                        <p className="text-gray-400 text-sm line-clamp-2">{framework.description}</p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-2">
                                    <button
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-500 hover:to-green-500 transition-all text-sm font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // Navigate to gap analysis
                                            router.push(`/frameworks/${framework.id}/gap-analysis`);
                                        }}
                                    >
                                        Gap Analysis
                                    </button>
                                    <button
                                        className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all text-sm font-medium"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFramework(framework);
                                        }}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {frameworks.length === 0 && (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-12 text-center">
                            <div className="text-6xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-white mb-2">No Frameworks Available</h3>
                            <p className="text-gray-400 mb-4">
                                Run the framework seeding script to populate compliance frameworks
                            </p>
                            <code className="bg-slate-900/50 px-4 py-2 rounded text-emerald-400 text-sm">
                                npx ts-node prisma/seed-frameworks.ts
                            </code>
                        </div>
                    )}

                    {/* Framework Detail Modal */}
                    {selectedFramework && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                            <div className="bg-slate-800 border border-white/10 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
                                {/* Modal Header */}
                                <div className={`bg-gradient-to-r ${getFrameworkColor(selectedFramework.name)} p-6`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-4xl">{getFrameworkIcon(selectedFramework.name)}</span>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">{selectedFramework.name}</h2>
                                                <p className="text-white/80 text-sm">Version {selectedFramework.version}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFramework(null)}
                                            className="text-white/80 hover:text-white transition-colors"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {/* Modal Content */}
                                <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                                    <div className="space-y-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                                            <p className="text-gray-300">{selectedFramework.description}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Jurisdiction</h3>
                                            <p className="text-gray-300">{selectedFramework.jurisdiction || 'Global'}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-semibold text-white mb-2">Coverage</h3>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                                    <div className="text-2xl font-bold text-emerald-400">{selectedFramework._count.mappings}</div>
                                                    <div className="text-sm text-gray-400">Mapped Controls</div>
                                                </div>
                                                <div className="bg-slate-900/50 p-4 rounded-lg">
                                                    <div className="text-2xl font-bold text-yellow-400">TBD</div>
                                                    <div className="text-sm text-gray-400">Requirements</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-white/10">
                                            <button
                                                onClick={() => {
                                                    setSelectedFramework(null);
                                                    router.push(`/frameworks/${selectedFramework.id}/gap-analysis`);
                                                }}
                                                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-500 hover:to-green-500 transition-all font-medium"
                                            >
                                                Start Gap Analysis
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
