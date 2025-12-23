'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    CheckCircle2,
    Clock,
    AlertTriangle,
    ChevronRight,
    Loader2
} from 'lucide-react';

interface Action {
    id: string;
    title: string;
    priority: string;
    status: string;
    dueDate?: string;
}

const PRIORITY_CONFIG: Record<string, { color: string }> = {
    critical: { color: 'text-red-400' },
    high: { color: 'text-orange-400' },
    medium: { color: 'text-amber-400' },
    low: { color: 'text-emerald-400' },
};

export function ActionItemsWidget() {
    const router = useRouter();
    const [actions, setActions] = useState<Action[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchActions() {
            try {
                const res = await fetch('/api/actions?status=open&limit=5');
                const data = await res.json();
                setActions(data.actions || []);
            } catch (error) {
                console.error('Failed to fetch actions:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchActions();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
        );
    }

    if (actions.length === 0) {
        return (
            <div className="text-center py-8">
                <CheckCircle2 className="w-12 h-12 text-emerald-400/30 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">All caught up! No pending actions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {actions.map(action => (
                <div
                    key={action.id}
                    className="group flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => router.push('/actions')}
                >
                    <div className={`w-2 h-2 rounded-full ${PRIORITY_CONFIG[action.priority]?.color.replace('text-', 'bg-')}`} />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{action.title}</p>
                        {action.dueDate && (
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                Due: {new Date(action.dueDate).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
                </div>
            ))}
        </div>
    );
}
