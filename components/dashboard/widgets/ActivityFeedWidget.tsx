"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow } from 'date-fns';
import Link from "next/link";
import {
    ShieldCheck,
    FileText,
    FolderOpen,
    AlertTriangle,
    User,
    Building2,
    BarChart3,
    ClipboardCheck,
    RefreshCw,
    PlusCircle,
    Edit,
    Trash2,
    Eye,
    Upload,
    CheckCircle,
    XCircle,
    Activity
} from "lucide-react";
import { AuditLogEntry } from "@/types/assessment";
import { motion } from "framer-motion";

interface ActivityFeedWidgetProps {
    activities: AuditLogEntry[];
    className?: string;
    limit?: number;
}

const ACTION_ICONS: Record<string, any> = {
    created: PlusCircle,
    updated: Edit,
    deleted: Trash2,
    viewed: Eye,
    exported: Upload,
    approved: CheckCircle,
    rejected: XCircle,
    uploaded: Upload,
    default: RefreshCw,
};

const ENTITY_ICONS: Record<string, any> = {
    Control: ShieldCheck,
    Policy: FileText,
    Evidence: FolderOpen,
    Risk: AlertTriangle,
    User: User,
    Vendor: Building2,
    Framework: BarChart3,
    Assessment: ClipboardCheck,
    default: FileText,
};

const ACTION_COLORS: Record<string, string> = {
    created: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    updated: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    deleted: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    viewed: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
    exported: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    approved: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    rejected: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    uploaded: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    default: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

const ENTITY_PATHS: Record<string, string> = {
    Control: '/controls',
    Policy: '/policies',
    Evidence: '/evidence',
    Risk: '/risks',
    Vendor: '/vendors',
    Framework: '/frameworks',
    Assessment: '/assessments',
    User: '/settings/users',
};

export function ActivityFeedWidget({ activities, className, limit = 5 }: ActivityFeedWidgetProps) {
    if (activities.length === 0) {
        return (
            <div className={cn("text-center py-12 bg-slate-900/40 backdrop-blur-xl rounded-[2rem] border border-white/5", className)}>
                <Activity className="w-10 h-10 mx-auto text-slate-700 mb-4 opacity-30 animate-pulse" />
                <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Silence in the Nexus</p>
                <p className="text-slate-600 text-[10px] mt-1 font-medium">No recent activities detected</p>
            </div>
        );
    }

    const items = activities.slice(0, limit);

    return (
        <div className={cn("space-y-3", className)}>
            {items.map((activity, index) => {
                const actionKey = activity.action.toLowerCase();
                const normalizedAction = Object.keys(ACTION_ICONS).find(k => actionKey.includes(k)) || 'default';

                const ActionIcon = ACTION_ICONS[normalizedAction];
                const EntityIcon = ENTITY_ICONS[activity.entity] || ENTITY_ICONS.default;
                const actionColor = ACTION_COLORS[normalizedAction];
                const entityPath = ENTITY_PATHS[activity.entity];

                return (
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={activity.id}
                        className="group relative flex items-start gap-4 p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-pointer border border-white/5 hover:border-white/10 hover:shadow-xl hover:-translate-x-1"
                    >
                        {/* Status Dot */}
                        <div className={cn(
                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full transition-all opacity-0 group-hover:opacity-100",
                            actionColor.split(' ')[0].replace('text-', 'bg-')
                        )} />

                        {/* Action Icon Bubble */}
                        <div className={cn("p-2.5 rounded-xl shrink-0 mt-0.5 border shadow-inner transition-transform group-hover:scale-110", actionColor)}>
                            <ActionIcon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-1.5">
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-black text-white tracking-tight">
                                        {activity.userName || 'System Intelligence'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                        {activity.action.toLowerCase()}
                                    </span>
                                </div>
                                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter whitespace-nowrap">
                                    {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                </span>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-800/50 px-2 py-1 rounded-lg border border-white/5 transition-colors group-hover:border-white/10 group-hover:bg-slate-800">
                                    <EntityIcon className="w-3 h-3 text-blue-400" />
                                    {entityPath ? (
                                        <Link href={entityPath} className="hover:text-white transition-colors">
                                            {activity.entity}
                                        </Link>
                                    ) : (
                                        <span>{activity.entity}</span>
                                    )}
                                </div>
                                <p className="text-[11px] text-slate-500 font-medium line-clamp-1 italic group-hover:text-slate-300 transition-colors">
                                    {activity.changes || "No change metadata available"}
                                </p>
                            </div>
                        </div>

                        {/* Subtle Right Arrow on Hover */}
                        <div className="flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="w-1.5 h-1.5 border-t-2 border-r-2 border-white/20 rotate-45" />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
