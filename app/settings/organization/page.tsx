'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Settings,
    Shield,
    Clock,
    Lock,
    Save,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

export default function OrganizationSettingsPage() {
    const [settings, setSettings] = useState({
        sessionTtl: 24,
        mfaRequired: false,
        passwordPolicy: 'standard'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        async function fetchSettings() {
            try {
                const res = await fetch('/api/organization/settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.securitySettings) {
                        setSettings(data.securitySettings);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch org settings:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/organization/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ securitySettings: settings })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Organization settings updated successfully' });
            } else {
                setMessage({ type: 'error', text: 'Failed to update settings' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'An unexpected error occurred' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen text-white selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Header */}
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Settings className="w-5 h-5 text-primary" />
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Administration</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                            Organization Settings
                        </h1>
                        <p className="text-lg text-slate-400">
                            Configure platform-wide security and governance policies for your organization.
                        </p>
                    </div>

                    {message && (
                        <div className={`p-4 rounded-xl border flex items-center gap-3 ${message.type === 'success'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            {message.text}
                        </div>
                    )}

                    <div className="grid gap-6">
                        {/* Security Section */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                            <div className="p-6 border-b border-white/5 bg-white/5">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <h2 className="text-xl font-bold">Security & Compliance</h2>
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Session TTL */}
                                <div className="flex items-start justify-between gap-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-slate-400" />
                                            <h3 className="font-bold">Session Expiration</h3>
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            How long a user session remains active before requiring re-authentication.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={settings.sessionTtl}
                                            onChange={(e) => setSettings({ ...settings, sessionTtl: parseInt(e.target.value) })}
                                            className="bg-slate-800 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        >
                                            <option value={1}>1 Hour</option>
                                            <option value={4}>4 Hours</option>
                                            <option value={12}>12 Hours</option>
                                            <option value={24}>24 Hours</option>
                                            <option value={72}>72 Hours</option>
                                            <option value={168}>7 Days</option>
                                        </select>
                                    </div>
                                </div>

                                {/* MFA Enforcement */}
                                <div className="flex items-start justify-between gap-8">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <Lock className="w-4 h-4 text-slate-400" />
                                            <h3 className="font-bold">MFA Enforcement</h3>
                                        </div>
                                        <p className="text-sm text-slate-400">
                                            Require all users in the organization to use Multi-Factor Authentication.
                                        </p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={settings.mfaRequired}
                                            onChange={(e) => setSettings({ ...settings, mfaRequired: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Saving Changes...' : 'Save Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
