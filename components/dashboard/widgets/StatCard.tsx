import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    variant?: "brand" | "green" | "blue" | "yellow" | "red" | "purple";
    href?: string;
    trend?: {
        value: number;
        label: string;
        positive: boolean;
    };
}

const VARIANTS = {
    brand: "from-blue-600/20 to-indigo-600/5 text-blue-400 border-blue-500/20 shadow-blue-500/10",
    green: "from-emerald-600/20 to-teal-600/5 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10",
    blue: "from-sky-600/20 to-blue-600/5 text-sky-400 border-sky-500/20 shadow-sky-500/10",
    yellow: "from-amber-600/20 to-orange-600/5 text-amber-400 border-amber-500/20 shadow-amber-500/10",
    red: "from-rose-600/20 to-red-600/5 text-rose-400 border-rose-500/20 shadow-rose-500/10",
    purple: "from-purple-600/20 to-fuchsia-600/5 text-purple-400 border-purple-500/20 shadow-purple-500/10",
};

const ICON_VARIANTS = {
    brand: "bg-blue-500/10 text-blue-400",
    green: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-sky-500/10 text-sky-400",
    yellow: "bg-amber-500/10 text-amber-400",
    red: "bg-rose-500/10 text-rose-400",
    purple: "bg-purple-500/10 text-purple-400",
};

export function StatCard({ title, value, icon: Icon, variant = "brand", href, trend }: StatCardProps) {
    const CardContent = (
        <div className={cn(
            "relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 transition-all duration-300 group backdrop-blur-md",
            "hover:bg-slate-900/60 hover:border-white/10 hover:shadow-2xl hover:-translate-y-1",
            href && "cursor-pointer"
        )}>
            {/* Background Gradient Glow */}
            <div className={cn(
                "absolute -right-8 -top-8 w-24 h-24 blur-3xl opacity-20 transition-opacity group-hover:opacity-40 rounded-full bg-gradient-to-br",
                VARIANTS[variant]
            )} />

            <div className="flex items-center justify-between relative z-10">
                <div className="space-y-1">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-400 transition-colors">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-white tracking-tight group-hover:scale-105 transition-transform origin-left">
                            {value}
                        </span>
                        {trend && (
                            <div className={cn(
                                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                trend.positive
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            )}>
                                {trend.positive ? "▲" : "▼"} {trend.value}%
                            </div>
                        )}
                    </div>
                    {trend && (
                        <p className="text-[10px] text-slate-500 font-medium">
                            {trend.label}
                        </p>
                    )}
                </div>

                <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-inner border border-white/5",
                    ICON_VARIANTS[variant]
                )}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className={cn(
                "absolute bottom-0 left-0 h-1 w-0 transition-all duration-500 group-hover:w-full bg-gradient-to-r",
                VARIANTS[variant]
            )} />
        </div>
    );

    if (href) {
        return <Link href={href} className="block">{CardContent}</Link>;
    }

    return CardContent;
}
