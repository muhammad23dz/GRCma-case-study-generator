"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, TrendingDown, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface ComplianceScoreCardProps {
    score: number;
    previousScore?: number;
    frameworkName?: string;
    implementedControls: number;
    totalControls: number;
    onClick?: () => void;
}

export function ComplianceScoreCard({
    score,
    previousScore,
    frameworkName,
    implementedControls,
    totalControls,
    onClick,
}: ComplianceScoreCardProps) {
    const scoreColor = useMemo(() => {
        if (score >= 80) return "text-emerald-400";
        if (score >= 60) return "text-amber-400";
        if (score >= 40) return "text-orange-400";
        return "text-rose-400";
    }, [score]);

    const progressColor = useMemo(() => {
        if (score >= 80) return "from-emerald-600 to-teal-400";
        if (score >= 60) return "from-amber-600 to-yellow-400";
        if (score >= 40) return "from-orange-600 to-amber-400";
        return "from-rose-600 to-red-400";
    }, [score]);

    const glowColor = useMemo(() => {
        if (score >= 80) return "bg-emerald-500/10";
        if (score >= 60) return "bg-amber-500/10";
        if (score >= 40) return "bg-orange-500/10";
        return "bg-rose-500/10";
    }, [score]);

    const trend = previousScore !== undefined ? score - previousScore : 5; // Placeholder trend if not provided

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-slate-900/40 backdrop-blur-2xl p-8 transition-all duration-500 group shadow-2xl",
                onClick && "cursor-pointer hover:bg-slate-900/60 hover:border-white/10 hover:-translate-y-1"
            )}
        >
            {/* Massive Background Glow */}
            <div className={cn(
                "absolute -right-20 -top-20 w-64 h-64 blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000 rounded-full",
                glowColor
            )} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-8">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                            <Target className="w-3 h-3 text-emerald-400" />
                            Security Posture
                        </div>
                        <h3 className="text-xl font-black text-white tracking-tight mt-2">
                            {frameworkName || "Global Compliance"}
                        </h3>
                    </div>
                    <div className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner border border-white/5 bg-slate-800/50",
                        scoreColor
                    )}>
                        <BarChart3 className="h-7 w-7" />
                    </div>
                </div>

                <div className="flex items-end gap-4 mb-8">
                    <span className={cn("text-7xl font-black tracking-tighter transition-all duration-500 group-hover:scale-105 origin-bottom-left", scoreColor)}>
                        {score}%
                    </span>
                    <div className="flex flex-col mb-2">
                        <div className={cn(
                            "flex items-center text-xs font-black uppercase tracking-widest",
                            trend >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                            {trend >= 0 ? (
                                <TrendingUp className="h-4 w-4 mr-1" />
                            ) : (
                                <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {Math.abs(trend)}% Growth
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Since last month</span>
                    </div>
                </div>

                {/* Advanced Progress visualization */}
                <div className="space-y-4">
                    <div className="h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${score}%` }}
                            transition={{ duration: 1.5, ease: "circOut" }}
                            className={cn("h-full rounded-full shadow-lg relative", progressColor, "bg-gradient-to-r")}
                        >
                            <div className="absolute inset-0 bg-white/20 blur-[2px] rounded-full" />
                            <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/30 rounded-full" />
                        </motion.div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className="text-white font-black">{implementedControls}</span>
                            <span>Controls Active</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                            <span className={scoreColor}>{totalControls - implementedControls}</span>
                            <span>Points Left</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
        </div>
    );
}
