'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Building2, Plus, Search, Trash2, ShieldCheck, AlertTriangle, FileText, BarChart, CheckCircle2, X } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

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
    const searchParams = useSearchParams();
    const initialCriticality = searchParams.get('criticality');
    const initialSearch = searchParams.get('search') || '';

    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newVendor, setNewVendor] = useState({
        name: '',
        criticality: 'medium',
        services: '',
        contactEmail: ''
    });
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [criticalityFilter, setCriticalityFilter] = useState<string | null>(initialCriticality);

    useEffect(() => {
        if (initialCriticality) setCriticalityFilter(initialCriticality);
        if (initialSearch) setSearchTerm(initialSearch);
    }, [initialCriticality, initialSearch]);

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
            case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getRiskScoreColor = (score?: number) => {
        if (!score) return 'text-slate-400';
        if (score >= 76) return 'text-red-500';
        if (score >= 51) return 'text-orange-500';
        if (score >= 26) return 'text-yellow-500';
        return 'text-emerald-500';
    };

    const filteredVendors = vendors.filter(vendor => {
        const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            vendor.services.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesCriticality = criticalityFilter ? vendor.criticality === criticalityFilter : true;

        return matchesSearch && matchesCriticality;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const criticalVendors = vendors.filter(v => v.criticality === 'critical' || v.criticality === 'high').length;
    const avgRiskScore = vendors.filter(v => v.riskScore).length > 0
        ? Math.round(vendors.filter(v => v.riskScore).reduce((sum, v) => sum + (v.riskScore || 0), 0) / vendors.filter(v => v.riskScore).length)
        : 0;

    return (
        <div className="min-h-screen text-white selection:bg-purple-500/30">
            <PremiumBackground />
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
                else if (view === 'history') router.push('/');
            }} />

            <div className="relative z-10 p-8">
                <PageTransition className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Vendor Risk Management</h1>
                            <p className="text-slate-400">Third-party and supply chain risk monitoring</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search vendors..."
                                    className="pl-9 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl w-64 text-sm focus:border-purple-500/50 focus:outline-none transition-all"
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
                                onClick={() => setShowAddModal(true)}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 font-bold flex items-center gap-2 group"
                            >
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                Add Vendor
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500 group-hover:scale-110 transition-transform">
                                    <Building2 className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-purple-400 mb-1">{vendors.length}</div>
                            <div className="text-slate-400 text-sm font-medium">Total Vendors</div>
                        </div>

                        <div
                            className={`bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group cursor-pointer ${criticalityFilter === 'high' || criticalityFilter === 'critical' ? 'ring-2 ring-red-500/50' : ''}`}
                            onClick={() => setCriticalityFilter(criticalityFilter === 'critical' ? null : 'critical')}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-red-500/10 rounded-xl text-red-500 group-hover:scale-110 transition-transform">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-red-400 mb-1">{criticalVendors}</div>
                            <div className="text-slate-400 text-sm font-medium">High Risk Vendors</div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:scale-110 transition-transform">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="text-3xl font-bold text-blue-400 mb-1">
                                {vendors.reduce((sum, v) => sum + v._count.assessments, 0)}
                            </div>
                            <div className="text-slate-400 text-sm font-medium">Total Assessments</div>
                        </div>

                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500 group-hover:scale-110 transition-transform">
                                    <BarChart className="w-6 h-6" />
                                </div>
                            </div>
                            <div className={`text-3xl font-bold mb-1 ${getRiskScoreColor(avgRiskScore)}`}>
                                {avgRiskScore || 'N/A'}
                            </div>
                            <div className="text-slate-400 text-sm font-medium">Avg Risk Score</div>
                        </div>
                    </div>

                    {/* Filter Banner */}
                    {(criticalityFilter || searchTerm) && (
                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-500/20 rounded-lg">
                                    <Search className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className="text-sm font-bold text-white">Active Filters:</span>
                                    {criticalityFilter && <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-white border border-white/10 uppercase">{criticalityFilter}</span>}
                                    {searchTerm && <span className="text-xs px-2 py-1 bg-white/10 rounded-md text-white border border-white/10">"{searchTerm}"</span>}
                                </div>
                            </div>
                            <button
                                onClick={() => { setSearchTerm(''); setCriticalityFilter(null); router.push('/vendors'); }}
                                className="px-3 py-1.5 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-xs font-bold transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Vendors Table */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-purple-500" />
                                Vendor Register
                            </h2>
                            <div className="text-sm text-slate-500">
                                Showing {filteredVendors.length} of {vendors.length} vendors
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-slate-950/20">
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Vendor</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Criticality</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Score</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Services</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Last Assessment</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Assessments</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredVendors.map((vendor) => (
                                        <tr key={vendor.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{vendor.name}</div>
                                                {vendor.contactEmail && <div className="text-xs text-slate-400 mt-1">{vendor.contactEmail}</div>}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide border ${getCriticalityColor(vendor.category)}`}>
                                                    {vendor.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`text-lg font-bold ${getRiskScoreColor(vendor.riskScore)}`}>
                                                    {vendor.riskScore || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm text-slate-300 max-w-2xl">{vendor.services}</div>
                                            </td>
                                            <td className="px-6 py-5 text-slate-400 text-sm font-mono">
                                                {vendor.lastAssessmentDate
                                                    ? new Date(vendor.lastAssessmentDate).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg uppercase tracking-wide border ${vendor.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    vendor.status === 'suspended' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                    {vendor.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-slate-300">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-mono">{vendor._count.assessments}</span>
                                                    <button
                                                        onClick={(e) => handleDelete(e, vendor.id)}
                                                        className="text-slate-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Delete Vendor"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredVendors.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center py-12 text-slate-500">
                                                No vendors found matching filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </PageTransition>
                {/* Add Vendor Modal - Moved outside PageTransition */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-white mb-2">Add New Vendor</h2>
                                <p className="text-slate-400 text-sm">Onboard a new third-party vendor.</p>
                            </div>
                            <form onSubmit={handleAddVendor}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Vendor Name</label>
                                        <input
                                            type="text"
                                            value={newVendor.name}
                                            onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Services Provided</label>
                                        <textarea
                                            value={newVendor.services}
                                            onChange={(e) => setNewVendor({ ...newVendor, services: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600 resize-none font-mono text-sm"
                                            rows={3}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Criticality</label>
                                            <select
                                                value={newVendor.criticality}
                                                onChange={(e) => setNewVendor({ ...newVendor, criticality: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all appearance-none"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Contact Email</label>
                                            <input
                                                type="email"
                                                value={newVendor.contactEmail}
                                                onChange={(e) => setNewVendor({ ...newVendor, contactEmail: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-500/20 transition-all hover:scale-105 font-bold"
                                    >
                                        Add Vendor
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
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
