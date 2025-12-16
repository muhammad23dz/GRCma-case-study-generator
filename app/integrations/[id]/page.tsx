'use client';

import { useLanguage } from '@/lib/contexts/LanguageContext';
import Header from '@/components/Header';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useState } from 'react';

export default function IntegrationDetailPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;
    const [saving, setSaving] = useState(false);

    // Mock data based on ID
    const integrationName = id ? id.charAt(0).toUpperCase() + id.slice(1) : 'Integration';

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(r => setTimeout(r, 1000));
        setSaving(false);
        alert('Settings saved!');
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <Header />

            <div className="relative z-10 px-8 pt-32 pb-12 max-w-4xl mx-auto">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Hub
                </button>

                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">{integrationName} Configuration</h1>
                        <p className="text-slate-400">Manage connection settings and sync frequency.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" /> Connected
                    </div>
                </div>

                <div className="space-y-6">
                    {/* API Credentials */}
                    <div className="p-6 bg-slate-900/50 border border-white/10 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            Credentials
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">API Key</label>
                                <input
                                    type="password"
                                    placeholder="sk_live_..."
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                                    defaultValue="**********************"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Webhook URL</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={`https://api.ncc-grc.com/webhooks/${id}`}
                                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-3 text-slate-500 font-mono text-sm"
                                    />
                                    <button className="px-4 py-2 bg-slate-800 rounded-lg border border-white/5 hover:bg-slate-700 transition-colors">Copy</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sync Settings */}
                    <div className="p-6 bg-slate-900/50 border border-white/10 rounded-2xl">
                        <h2 className="text-xl font-semibold mb-6">Sync Settings</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <div>
                                    <div className="font-medium text-white">Auto-Sync</div>
                                    <div className="text-sm text-slate-500">Automatically fetch new data every hour</div>
                                </div>
                                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-emerald-500">
                                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl border border-white/5">
                                <div>
                                    <div className="font-medium text-white">Import Historical Data</div>
                                    <div className="text-sm text-slate-500">Fetch data from the last 90 days</div>
                                </div>
                                <button className="text-sm text-emerald-400 hover:text-emerald-300 font-medium">Configure</button>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 mt-8">
                        <button className="px-6 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
