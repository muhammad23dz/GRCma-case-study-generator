'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldAlert,
    Server,
    Users2,
    GraduationCap,
    ClipboardList,
    BookMarked,
    Workflow,
    ChevronRight,
    Trash2,
    Loader2,
    AlertTriangle,
    Shield,
    FileText,
    Building2,
    Siren,
    ListChecks
} from 'lucide-react';

interface GigachadWidgetProps {
    bcdrPlans: any[];
    assets: any[];
    employees: any[];
    trainingCourses: any[];
    questionnaires: any[];
    runbooks: any[];
    businessProcesses: any[];
    controls?: any[];
    risks?: any[];
    policies?: any[];
    vendors?: any[];
    incidents?: any[];
    actions?: any[];
    onRefresh?: () => void;
}

const modules = [
    { key: 'bcdrPlans', label: 'BCDR Plans', icon: ShieldAlert, href: '/bcdr', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    { key: 'assets', label: 'Assets', icon: Server, href: '/assets', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { key: 'businessProcesses', label: 'Processes', icon: Workflow, href: '/processes', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { key: 'employees', label: 'Employees', icon: Users2, href: '/employees', color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
    { key: 'trainingCourses', label: 'Training', icon: GraduationCap, href: '/training', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
    { key: 'questionnaires', label: 'Questionnaires', icon: ClipboardList, href: '/questionnaires', color: 'text-pink-400', bgColor: 'bg-pink-500/10' },
    { key: 'runbooks', label: 'Runbooks', icon: BookMarked, href: '/runbooks', color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
];

const coreModules = [
    { key: 'controls', label: 'Controls', icon: Shield, href: '/controls', color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { key: 'risks', label: 'Risks', icon: AlertTriangle, href: '/risks', color: 'text-red-400', bgColor: 'bg-red-500/10' },
    { key: 'policies', label: 'Policies', icon: FileText, href: '/policies', color: 'text-green-400', bgColor: 'bg-green-500/10' },
    { key: 'vendors', label: 'Vendors', icon: Building2, href: '/vendors', color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { key: 'incidents', label: 'Incidents', icon: Siren, href: '/incidents', color: 'text-orange-400', bgColor: 'bg-orange-500/10' },
    { key: 'actions', label: 'Actions', icon: ListChecks, href: '/actions', color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
];

export function GigachadModulesWidget(props: GigachadWidgetProps) {
    const router = useRouter();
    const [deleting, setDeleting] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<string | null>(null);

    const handleDeleteAll = async (moduleKey: string) => {
        setDeleting(moduleKey);
        try {
            const res = await fetch(`/api/bulk/delete?module=${moduleKey}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                const data = await res.json();
                console.log(`Deleted ${data.deleted} items from ${moduleKey}`);
                // Trigger refresh
                props.onRefresh?.();
                window.location.reload(); // Force refresh to update counts
            }
        } catch (error) {
            console.error('Failed to delete:', error);
        } finally {
            setDeleting(null);
            setShowConfirm(null);
        }
    };

    const allModules = [...modules, ...coreModules];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Extended Modules Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-7 gap-4">
                {modules.map(mod => {
                    const Icon = mod.icon;
                    const count = (props as any)[mod.key]?.length || 0;

                    return (
                        <div
                            key={mod.key}
                            className="group relative overflow-hidden bg-slate-900/20 backdrop-blur-xl border border-white/[0.03] hover:border-white/10 rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40"
                        >
                            {/* Accent Glow */}
                            <div className={`absolute -right-4 -top-4 w-12 h-12 blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${mod.bgColor}`} />

                            <div
                                onClick={() => router.push(mod.href)}
                                className="cursor-pointer relative z-10"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-10 h-10 rounded-xl ${mod.bgColor} flex items-center justify-center border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                        <Icon className={`w-5 h-5 ${mod.color}`} />
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                </div>
                                <div className="space-y-0.5">
                                    <div className="text-3xl font-black text-white group-hover:scale-105 transition-transform origin-left">{count}</div>
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors uppercase">{mod.label}</div>
                                </div>
                            </div>

                            {/* Delete All Button */}
                            {count > 0 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowConfirm(mod.key);
                                    }}
                                    className="absolute top-3 right-3 p-1.5 text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100"
                                    title={`Delete all ${mod.label}`}
                                >
                                    {deleting === mod.key ? (
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            )}

                            {/* Bottom Progress/Status Dot */}
                            <div className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-slate-800 group-hover:bg-emerald-500 transition-colors shadow-sm shadow-emerald-500/50" />
                        </div>
                    );
                })}
            </div>

            {/* Core GRC Modules */}
            <div>
                <div className="flex items-center gap-4 mb-6 px-1">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Core GRC Foundations</h4>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                    {coreModules.map(mod => {
                        const Icon = mod.icon;
                        const count = (props as any)[mod.key]?.length || 0;

                        return (
                            <div
                                key={mod.key}
                                className="group relative overflow-hidden bg-slate-900/30 backdrop-blur-xl border border-white/[0.05] hover:border-emerald-500/30 rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1"
                            >
                                <div
                                    onClick={() => router.push(mod.href)}
                                    className="cursor-pointer relative z-10"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-xl ${mod.bgColor} flex items-center justify-center border border-white/5 transition-all duration-500 group-hover:bg-emerald-500/20`}>
                                            <Icon className={`w-5 h-5 ${mod.color} group-hover:text-emerald-400`} />
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="text-3xl font-black text-white">{count}</div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors uppercase">{mod.label}</div>
                                    </div>
                                </div>

                                {/* Delete All Button */}
                                {count > 0 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowConfirm(mod.key);
                                        }}
                                        className="absolute top-3 right-3 p-1.5 text-slate-700 hover:text-red-400 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100"
                                    >
                                        {deleting === mod.key ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Delete All?</h3>
                                <p className="text-sm text-slate-400">
                                    This will delete all {allModules.find(m => m.key === showConfirm)?.label.toLowerCase() || 'items'}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">
                            This action cannot be undone. All data will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(null)}
                                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => showConfirm && handleDeleteAll(showConfirm)}
                                disabled={deleting === showConfirm}
                                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                            >
                                {deleting === showConfirm ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete All
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
