'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, RefreshCw, Smartphone, Server, Github, Slack, Cloud } from 'lucide-react';


import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function IntegrationsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [integrations, setIntegrations] = useState([
        { id: 'aws', name: 'AWS', category: 'Infrastructure', icon: <Cloud className="w-8 h-8 text-orange-400" />, connected: false },
        { id: 'github', name: 'GitHub', category: 'Version Control', icon: <Github className="w-8 h-8 text-white" />, connected: false },
        { id: 'jira', name: 'Jira', category: 'Ticketing', icon: <div className="text-3xl">🎫</div>, connected: false },
        { id: 'slack', name: 'Slack', category: 'Communication', icon: <Slack className="w-8 h-8 text-purple-400" />, connected: false },
        { id: 'google', name: 'Google Workspace', category: 'Identity', icon: <div className="text-3xl">🔍</div>, connected: true },
        { id: 'azure', name: 'Azure', category: 'Infrastructure', icon: <div className="text-3xl">🔷</div>, connected: false },
        { id: 'okta', name: 'Okta', category: 'Identity', icon: <div className="text-3xl">⭕</div>, connected: false },
        { id: 'vanta', name: 'Vanta Import', category: 'Migration', icon: <div className="text-3xl">📦</div>, connected: false },
    ]);
    const [syncing, setSyncing] = useState<string | null>(null);

    // Load state from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ncc_integrations');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setIntegrations(prev => prev.map(p => {
                    const savedItem = parsed.find((i: any) => i.id === p.id);
                    return savedItem ? { ...p, connected: savedItem.connected } : p;
                }));
            } catch (e) {
                console.error('Failed to parse saved integrations', e);
            }
        }
    }, []);

    // Save state changes
    useEffect(() => {
        localStorage.setItem('ncc_integrations', JSON.stringify(integrations.map(i => ({ id: i.id, connected: i.connected }))));
    }, [integrations]);

    const toggleConnection = async (id: string, name: string) => {
        const integration = integrations.find(i => i.id === id);

        if (integration?.connected) {
            // Disconnect flow
            if (confirm(`Are you sure you want to disconnect ${name}?`)) {
                setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: false } : i));
            }
        } else {
            // Connect flow simulation
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: true } : i));
            alert(`Successfully connected to ${name}`);
        }
    };

    const syncIntegration = async (id: string) => {
        if (syncing) return;
        setSyncing(id);

        // Simulate sync
        await new Promise(resolve => setTimeout(resolve, 2000));

        setSyncing(null);
        alert('Sync completed successfully!');
    };

    const filtered = integrations.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <Header />

            <div className="relative z-10 px-8 pt-32 pb-12 max-w-7xl mx-auto">
                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                            {t('int_title')}
                        </h1>
                        <p className="text-slate-400 max-w-xl">
                            {t('int_sub')}
                        </p>
                    </div>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder={t('int_search_placeholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filtered.map(tool => (
                        <div key={tool.id} className="group relative bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 transition-all hover:shadow-2xl hover:shadow-emerald-500/5">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-slate-800/50 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    {tool.icon}
                                </div>
                                <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${tool.connected
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-800 text-slate-500 border-white/5'
                                    }`}>
                                    {tool.connected ? t('int_status_active') : t('int_status_not_connected')}
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">{tool.name}</h3>
                                <p className="text-sm text-slate-500">{tool.category}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleConnection(tool.id, tool.name)}
                                    className={`flex-1 py-2 rounded-lg font-bold text-sm transition-all ${tool.connected
                                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                                        : 'bg-white text-slate-950 hover:bg-emerald-400 hover:text-slate-950 hover:shadow-lg hover:shadow-emerald-500/20'
                                        }`}
                                >
                                    {tool.connected ? t('int_btn_disconnect') : t('int_btn_connect')}
                                </button>
                                {tool.connected && (
                                    <>
                                        <button
                                            onClick={() => router.push(`/integrations/${tool.id}`)}
                                            className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 border border-white/5 transition-colors font-medium text-sm"
                                        >
                                            Configure
                                        </button>
                                        <button
                                            onClick={() => syncIntegration(tool.id)}
                                            disabled={!!syncing}
                                            className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 hover:text-white border border-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Sync now"
                                        >
                                            <RefreshCw className={`w-5 h-5 ${syncing === tool.id ? 'animate-spin text-emerald-400' : ''}`} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-8 bg-slate-900/30 rounded-2xl border border-dashed border-white/10 flex flex-col items-center justify-center text-center hover:bg-slate-900/50 transition-colors group cursor-pointer">
                    <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Server className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{t('int_custom_title')}</h3>
                    <p className="text-slate-400 mb-6 max-w-md">{t('int_custom_desc')}</p>
                    <button onClick={() => router.push('/admin/settings')} className="text-emerald-400 font-bold hover:text-emerald-300 hover:translate-x-1 transition-all flex items-center gap-1">
                        {t('int_custom_btn')} &rarr;
                    </button>
                </div>
            </div>
        </div>
    );
}
