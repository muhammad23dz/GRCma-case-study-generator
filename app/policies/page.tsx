'use client';

import { useState, useEffect } from 'react';
import Header from "@/components/Header";
import PremiumBackground from "@/components/PremiumBackground";
import { Shield, BookOpen, AlertTriangle, Loader2 } from "lucide-react";
import { PolicyList } from "@/components/policies/PolicyList";
import { useLanguage } from '@/lib/contexts/LanguageContext';
import RestrictedView from '@/components/SaaS/RestrictedView';

export default function PoliciesPage() {
    const { t } = useLanguage();
    const [policies, setPolicies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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
            </div>
        </RestrictedView>
    );
}
