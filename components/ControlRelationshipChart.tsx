'use client';

import React from 'react';

interface ControlData {
    id: string;
    title: string;
    controlType: string;
    status: string;
    _count?: {
        policyControls: number;
        incidentControls: number;
        auditFindings: number;
        evidences: number;
    };
}

interface Props {
    controls: ControlData[];
}

export default function ControlRelationshipChart({ controls }: Props) {
    // Group controls by type
    const typeGroups = controls.reduce((acc: Record<string, ControlData[]>, control) => {
        const type = control.controlType || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(control);
        return acc;
    }, {});

    const types = Object.keys(typeGroups);

    const getTypeColor = (type: string) => {
        const colors: Record<string, string> = {
            'Preventive': 'from-emerald-500 to-emerald-600',
            'Detective': 'from-blue-500 to-blue-600',
            'Corrective': 'from-purple-500 to-purple-600',
            'Directive': 'from-yellow-500 to-yellow-600',
            'Compensating': 'from-orange-500 to-orange-600',
            'Other': 'from-slate-500 to-slate-600'
        };
        return colors[type] || colors['Other'];
    };

    const getTypeBgColor = (type: string) => {
        const colors: Record<string, string> = {
            'Preventive': 'bg-emerald-500/10 border-emerald-500/20',
            'Detective': 'bg-blue-500/10 border-blue-500/20',
            'Corrective': 'bg-purple-500/10 border-purple-500/20',
            'Directive': 'bg-yellow-500/10 border-yellow-500/20',
            'Compensating': 'bg-orange-500/10 border-orange-500/20',
            'Other': 'bg-slate-500/10 border-slate-500/20'
        };
        return colors[type] || colors['Other'];
    };

    // Calculate stats
    const totalPolicies = controls.reduce((acc, c) => acc + (c._count?.policyControls || 0), 0);
    const totalFindings = controls.reduce((acc, c) => acc + (c._count?.auditFindings || 0), 0);
    const totalEvidence = controls.reduce((acc, c) => acc + (c._count?.evidences || 0), 0);

    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-6">Control Distribution</h3>

            {/* Type Bar Chart */}
            <div className="space-y-3 mb-6">
                {types.map(type => {
                    const count = typeGroups[type].length;
                    const percentage = Math.round((count / controls.length) * 100);
                    return (
                        <div key={type} className="flex items-center gap-3">
                            <div className="w-28 text-sm text-slate-400 font-medium truncate">{type}</div>
                            <div className="flex-1 h-8 bg-slate-800 rounded-lg overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r ${getTypeColor(type)} transition-all flex items-center justify-end pr-2`}
                                    style={{ width: `${Math.max(percentage, 5)}%` }}
                                >
                                    <span className="text-xs font-bold text-white">{count}</span>
                                </div>
                            </div>
                            <div className="w-12 text-right text-xs text-slate-500">{percentage}%</div>
                        </div>
                    );
                })}
            </div>

            {/* Relationship Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/5">
                <div className={`rounded-xl p-4 border ${getTypeBgColor('Preventive')}`}>
                    <div className="text-2xl font-black text-white">{totalPolicies}</div>
                    <div className="text-xs text-slate-400">Policy Links</div>
                </div>
                <div className={`rounded-xl p-4 border ${getTypeBgColor('Detective')}`}>
                    <div className="text-2xl font-black text-white">{totalFindings}</div>
                    <div className="text-xs text-slate-400">Audit Findings</div>
                </div>
                <div className={`rounded-xl p-4 border ${getTypeBgColor('Corrective')}`}>
                    <div className="text-2xl font-black text-white">{totalEvidence}</div>
                    <div className="text-xs text-slate-400">Evidence Items</div>
                </div>
            </div>
        </div>
    );
}
