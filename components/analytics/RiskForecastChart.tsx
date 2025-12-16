'use client';

import { useEffect, useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceArea,
    ReferenceLine
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, RefreshCw } from 'lucide-react';

interface RiskTrend {
    date: string;
    score: number;
    projected?: boolean;
}

interface PredictionData {
    currentScore: number;
    projectedScore: number;
    trend: 'up' | 'down' | 'stable';
    confidence: number;
    dataPoints: RiskTrend[];
}

interface RiskForecastProps {
    riskId: string;
}

export default function RiskForecastChart({ riskId }: RiskForecastProps) {
    const [data, setData] = useState<PredictionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchForecast();
    }, [riskId]);

    const fetchForecast = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/analytics/predictive/${riskId}`);
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="h-64 animate-pulse bg-slate-900/50 rounded-xl" />;
    if (!data) return <div className="h-64 flex items-center justify-center text-slate-500">No sufficient history for prediction.</div>;

    const trendColor = data.trend === 'down' ? '#10b981' : data.trend === 'up' ? '#ef4444' : '#94a3b8';
    const TrendIcon = data.trend === 'down' ? TrendingDown : data.trend === 'up' ? TrendingUp : Minus;

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Risk Forecast (30 Days)
                        {data.projectedScore > data.currentScore && (
                            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Degrading</span>
                        )}
                        {data.projectedScore < data.currentScore && (
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">Improving</span>
                        )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">AI-driven projection based on historical regression</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-xs text-slate-500 font-mono">CONFIDENCE</div>
                        <div className="text-sm font-bold text-white">{(data.confidence * 100).toFixed(0)}%</div>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 ${data.trend === 'up' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        <TrendIcon className="w-5 h-5" />
                        <span className="text-xl font-black">{data.projectedScore}</span>
                        <span className="text-xs opacity-70">Projected</span>
                    </div>
                </div>
            </div>

            <div className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dataPoints} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={trendColor} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={trendColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickFormatter={formatDate}
                            stroke="#475569"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                        />
                        <YAxis
                            stroke="#475569"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            domain={[0, 25]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                            itemStyle={{ color: '#e2e8f0' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px' }}
                            labelFormatter={(label) => formatDate(label)}
                        />
                        {/* Historical Line */}
                        <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={{ fill: '#6366f1', r: 3, strokeWidth: 0 }}
                            activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                            connectNulls
                        />

                        {/* Reference Line for 'Today' */}
                        <ReferenceLine x={data.dataPoints.find(d => !d.projected && data.dataPoints[data.dataPoints.indexOf(d) + 1]?.projected)?.date} stroke="#475569" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#94a3b8', fontSize: 10 }} />

                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
