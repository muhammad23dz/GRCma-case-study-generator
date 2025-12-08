'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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
    const [policies, setPolicies] = useState<Policy[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        version: '1.0',
        content: '',
        reviewDate: ''
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading policies...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Policy Management</h1>
                            <p className="text-gray-400">Manage organizational policies and procedures</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg"
                        >
                            + New Policy
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-emerald-400">{policies.filter(p => p.status === 'active').length}</div>
                            <div className="text-gray-400 text-sm">Active Policies</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-yellow-400">{policies.filter(p => p.status === 'draft').length}</div>
                            <div className="text-gray-400 text-sm">Draft Policies</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-blue-400">{policies.length}</div>
                            <div className="text-gray-400 text-sm">Total Policies</div>
                        </div>
                    </div>

                    {/* Policies Table */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Version</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Owner</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Review Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {policies.map((policy) => (
                                    <tr key={policy.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{policy.title}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{policy.version}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs rounded-full ${policy.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    policy.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {policy.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{policy.owner}</td>
                                        <td className="px-6 py-4 text-gray-300">{new Date(policy.reviewDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Create Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Create New Policy</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Version</label>
                                            <input
                                                type="text"
                                                value={formData.version}
                                                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Content</label>
                                            <textarea
                                                value={formData.content}
                                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                rows={6}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Review Date</label>
                                            <input
                                                type="date"
                                                value={formData.reviewDate}
                                                onChange={(e) => setFormData({ ...formData, reviewDate: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all"
                                        >
                                            Create Policy
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all"
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
        </div>
    );
}
