'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Settings, Save, AlertTriangle, CheckCircle, Mail, Server, Shield, Key } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function SettingsPage() {
    const { t } = useLanguage();
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Config State
    const [config, setConfig] = useState({
        SMTP_HOST: '',
        SMTP_PORT: '587',
        SMTP_USER: '',
        SMTP_PASS: '',
        SMTP_SECURE: 'false',
        SMTP_FROM: '',
        NEXTAUTH_URL: ''
    });

    useEffect(() => {
        if (isLoaded) {
            const role = (user?.publicMetadata as any)?.role;
            if (role !== 'admin') {
                router.push('/');
            } else {
                fetchSettings();
            }
        }
    }, [isLoaded, user]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/settings');
            if (res.ok) {
                const data = await res.json();
                const settingsMap = data.settings.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});

                // Pre-fill Logic (Auto-Fill)
                setConfig(prev => ({
                    ...prev,
                    ...settingsMap,
                    // If empty, suggest defaults based on Admin User
                    SMTP_USER: settingsMap.SMTP_USER || user?.primaryEmailAddress?.emailAddress || '',
                    SMTP_HOST: settingsMap.SMTP_HOST || (user?.primaryEmailAddress?.emailAddress?.includes('gmail') ? 'smtp.gmail.com' : ''),
                    SMTP_PORT: settingsMap.SMTP_PORT || (user?.primaryEmailAddress?.emailAddress?.includes('gmail') ? '587' : '587'),
                    SMTP_SECURE: settingsMap.SMTP_SECURE || 'false',
                    SMTP_FROM: settingsMap.SMTP_FROM || `GRCma Admin <${user?.primaryEmailAddress?.emailAddress}>`,
                    NEXTAUTH_URL: settingsMap.NEXTAUTH_URL || window.location.origin
                }));
            }
        } catch (error) {
            console.error('Failed to fetch settings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const updates = Object.entries(config).map(([key, value]) => ({
                key,
                value,
                isSecret: key.includes('PASS') || key.includes('SECRET'),
                description: key
            }));

            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });

            if (res.ok) {
                alert('Settings saved successfully!');
            } else {
                const data = await res.json();
                alert(`Failed to save settings: ${data.error}`);
            }
        } catch (error: any) {
            console.error('Save failed', error);
            alert(`Failed to save settings: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    return (
        <div className="min-h-screen text-white bg-slate-950">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32 max-w-4xl mx-auto">
                <PageTransition>
                    <div className="flex justify-between items-end mb-10">
                        <div>
                            <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
                                <Settings className="w-8 h-8 text-slate-400" />
                                {t('config_title')}
                            </h1>
                            <p className="text-slate-400">{t('config_sub')}</p>
                        </div>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden p-8">
                        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-white/5">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Mail className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">{t('config_email_section')}</h2>
                                <p className="text-slate-400 text-sm">{t('config_email_sub')}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">

                            {/* Auto-Fill Notice */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 text-sm text-blue-300 mb-6">
                                <CheckCircle className="w-5 h-5 shrink-0" />
                                <p>{t('config_auto_fill')}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                                        <Server className="w-3 h-3" /> {t('config_smtp_host')}
                                    </label>
                                    <input
                                        type="text"
                                        value={config.SMTP_HOST}
                                        onChange={e => setConfig({ ...config, SMTP_HOST: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                        placeholder="smtp.gmail.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2">{t('config_smtp_port')}</label>
                                    <input
                                        type="text"
                                        value={config.SMTP_PORT}
                                        onChange={e => setConfig({ ...config, SMTP_PORT: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                        placeholder="587"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                                        <Shield className="w-3 h-3" /> {t('config_sender')}
                                    </label>
                                    <input
                                        type="email"
                                        value={config.SMTP_USER}
                                        onChange={e => setConfig({ ...config, SMTP_USER: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                        placeholder="admin@company.com"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold uppercase text-slate-500 mb-2 flex items-center gap-2">
                                        <Key className="w-3 h-3" /> {t('config_app_pass')}
                                    </label>
                                    <input
                                        type="password"
                                        value={config.SMTP_PASS}
                                        onChange={e => setConfig({ ...config, SMTP_PASS: e.target.value })}
                                        className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                        placeholder={config.SMTP_PASS === '********' ? '********' : 'Enter App Password (Not your Google Password)'}
                                    />
                                    <p className="mt-2 text-xs text-slate-500">
                                        {t('config_app_pass_help')}{' '}
                                        <a href="https://myaccount.google.com/apppasswords" target="_blank" className="text-blue-400 hover:underline">App Password</a>
                                    </p>

                                    {/* Helper Guide */}
                                    <div className="mt-4 p-4 bg-slate-900 border border-white/5 rounded-lg text-sm text-slate-400">
                                        <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center text-xs">G</div>
                                            {t('config_gmail_guide')}
                                        </h4>
                                        <ol className="list-decimal list-inside space-y-1 ml-1 text-xs">
                                            <li>Go to your <a href="https://myaccount.google.com/security" target="_blank" className="text-blue-400 hover:underline">Google Account Security</a> page.</li>
                                            <li>Enable <strong>2-Step Verification</strong> if not valid.</li>
                                            <li>Search for <strong>"App Passwords"</strong> (or scroll to bottom).</li>
                                            <li>Create a new app name (e.g., "GRCma").</li>
                                            <li>Copy the <strong>16-character code</strong> generated.</li>
                                            <li>Paste that code into the <strong>App Password</strong> field above.</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            const res = await fetch('/api/admin/settings/test-email', { method: 'POST', body: JSON.stringify({}) });
                                            const data = await res.json();
                                            if (res.ok) alert('Test Email Sent Successfully to your inbox!');
                                            else alert('Test Failed: ' + data.error);
                                        } catch (e: any) {
                                            alert('Test Error: ' + e.message);
                                        }
                                    }}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-colors"
                                >
                                    {t('config_test_conn')}
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 font-bold flex items-center gap-2 transition-all disabled:opacity-50"
                                >
                                    <Save className="w-5 h-5" />
                                    {saving ? t('config_saving') : t('config_save')}
                                </button>
                            </div>

                        </form>
                    </div>

                </PageTransition>
            </div>
        </div>
    );
}
