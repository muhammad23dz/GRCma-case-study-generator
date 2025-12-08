'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    const [controls, setControls] = useState<Control[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newControl, setNewControl] = useState({
        title: '',
        description: '',
        controlType: 'preventive',
        controlRisk: 'medium'
    });

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
            case 'critical': return 'text-red-500';
            case 'high': return 'text-orange-500';
            case 'medium': return 'text-yellow-500';
            case 'low': return 'text-green-500';
            default: return 'text-gray-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading controls...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <button
                                onClick={() => router.push('/')}
                                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all flex items-center gap-2"
                            >
                                ← Back
                            </button>
                            <h1 className="text-4xl font-bold text-white">Control Library</h1>
                        </div>
                        <p className="text-gray-400">Manage your GRC controls and framework mappings</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-500 hover:to-green-500 transition-all shadow-lg"
                    >
                        + Add Control
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                        <div className="text-3xl font-bold text-emerald-400">{controls.length}</div>
                        <div className="text-gray-400 text-sm">Total Controls</div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
                        <div className="text-3xl font-bold text-red-400">
                            {controls.filter(c => c.controlRisk === 'critical' || c.controlRisk === 'high').length}
                        </div>
                        <div className="text-gray-400 text-sm">High Risk</div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                        <div className="text-3xl font-bold text-blue-400">
                            {controls.reduce((sum, c) => sum + c.mappings.length, 0)}
                        </div>
                        <div className="text-gray-400 text-sm">Framework Mappings</div>
                    </div>
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                        <div className="text-3xl font-bold text-yellow-400">
                            {controls.reduce((sum, c) => sum + c._count.evidences, 0)}
                        </div>
                        <div className="text-gray-400 text-sm">Evidence Items</div>
                    </div>
                </div>

                {/* Controls Table */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Control</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Risk</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Mappings</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Evidence</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {controls.map((control) => (
                                <tr key={control.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-white">{control.title}</div>
                                        <div className="text-sm text-gray-400 truncate max-w-md">{control.description}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                                            {control.controlType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`font-semibold ${getRiskColor(control.controlRisk)}`}>
                                            {control.controlRisk?.toUpperCase() || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-300">{control.mappings.length}</td>
                                    <td className="px-6 py-4 text-gray-300">{control._count.evidences}</td>
                                    <td className="px-6 py-4 text-gray-300">{control._count.actions}</td>
                                    <td className="px-6 py-4">
                                        <button
                                            onClick={() => handleDeleteControl(control.id)}
                                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-all text-sm"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Add Control Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                            <h2 className="text-2xl font-bold text-white mb-6">Add New Control</h2>
                            <form onSubmit={handleAddControl}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                        <input
                                            type="text"
                                            value={newControl.title}
                                            onChange={(e) => setNewControl({ ...newControl, title: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                        <textarea
                                            value={newControl.description}
                                            onChange={(e) => setNewControl({ ...newControl, description: e.target.value })}
                                            className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            rows={4}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Control Type</label>
                                            <select
                                                value={newControl.controlType}
                                                onChange={(e) => setNewControl({ ...newControl, controlType: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            >
                                                <option value="preventive">Preventive</option>
                                                <option value="detective">Detective</option>
                                                <option value="corrective">Corrective</option>
                                                <option value="directive">Directive</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Risk Level</label>
                                            <select
                                                value={newControl.controlRisk}
                                                onChange={(e) => setNewControl({ ...newControl, controlRisk: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 mt-6">
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-500 hover:to-green-500 transition-all"
                                    >
                                        Add Control
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
    );
}
