'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Mail, Target, Users, Play, Pause, BarChart3, AlertTriangle,
    Plus, Eye, Trash2, Clock, CheckCircle, XCircle, TrendingUp
} from 'lucide-react';

interface Campaign {
    id: string;
    name: string;
    description?: string;
    status: string;
    templateId?: string;
    targetType: string;
    scheduledAt?: string;
    startedAt?: string;
    completedAt?: string;
    totalTargets: number;
    emailsSent: number;
    emailsOpened: number;
    linksClicked: number;
    dataSubmitted: number;
    template?: {
        name: string;
        difficulty: string;
        category: string;
    };
    _count?: { targets: number };
}

interface Template {
    id: string;
    name: string;
    subject: string;
    difficulty: string;
    category: string;
    _count?: { campaigns: number };
}

export default function PhishingPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'campaigns' | 'templates'>('campaigns');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState({ total: 0, running: 0, completed: 0, avgClickRate: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        try {
            const [campaignsRes, templatesRes] = await Promise.all([
                fetch('/api/phishing/campaigns'),
                fetch('/api/phishing/templates')
            ]);

            if (campaignsRes.ok) {
                const data = await campaignsRes.json();
                setCampaigns(data.campaigns || []);
                setStats(data.stats || { total: 0, running: 0, completed: 0, avgClickRate: 0 });
            }

            if (templatesRes.ok) {
                const data = await templatesRes.json();
                setTemplates(data.templates || []);
            }
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateCampaign(data: any) {
        try {
            const res = await fetch('/api/phishing/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (res.ok) {
                setShowCreateModal(false);
                fetchData();
            }
        } catch (err) {
            console.error('Failed to create:', err);
        }
    }

    async function handleUpdateStatus(id: string, status: string) {
        try {
            await fetch(`/api/phishing/campaigns?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            fetchData();
        } catch (err) {
            console.error('Failed to update:', err);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'running': return 'bg-emerald-500/20 text-emerald-400';
            case 'completed': return 'bg-blue-500/20 text-blue-400';
            case 'scheduled': return 'bg-yellow-500/20 text-yellow-400';
            case 'cancelled': return 'bg-red-500/20 text-red-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'text-emerald-400';
            case 'medium': return 'text-yellow-400';
            case 'hard': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen text-foreground">
                <PremiumBackground />
                <Header />
                <div className="pt-32 flex items-center justify-center">
                    <div className="text-slate-500">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Mail className="w-5 h-5 text-red-400" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Security Awareness</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white">Phishing Simulations</h1>
                            <p className="text-slate-400 mt-2">Test and train your organization against phishing attacks</p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            New Campaign
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Target className="w-5 h-5 text-blue-400" />
                                </div>
                                <span className="text-sm text-slate-400">Total Campaigns</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.total}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Play className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span className="text-sm text-slate-400">Running</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.running}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-purple-400" />
                                </div>
                                <span className="text-sm text-slate-400">Completed</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.completed}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-red-400" />
                                </div>
                                <span className="text-sm text-slate-400">Avg Click Rate</span>
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.avgClickRate.toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-white/10 pb-4">
                        <button
                            onClick={() => setActiveTab('campaigns')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'campaigns'
                                    ? 'bg-primary text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Campaigns
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'templates'
                                    ? 'bg-primary text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Templates
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'campaigns' && (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                            {campaigns.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-white mb-2">No campaigns yet</h3>
                                    <p className="text-slate-500 mb-6">Create your first phishing simulation campaign</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg"
                                    >
                                        Create Campaign
                                    </button>
                                </div>
                            ) : (
                                <table className="w-full">
                                    <thead className="bg-white/5 border-b border-white/5">
                                        <tr>
                                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Campaign</th>
                                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Status</th>
                                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Targets</th>
                                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Results</th>
                                            <th className="text-left text-xs font-medium text-slate-400 uppercase tracking-wider p-4">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {campaigns.map(campaign => (
                                            <tr key={campaign.id} className="hover:bg-white/5">
                                                <td className="p-4">
                                                    <div className="font-semibold text-white">{campaign.name}</div>
                                                    <div className="text-sm text-slate-500">{campaign.template?.name || 'No template'}</div>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(campaign.status)}`}>
                                                        {campaign.status}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="text-white">{campaign.totalTargets}</div>
                                                    <div className="text-xs text-slate-500">{campaign.emailsSent} sent</div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <div className="text-center">
                                                            <div className="text-blue-400 font-semibold">{campaign.emailsOpened}</div>
                                                            <div className="text-xs text-slate-500">Opened</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-red-400 font-semibold">{campaign.linksClicked}</div>
                                                            <div className="text-xs text-slate-500">Clicked</div>
                                                        </div>
                                                        <div className="text-center">
                                                            <div className="text-orange-400 font-semibold">{campaign.dataSubmitted}</div>
                                                            <div className="text-xs text-slate-500">Submitted</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        {campaign.status === 'draft' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(campaign.id, 'running')}
                                                                className="p-2 hover:bg-emerald-500/20 rounded-lg text-emerald-400"
                                                                title="Start"
                                                            >
                                                                <Play className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        {campaign.status === 'running' && (
                                                            <button
                                                                onClick={() => handleUpdateStatus(campaign.id, 'completed')}
                                                                className="p-2 hover:bg-orange-500/20 rounded-lg text-orange-400"
                                                                title="End"
                                                            >
                                                                <Pause className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400" title="View">
                                                            <BarChart3 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {templates.map(template => (
                                <div key={template.id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="font-semibold text-white">{template.name}</h3>
                                            <p className="text-sm text-slate-500 mt-1">{template.subject}</p>
                                        </div>
                                        <span className={`text-xs font-semibold ${getDifficultyColor(template.difficulty)}`}>
                                            {template.difficulty.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400 capitalize">{template.category.replace('_', ' ')}</span>
                                        <span className="text-slate-500">{template._count?.campaigns || 0} campaigns</span>
                                    </div>
                                </div>
                            ))}
                            {templates.length === 0 && (
                                <div className="col-span-full text-center py-12 text-slate-500">
                                    No templates yet. Templates are created via API.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Campaign Modal */}
            {showCreateModal && (
                <CreateCampaignModal
                    templates={templates}
                    onClose={() => setShowCreateModal(false)}
                    onCreate={handleCreateCampaign}
                />
            )}
        </div>
    );
}

function CreateCampaignModal({ templates, onClose, onCreate }: {
    templates: Template[];
    onClose: () => void;
    onCreate: (data: any) => void;
}) {
    const [form, setForm] = useState({
        name: '',
        description: '',
        templateId: '',
        targetType: 'all',
        sendingRate: 10
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-lg w-full mx-4">
                <h2 className="text-2xl font-bold text-white mb-6">New Phishing Campaign</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Campaign Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                            placeholder="Q4 Security Awareness Test"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white min-h-[80px]"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Template</label>
                        <select
                            value={form.templateId}
                            onChange={(e) => setForm({ ...form, templateId: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        >
                            <option value="">Select a template...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name} ({t.difficulty})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Target Audience</label>
                        <select
                            value={form.targetType}
                            onChange={(e) => setForm({ ...form, targetType: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        >
                            <option value="all">All Employees</option>
                            <option value="department">By Department</option>
                            <option value="role">By Role</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onCreate(form)}
                            disabled={!form.name}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 disabled:opacity-50"
                        >
                            Create Campaign
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
