'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Incident {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    reportedBy: string;
    assignedTo?: string;
    createdAt: string;
    actions: any[];
}

export default function IncidentsPage() {
    const router = useRouter();
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        severity: 'medium',
        assignedTo: ''
    });

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const res = await fetch('/api/incidents');
            const data = await res.json();
            setIncidents(data.incidents || []);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/incidents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setShowModal(false);
                setFormData({ title: '', description: '', severity: 'medium', assignedTo: '' });
                fetchIncidents();
            }
        } catch (error) {
            console.error('Error creating incident:', error);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this incident?')) return;
        try {
            const res = await fetch(`/api/incidents/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setIncidents(incidents.filter(i => i.id !== id));
            } else {
                alert('Failed to delete incident');
            }
        } catch (error) {
            console.error('Error deleting incident:', error);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/50';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
            case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
            case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading incidents...</div>
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
                            <h1 className="text-4xl font-bold text-white mb-2">Incident Management</h1>
                            <p className="text-gray-400">Track and manage security incidents</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 transition-all shadow-lg"
                        >
                            + Report Incident
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-red-400">{incidents.filter(i => i.severity === 'critical').length}</div>
                            <div className="text-gray-400 text-sm">Critical</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-orange-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-orange-400">{incidents.filter(i => i.status === 'open').length}</div>
                            <div className="text-gray-400 text-sm">Open</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-yellow-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-yellow-400">{incidents.filter(i => i.status === 'investigating').length}</div>
                            <div className="text-gray-400 text-sm">Investigating</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-emerald-400">{incidents.filter(i => i.status === 'resolved').length}</div>
                            <div className="text-gray-400 text-sm">Resolved</div>
                        </div>
                    </div>

                    {/* Incidents Table */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-900/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Title</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Severity</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Assigned To</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Reported</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {incidents.map((incident) => (
                                    <tr key={incident.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-white">{incident.title}</div>
                                            <div className="text-sm text-gray-400 truncate max-w-md">{incident.description}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 text-xs rounded-full border ${getSeverityColor(incident.severity)}`}>
                                                {incident.severity}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${incident.status === 'open' ? 'bg-red-500/20 text-red-400' :
                                                incident.status === 'investigating' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    incident.status === 'resolved' ? 'bg-emerald-500/20 text-emerald-400' :
                                                        'bg-gray-500/20 text-gray-400'
                                                }`}>
                                                {incident.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-300">{incident.assignedTo || 'Unassigned'}</td>
                                        <td className="px-6 py-4 text-gray-300">
                                            <div className="flex items-center justify-between">
                                                <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
                                                <button
                                                    onClick={(e) => handleDelete(e, incident.id)}
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

                    {/* Create Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Report New Incident</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                                            <input
                                                type="text"
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                                rows={4}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Severity</label>
                                            <select
                                                value={formData.severity}
                                                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                            >
                                                <option value="low">Low</option>
                                                <option value="medium">Medium</option>
                                                <option value="high">High</option>
                                                <option value="critical">Critical</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Assign To (email)</label>
                                            <input
                                                type="email"
                                                value={formData.assignedTo}
                                                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-red-500"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-500 hover:to-orange-500 transition-all"
                                        >
                                            Report Incident
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
