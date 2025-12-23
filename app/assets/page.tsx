'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Server,
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    X,
    AlertTriangle,
    Shield,
    Eye
} from 'lucide-react';

interface Asset {
    id: string;
    name: string;
    type: string;
    category?: string;
    status: string;
    criticality: string;
    owner: string;
    location?: string;
    description?: string;
    value?: number;
    confidentiality?: string;
    integrity?: string;
    availability?: string;
    createdAt: string;
}

const ASSET_TYPES = ['hardware', 'software', 'data', 'personnel', 'facility'];
const CRITICALITY_LEVELS = ['low', 'medium', 'high', 'critical'];
const STATUS_OPTIONS = ['active', 'inactive', 'decommissioned'];

export default function AssetsPage() {
    const router = useRouter();
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<string>('');
    const [showModal, setShowModal] = useState(false);
    const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', type: 'hardware', category: '', status: 'active',
        criticality: 'medium', owner: '', location: '', description: '',
        value: '', confidentiality: 'internal', integrity: 'medium', availability: 'medium'
    });

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            const res = await fetch('/api/assets');
            if (res.ok) {
                const data = await res.json();
                setAssets(data.assets || []);
            }
        } catch (error) {
            console.error('Failed to fetch assets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets';
            const method = editingAsset ? 'PATCH' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    value: formData.value ? parseFloat(formData.value) : null
                })
            });

            if (res.ok) {
                setShowModal(false);
                setEditingAsset(null);
                resetForm();
                fetchAssets();
            }
        } catch (error) {
            console.error('Failed to save asset:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this asset?')) return;
        setDeleting(id);
        try {
            const res = await fetch(`/api/assets/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchAssets();
            }
        } catch (error) {
            console.error('Failed to delete asset:', error);
        } finally {
            setDeleting(null);
        }
    };

    const openEdit = (asset: Asset) => {
        setEditingAsset(asset);
        setFormData({
            name: asset.name, type: asset.type, category: asset.category || '',
            status: asset.status, criticality: asset.criticality, owner: asset.owner,
            location: asset.location || '', description: asset.description || '',
            value: asset.value?.toString() || '', confidentiality: asset.confidentiality || 'internal',
            integrity: asset.integrity || 'medium', availability: asset.availability || 'medium'
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '', type: 'hardware', category: '', status: 'active',
            criticality: 'medium', owner: '', location: '', description: '',
            value: '', confidentiality: 'internal', integrity: 'medium', availability: 'medium'
        });
    };

    const filteredAssets = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            (a.description || '').toLowerCase().includes(search.toLowerCase());
        const matchesType = !filterType || a.type === filterType;
        return matchesSearch && matchesType;
    });

    const CRITICALITY_COLORS: Record<string, string> = {
        critical: 'text-red-400 bg-red-500/10',
        high: 'text-orange-400 bg-orange-500/10',
        medium: 'text-amber-400 bg-amber-500/10',
        low: 'text-emerald-400 bg-emerald-500/10',
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Server className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Asset Management</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Asset Inventory</h1>
                            <p className="text-lg text-slate-400">Track and manage your organizational assets</p>
                        </div>
                        <button
                            onClick={() => { resetForm(); setEditingAsset(null); setShowModal(true); }}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-5 h-5" />
                            Add Asset
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                            <div className="text-2xl font-bold text-white">{assets.length}</div>
                            <div className="text-xs text-slate-500 uppercase tracking-wider">Total Assets</div>
                        </div>
                        {ASSET_TYPES.slice(0, 4).map(type => (
                            <div key={type} className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-blue-400">{assets.filter(a => a.type === type).length}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider capitalize">{type}</div>
                            </div>
                        ))}
                    </div>

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search assets..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">All Types</option>
                            {ASSET_TYPES.map(type => (
                                <option key={type} value={type} className="bg-slate-900">{type}</option>
                            ))}
                        </select>
                    </div>

                    {/* Assets Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-48 bg-slate-900/40 animate-pulse rounded-2xl" />
                            ))}
                        </div>
                    ) : filteredAssets.length === 0 ? (
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-12 text-center">
                            <Server className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No Assets Found</h3>
                            <p className="text-slate-400 mb-6">Start by adding your first asset to the inventory.</p>
                            <button
                                onClick={() => { resetForm(); setShowModal(true); }}
                                className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                            >
                                Add First Asset
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredAssets.map(asset => (
                                <div
                                    key={asset.id}
                                    className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                            <Server className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEdit(asset)} className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(asset.id)}
                                                disabled={deleting === asset.id}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-white mb-1">{asset.name}</h3>
                                    <p className="text-sm text-slate-500 mb-3 line-clamp-2">{asset.description || 'No description'}</p>

                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400">
                                            {asset.type}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${CRITICALITY_COLORS[asset.criticality]}`}>
                                            {asset.criticality}
                                        </span>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-500">
                                        <span>Owner: {asset.owner}</span>
                                        <span>{asset.location || 'No location'}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">{editingAsset ? 'Edit Asset' : 'Add New Asset'}</h2>
                            <button onClick={() => { setShowModal(false); setEditingAsset(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Type *</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {ASSET_TYPES.map(type => (
                                            <option key={type} value={type} className="bg-slate-900">{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Criticality</label>
                                    <select
                                        value={formData.criticality}
                                        onChange={(e) => setFormData({ ...formData, criticality: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {CRITICALITY_LEVELS.map(level => (
                                            <option key={level} value={level} className="bg-slate-900">{level}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {STATUS_OPTIONS.map(status => (
                                            <option key={status} value={status} className="bg-slate-900">{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Owner *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.owner}
                                        onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Location</label>
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Confidentiality</label>
                                    <select
                                        value={formData.confidentiality}
                                        onChange={(e) => setFormData({ ...formData, confidentiality: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="public" className="bg-slate-900">Public</option>
                                        <option value="internal" className="bg-slate-900">Internal</option>
                                        <option value="confidential" className="bg-slate-900">Confidential</option>
                                        <option value="restricted" className="bg-slate-900">Restricted</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Integrity</label>
                                    <select
                                        value={formData.integrity}
                                        onChange={(e) => setFormData({ ...formData, integrity: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="low" className="bg-slate-900">Low</option>
                                        <option value="medium" className="bg-slate-900">Medium</option>
                                        <option value="high" className="bg-slate-900">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Availability</label>
                                    <select
                                        value={formData.availability}
                                        onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        <option value="low" className="bg-slate-900">Low</option>
                                        <option value="medium" className="bg-slate-900">Medium</option>
                                        <option value="high" className="bg-slate-900">High</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); setEditingAsset(null); }}
                                    className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
                                >
                                    {editingAsset ? 'Update Asset' : 'Create Asset'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
