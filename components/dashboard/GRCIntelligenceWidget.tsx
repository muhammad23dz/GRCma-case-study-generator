'use client';

import { useState } from 'react';
import {
    Brain,
    Sparkles,
    AlertTriangle,
    Shield,
    FileText,
    Search,
    Zap,
    ArrowRight,
    Loader2,
    CheckCircle,
    TrendingUp
} from 'lucide-react';
import Link from 'next/link';

interface QuickAction {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
    color: string;
    href: string;
}

const quickActions: QuickAction[] = [
    {
        id: 'risk-analysis',
        title: 'Analyze Risk',
        description: 'AI-powered risk scoring',
        icon: AlertTriangle,
        color: 'from-red-500 to-orange-500',
        href: '/intelligence?tab=risk',
    },
    {
        id: 'suggest-controls',
        title: 'Suggest Controls',
        description: 'Get AI recommendations',
        icon: Shield,
        color: 'from-emerald-500 to-teal-500',
        href: '/intelligence?tab=controls',
    },
    {
        id: 'draft-policy',
        title: 'Draft Policy',
        description: 'AI policy generation',
        icon: FileText,
        color: 'from-blue-500 to-indigo-500',
        href: '/intelligence?tab=policy',
    },
    {
        id: 'gap-analysis',
        title: 'Gap Analysis',
        description: 'Compliance assessment',
        icon: TrendingUp,
        color: 'from-purple-500 to-pink-500',
        href: '/intelligence?tab=gaps',
    },
];

export default function GRCIntelligenceWidget() {
    const [isHovered, setIsHovered] = useState<string | null>(null);

    return (
        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 relative overflow-hidden">
            {/* Animated background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/25">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">GRC Intelligence</h3>
                        <p className="text-xs text-slate-400">AI-Powered Analysis</p>
                    </div>
                </div>
                <Link
                    href="/intelligence"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 hover:text-white transition-all group"
                >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Open Studio
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
            </div>

            {/* Quick Actions Grid */}
            <div className="relative z-10 grid grid-cols-2 gap-3">
                {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.id}
                            href={action.href}
                            onMouseEnter={() => setIsHovered(action.id)}
                            onMouseLeave={() => setIsHovered(null)}
                            className={`group relative p-4 rounded-xl border transition-all duration-300 ${isHovered === action.id
                                    ? 'bg-white/10 border-white/20 scale-[1.02]'
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}
                        >
                            {/* Gradient overlay on hover */}
                            <div
                                className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}
                            />

                            <div className="relative z-10">
                                <div className={`p-2 bg-gradient-to-br ${action.color} rounded-lg w-fit mb-3 shadow-lg`}>
                                    <Icon className="w-4 h-4 text-white" />
                                </div>
                                <div className="font-semibold text-white text-sm mb-1">{action.title}</div>
                                <div className="text-xs text-slate-400">{action.description}</div>
                            </div>

                            {/* Arrow indicator */}
                            <ArrowRight
                                className={`absolute bottom-4 right-4 w-4 h-4 text-slate-500 transition-all duration-300 ${isHovered === action.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                                    }`}
                            />
                        </Link>
                    );
                })}
            </div>

            {/* Status bar */}
            <div className="relative z-10 mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                    <span className="text-xs text-slate-400">AI Engine Ready</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    Powered by LLM
                </div>
            </div>
        </div>
    );
}
