'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PageTransition from '@/components/PageTransition';
import PremiumBackground from '@/components/PremiumBackground';
import { Shield, AlertTriangle, PlayCircle, Zap, FileText, Search, Plus, Trash2, X, Filter } from 'lucide-react';

interface Control {
    id: string;
    title: string;
    description: string;
    controlType: string;
    owner?: string;
    controlRisk?: string;
    confidence?: number;
    mappings: any[];
    _count: {
        evidences: number;
        risks: number;
        actions: number;
    };
}

export default function ControlsPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('type') || 'all';
    const initialSearch = searchParams.get('search') || '';

    const [controls, setControls] = useState<Control[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newControl, setNewControl] = useState({
        title: '',
        description: '',
        controlType: 'preventive',
        controlRisk: 'medium'
    });

    // Initial state from URL params
    const [activeTab, setActiveTab] = useState(initialTab);
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    // Update state when URL params change
    useEffect(() => {
        if (searchParams.get('type')) setActiveTab(searchParams.get('type') || 'all');
        if (searchParams.get('search')) setSearchTerm(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => {
        fetchControls();
    }, []);

    const fetchControls = async () => {
        try {
            const res = await fetch('/api/controls');
            const data = await res.json();
            setControls(data.controls || []);
        } catch (error) {
            console.error('Error fetching controls:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddControl = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/controls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newControl)
            });
            if (res.ok) {
                setShowAddModal(false);
                setNewControl({ title: '', description: '', controlType: 'preventive', controlRisk: 'medium' });
                fetchControls();
            }
        } catch (error) {
            console.error('Error adding control:', error);
        }
    };

    const handleDeleteControl = async (id: string) => {
        if (!confirm('Are you sure you want to delete this control?')) return;

        try {
            const res = await fetch(`/api/controls/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchControls();
            }
        } catch (error) {
            console.error('Error deleting control:', error);
        }
    };

    const getRiskColor = (risk?: string) => {
        switch (risk) {
            case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
            case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
            case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const filteredControls = controls.filter(control => {
        const matchesTab = activeTab === 'all' || control.controlType === activeTab;
        const matchesSearch = control.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            control.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            control.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    const updateFilters = (type: string, search: string) => {
        setActiveTab(type);
        setSearchTerm(search);

        // Update URL
        const params = new URLSearchParams();
        if (type !== 'all') params.set('type', type);
        if (search) params.set('search', search);

        const queryString = params.toString();
        router.push(queryString ? `?${queryString}` : '/controls');
    };

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
                    <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Control Library</h1>
                            <p className="text-slate-400">Manage your GRC controls and framework mappings</p>
                        </div>
                        <div className="flex gap-3 items-center">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search controls..."
                                    value={searchTerm}
                                    onChange={(e) => updateFilters(activeTab, e.target.value)}
                                    className="pl-10 pr-4 py-3 bg-slate-900/40 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 w-64 md:w-80 backdrop-blur-sm transition-all shadow-lg"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => updateFilters(activeTab, '')}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 font-medium flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="hidden md:inline">Add Control</span>
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-8 p-1 bg-slate-900/40 backdrop-blur-md rounded-xl border border-white/5 w-fit">
                        {['all', 'preventive', 'detective', 'corrective', 'directive'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => updateFilters(tab, searchTerm)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab
                                    ? 'bg-emerald-500/10 text-emerald-400 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <div className="text-gray-400 text-sm font-medium">Total Controls</div>
                            </div>
                            <div className="text-3xl font-bold text-white pl-1">{controls.length}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-400">
                                    <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="text-gray-400 text-sm font-medium">High Risk</div>
                            </div>
                            <div className="text-3xl font-bold text-white pl-1">
                                {controls.filter(c => c.controlRisk === 'critical' || c.controlRisk === 'high').length}
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div className="text-gray-400 text-sm font-medium">Mapped</div>
                            </div>
                            <div className="text-3xl font-bold text-white pl-1">
                                {controls.reduce((sum, c) => sum + c.mappings.length, 0)}
                            </div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div className="text-gray-400 text-sm font-medium">Evidence</div>
                            </div>
                            <div className="text-3xl font-bold text-white pl-1">
                                {controls.reduce((sum, c) => sum + c._count.evidences, 0)}
                            </div>
                        </div>
                    </div>

                    {/* Filter Banner */}
                    {(searchTerm || activeTab !== 'all') && (
                        <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 mb-8 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/20 rounded-lg">
                                    <Filter className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">Active Filter</div>
                                    <div className="text-xs text-slate-400 flex gap-2">
                                        {searchTerm && <span>Search: "{searchTerm}"</span>}
                                        {activeTab !== 'all' && <span className="capitalize">Type: {activeTab}</span>}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => updateFilters('all', '')}
                                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold transition-colors"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Controls Table */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/5 bg-slate-950/20">
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Control</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Risk</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Mappings</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Evidence</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredControls.map((control) => (
                                    <tr key={control.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{control.title}</div>
                                            <div className="text-sm text-slate-400 max-w-2xl">{control.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-white/5">
                                                {control.controlType}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${getRiskColor(control.controlRisk)}`}>
                                                {control.controlRisk?.toUpperCase() || 'N/A'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                                            {control.mappings.length > 0 ? (
                                                <span className="text-blue-400">{control.mappings.length}</span>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-mono text-sm">
                                            {control._count.evidences > 0 ? (
                                                <span className="text-yellow-400">{control._count.evidences}</span>
                                            ) : (
                                                <span className="text-slate-600">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-300 font-mono text-sm">{control._count.actions}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteControl(control.id)}
                                                className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                title="Delete Control"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredControls.length === 0 && (
                            <div className="text-center py-12 text-slate-500">
                                <div className="mb-2">No controls found</div>
                                <div className="text-sm">Try adjusting your search or filters</div>
                            </div>
                        )}
                    </div>

                </PageTransition>
                {/* Add Control Modal (Premium) - Moved outside PageTransition */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                        <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="mb-6">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Add New Control</h2>
                                <p className="text-slate-400 text-sm">Define a new control to mitigate risks and ensure compliance.</p>
                            </div>

                            <form onSubmit={handleAddControl}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={newControl.title}
                                            onChange={(e) => setNewControl({ ...newControl, title: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                                            placeholder="e.g., Access Control Policy"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
                                        <textarea
                                            value={newControl.description}
                                            onChange={(e) => setNewControl({ ...newControl, description: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                                            rows={4}
                                            placeholder="Describe the control's purpose and implementation..."
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Control Type</label>
                                            <select
                                                value={newControl.controlType}
                                                onChange={(e) => setNewControl({ ...newControl, controlType: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                            >
                                                <option value="preventive">Preventive</option>
                                                <option value="detective">Detective</option>
                                                <option value="corrective">Corrective</option>
                                                <option value="directive">Directive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-300 mb-2">Risk Level</label>
                                            <select
                                                value={newControl.controlRisk}
                                                onChange={(e) => setNewControl({ ...newControl, controlRisk: e.target.value })}
                                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-semibold shadow-lg shadow-emerald-500/20"
                                    >
                                        Add Control
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-all font-semibold"
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
