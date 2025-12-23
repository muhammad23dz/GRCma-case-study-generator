'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Plug,
    Search,
    CheckCircle,
    XCircle,
    AlertCircle,
    ExternalLink,
    Settings,
    Zap
} from 'lucide-react';

interface Integration {
    provider: string;
    type: string;
    name: string;
    description: string;
    logo: string;
    configured: boolean;
    status: string;
    lastSynced?: string;
    integrationId?: string;
}

interface Summary {
    total: number;
    configured: number;
    active: number;
    errors: number;
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    siem: { label: 'SIEM', color: 'text-purple-400' },
    cloud: { label: 'Cloud', color: 'text-blue-400' },
    identity: { label: 'Identity', color: 'text-emerald-400' },
    ticketing: { label: 'Ticketing', color: 'text-amber-400' },
    communication: { label: 'Communication', color: 'text-pink-400' },
    security: { label: 'Security', color: 'text-red-400' },
    grc: { label: 'GRC', color: 'text-cyan-400' },
};

export default function IntegrationsHubPage() {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [byType, setByType] = useState<Record<string, Integration[]>>({});
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [activeType, setActiveType] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch('/api/integrations/hub');
                if (res.ok) {
                    const data = await res.json();
                    setIntegrations(data.integrations || []);
                    setByType(data.byType || {});
                    setSummary(data.summary || null);
                }
            } catch (error) {
                console.error('Failed to fetch integrations:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const filteredIntegrations = integrations.filter(i => {
        const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
            i.description.toLowerCase().includes(search.toLowerCase());
        const matchesType = !activeType || i.type === activeType;
        return matchesSearch && matchesType;
    });

    const statusIcon = (status: string) => {
        if (status === 'active') return <CheckCircle className="w-4 h-4 text-emerald-400" />;
        if (status === 'error') return <XCircle className="w-4 h-4 text-red-400" />;
        if (status === 'not_configured') return <AlertCircle className="w-4 h-4 text-slate-500" />;
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Plug className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Integrations</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Integration Hub
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl">
                                Connect your security stack: SIEM, Cloud, Identity, and more.
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    {summary && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-white">{summary.total}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Available</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-blue-400">{summary.configured}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Configured</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-emerald-400">{summary.active}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Active</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-red-400">{summary.errors}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Errors</div>
                            </div>
                        </div>
                    )}

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search integrations..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                onClick={() => setActiveType(null)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${!activeType ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                    }`}
                            >
                                All
                            </button>
                            {Object.entries(TYPE_LABELS).map(([type, config]) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveType(type)}
                                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeType === type ? 'bg-primary text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                        }`}
                                >
                                    {config.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Integrations Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-40 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredIntegrations.map(integration => {
                                const typeConfig = TYPE_LABELS[integration.type] || { label: integration.type, color: 'text-slate-400' };

                                return (
                                    <div
                                        key={integration.provider}
                                        className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl font-bold text-white">
                                                {integration.name.charAt(0)}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {statusIcon(integration.status)}
                                                <span className={`text-xs font-medium ${typeConfig.color}`}>
                                                    {typeConfig.label}
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-bold text-white mb-1">{integration.name}</h3>
                                        <p className="text-sm text-slate-500 mb-4">{integration.description}</p>

                                        <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                            {integration.configured ? (
                                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle className="w-3 h-3" />
                                                    Connected
                                                </span>
                                            ) : (
                                                <span className="text-xs text-slate-500">Not configured</span>
                                            )}
                                            <button className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
                                                {integration.configured ? (
                                                    <><Settings className="w-3 h-3" /> Configure</>
                                                ) : (
                                                    <><Zap className="w-3 h-3" /> Connect</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
