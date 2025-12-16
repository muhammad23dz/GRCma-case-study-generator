'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Link, ArrowRight, Trash2, Filter, X, Shield, CheckCircle2, Search, Plus } from 'lucide-react';

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
    const { user } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL Params for Deep Linking
    const filterFramework = searchParams.get('framework');
    const filterRequirement = searchParams.get('requirement');

    const [controls, setControls] = useState<Control[]>([]);
    const [mappings, setMappings] = useState<FrameworkMapping[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMapModal, setShowMapModal] = useState(false);
    const [selectedControl, setSelectedControl] = useState<Control | null>(null);
    const [newMapping, setNewMapping] = useState({
        framework: filterFramework || 'ISO27001',
        requirement: filterRequirement || '',
        description: '',
    });

    // Update state if URL params change
    useEffect(() => {
        if (filterFramework || filterRequirement) {
            setNewMapping(prev => ({
                ...prev,
                framework: filterFramework || prev.framework,
                requirement: filterRequirement || prev.requirement
            }));
        }
    }, [filterFramework, filterRequirement]);

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
            <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    const stats = getMappingStats();

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Control Mapping</h1>
                        <p className="text-slate-400">Map your controls to framework requirements for unified compliance.</p>
                    </div>

                    {/* Active Filter Banner */}
                    {(filterFramework || filterRequirement) && (
                        <div className="mb-8 p-4 bg-emerald-900/20 border border-emerald-500/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md shadow-lg shadow-emerald-500/5 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                    <Filter className="w-5 h-5" />
                                </div>
                                <span className="text-slate-300">
                                    Showing mappings for
                                    {filterFramework && <span className="text-emerald-400 font-bold ml-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{getFrameworkName(filterFramework)}</span>}
                                    {filterRequirement && <span className="text-emerald-400 font-bold ml-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Req {filterRequirement}</span>}
                                </span>
                            </div>
                            <button
                                onClick={() => router.push('/mapping')}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm rounded-xl transition-all font-medium border border-white/5 hover:border-white/10"
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="text-3xl font-bold text-emerald-400 mb-1">{controls.length}</div>
                            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Controls</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                            <div className="text-3xl font-bold text-blue-400 mb-1">{mappings.length}</div>
                            <div className="text-slate-400 text-xs font-medium uppercase tracking-wider">Active Mappings</div>
                        </div>
                        {Object.entries(stats).slice(0, 3).map(([fw, count]) => (
                            <div key={fw} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-colors group">
                                <div className="text-2xl font-bold text-white mb-1">{count}</div>
                                <div className="text-slate-500 text-xs font-medium uppercase tracking-wider">{getFrameworkName(fw)}</div>
                            </div>
                        ))}
                    </div>

                    {/* Controls with Mappings Table */}
                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-slate-950/20">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                <Link className="w-5 h-5 text-emerald-500" />
                                Controls & Mappings
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5 bg-slate-950/20">
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Control</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Mapped To</th>
                                        <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {controls
                                        .filter(control => {
                                            if (!filterFramework && !filterRequirement) return true;
                                            const matches = mappings.filter(m => m.control.id === control.id);
                                            const hasMatchingMapping = matches.some(m =>
                                                (!filterFramework || m.framework === filterFramework) &&
                                                (!filterRequirement || m.requirement === filterRequirement)
                                            );
                                            return true;
                                        })
                                        .sort((a, b) => {
                                            if (!filterFramework && !filterRequirement) return 0;
                                            const aMatches = mappings.some(m => m.control.id === a.id && (!filterFramework || m.framework === filterFramework) && (!filterRequirement || m.requirement === filterRequirement));
                                            const bMatches = mappings.some(m => m.control.id === b.id && (!filterFramework || m.framework === filterFramework) && (!filterRequirement || m.requirement === filterRequirement));
                                            return (aMatches === bMatches) ? 0 : aMatches ? -1 : 1;
                                        })
                                        .map((control) => {
                                            const controlMappings = mappings.filter(m => m.control.id === control.id);
                                            const isMatch = filterFramework && controlMappings.some(m =>
                                                m.framework === filterFramework &&
                                                (!filterRequirement || m.requirement === filterRequirement)
                                            );

                                            return (
                                                <tr key={control.id} className={`transition-all group border-l-[3px] ${isMatch ? 'bg-emerald-500/5 border-emerald-500' : 'hover:bg-white/5 border-transparent'}`}>
                                                    <td className="px-6 py-5">
                                                        <div className="font-semibold text-white mb-1 ${isMatch ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'}">{control.title}</div>
                                                        <div className="text-sm text-slate-400 max-w-2xl">{control.description}</div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-white/5">
                                                            {control.controlType}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        {controlMappings.length > 0 ? (
                                                            <div className="flex flex-wrap gap-2">
                                                                {controlMappings.map(mapping => (
                                                                    <div key={mapping.id} className="flex items-center gap-2 bg-slate-800/50 border border-white/5 rounded-lg px-2 py-1">
                                                                        <span className="text-xs font-bold text-purple-400">
                                                                            {mapping.framework}
                                                                        </span>
                                                                        <div className="w-px h-3 bg-white/10"></div>
                                                                        <span className="text-xs text-slate-300 font-mono">{mapping.requirement}</span>
                                                                        <button
                                                                            onClick={() => handleDeleteMapping(mapping.id)}
                                                                            className="ml-1 text-slate-500 hover:text-red-400 transition-colors"
                                                                        >
                                                                            <X className="w-3 h-3" />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-600 text-sm italic">Unmapped</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedControl(control);
                                                                setShowMapModal(true);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition-all text-sm font-medium border border-emerald-500/20 hover:border-emerald-500"
                                                        >
                                                            <Plus className="w-4 h-4" />
                                                            Map
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </div>

            {/* Mapping Modal (Premium) - Moved outside z-10 context */}
            {showMapModal && selectedControl && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
                        <button
                            onClick={() => {
                                setShowMapModal(false);
                                setSelectedControl(null);
                            }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 mb-4">
                                <Link className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Map Control to Framework</h2>
                            <p className="text-slate-400 text-sm">Create a relationship between this control and a compliance requirement.</p>
                        </div>

                        <div className="mb-6 p-4 bg-slate-950 rounded-xl border border-white/5">
                            <div className="font-bold text-white mb-1">{selectedControl.title}</div>
                            <div className="text-sm text-slate-400">{selectedControl.description}</div>
                        </div>

                        <form onSubmit={handleMapControl}>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Framework</label>
                                        <select
                                            value={newMapping.framework}
                                            onChange={(e) => setNewMapping({ ...newMapping, framework: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all"
                                        >
                                            {frameworks.map(fw => (
                                                <option key={fw.id} value={fw.id}>{fw.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Requirement ID</label>
                                        <input
                                            type="text"
                                            value={newMapping.requirement}
                                            onChange={(e) => setNewMapping({ ...newMapping, requirement: e.target.value })}
                                            placeholder="e.g., A.5.1, CC6.1"
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-600"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Implementation Notes</label>
                                    <textarea
                                        value={newMapping.description}
                                        onChange={(e) => setNewMapping({ ...newMapping, description: e.target.value })}
                                        placeholder="How does this control satisfy the requirement?"
                                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600 resize-none"
                                        rows={3}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-bold shadow-lg shadow-emerald-500/20"
                                >
                                    Create Mapping
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowMapModal(false);
                                        setSelectedControl(null);
                                    }}
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
    );
}
