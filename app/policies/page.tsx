'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import PremiumBackground from "@/components/PremiumBackground";
import { Shield, BookOpen, AlertTriangle, Loader2, Plus } from "lucide-react";
import { PolicyList } from "@/components/policies/PolicyList";
import Modal from "@/components/Modal";
import { useLanguage } from '@/lib/contexts/LanguageContext';
import RestrictedView from '@/components/SaaS/RestrictedView';

export default function PoliciesPage() {
    const { t } = useLanguage();
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // New Policy Form State
    const [newPolicy, setNewPolicy] = useState({
        title: '',
        version: '1.0',
        content: '',
        category: 'General'
    });

    useEffect(() => {
        fetchPolicies();
    }, []);

    const fetchPolicies = async () => {
        try {
            const res = await fetch('/api/policies');
            const data = await res.json();
            setPolicies(data.policies || []);
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePolicy = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPolicy)
            });

            if (res.ok) {
                setShowCreateModal(false);
                setNewPolicy({ title: '', version: '1.0', content: '', category: 'General' });
                fetchPolicies(); // Refresh list
            } else {
                const err = await res.json();
                alert(`Error: ${err.error || 'Failed to create policy'}`);
            }
        } catch (error) {
            console.error('Error creating policy:', error);
            alert('Failed to connect to server');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Map policies to the frontend structure
    const mappedPolicies = policies.map(p => ({
        id: p.id,
        title: p.title,
        description: p.content ? p.content.substring(0, 150) : (p.description || "No description"),
        status: p.status as 'active' | 'draft' | 'archived' | 'review',
        version: p.version,
        owner: p.owner || 'System',
        updatedAt: new Date(p.updatedAt).toISOString(),
        category: p.category || 'General'
    }));

    // Calculate quick stats
    const totalPolicies = policies.length;
    const activePolicies = policies.filter(p => p.status === 'active').length;
    const reviewNeeded = policies.filter(p => p.status === 'review' || p.status === 'draft').length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <Loader2 className="animate-spin h-12 w-12 text-emerald-500" />
            </div>
        );
    }

    return (
        <RestrictedView>
            <div className="min-h-screen text-foreground selection:bg-primary/30">
                <PremiumBackground />
                <Header />

                <div className="relative z-10 p-8 pt-32">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {/* Header Section */}
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">
                                    {t('nav_policies')}
                                </h1>
                                <p className="text-lg text-slate-400 font-medium">
                                    {t('dash_stat_policy')}: {t('dash_module_ecosystem_desc')}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 font-bold flex items-center gap-2 group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                New Policy
                            </button>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-white">{totalPolicies}</p>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('ctrl_stat_total')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                                        <Shield className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-white">{activePolicies}</p>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('dash_system_live')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400 group-hover:scale-110 transition-transform">
                                        <AlertTriangle className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-black text-white">{reviewNeeded}</p>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t('dash_pending_actions')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Policy List Module */}
                        <div className="pt-4">
                            <PolicyList policies={mappedPolicies} />
                        </div>
                    </div>
                </div>

                {/* Create Policy Modal - Correctly Centered */}
                {/* Create Policy Modal - Correctly Centered */}
                <Modal
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    title={
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-emerald-500" />
                            Create New Policy
                        </div>
                    }
                    maxWidth="max-w-2xl"
                >
                    <form onSubmit={handleCreatePolicy} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Policy Title</label>
                                <input
                                    type="text"
                                    required
                                    value={newPolicy.title}
                                    onChange={(e) => setNewPolicy({ ...newPolicy, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                                    placeholder="e.g. Acceptable Use Policy"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Category</label>
                                    <select
                                        value={newPolicy.category}
                                        onChange={(e) => setNewPolicy({ ...newPolicy, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                    >
                                        <option value="General">General</option>
                                        <option value="Security">Security</option>
                                        <option value="Privacy">Privacy</option>
                                        <option value="Operational">Operational</option>
                                        <option value="Legal">Legal</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Version</label>
                                    <input
                                        type="text"
                                        value={newPolicy.version}
                                        onChange={(e) => setNewPolicy({ ...newPolicy, version: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Policy Content</label>
                                <textarea
                                    required
                                    value={newPolicy.content}
                                    onChange={(e) => setNewPolicy({ ...newPolicy, content: e.target.value })}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all resize-none font-mono text-sm"
                                    placeholder="# Policy Statement..."
                                />
                                <p className="text-xs text-slate-500 mt-2 text-right">Markdown supported</p>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Policy'}
                            </button>
                        </div>
                    </form>
                </Modal>
            </div>
        </RestrictedView>
    );
}
