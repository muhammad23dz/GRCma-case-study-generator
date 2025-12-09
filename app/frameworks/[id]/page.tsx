'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Requirement {
    id: string;
    requirementId: string;
    title: string;
    description: string;
    category: string;
    priority: string;
}

interface Framework {
    id: string;
    name: string;
    version: string;
    description: string;
    _count?: {
        mappings: number;
    };
}

interface GapAnalysisStats {
    totalRequirements: number;
    mappedRequirements: number;
    unmappedRequirements: number;
    coveragePercentage: number;
}

export default function FrameworkDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [framework, setFramework] = useState<Framework | null>(null);
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [stats, setStats] = useState<GapAnalysisStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchDetails();
        }
    }, [id]);

    const fetchDetails = async () => {
        try {
            const res = await fetch(`/api/frameworks/${id}/requirements`);
            if (res.ok) {
                const data = await res.json();
                setFramework(data.framework);
                setRequirements(data.requirements || []);
                setStats(data.gapAnalysis);
            } else {
                console.error('Failed to load framework details');
            }
        } catch (error) {
            console.error('Error fetching details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading requirements...</div>
            </div>
        );
    }

    if (!framework) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center flex-col">
                <div className="text-white text-xl mb-4">Framework not found</div>
                <button
                    onClick={() => router.push('/gap-analysis')}
                    className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-600"
                >
                    Back to Dashboard
                </button>
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

                    {/* Breadcrumbs / Back */}
                    <button
                        onClick={() => router.back()}
                        className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    {/* Header Details */}
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white">{framework.name}</h1>
                                <span className="px-3 py-1 bg-slate-700 rounded-full text-sm text-emerald-400 border border-emerald-500/30">
                                    Version {framework.version}
                                </span>
                            </div>
                            <p className="text-gray-400 max-w-2xl">{framework.description}</p>
                        </div>
                        <div className="text-right">
                            <button
                                onClick={() => router.push('/mapping')}
                                className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all font-medium shadow-lg"
                            >
                                Manage Mappings
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                                <div className="text-3xl font-bold text-white">{stats.totalRequirements}</div>
                                <div className="text-sm text-gray-400">Total Requirements</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
                                <div className="text-3xl font-bold text-green-400">{stats.mappedRequirements}</div>
                                <div className="text-sm text-gray-400">Mapped Controls</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
                                <div className="text-3xl font-bold text-red-400">{stats.unmappedRequirements}</div>
                                <div className="text-sm text-gray-400">Gaps Identified</div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-purple-400">{stats.coveragePercentage}%</span>
                                    <span className="text-sm text-gray-400 mb-1">Coverage</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${stats.coveragePercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Requirements List */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-6 border-b border-white/10">
                            <h2 className="text-xl font-bold text-white">Framework Requirements</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50 text-gray-400 text-xs uppercase font-medium">
                                    <tr>
                                        <th className="px-6 py-4">ID</th>
                                        <th className="px-6 py-4">Category</th>
                                        <th className="px-6 py-4">Requirement</th>
                                        {/* <th className="px-6 py-4">Status</th> */}
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5 text-sm">
                                    {requirements.map((req) => (
                                        <tr key={req.id} className="hover:bg-slate-700/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-emerald-400 font-medium">
                                                {req.requirementId}
                                            </td>
                                            <td className="px-6 py-4 text-gray-300">
                                                <span className="bg-slate-700 px-2 py-1 rounded text-xs border border-white/10">
                                                    {req.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-white">
                                                <div className="font-medium mb-1">{req.title}</div>
                                                <div className="text-gray-400 text-xs line-clamp-1">{req.description}</div>
                                            </td>
                                            {/* <td className="px-6 py-4">
                                                <span className="text-red-400 text-xs font-medium">Unmapped</span> 
                                                // TODO: Check mapping status per requirement
                                            </td> */}
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => router.push(`/mapping?framework=${framework.id}&requirement=${req.requirementId}`)}
                                                    className="text-gray-400 hover:text-white p-2 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="View Mapping"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {requirements.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                                No requirements found for this framework.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
