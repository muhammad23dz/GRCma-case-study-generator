'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { useRouter } from 'next/navigation';

export default function IntegrationsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const integrations = [
        { id: 'aws', name: 'AWS', category: 'Infrastructure', icon: '☁️', connected: false },
        { id: 'github', name: 'GitHub', category: 'Version Control', icon: '🐙', connected: true },
        { id: 'jira', name: 'Jira', category: 'Ticketing', icon: '🎫', connected: false },
        { id: 'slack', name: 'Slack', category: 'Communication', icon: '💬', connected: false },
        { id: 'google', name: 'Google Workspace', category: 'Identity', icon: '🔍', connected: true },
        { id: 'azure', name: 'Azure', category: 'Infrastructure', icon: '🔷', connected: false },
        { id: 'okta', name: 'Okta', category: 'Identity', icon: '⭕', connected: false },
        { id: 'vanta', name: 'Vanta Import', category: 'Migration', icon: '📦', connected: false },
    ];

    const filtered = integrations.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Integrations</h1>
                            <p className="text-gray-400">Automate evidence collection by connecting your tools.</p>
                        </div>
                        <input
                            type="text"
                            placeholder="Search integrations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 w-64 backdrop-blur-sm"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {filtered.map(tool => (
                            <div key={tool.id} className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="text-4xl">{tool.icon}</div>
                                    {tool.connected ? (
                                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-bold border border-emerald-500/30">
                                            CONNECTED
                                        </span>
                                    ) : (
                                        <span className="bg-slate-700 text-gray-400 px-2 py-1 rounded text-xs">
                                            Available
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-white mb-1">{tool.name}</h3>
                                <p className="text-sm text-gray-400 mb-6">{tool.category}</p>

                                <button
                                    className={`w-full py-2 rounded-lg font-medium transition-colors ${tool.connected
                                            ? 'bg-slate-700 text-white cursor-default'
                                            : 'bg-white text-slate-900 hover:bg-gray-100'
                                        }`}
                                >
                                    {tool.connected ? 'Manage' : 'Connect'}
                                </button>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-8 bg-slate-800/30 rounded-2xl border border-dashed border-white/10 text-center">
                        <h3 className="text-xl font-bold text-white mb-2">Don't see your tool?</h3>
                        <p className="text-gray-400 mb-6">We support custom webhooks and API integrations.</p>
                        <button className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
                            Request Integration &rarr;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
