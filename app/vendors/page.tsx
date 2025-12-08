'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Vendor {
    id: string;
    name: string;
    criticality: string;
    services: string;
    contactEmail?: string;
    riskScore?: number;
    lastAssessmentDate?: string;
    status: string;
    _count: {
        assessments: number;
        evidences: number;
    };
}

export default function VendorsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '',
        criticality: 'medium',
        services: '',
        contactEmail: ''
    });

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/vendors');
            const data = await res.json();
            setVendors(data.vendors || []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVendor)
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewVendor({ name: '', criticality: 'medium', services: '', contactEmail: '' });
                fetchVendors();
            }
        } catch (error) {
            console.error('Error adding vendor:', error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this vendor?')) return;
        try {
            const res = await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setVendors(vendors.filter(v => v.id !== id));
            } else {
                alert('Failed to delete vendor');
            }
        } catch (error) {
            console.error('Error deleting vendor:', error);
        }
    };

    const getCriticalityColor = (criticality: string) => {
        switch (criticality) {
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-400';
        }
    };

    const getRiskScoreColor = (score?: number) => {
        if (!score) return 'text-gray-400';
        if (score >= 76) return 'text-red-500';
        if (score >= 51) return 'text-orange-500';
        if (score >= 26) return 'text-yellow-500';
        return 'text-green-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading vendors...</div>
            </div>
        );
    }

    const criticalVendors = vendors.filter(v => v.criticality === 'critical' || v.criticality === 'high').length;
    const avgRiskScore = vendors.filter(v => v.riskScore).length > 0
        ? Math.round(vendors.filter(v => v.riskScore).reduce((sum, v) => sum + (v.riskScore || 0), 0) / vendors.filter(v => v.riskScore).length)
        : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
                else if (view === 'history') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex justify-between items-center">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Vendor Risk Management</h1>
                            <p className="text-gray-400">Third-party and supply chain risk monitoring</p>
                        </div>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg"
                        >
                            + Add Vendor
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-purple-400">{vendors.length}</div>
                            <div className="text-gray-400 text-sm">Total Vendors</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-red-400">{criticalVendors}</div>
                            <div className="text-gray-400 text-sm">High Risk Vendors</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-blue-400">
                                {vendors.reduce((sum, v) => sum + v._count.assessments, 0)}
                            </div>
                            <div className="text-gray-400 text-sm">Total Assessments</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                            <div className={`text-3xl font-bold ${getRiskScoreColor(avgRiskScore)}`}>
                                {avgRiskScore || 'N/A'}
                            </div>
                            <div className="text-gray-400 text-sm">Avg Risk Score</div>
                        </div>
                    </div>

                    {/* Vendors Table */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Vendor</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Criticality</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Risk Score</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Services</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Last Assessment</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Assessments</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{vendor.name}</div>
                                            {vendor.contactEmail && <div className="text-sm text-gray-400">{vendor.contactEmail}</div>}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-semibold ${getCriticalityColor(vendor.criticality)}`}>
                                                {vendor.criticality.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-2xl font-bold ${getRiskScoreColor(vendor.riskScore)}`}>
                                                {vendor.riskScore || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-300 max-w-xs truncate">{vendor.services}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300 text-sm">
                                            {vendor.lastAssessmentDate
                                                ? new Date(vendor.lastAssessmentDate).toLocaleDateString()
                                                : 'Never'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${vendor.status === 'active' ? 'bg-green-500/20 text-green-400' :
                                                vendor.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {vendor.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex items-center justify-between">
                                                <span>{vendor._count.assessments}</span>
                                                <button
                                                    onClick={(e) => handleDelete(e, vendor.id)}
                                                    className="text-gray-500 hover:text-red-400 p-2 rounded hover:bg-white/5 opacity-0 group-hover:opacity-100 transition-all"
                                                    title="Delete"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Add Vendor Modal */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Add New Vendor</h2>
                                <form onSubmit={handleAddVendor}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Vendor Name</label>
                                            <input
                                                type="text"
                                                value={newVendor.name}
                                                onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Services Provided</label>
                                            <textarea
                                                value={newVendor.services}
                                                onChange={(e) => setNewVendor({ ...newVendor, services: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                rows={3}
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Criticality</label>
                                                <select
                                                    value={newVendor.criticality}
                                                    onChange={(e) => setNewVendor({ ...newVendor, criticality: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                >
                                                    <option value="low">Low</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="high">High</option>
                                                    <option value="critical">Critical</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
                                                <input
                                                    type="email"
                                                    value={newVendor.contactEmail}
                                                    onChange={(e) => setNewVendor({ ...newVendor, contactEmail: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-all"
                                        >
                                            Add Vendor
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
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
