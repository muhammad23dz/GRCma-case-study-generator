'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Framework {
    id: string;
    name: string;
    version: string;
    description: string | null;
    _count: {
        mappings: number;
    };
}

export default function GapAnalysisPage() {
    const { user } = useUser();
    const router = useRouter();
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [loading, setLoading] = useState(true);

    // Estimated requirements count per framework (in production, would be dynamic)
    const requirementsCount: Record<string, number> = {
        'ISO 27001:2022': 93,
        'SOC 2 Type II': 64,
        'NIST CSF 2.0': 108,
        'GDPR': 99,
        'PCI DSS': 325,
    };

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

    const calculateCoverage = (framework: Framework) => {
        const total = requirementsCount[framework.name] || 100;
        const mapped = framework._count.mappings;
        const percentage = total > 0 ? Math.round((mapped / total) * 100) : 0;

        return {
            total,
            mapped,
            unmapped: total - mapped,
            percentage,
            status: percentage >= 80 ? 'ready' : percentage >= 50 ? 'in-progress' : 'needs-work',
        };
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ready': return 'text-green-400 bg-green-500/20 border-green-500/50';
            case 'in-progress': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
            case 'needs-work': return 'text-red-400 bg-red-500/20 border-red-500/50';
            default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'ready': return '✅ Audit Ready';
            case 'in-progress': return '🔸 In Progress';
            case 'needs-work': return '⚠️ Needs Work';
            default: return 'Not Started';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading gap analysis...</div>
            </div>
        );
    }

    const totalMappings = frameworks.reduce((sum, f) => sum + f._count.mappings, 0);
    const avgCoverage = frameworks.length > 0
        ? Math.round(frameworks.reduce((sum, f) => sum + calculateCoverage(f).percentage, 0) / frameworks.length)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header />

            <div className="flex-grow p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Compliance Gap Analysis</h1>
                        <p className="text-gray-400">Track control coverage against framework requirements</p>
                    </div>

                    {/* Overall Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-emerald-400">{frameworks.length}</div>
                            <div className="text-gray-400 text-sm">Frameworks Tracked</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-blue-400">{totalMappings}</div>
                            <div className="text-gray-400 text-sm">Total Mappings</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-purple-400">{avgCoverage}%</div>
                            <div className="text-gray-400 text-sm">Avg Coverage</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-yellow-400">
                                {frameworks.filter(f => calculateCoverage(f).status === 'ready').length}
                            </div>
                            <div className="text-gray-400 text-sm">Audit Ready</div>
                        </div>
                    </div>

                    {/* Framework Gap Analysis Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {frameworks.map((framework) => {
                            const coverage = calculateCoverage(framework);

                            return (
                                <div
                                    key={framework.id}
                                    className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-emerald-500/50 transition-all"
                                >
                                    {/* Framework Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{framework.name}</h3>
                                            <p className="text-sm text-gray-400">Version {framework.version}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(coverage.status)}`}>
                                            {getStatusLabel(coverage.status)}
                                        </span>
                                    </div>

                                    {/* Coverage Progress Bar */}
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-300">Coverage</span>
                                            <span className="text-lg font-bold text-white">{coverage.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${coverage.percentage >= 80 ? 'bg-green-500' :
                                                    coverage.percentage >= 50 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}
                                                style={{ width: `${coverage.percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Coverage Details */}
                                    <div className="grid grid-cols-3 gap-4 mb-4">
                                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                                            <div className="text-2xl font-bold text-white">{coverage.total}</div>
                                            <div className="text-xs text-gray-400">Requirements</div>
                                        </div>
                                        <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                                            <div className="text-2xl font-bold text-green-400">{coverage.mapped}</div>
                                            <div className="text-xs text-gray-400">Mapped</div>
                                        </div>
                                        <div className="text-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                            <div className="text-2xl font-bold text-red-400">{coverage.unmapped}</div>
                                            <div className="text-xs text-gray-400">Gaps</div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push('/mapping')}
                                            className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-all text-sm font-medium"
                                        >
                                            Add Mappings
                                        </button>
                                        <button
                                            onClick={() => router.push(`/frameworks/${framework.id}`)}
                                            className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all text-sm font-medium"
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Recommendations */}
                    <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">📊 Recommendations</h2>
                        <div className="space-y-3">
                            {frameworks
                                .filter(f => calculateCoverage(f).status === 'needs-work')
                                .map(f => (
                                    <div key={f.id} className="flex items-center gap-3 text-gray-300">
                                        <span className="text-yellow-400">⚠️</span>
                                        <span>
                                            <strong>{f.name}</strong> needs {calculateCoverage(f).unmapped} more control mappings to reach 50% coverage
                                        </span>
                                    </div>
                                ))}
                            {frameworks
                                .filter(f => calculateCoverage(f).status === 'in-progress')
                                .map(f => (
                                    <div key={f.id} className="flex items-center gap-3 text-gray-300">
                                        <span className="text-blue-400">ℹ️</span>
                                        <span>
                                            <strong>{f.name}</strong> is {80 - calculateCoverage(f).percentage}% away from audit-ready status
                                        </span>
                                    </div>
                                ))}
                            {frameworks.filter(f => calculateCoverage(f).status === 'ready').length === frameworks.length && (
                                <div className="flex items-center gap-3 text-green-300">
                                    <span className="text-green-400">✅</span>
                                    <span><strong>Excellent!</strong> All frameworks are audit-ready (≥80% coverage)</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
