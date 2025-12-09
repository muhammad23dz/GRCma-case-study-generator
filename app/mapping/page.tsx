'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Control {
    id: string;
    title: string;
    description: string;
    controlType: string;
    controlRisk?: string;
}

interface FrameworkMapping {
    id: string;
    framework: string;
    requirement: string;
    description?: string;
    confidence?: number;
    control: Control;
}

export default function ControlMappingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [controls, setControls] = useState<Control[]>([]);
    const [mappings, setMappings] = useState<FrameworkMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedControl, setSelectedControl] = useState<Control | null>(null);
    const [newMapping, setNewMapping] = useState({
        framework: 'ISO27001',
        requirement: '',
        description: '',
    });

    const frameworks = [
        { id: 'ISO27001', name: 'ISO 27001:2022' },
        { id: 'SOC2', name: 'SOC 2 Type II' },
        { id: 'NIST_CSF', name: 'NIST CSF 2.0' },
        { id: 'GDPR', name: 'GDPR' },
        { id: 'PCI_DSS', name: 'PCI DSS' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [controlsRes, mappingsRes] = await Promise.all([
                fetch('/api/controls'),
                fetch('/api/controls/mappings'),
            ]);

            const controlsData = await controlsRes.json();
            const mappingsData = await mappingsRes.json();

            setControls(controlsData.controls || []);
            setMappings(mappingsData.mappings || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMapControl = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedControl) return;

        try {
            const res = await fetch('/api/controls/mappings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    controlId: selectedControl.id,
                    ...newMapping,
                }),
            });

            if (res.ok) {
                setShowMapModal(false);
                setSelectedControl(null);
                setNewMapping({ framework: 'ISO27001', requirement: '', description: '' });
                fetchData();
            }
        } catch (error) {
            console.error('Error creating mapping:', error);
        }
    };

    const handleDeleteMapping = async (id: string) => {
        if (!confirm('Remove this framework mapping?')) return;

        try {
            const res = await fetch(`/api/controls/mappings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchData();
            }
        } catch (error) {
            console.error('Error deleting mapping:', error);
        }
    };

    const getFrameworkName = (id: string) => {
        return frameworks.find(f => f.id === id)?.name || id;
    };

    const getMappingStats = () => {
        const byFramework: Record<string, number> = {};
        mappings.forEach(m => {
            byFramework[m.framework] = (byFramework[m.framework] || 0) + 1;
        });
        return byFramework;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    const stats = getMappingStats();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Control-Framework Mapping</h1>
                        <p className="text-gray-400">Map your controls to framework requirements for compliance tracking</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-emerald-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-emerald-400">{controls.length}</div>
                            <div className="text-gray-400 text-sm">Total Controls</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-blue-500/20 rounded-lg p-6">
                            <div className="text-3xl font-bold text-blue-400">{mappings.length}</div>
                            <div className="text-gray-400 text-sm">Total Mappings</div>
                        </div>
                        {Object.entries(stats).slice(0, 3).map(([fw, count]) => (
                            <div key={fw} className="bg-slate-800/50 backdrop-blur-sm border border-purple-500/20 rounded-lg p-6">
                                <div className="text-2xl font-bold text-purple-400">{count}</div>
                                <div className="text-gray-400 text-xs">{getFrameworkName(fw)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Controls with Mappings */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Controls & Framework Mappings</h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Control</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Type</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Mapped To</th>
                                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {controls.map((control) => {
                                        const controlMappings = mappings.filter(m => m.control.id === control.id);

                                        return (
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
                                                    {controlMappings.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {controlMappings.map(mapping => (
                                                                <div key={mapping.id} className="flex items-center gap-2">
                                                                    <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-400">
                                                                        {mapping.framework}
                                                                    </span>
                                                                    <span className="text-sm text-gray-300">{mapping.requirement}</span>
                                                                    <button
                                                                        onClick={() => handleDeleteMapping(mapping.id)}
                                                                        className="text-red-400 hover:text-red-300 text-xs"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-500 text-sm">No mappings</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedControl(control);
                                                            setShowMapModal(true);
                                                        }}
                                                        className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-500 transition-all text-sm"
                                                    >
                                                        + Map
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Mapping Modal */}
                    {showMapModal && selectedControl && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Map Control to Framework</h2>
                                <div className="mb-4 p-4 bg-slate-900/50 rounded-lg">
                                    <div className="font-medium text-white">{selectedControl.title}</div>
                                    <div className="text-sm text-gray-400">{selectedControl.description}</div>
                                </div>

                                <form onSubmit={handleMapControl}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Framework</label>
                                            <select
                                                value={newMapping.framework}
                                                onChange={(e) => setNewMapping({ ...newMapping, framework: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            >
                                                {frameworks.map(fw => (
                                                    <option key={fw.id} value={fw.id}>{fw.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Requirement ID</label>
                                            <input
                                                type="text"
                                                value={newMapping.requirement}
                                                onChange={(e) => setNewMapping({ ...newMapping, requirement: e.target.value })}
                                                placeholder="e.g., A.5.1, CC6.1, PR.AC-1"
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Implementation Notes</label>
                                            <textarea
                                                value={newMapping.description}
                                                onChange={(e) => setNewMapping({ ...newMapping, description: e.target.value })}
                                                placeholder="How does this control satisfy the requirement?"
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                rows={3}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:from-emerald-500 hover:to-green-500 transition-all"
                                        >
                                            Create Mapping
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowMapModal(false);
                                                setSelectedControl(null);
                                            }}
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
