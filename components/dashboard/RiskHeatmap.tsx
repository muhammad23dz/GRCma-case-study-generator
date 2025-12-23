'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Download, FileImage, FileText, Loader2, Info, Activity, ShieldAlert, Target } from 'lucide-react';
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Risk {
    id: string;
    narrative: string;
    likelihood: number;
    impact: number;
    score: number;
    category: string;
    _count?: {
        controls?: number;
        evidences?: number;
    };
}

interface RiskHeatmapProps {
    risks: Risk[];
}

interface HeatmapCell {
    likelihood: number;
    impact: number;
    count: number;
    risks: Risk[];
}

const getRiskLevel = (likelihood: number, impact: number): 'low' | 'medium' | 'high' | 'critical' => {
    const score = likelihood * impact;
    if (score >= 15) return 'critical';
    if (score >= 10) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
};

const getCellColor = (likelihood: number, impact: number): string => {
    const level = getRiskLevel(likelihood, impact);
    switch (level) {
        case 'critical': return 'bg-rose-500/30 hover:bg-rose-500/50 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
        case 'high': return 'bg-orange-500/30 hover:bg-orange-500/50 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]';
        case 'medium': return 'bg-amber-500/30 hover:bg-amber-500/50 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
        case 'low': return 'bg-emerald-500/30 hover:bg-emerald-500/50 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
        default: return 'bg-slate-800/50 hover:bg-slate-700/50 border-white/5';
    }
};

export default function RiskHeatmap({ risks }: RiskHeatmapProps) {
    const router = useRouter();
    const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);
    const heatmapRef = useRef<HTMLDivElement>(null);

    const matrix = useMemo(() => {
        const cells: HeatmapCell[] = [];
        for (let l = 1; l <= 5; l++) {
            for (let i = 1; i <= 5; i++) {
                const cellRisks = risks.filter(r => Math.round(r.likelihood) === l && Math.round(r.impact) === i);
                cells.push({ likelihood: l, impact: i, count: cellRisks.length, risks: cellRisks });
            }
        }
        return cells;
    }, [risks]);

    const getCell = (likelihood: number, impact: number) => {
        return matrix.find(c => c.likelihood === likelihood && c.impact === impact);
    };

    const exportToPNG = useCallback(async () => {
        if (!heatmapRef.current) return;
        setIsExporting(true);
        setShowExportMenu(false);
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(heatmapRef.current, {
                backgroundColor: '#0f172a',
                scale: 2,
                logging: false,
            });
            const link = document.createElement('a');
            link.download = `risk-heatmap-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Failed to export PNG:', error);
        } finally {
            setIsExporting(false);
        }
    }, []);

    const exportToPDF = useCallback(async () => {
        if (!heatmapRef.current) return;
        setIsExporting(true);
        setShowExportMenu(false);
        try {
            const [html2canvas, { jsPDF }] = await Promise.all([
                import('html2canvas').then(m => m.default),
                import('jspdf'),
            ]);
            const canvas = await html2canvas(heatmapRef.current, {
                backgroundColor: '#0f172a',
                scale: 2,
                logging: false,
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

            pdf.setFillColor(15, 23, 42); // slate-900
            pdf.rect(0, 0, 297, 210, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(18);
            pdf.text('Risk Heatmap', 10, 15);
            pdf.setFontSize(10);
            pdf.setTextColor(148, 163, 184); // slate-400
            pdf.text(`Generated: ${new Date().toLocaleString()}`, 10, 22);

            const imgWidth = 277;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);

            pdf.save(`risk-heatmap-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (error) {
            console.error('Failed to export PDF:', error);
        } finally {
            setIsExporting(false);
        }
    }, []);

    const sidebarStats = useMemo(() => {
        const byLevel = {
            low: risks.filter(r => getRiskLevel(r.likelihood, r.impact) === 'low').length,
            medium: risks.filter(r => getRiskLevel(r.likelihood, r.impact) === 'medium').length,
            high: risks.filter(r => getRiskLevel(r.likelihood, r.impact) === 'high').length,
            critical: risks.filter(r => getRiskLevel(r.likelihood, r.impact) === 'critical').length,
        };
        const byCategory = risks.reduce((acc, r) => {
            acc[r.category] = (acc[r.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return { byLevel, byCategory };
    }, [risks]);

    return (
        <div className="space-y-8 p-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <Activity className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-xs text-slate-400 font-black tracking-[0.2em] uppercase">Executive Intelligence</span>
                    </div>
                    <h3 className="text-xl font-black text-white tracking-tight">Risk Distribution Nexus</h3>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowExportMenu(!showExportMenu)}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all border border-white/10 disabled:opacity-50 shadow-lg backdrop-blur-md group"
                    >
                        {isExporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3 group-hover:scale-110 transition-transform" />}
                        Intelligence Export
                    </button>

                    <AnimatePresence>
                        {showExportMenu && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute right-0 mt-3 w-56 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
                            >
                                <button onClick={exportToPNG} className="w-full flex items-center gap-3 px-5 py-4 text-left text-slate-300 hover:bg-white/10 transition-colors group">
                                    <FileImage className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                                    <div className="text-xs font-black uppercase tracking-wider">Export Snapshot (PNG)</div>
                                </button>
                                <button onClick={exportToPDF} className="w-full flex items-center gap-3 px-5 py-4 text-left text-slate-300 hover:bg-white/10 transition-colors border-t border-white/5 group">
                                    <FileText className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                                    <div className="text-xs font-black uppercase tracking-wider">Formal Report (PDF)</div>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    <div ref={heatmapRef} className="bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl relative overflow-hidden group">
                        {/* Background Glow */}
                        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-1000" />

                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-2">
                                <Target className="w-4 h-4 text-emerald-400" />
                                <span className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase">Impact vs Likelihood Matrix</span>
                            </div>
                            <div className="flex items-center gap-4 text-[9px] font-black tracking-widest uppercase">
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-emerald-500/40 rounded-full" /> <span className="text-slate-500">Minimal</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-amber-500/40 rounded-full" /> <span className="text-slate-500">Moderate</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-orange-500/40 rounded-full" /> <span className="text-slate-500">Elevated</span></div>
                                <div className="flex items-center gap-1.5"><div className="w-2 h-2 bg-rose-500/40 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.4)]" /> <span className="text-slate-400 font-black">Critical</span></div>
                            </div>
                        </div>

                        <div className="relative ml-8 z-10">
                            <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-black tracking-[0.3em] text-slate-600 uppercase">Likelihood Priority</div>

                            <div className="grid grid-rows-5 gap-3">
                                {[5, 4, 3, 2, 1].map(l => (
                                    <div key={l} className="flex gap-3">
                                        <div className="w-8 flex items-center justify-end text-[10px] font-black text-slate-500 pr-2">{l}</div>
                                        {[1, 2, 3, 4, 5].map(i => {
                                            const cell = getCell(l, i);
                                            return (
                                                <motion.button
                                                    whileHover={{ scale: 1.05, zIndex: 20 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    key={`${l}-${i}`}
                                                    onClick={() => cell && cell.count > 0 && setSelectedCell(cell)}
                                                    className={cn(
                                                        "flex-1 aspect-square rounded-2xl border transition-all duration-300 flex items-center justify-center relative group/cell",
                                                        getCellColor(l, i),
                                                        cell?.count ? 'cursor-pointer' : 'cursor-default opacity-10 grayscale'
                                                    )}
                                                >
                                                    {cell && cell.count > 0 && (
                                                        <span className="text-white font-black text-sm drop-shadow-md">
                                                            {cell.count}
                                                        </span>
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-white/10 to-transparent opacity-0 group-hover/cell:opacity-100 transition-opacity rounded-b-2xl" />
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                ))}
                                <div className="flex gap-3 mt-3">
                                    <div className="w-8" />
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="flex-1 text-center text-[10px] font-black text-slate-500">{i}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="text-center text-[10px] font-black tracking-[0.3em] text-slate-600 mt-6 uppercase">Impact Magnitude</div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/5 min-h-[160px] shadow-xl relative overflow-hidden group">
                        <div className="absolute -right-10 -top-10 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full" />

                        <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-6 flex items-center gap-2 relative z-10">
                            <Info className="w-3 h-3" />
                            {selectedCell ? 'Intelligence Details' : 'Contextual Insights'}
                        </h4>

                        <div className="relative z-10">
                            {selectedCell ? (
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                    {selectedCell.risks.map(risk => (
                                        <button
                                            key={risk.id}
                                            onClick={() => router.push(`/risks`)}
                                            className="w-full p-4 bg-white/[0.03] hover:bg-white/[0.08] rounded-2xl text-left border border-white/5 transition-all group/item hover:-translate-y-0.5"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover/item:scale-150 transition-transform" />
                                                <p className="text-[11px] text-slate-300 font-bold line-clamp-2 leading-relaxed group-hover/item:text-white transition-colors">
                                                    {risk.narrative}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-center opacity-40">
                                    <ShieldAlert className="w-8 h-8 text-slate-700 mb-4" />
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest max-w-[150px] leading-loose">Select a critical nexus to analyze data</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/5 shadow-xl">
                        <h4 className="text-[10px] font-black tracking-[0.2em] uppercase text-slate-500 mb-6">Risk Level Stratification</h4>
                        <div className="space-y-5">
                            {Object.entries(sidebarStats.byLevel).reverse().map(([level, count]) => (
                                <div key={level} className="group">
                                    <div className="flex justify-between items-end text-[10px] font-black tracking-tight mb-2">
                                        <span className="text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <div className={cn(
                                                "w-2 h-2 rounded-full",
                                                level === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' :
                                                    level === 'high' ? 'bg-orange-500' :
                                                        level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                            )} />
                                            {level}
                                        </span>
                                        <span className="text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/5">
                                            {count} ({risks.length ? Math.round((count / risks.length) * 100) : 0}%)
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${risks.length ? (count / risks.length) * 100 : 0}%` }}
                                            transition={{ duration: 1.5, ease: "circOut" }}
                                            className={cn(
                                                "h-full rounded-full transition-all group-hover:brightness-125",
                                                level === 'critical' ? 'bg-rose-500' :
                                                    level === 'high' ? 'bg-orange-500' :
                                                        level === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                                            )}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {showExportMenu && (
                <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
            )}
        </div>
    );
}
