'use client';

import {
    FileIcon,
    FileText,
    Download,
    Trash2,
    ExternalLink,
    Link as LinkIcon,
    Clock,
    CheckCircle,
    AlertCircle,
    MoreVertical
} from 'lucide-react';

interface Evidence {
    id: string;
    fileName: string;
    fileUrl: string;
    evidenceType: string;
    status: string;
    timestamp: string;
    control?: { title: string };
    risk?: { title: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    draft: { label: 'Draft', color: 'text-slate-400', icon: Clock },
    pending: { label: 'Pending Review', color: 'text-amber-400', icon: Clock },
    approved: { label: 'Approved', color: 'text-emerald-400', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'text-red-400', icon: AlertCircle },
};

export function EvidenceList({ evidence }: { evidence: Evidence[] }) {
    if (evidence.length === 0) {
        return (
            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
                    <FileIcon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Evidence vault is empty</h3>
                <p className="text-slate-400 max-w-sm mx-auto">
                    No files have been collected yet. Upload relevant documents or link external proofs to maintain compliance.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evidence.map((item) => (
                <div
                    key={item.id}
                    className="group bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:bg-slate-800/60 transition-all border-l-4 border-l-transparent hover:border-l-primary"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-white/5 rounded-xl group-hover:bg-primary/20 transition-colors">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div className="flex items-center gap-1">
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                                <Download className="w-4 h-4" />
                            </button>
                            <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <h4 className="text-sm font-bold text-white mb-1 truncate" title={item.fileName}>
                        {item.fileName}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mb-4">
                        {item.evidenceType}
                    </p>

                    <div className="space-y-3 mb-4">
                        {item.control && (
                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                <LinkIcon className="w-3 h-3 text-primary/60" />
                                <span className="truncate">Control: {item.control.title}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>Uploaded: {new Date(item.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            {(() => {
                                const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft;
                                const Icon = cfg.icon;
                                return (
                                    <>
                                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                                        <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
                                            {cfg.label}
                                        </span>
                                    </>
                                );
                            })()}
                        </div>
                        <button className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                            View Details <ExternalLink className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
