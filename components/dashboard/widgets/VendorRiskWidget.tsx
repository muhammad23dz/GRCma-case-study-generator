"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Building2, AlertTriangle, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface VendorRiskWidgetProps {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    active: number;
    pendingReview: number;
}

export function VendorRiskWidget({
    total,
    critical,
    high,
    medium,
    low,
    active,
    pendingReview
}: VendorRiskWidgetProps) {
    const router = useRouter();
    const criticalityData = useMemo(() => [
        { label: 'Critical', count: critical, color: 'bg-red-500', textColor: 'text-red-400' },
        { label: 'High', count: high, color: 'bg-orange-500', textColor: 'text-orange-400' },
        { label: 'Medium', count: medium, color: 'bg-amber-500', textColor: 'text-amber-400' },
        { label: 'Low', count: low, color: 'bg-emerald-500', textColor: 'text-emerald-400' },
    ], [critical, high, medium, low]);

    if (total === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-8 text-center h-full">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mb-3">
                    <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No vendors configured yet</p>
                <Link href="/vendors" className="text-primary text-sm mt-2 hover:underline">
                    Add your first vendor →
                </Link>
            </div>
        );
    }

    return (
        <div
            onClick={() => router.push('/vendors')}
            className="space-y-6 cursor-pointer group"
        >
            {/* Summary Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-secondary/30 rounded-lg border border-border group-hover:border-primary/30 transition-colors">
                    <p className="text-2xl font-bold text-foreground">{total}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20 group-hover:border-emerald-500/40 transition-colors">
                    <p className="text-2xl font-bold text-emerald-500">{active}</p>
                    <p className="text-xs text-emerald-400">Active</p>
                </div>
                <div className="text-center p-3 bg-amber-500/10 rounded-lg border border-amber-500/20 group-hover:border-amber-500/40 transition-colors">
                    <p className="text-2xl font-bold text-amber-500">{pendingReview}</p>
                    <p className="text-xs text-amber-400">Review</p>
                </div>
            </div>

            {/* Criticality Breakdown Bar */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-muted-foreground">Risk Distribution</p>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-secondary">
                    {criticalityData.map((item, index) => (
                        item.count > 0 && (
                            <motion.div
                                key={item.label}
                                className={cn(item.color)}
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.count / total) * 100}%` }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                title={`${item.label}: ${item.count}`}
                            />
                        )
                    ))}
                </div>
                <div className="flex justify-between mt-3 text-xs">
                    {criticalityData.map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5">
                            <div className={cn("w-2 h-2 rounded-full", item.color)} />
                            <span className="text-muted-foreground">
                                {item.label}: <span className={cn("font-medium", item.textColor)}>{item.count}</span>
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
