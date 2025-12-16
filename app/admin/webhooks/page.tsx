'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function WebhooksPage() {
    const router = useRouter();
    const [webhooks, setWebhooks] = useState([
        { id: '1', url: 'https://api.slack.com/webhook/xyz', events: ['incident.created'], active: true },
        { id: '2', url: 'https://security-tool.internal/alert', events: ['risk.critical'], active: false }
    ]);
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header />

            <div className="flex-grow p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Webhooks</h1>
                            <p className="text-gray-400">Configure event notifications for external systems</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-500 hover:to-indigo-500 transition-all"
                        >
                            + New Webhook
                        </button>
                    </div>

                    <div className="space-y-4">
                        {webhooks.map((hook) => (
                            <div key={hook.id} className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`w-3 h-3 rounded-full ${hook.active ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                        <code className="text-white font-mono bg-slate-900 px-2 py-1 rounded">{hook.url}</code>
                                    </div>
                                    <div className="flex gap-2">
                                        {hook.events.map(ev => (
                                            <span key={ev} className="text-xs text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                                                {ev}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <button className="text-gray-400 hover:text-white">Edit</button>
                                    <button className="text-red-400 hover:text-red-300">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-200 text-sm">
                        Note: Webhook delivery is currently in beta. Events are queued but retry logic is minimal.
                    </div>

                </div>
            </div>
        </div>
    );
}
