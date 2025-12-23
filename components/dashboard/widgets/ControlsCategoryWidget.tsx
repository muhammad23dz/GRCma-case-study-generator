"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

interface ControlsCategoryWidgetProps {
    data: Record<string, number>;
    total: number;
}

export function ControlsCategoryWidget({ data, total }: ControlsCategoryWidgetProps) {
    const router = useRouter();
    // Sort categories by count (descending) and take top 6
    const categories = Object.entries(data)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6);

    if (categories.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                <p>No controls categorized yet.</p>
            </div>
        );
    }

    return (
        <div
            onClick={() => router.push('/controls')}
            className="space-y-4 cursor-pointer group"
        >
            {categories.map(([category, count], index) => {
                const percentage = Math.round((count / (total || 1)) * 100);
                return (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-foreground capitalize group-hover:text-primary transition-colors">
                                {category.replace(/_/g, ' ')}
                            </span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">{count}</span>
                                {index === 0 && <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                            </div>
                        </div>
                        <div className="w-full h-2 bg-secondary/50 rounded-full overflow-hidden">
                            <motion.div
                                className={cn(
                                    "h-full rounded-full",
                                    index === 0 ? "bg-primary" :
                                        index === 1 ? "bg-blue-500" :
                                            index === 2 ? "bg-emerald-500" : "bg-slate-500"
                                )}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}
