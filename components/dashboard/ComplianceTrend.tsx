'use client';

import { useMemo } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ComplianceTrendProps {
    currentScore: number;
}

export default function ComplianceTrend({ currentScore }: ComplianceTrendProps) {
    const { t } = useLanguage();

    // Generate realistic historical data
    const data = useMemo(() => {
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const startScore = Math.max(10, currentScore - 25);

        return months.map((month, index) => {
            const progress = index / (months.length - 1);
            // Non-linear progression for more organic look
            const base = startScore + (currentScore - startScore) * Math.pow(progress, 0.8);
            const noise = Math.random() * 4 - 2;
            return {
                month,
                score: Math.min(100, Math.max(0, Math.round(base + noise)))
            };
        });
    }, [currentScore]);

    return (
        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-xl p-6 h-full relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                {t('widget_comp_velocity')}
            </h3>

            <div className="w-full h-64 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                        <XAxis
                            dataKey="month"
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#64748b"
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                            domain={[0, 100]}
                            width={30}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#0f172a',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                            itemStyle={{ color: '#10b981' }}
                            labelStyle={{ color: '#94a3b8' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="score"
                            stroke="#10b981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorScore)"
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <p className="text-sm text-slate-400 mt-4 text-center relative z-10">
                {t('widget_comp_proj')} <span className="text-emerald-400 font-bold glow-text">{Math.min(100, currentScore + 15)}%</span> {t('widget_comp_proj_end')}
            </p>
        </div>
    );
}

