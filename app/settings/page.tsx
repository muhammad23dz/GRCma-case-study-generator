'use client';

import { useState, useEffect } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import PageTransition from '@/components/PageTransition';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { Shield, Lock, Bell, Users, Layout, Globe, Activity, Download, Trash, RefreshCw, Key, ShieldCheck, Mail, Siren, Database, Clock, ChevronRight, Menu, X, Plus, ExternalLink, Settings as SettingsIcon, LogOut, CheckCircle, CheckCircle2, AlertTriangle, FileText, Zap, Plug, Building2, User } from 'lucide-react';
import { useGRCData } from '@/lib/contexts/GRCDataContext';
import { AuditLogEntry } from '@/types/assessment';
import {
    getUserFullSettings,
    updateNotificationStub,
    updateComplianceSetting,
    updateDefaultFrameworks,
    toggleMFA,
    updateSessionTimeout,
    updateDataRetention,
    exportUserData,
    toggleIntegration,
    getSessions,
    deleteAccount,
    updateOrganizationSecuritySettings
} from './actions';
import Link from 'next/link';

const SETTINGS_GROUPED = [
    {
        label: 'Account',
        items: [
            { id: 'profile', label: 'Personal Profile', icon: User },
            { id: 'notifications', label: 'Notifications', icon: Bell },
        ]
    },
    {
        label: 'Security & Access',
        items: [
            { id: 'security', label: 'Security Portal', icon: Shield },
            { id: 'users', label: 'User Management', icon: Users, adminOnly: true },
            { id: 'audit-logs', label: 'Audit Nexus', icon: Activity, adminOnly: true },
        ]
    },
    {
        label: 'Management',
        items: [
            { id: 'organization', label: 'Organization Hub', icon: Layout },
            { id: 'compliance', label: 'Framework Policy', icon: FileText },
            { id: 'integrations', label: 'Integrations', icon: Plug },
            { id: 'data', label: 'Data & Privacy', icon: Database },
        ]
    }
];

const SETTINGS_TABS = SETTINGS_GROUPED.flatMap(g => g.items);

const AVAILABLE_FRAMEWORKS = ['ISO 27001', 'SOC 2', 'NIST CSF', 'GDPR', 'HIPAA', 'PCI DSS'];

export default function SettingsPage() {
    const { t } = useLanguage();
    const router = useRouter();
    const { isLoaded: userLoaded, user } = useUser();
    const { signOut } = useClerk();
    const searchParams = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'profile');
    const { activity: activityLogs, refreshActivity } = useGRCData() as { activity: AuditLogEntry[], refreshActivity: () => void };
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Settings State
    const [notifications, setNotifications] = useState({ email: true, marketing: false, weeklyDigest: true, incidentAlerts: true });
    const [complianceSettings, setComplianceSettings] = useState({
        defaultFrameworks: ['ISO 27001', 'SOC 2'],
        riskAppetite: 'medium',
        controlTestingFrequency: 'quarterly',
        evidenceReviewCycle: 30
    });
    const [securitySettings, setSecuritySettings] = useState({ sessionTimeout: '15' });
    const [orgSecuritySettings, setOrgSecuritySettings] = useState({
        sessionTtl: 24,
        mfaRequired: false,
        passwordPolicy: 'standard'
    });
    const [dataSettings, setDataSettings] = useState({ retention: '3years' });
    const [integrationSettings, setIntegrationSettings] = useState<Record<string, boolean>>({});
    const [activeSessions, setActiveSessions] = useState<any[]>([]);

    useEffect(() => {
        async function loadSettings() {
            if (!user) return;
            try {
                const data = await getUserFullSettings();
                if (data) {
                    // Clerk status takes precedence for UI
                    setNotifications(prev => ({ ...prev, ...data.notifications }));
                    setComplianceSettings(prev => ({ ...prev, ...data.compliance }));
                    setSecuritySettings(prev => ({ ...prev, ...data.security }));
                    setDataSettings(prev => ({ ...prev, ...data.data }));
                    setIntegrationSettings(data.integrations || {});
                    if (data.organizationSecuritySettings) {
                        setOrgSecuritySettings(data.organizationSecuritySettings);
                    }
                }

                // Fetch real sessions from Clerk
                if ((user as any).getSessions) {
                    const sessions = await (user as any).getSessions();
                    setActiveSessions(sessions.map((s: any) => ({
                        id: s.id,
                        device: (s as any).browserName ? `${(s as any).browserName} on ${(s as any).osName}` : 'Unknown Device',
                        ipAddress: (s as any).ipAddress || 'Unknown IP',
                        lastActive: s.lastActiveAt.toISOString(),
                        isCurrent: s.id === (user as any).lastActiveSessionId
                    })));
                }
            } catch (err) {
                console.error("Failed to load settings", err);
            } finally {
                setLoading(false);
            }
        }
        if (userLoaded && user) {
            loadSettings();
        } else if (userLoaded && !user) {
            setLoading(false);
        }
    }, [userLoaded, user]);

    const handleOrgSecurityChange = async (newSettings: any) => {
        const updated = { ...orgSecuritySettings, ...newSettings };
        setOrgSecuritySettings(updated);
        setSaving(true);
        await updateOrganizationSecuritySettings(updated);
        setSaving(false);
    };

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

    // handleToggleMFA removed - MFA managed via Clerk

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

    const handleIntegrationToggle = async (name: string) => {
        const key = name.replace(/\s+/g, '_');
        const newState = !integrationSettings[key];
        setIntegrationSettings(prev => ({ ...prev, [key]: newState }));
        // Optimistic update done, trigger save
        await toggleIntegration(name, newState);
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm(
            "WARNING: This will permanently delete your account and all associated GRC data (assessments, risks, controls, etc.). This action CANNOT be undone.\n\nAre you sure you want to proceed?"
        );

        if (!confirmed) return;

        setSaving(true);
        try {
            const result = await deleteAccount();
            if (result.success) {
                alert("Your account and data have been successfully deleted.");
                await signOut();
            } else {
                alert("Error: " + (result.error || "Failed to delete account"));
            }
        } catch (err) {
            console.error(err);
            alert("A critical error occurred while deleting your account.");
        } finally {
            setSaving(false);
        }
    };

    if (!userLoaded) return null;

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
                const isMfaActive = user?.twoFactorEnabled;
                return (
                    <div className="space-y-6">
                        <SettingRow title="Multi-Factor Authentication" description="Managed via Clerk Security Portal" icon={<Key className="w-5 h-5 text-orange-400" />}>
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isMfaActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                    {isMfaActive ? 'Enabled' : 'Disabled'}
                                </span>
                                <a
                                    href="https://accounts.clerk.com/user/security/mfa"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition flex items-center gap-2"
                                >
                                    Manage <ExternalLink className="w-3 h-3" />
                                </a>
                            </div>
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

                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Active Sessions</h4>
                            <div className="space-y-3">
                                {activeSessions.map(session => (
                                    <div key={session.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                                <Globe className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{session.device}</p>
                                                <p className="text-xs text-slate-500">{session.ipAddress} • {session.isCurrent ? 'Current Session' : `Last active ${new Date(session.lastActive).toLocaleTimeString()}`}</p>
                                            </div>
                                        </div>
                                        {session.isCurrent && (
                                            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            case 'organization':
                return (
                    <div className="space-y-6">
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-purple-500/20 rounded-2xl">
                                    <Building2 className="w-8 h-8 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Default Organization</h3>
                                    <p className="text-sm text-slate-400">Workspace Governance & Identity</p>
                                </div>
                                <span className="ml-auto bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-emerald-500/30">Active</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Your Role</p>
                                    <p className="font-bold text-emerald-400">{(user?.publicMetadata as any)?.role || 'Admin'}</p>
                                </div>
                                <div className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Subscription</p>
                                    <p className="font-bold text-blue-400">Enterprise Plan</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Organization Security Policy</h4>

                            <SettingRow
                                title="Enforce Organization MFA"
                                description="Require all members to use Multi-Factor Authentication"
                                icon={<Lock className="w-5 h-5 text-red-400" />}
                            >
                                <button
                                    onClick={() => handleOrgSecurityChange({ mfaRequired: !orgSecuritySettings.mfaRequired })}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors ${orgSecuritySettings.mfaRequired ? 'bg-red-500' : 'bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transition-transform ${orgSecuritySettings.mfaRequired ? 'translate-x-6' : 'translate-x-0'}`} />
                                </button>
                            </SettingRow>

                            <SettingRow
                                title="Session Expiration (TTL)"
                                description="Platform-wide session duration policy"
                                icon={<Clock className="w-5 h-5 text-blue-400" />}
                            >
                                <select
                                    value={orgSecuritySettings.sessionTtl}
                                    onChange={(e) => handleOrgSecurityChange({ sessionTtl: parseInt(e.target.value) })}
                                    className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none"
                                >
                                    <option value={1}>1 Hour</option>
                                    <option value={4}>4 Hours</option>
                                    <option value={12}>12 Hours</option>
                                    <option value={24}>24 Hours</option>
                                    <option value={72}>72 Hours</option>
                                    <option value={168}>7 Days</option>
                                </select>
                            </SettingRow>

                            <SettingRow
                                title="Password Complexity"
                                description="Standard organizational password hygiene"
                                icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
                            >
                                <select
                                    value={orgSecuritySettings.passwordPolicy}
                                    onChange={(e) => handleOrgSecurityChange({ passwordPolicy: e.target.value })}
                                    className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none"
                                >
                                    <option value="standard">Standard</option>
                                    <option value="strong">Strong (Mixed Case + Symbols)</option>
                                    <option value="enterprise">Enterprise (Rotating Keys)</option>
                                </select>
                            </SettingRow>
                        </div>

                        <div className="bg-white/5 border border-white/5 rounded-xl p-6 flex items-center justify-between group hover:bg-white/10 transition-all">
                            <div>
                                <h3 className="font-bold mb-1 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-400" />
                                    Advanced Identity Management
                                </h3>
                                <p className="text-xs text-slate-400 max-w-md">Manage user invitations, granular permissions, and access lifecycle for the entire organization.</p>
                            </div>
                            <Link
                                href="/settings/users"
                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2 group-hover:gap-3"
                            >
                                Manage Members <ChevronRight className="w-3 h-3" />
                            </Link>
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
                        <SettingRow title="Control Testing Frequency" description="Default testing schedule for controls" icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />}>
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
                        ].map(int => {
                            const key = int.name.replace(/\s+/g, '_');
                            const isConnected = integrationSettings[key] || false;
                            return (
                                <div key={int.name} className="flex items-center justify-between bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition">
                                    <div className="flex items-center gap-4">
                                        <span className="text-2xl">{int.icon}</span>
                                        <div>
                                            <p className="font-bold">{int.name}</p>
                                            <p className="text-xs text-slate-500">{int.desc}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleIntegrationToggle(int.name)}
                                        className={`px-4 py-2 rounded-lg text-xs font-bold transition ${isConnected ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border border-blue-500/30'}`}
                                    >
                                        {isConnected ? '✓ Connected' : 'Connect'}
                                    </button>
                                </div>
                            );
                        })}
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

                        <div className="mt-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Activity Log</h4>
                            <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                                {activityLogs.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {activityLogs.map((log) => (
                                            <div key={log.id} className="p-4 hover:bg-white/5 transition flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg ${log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        log.action === 'DELETE' ? 'bg-red-500/10 text-red-400' :
                                                            'bg-blue-500/10 text-blue-400'
                                                        }`}>
                                                        <Activity className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium">{log.action} {log.entity}</p>
                                                        <p className="text-xs text-slate-500">by {log.userName} • {new Date(log.timestamp).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                                <p className="text-[10px] font-mono text-slate-600">{log.ipAddress || 'Internal'}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-slate-500 text-sm italic">
                                        No recent activity logged.
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="border-t border-white/10 pt-6 mt-6">
                            <h4 className="text-red-500 font-bold mb-2">Danger Zone</h4>
                            <p className="text-sm text-slate-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={saving}
                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-bold hover:bg-red-500/30 transition disabled:opacity-50"
                            >
                                {saving ? "Processing..." : "Delete Account"}
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
                        <div className="lg:w-72 shrink-0">
                            <div className="sticky top-32 space-y-6">
                                {SETTINGS_GROUPED.map((group, gIdx) => (
                                    <div key={group.label} className="space-y-2">
                                        <h3 className="px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            {group.label}
                                        </h3>
                                        <nav className="bg-slate-900/50 border border-white/5 rounded-2xl p-1.5 space-y-0.5">
                                            {group.items.map(tab => {
                                                const userRole = (user?.publicMetadata as any)?.role || 'user';
                                                const isAdmin = ['admin', 'manager'].includes(userRole.toLowerCase());
                                                if ((tab as any).adminOnly && !isAdmin) return null;

                                                const Icon = tab.icon;
                                                const isActive = activeTab === tab.id;
                                                return (
                                                    <button
                                                        key={tab.id}
                                                        onClick={() => {
                                                            if (tab.id === 'users') router.push('/settings/users');
                                                            else if (tab.id === 'audit-logs') router.push('/settings/audit-logs');
                                                            else setActiveTab(tab.id);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isActive
                                                            ? 'bg-emerald-500/10 text-emerald-400 shadow-lg shadow-emerald-500/5 border border-emerald-500/20'
                                                            : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                            }`}
                                                    >
                                                        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-emerald-500/20' : 'bg-slate-800/50'}`}>
                                                            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                                                        </div>
                                                        {tab.label}
                                                        {isActive && <div className="w-1 h-1 rounded-full bg-emerald-400 ml-auto" />}
                                                    </button>
                                                );
                                            })}
                                        </nav>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl p-8">
                            {/* MFA Enforcement Alert */}
                            {orgSecuritySettings.mfaRequired && user && !user.twoFactorEnabled && (
                                <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <div className="p-2 bg-red-500/20 rounded-xl">
                                        <AlertTriangle className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-red-400">Action Required: MFA Mandatory</h4>
                                        <p className="text-sm text-red-400/70">Your organization requires all members to use Multi-Factor Authentication. Please enable it in the Security portal.</p>
                                    </div>
                                    <button
                                        onClick={() => setActiveTab('security')}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-400 text-white text-xs font-bold rounded-lg transition"
                                    >
                                        Enroll Now
                                    </button>
                                </div>
                            )}

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
