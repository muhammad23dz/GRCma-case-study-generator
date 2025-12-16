'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import {
    User, Building2, Shield, Mail, Key, Bell,
    Globe, CheckCircle, Crown, Plug, Database,
    ChevronRight, AlertTriangle, Zap, Clock, FileText, Download
} from 'lucide-react';
import {
    getUserFullSettings,
    updateNotificationStub,
    updateComplianceSetting,
    updateDefaultFrameworks,
    updateSessionTimeout,
    updateDataRetention,
    exportUserData
} from './actions';
import Link from 'next/link';

const SETTINGS_TABS = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'organization', label: 'Organization', icon: Building2 },
    { id: 'compliance', label: 'Compliance', icon: FileText },
    { id: 'integrations', label: 'Integrations', icon: Plug },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'data', label: 'Data & Privacy', icon: Database },
];

const AVAILABLE_FRAMEWORKS = ['ISO 27001', 'SOC 2', 'NIST CSF', 'GDPR', 'HIPAA', 'PCI DSS'];

export default function SettingsPage() {
    const { t } = useLanguage();
    const { user, isLoaded } = useUser();
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings State
    const [notifications, setNotifications] = useState({ email: true, marketing: false, weeklyDigest: true, incidentAlerts: true });
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [complianceSettings, setComplianceSettings] = useState({
        defaultFrameworks: ['ISO 27001', 'SOC 2'],
        riskAppetite: 'medium',
        controlTestingFrequency: 'quarterly',
        evidenceReviewCycle: 30
    });
    const [securitySettings, setSecuritySettings] = useState({ sessionTimeout: '15' });
    const [dataSettings, setDataSettings] = useState({ retention: '3years' });

    useEffect(() => {
        async function loadSettings() {
            if (!user) return;
            try {
                const data = await getUserFullSettings();
                if (data) {
                    setMfaEnabled(data.mfaEnabled);
                    setNotifications(prev => ({ ...prev, ...data.notifications }));
                    setComplianceSettings(prev => ({ ...prev, ...data.compliance }));
                    setSecuritySettings(prev => ({ ...prev, ...data.security }));
                    setDataSettings(prev => ({ ...prev, ...data.data }));
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        }
        if (isLoaded && user) {
            loadSettings();
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [isLoaded, user]);

    // Update URL when tab changes
    useEffect(() => {
        if (tabFromUrl && SETTINGS_TABS.find(t => t.id === tabFromUrl)) {
            setActiveTab(tabFromUrl);
        }
    }, [tabFromUrl]);

    const handleToggleNotification = async (key: keyof typeof notifications) => {
        const newState = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newState }));
        setSaving(true);
        await updateNotificationStub(key, newState);
        setSaving(false);
    };

    const handleFrameworkToggle = async (framework: string) => {
        const current = complianceSettings.defaultFrameworks;
        const updated = current.includes(framework)
            ? current.filter(f => f !== framework)
            : [...current, framework];
        setComplianceSettings(prev => ({ ...prev, defaultFrameworks: updated }));
        setSaving(true);
        await updateDefaultFrameworks(updated);
        setSaving(false);
    };

    const handleComplianceChange = async (key: string, value: string) => {
        setComplianceSettings(prev => ({ ...prev, [key]: value }));
        setSaving(true);
        await updateComplianceSetting(key, value);
        setSaving(false);
    };

    const handleSessionTimeoutChange = async (value: string) => {
        setSecuritySettings(prev => ({ ...prev, sessionTimeout: value }));
        setSaving(true);
        await updateSessionTimeout(value);
        setSaving(false);
    };

    const handleDataRetentionChange = async (value: string) => {
        setDataSettings(prev => ({ ...prev, retention: value }));
        setSaving(true);
        await updateDataRetention(value);
        setSaving(false);
    };

    const handleExportData = async () => {
        setSaving(true);
        const result = await exportUserData();
        if (result.success && result.data) {
            const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `grcma-export-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }
        setSaving(false);
    };

    if (!isLoaded) return null;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-6">
                            <img src={user?.imageUrl} alt={user?.firstName || 'User'} className="w-20 h-20 rounded-full border-4 border-slate-800" />
                            <div>
                                <h3 className="text-xl font-bold">{user?.fullName || 'Guest User'}</h3>
                                <p className="text-slate-400 font-mono text-sm">{user?.primaryEmailAddress?.emailAddress}</p>
                                <p className="text-xs text-slate-500 mt-1">User ID: {user?.id}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <label className="text-xs text-slate-500 uppercase font-bold">Display Name</label>
                                <input type="text" defaultValue={user?.fullName || ''} className="w-full mt-2 bg-slate-950 border border-white/10 rounded-lg px-4 py-2 text-white" readOnly />
                            </div>
                            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                                <label className="text-xs text-slate-500 uppercase font-bold">Email</label>
                                <input type="email" defaultValue={user?.primaryEmailAddress?.emailAddress || ''} disabled className="w-full mt-2 bg-slate-900 border border-white/5 rounded-lg px-4 py-2 text-slate-400 cursor-not-allowed" />
                            </div>
                        </div>
                        <p className="text-xs text-slate-500">Profile details are managed via <a href="https://accounts.clerk.dev" target="_blank" className="text-blue-400 hover:underline">Clerk</a>.</p>
                    </div>
                );
            case 'security':
                return (
                    <div className="space-y-6">
                        <SettingRow title="Multi-Factor Authentication" description="Managed via Clerk Dashboard" icon={<Key className="w-5 h-5 text-orange-400" />}>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${mfaEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                {mfaEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                        </SettingRow>
                        <SettingRow title="Session Timeout" description="Auto-lock after inactivity" icon={<Clock className="w-5 h-5 text-blue-400" />}>
                            <select
                                value={securitySettings.sessionTimeout}
                                onChange={(e) => handleSessionTimeoutChange(e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                            >
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="never">Never</option>
                            </select>
                        </SettingRow>
                        <SettingRow title="API Tokens" description="Manage programmatic access" icon={<Zap className="w-5 h-5 text-purple-400" />}>
                            <Link href="/settings/security" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
                                Manage Tokens →
                            </Link>
                        </SettingRow>
                    </div>
                );
            case 'organization':
                return (
                    <div className="space-y-6">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Building2 className="w-8 h-8 text-purple-400" />
                                <div>
                                    <h3 className="text-lg font-bold">Default Organization</h3>
                                    <p className="text-sm text-slate-400">Your active workspace</p>
                                </div>
                                <span className="ml-auto bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-slate-950/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Role</p>
                                    <p className="font-bold text-emerald-400">{(user?.publicMetadata as any)?.role || 'Admin'}</p>
                                </div>
                                <div className="bg-slate-950/50 p-3 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">Plan</p>
                                    <p className="font-bold text-blue-400">Enterprise</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                            <p className="text-sm text-slate-400">Organization settings are managed by your administrator. Contact support to request changes.</p>
                        </div>
                    </div>
                );
            case 'compliance':
                return (
                    <div className="space-y-6">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                            <h4 className="font-bold mb-3 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-cyan-400" />
                                Default Frameworks
                            </h4>
                            <p className="text-xs text-slate-500 mb-4">Select frameworks to track by default when creating new assessments.</p>
                            <div className="flex flex-wrap gap-2">
                                {AVAILABLE_FRAMEWORKS.map(fw => (
                                    <button
                                        key={fw}
                                        onClick={() => handleFrameworkToggle(fw)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${complianceSettings.defaultFrameworks.includes(fw)
                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                : 'bg-slate-800 text-slate-400 border border-white/5 hover:border-cyan-500/30'
                                            }`}
                                    >
                                        {fw}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <SettingRow title="Risk Appetite" description="Organization risk tolerance level" icon={<AlertTriangle className="w-5 h-5 text-amber-400" />}>
                            <select
                                value={complianceSettings.riskAppetite}
                                onChange={e => handleComplianceChange('riskAppetite', e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                            >
                                <option value="low">Low (Conservative)</option>
                                <option value="medium">Medium (Balanced)</option>
                                <option value="high">High (Aggressive)</option>
                            </select>
                        </SettingRow>
                        <SettingRow title="Control Testing Frequency" description="Default testing schedule for controls" icon={<CheckCircle className="w-5 h-5 text-emerald-400" />}>
                            <select
                                value={complianceSettings.controlTestingFrequency}
                                onChange={e => handleComplianceChange('controlTestingFrequency', e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                            >
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="biannually">Bi-Annually</option>
                                <option value="annually">Annually</option>
                            </select>
                        </SettingRow>
                        <SettingRow title="Evidence Review Cycle" description="Days between evidence reviews" icon={<Clock className="w-5 h-5 text-slate-400" />}>
                            <select
                                value={String(complianceSettings.evidenceReviewCycle)}
                                onChange={e => handleComplianceChange('evidenceReviewCycle', e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                            >
                                <option value="7">7 Days</option>
                                <option value="14">14 Days</option>
                                <option value="30">30 Days</option>
                                <option value="60">60 Days</option>
                                <option value="90">90 Days</option>
                            </select>
                        </SettingRow>
                    </div>
                );
            case 'integrations':
                return (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm mb-4">Connect external tools to enhance your GRC workflows.</p>
                        {[
                            { name: 'Jira', desc: 'Issue tracking & remediation', connected: false, icon: '🎫' },
                            { name: 'Slack', desc: 'Real-time notifications', connected: true, icon: '💬' },
                            { name: 'Microsoft Teams', desc: 'Team collaboration', connected: false, icon: '👥' },
                            { name: 'AWS Security Hub', desc: 'Cloud security posture', connected: false, icon: '☁️' },
                            { name: 'ServiceNow', desc: 'ITSM workflows', connected: false, icon: '🔧' },
                            { name: 'Splunk', desc: 'SIEM integration', connected: false, icon: '📊' },
                        ].map(int => (
                            <div key={int.name} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition">
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl">{int.icon}</span>
                                    <div>
                                        <p className="font-bold">{int.name}</p>
                                        <p className="text-xs text-slate-500">{int.desc}</p>
                                    </div>
                                </div>
                                <button className={`px-4 py-2 rounded-lg text-xs font-bold transition ${int.connected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'}`}>
                                    {int.connected ? '✓ Connected' : 'Connect'}
                                </button>
                            </div>
                        ))}
                        <Link href="/integrations" className="block text-center text-sm text-blue-400 hover:text-blue-300 mt-4">
                            View All Integrations →
                        </Link>
                    </div>
                );
            case 'notifications':
                return (
                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm mb-4">Configure how and when you receive alerts from the platform.</p>
                        <SettingToggle title="Email Alerts" description="Critical risk and incident notifications" enabled={notifications.email} onToggle={() => handleToggleNotification('email')} />
                        <SettingToggle title="Weekly Digest" description="Summary of platform activity every Monday" enabled={notifications.weeklyDigest} onToggle={() => handleToggleNotification('weeklyDigest')} />
                        <SettingToggle title="Incident Alerts" description="Immediate notifications for security incidents" enabled={notifications.incidentAlerts} onToggle={() => handleToggleNotification('incidentAlerts')} />
                        <SettingToggle title="Marketing Communications" description="Product updates, tips, and news" enabled={notifications.marketing} onToggle={() => handleToggleNotification('marketing')} />
                    </div>
                );
            case 'data':
                return (
                    <div className="space-y-6">
                        <SettingRow title="Export Data" description="Download all your organization data as JSON" icon={<Download className="w-5 h-5 text-blue-400" />}>
                            <button
                                onClick={handleExportData}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-500/30 transition disabled:opacity-50"
                            >
                                {saving ? 'Exporting...' : 'Export JSON'}
                            </button>
                        </SettingRow>
                        <SettingRow title="Data Retention Policy" description="How long evidence and logs are stored" icon={<Clock className="w-5 h-5 text-slate-400" />}>
                            <select
                                value={dataSettings.retention}
                                onChange={(e) => handleDataRetentionChange(e.target.value)}
                                className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm"
                            >
                                <option value="1year">1 Year</option>
                                <option value="3years">3 Years</option>
                                <option value="7years">7 Years</option>
                                <option value="forever">Forever</option>
                            </select>
                        </SettingRow>
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                            <p className="text-sm text-amber-400">Note: Data retention changes apply to new data only. Existing data follows the policy at time of creation.</p>
                        </div>
                        <div className="border-t border-white/10 pt-6 mt-6">
                            <h4 className="text-red-500 font-bold mb-2">Danger Zone</h4>
                            <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                            <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-500/30 transition">
                                Delete Account
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen text-slate-100 bg-slate-950">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32 max-w-6xl mx-auto">
                <PageTransition>
                    <div className="mb-8 flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
                                Settings
                            </h1>
                            <p className="text-slate-400 mt-2">Manage your account, security, and platform preferences.</p>
                        </div>
                        {saving && (
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full animate-pulse">
                                Saving...
                            </span>
                        )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar */}
                        <div className="lg:w-64 shrink-0">
                            <nav className="bg-slate-900/50 border border-white/5 rounded-2xl p-2 space-y-1 sticky top-32">
                                {SETTINGS_TABS.map(tab => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                                ? 'bg-white/10 text-white'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                                            {tab.label}
                                            {isActive && <ChevronRight className="w-4 h-4 ml-auto text-emerald-400" />}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl p-8">
                            <h2 className="text-xl font-bold mb-6 flex items-center gap-3">
                                {(() => {
                                    const tab = SETTINGS_TABS.find(t => t.id === activeTab);
                                    const Icon = tab?.icon || User;
                                    return <Icon className="w-5 h-5 text-emerald-400" />;
                                })()}
                                {SETTINGS_TABS.find(t => t.id === activeTab)?.label}
                            </h2>
                            {renderTabContent()}
                        </div>
                    </div>
                </PageTransition>
            </div>
        </div>
    );
}

// Reusable Components
function SettingRow({ title, description, icon, children }: { title: string; description: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-4">
                <div className="p-2 bg-white/5 rounded-lg">{icon}</div>
                <div>
                    <p className="font-medium">{title}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function SettingToggle({ title, description, enabled, onToggle }: { title: string; description: string; enabled: boolean; onToggle: () => void }) {
    return (
        <div className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-4">
            <div>
                <p className="font-medium">{title}</p>
                <p className="text-xs text-slate-500">{description}</p>
            </div>
            <button onClick={onToggle} className={`w-12 h-6 rounded-full p-1 transition-colors ${enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}
