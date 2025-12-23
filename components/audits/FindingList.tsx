'use client';

import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    ChevronRight,
    MoreHorizontal,
    FileText,
    User
} from 'lucide-react';

interface Finding {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    dueDate?: string;
    audit?: {
        title: string;
    };
    control?: {
        title: string;
        category: string;
    };
}

const SEVERITY_CONFIG: Record<string, { label: string; color: string; bgColor: string }> = {
    critical: { label: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    major: { label: 'Major', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    minor: { label: 'Minor', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    observation: { label: 'Observation', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    open: { label: 'Open', color: 'text-red-400', icon: AlertTriangle },
    in_progress: { label: 'In Progress', color: 'text-blue-400', icon: Clock },
    resolved: { label: 'Resolved', color: 'text-emerald-400', icon: CheckCircle },
    accepted_risk: { label: 'Risk Accepted', color: 'text-purple-400', icon: XCircle },
};

export function FindingList({ findings }: { findings: Finding[] }) {
    if (findings.length === 0) {
        return (
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No active findings</h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                    Your environment is compliant. No audit findings were identified in recent cycles.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {findings.map((finding) => (
                <div
                    key={finding.id}
                    className="group bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-5 hover:bg-slate-800/60 transition-all cursor-pointer"
                >
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${SEVERITY_CONFIG[finding.severity]?.bgColor} ${SEVERITY_CONFIG[finding.severity]?.color}`}>
                                    {finding.severity}
                                </span>
                                <h4 className="text-md font-bold text-white group-hover:text-primary transition-colors truncate">
                                    {finding.title}
                                </h4>
                            </div>

                            <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                                {finding.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-[11px] text-slate-500 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <FileText className="w-3.5 h-3.5" />
                                    <span>Audit: {finding.audit?.title || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                    <span>Control: {finding.control?.title || 'N/A'}</span>
                                </div>
                                {finding.dueDate && (
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Target: {new Date(finding.dueDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 shrink-0">
                            <div className="flex items-center gap-2">
                                {(() => {
                                    const StatusIcon = STATUS_CONFIG[finding.status]?.icon || AlertTriangle;
                                    return <StatusIcon className={`w-4 h-4 ${STATUS_CONFIG[finding.status]?.color}`} />;
                                })()}
                                <span className={`text-xs font-bold ${STATUS_CONFIG[finding.status]?.color}`}>
                                    {STATUS_CONFIG[finding.status]?.label || finding.status}
                                </span>
                            </div>
                            <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
