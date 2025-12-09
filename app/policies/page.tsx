'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { FileText, Shield, AlertTriangle, Plus, Trash2, Calendar, Search, X, Filter } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

interface Policy {
    id: string;
    title: string;
    version: string;
    status: string;
    owner: string;
    reviewDate: string;
    approvedBy?: string;
    createdAt: string;
}

export default function PoliciesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialStatus = searchParams.get('status');
    const initialSearch = searchParams.get('search') || '';

    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        version: '1.0',
        content: '',
        reviewDate: ''
    });
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [statusFilter, setStatusFilter] = useState<string | null>(initialStatus);

    useEffect(() => {
        if (initialStatus) setStatusFilter(initialStatus);
        if (initialSearch) setSearchTerm(initialSearch);
    }, [initialStatus, initialSearch]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/policies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', version: '1.0', content: '', reviewDate: '' });
                fetchPolicies();
            }
        } catch (error) {
            console.error('Error creating policy:', error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this policy?')) return;
        try {
            const res = await fetch(`/api/policies/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setPolicies(policies.filter(p => p.id !== id));
            } else {
                alert('Failed to delete policy');
            }
        } catch (error) {
            console.error('Error deleting policy:', error);
        }
    };

    const filteredPolicies = policies.filter(policy => {
        const matchesSearch = policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            policy.owner.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter ? policy.status === statusFilter : true;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="relative z-10 p-8">
                <PageTransition className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Policy Management</h1>
                            <p className="text-slate-400">Manage and enforce organizational security policies</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search policies..."
                                    className="pl-9 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl w-64 text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 font-bold flex items-center gap-2 group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                New Policy
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div
                            className={`bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group cursor-pointer ${statusFilter === 'active' ? 'ring-2 ring-emerald-500/50' : ''}`}
                            onClick={() => setStatusFilter(statusFilter === 'active' ? null : 'active')}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400 group-hover:scale-110 transition-transform">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg uppercase tracking-wide">
                                    Compliant
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{policies.filter(p => p.status === 'active').length}</div>
                            <div className="text-slate-400 text-sm font-medium">Active Policies</div>
                        </div>

                        <div
                            className={`bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group cursor-pointer ${statusFilter === 'draft' ? 'ring-2 ring-yellow-500/50' : ''}`}
                            onClick={() => setStatusFilter(statusFilter === 'draft' ? null : 'draft')}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400 group-hover:scale-110 transition-transform">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="px-2 py-1 bg-yellow-500/10 text-yellow-400 text-xs font-bold rounded-lg uppercase tracking-wide">
                                    Drafting
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{policies.filter(p => p.status === 'draft').length}</div>
                            <div className="text-slate-400 text-sm font-medium">Draft Policies</div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:scale-110 transition-transform">
                                    <Calendar className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">{policies.length}</div>
                            <div className="text-slate-400 text-sm font-medium">Total Documents</div>
                        </div>
                    </div>

                    {/* Filter Banner */}
                    {(statusFilter || searchTerm) && (
                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Filter className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm font-bold text-white">Active Filters:</span>
                                    {statusFilter && <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-white border border-white/10 uppercase">{statusFilter}</span>}
                                    {searchTerm && <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-white border border-white/10">"{searchTerm}"</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => { setSearchTerm(''); setStatusFilter(null); router.push('/policies'); }}
                                className="px-3 py-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Policies Table */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-emerald-500" />
                                Document Library
                            </h2>
                            <div className="text-sm text-slate-500">
                                Showing {filteredPolicies.length} of {policies.length} policies
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-slate-950/20">
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Version</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Owner</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Review Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredPolicies.map((policy) => (
                                        <tr key={policy.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{policy.title}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-slate-400 text-xs bg-slate-800 px-2 py-1 rounded border border-white/5">
                                                    v{policy.version}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide border ${policy.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    policy.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                    {policy.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-slate-300 text-sm">{policy.owner}</td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-400 text-sm">{new Date(policy.reviewDate).toLocaleDateString()}</span>
                                                    <button
                                                        onClick={(e) => handleDelete(e, policy.id)}
                                                        className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Delete Policy"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredPolicies.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="text-center py-12 text-slate-500">
                                                No policies found matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </PageTransition>
                {/* Create Modal - Moved outside PageTransition */}
                {showModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Create New Policy</h2>
                                <p className="text-slate-400 text-sm">Draft a new security policy or procedure.</p>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                            placeholder="e.g. Access Control Policy"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Version</label>
                                            <input
                                                type="text"
                                                value={formData.version}
                                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Review Date</label>
                                            <input
                                                type="date"
                                                value={formData.reviewDate}
                                                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all calendar-picker-indicator:invert"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Content</label>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 resize-none font-mono text-sm"
                                            rows={6}
                                            placeholder="# Policy Content..."
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-bold shadow-lg shadow-emerald-500/20"
                                    >
                                        Create Policy
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
