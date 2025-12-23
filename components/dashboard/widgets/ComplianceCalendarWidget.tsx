'use client';

import { useEffect, useState } from 'react';
import {
    Calendar,
    Clock,
    ShieldCheck,
    FileText,
    AlertTriangle,
    Loader2
} from 'lucide-react';

interface Deadline {
    id: string;
    title: string;
    type: 'audit' | 'policy' | 'control_test' | 'review';
    dueDate: string;
}

const TYPE_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
    audit: { icon: ShieldCheck, color: 'text-blue-400', label: 'Audit' },
    policy: { icon: FileText, color: 'text-purple-400', label: 'Policy' },
    control_test: { icon: AlertTriangle, color: 'text-amber-400', label: 'Control Test' },
    review: { icon: Clock, color: 'text-emerald-400', label: 'Review' },
};

export function ComplianceCalendarWidget() {
    const [deadlines, setDeadlines] = useState<Deadline[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDeadlines() {
            try {
                // Mock calendar data - in production this would fetch from a calendar API
                // Combining data from multiple sources: audits, policies, control tests
                const auditsRes = await fetch('/api/audit');
                const auditsData = await auditsRes.json();

                const upcoming: Deadline[] = [];

                // Add audit end dates as deadlines
                (auditsData.audits || []).forEach((audit: any) => {
                    if (audit.endDate && new Date(audit.endDate) > new Date()) {
                        upcoming.push({
                            id: audit.id,
                            title: audit.title,
                            type: 'audit',
                            dueDate: audit.endDate
                        });
                    }
                });

                // Sort by date
                upcoming.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

                setDeadlines(upcoming.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch deadlines:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchDeadlines();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    if (deadlines.length === 0) {
        return (
            <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-600/30 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No upcoming compliance deadlines.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {deadlines.map(deadline => {
                const config = TYPE_CONFIG[deadline.type] || TYPE_CONFIG.review;
                const Icon = config.icon;
                const daysUntil = Math.ceil((new Date(deadline.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

                return (
                    <div
                        key={deadline.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all"
                    >
                        <div className={`p-2 rounded-lg bg-white/5 ${config.color}`}>
                            <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{deadline.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{config.label}</p>
                        </div>
                        <div className="text-right">
                            <p className={`text-xs font-bold ${daysUntil <= 3 ? 'text-red-400' : daysUntil <= 7 ? 'text-amber-400' : 'text-slate-400'}`}>
                                {daysUntil <= 0 ? 'Today' : `${daysUntil}d`}
                            </p>
                            <p className="text-[10px] text-slate-600">
                                {new Date(deadline.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
