'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Link, ArrowRight, Trash2, Filter, X, Shield, Plus, FileText, CheckCircle2, XCircle, Clock, Eye, Upload, FileCheck, Lock } from 'lucide-react';

interface Evidence {
    id: string;
    fileName: string;
    fileUrl: string;
    evidenceType: string;
    source: string;
    description: string;
    status: string;
    uploadedBy: string;
    timestamp: string;
    control?: { id: string; title: string };
    risk?: { id: string };
    requirement?: {
        id: string;
        title: string;
        framework: { name: string; version: string };
    };
    reviewNotes?: string;
}

interface Framework {
    id: string;
    name: string;
    version: string;
}

interface Requirement {
    id: string;
    requirementId: string;
    title: string;
}

export default function EvidencePage() {
    const router = useRouter();
    const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Selection Data
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [requirements, setRequirements] = useState<Requirement[]>([]);
    const [controls, setControls] = useState<{ id: string, title: string }[]>([]);
    const [selectedFrameworkId, setSelectedFrameworkId] = useState('');

    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        evidenceType: 'document',
        source: 'manual',
        description: '',
        controlId: '',
        riskId: '',
        requirementId: '',
        auditPeriod: 'Q4 2025'
    });

    useEffect(() => {
        fetchEvidence();
        fetchFrameworks();
        fetchControls();
    }, []);

    useEffect(() => {
        if (selectedFrameworkId) {
            fetchRequirements(selectedFrameworkId);
        } else {
            setRequirements([]);
        }
    }, [selectedFrameworkId]);

    const fetchEvidence = async () => {
        try {
            const res = await fetch('/api/evidence');
            const data = await res.json();
            setEvidenceList(data.evidence || []);
        } catch (error) {
            console.error('Error fetching evidence:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchFrameworks = async () => {
        try {
            const res = await fetch('/api/frameworks');
            if (res.ok) {
                const data = await res.json();
                setFrameworks(data.frameworks || []);
            }
        } catch (error) {
            console.error('Error fetching frameworks:', error);
        }
    };

    const fetchRequirements = async (frameworkId: string) => {
        try {
            const res = await fetch(`/api/frameworks/${frameworkId}/requirements`);
            if (res.ok) {
                const data = await res.json();
                setRequirements(data.requirements || []);
            }
        } catch (error) {
            console.error('Error fetching requirements:', error);
        }
    };

    const fetchControls = async () => {
        try {
            const res = await fetch('/api/controls');
            if (res.ok) {
                const data = await res.json();
                setControls(data.controls || []);
            }
        } catch (error) {
            console.error('Error fetching controls:', error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append('file', file);
        data.append('evidenceType', formData.evidenceType);
        data.append('source', formData.source);
        data.append('description', formData.description);
        if (formData.controlId) data.append('controlId', formData.controlId);
        if (formData.riskId) data.append('riskId', formData.riskId);
        if (formData.requirementId) data.append('requirementId', formData.requirementId);

        try {
            const res = await fetch('/api/evidence', {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                setShowModal(false);
                setFile(null);
                setFormData({
                    evidenceType: 'document',
                    source: 'manual',
                    description: '',
                    controlId: '',
                    riskId: '',
                    requirementId: '',
                    auditPeriod: 'Q4 2025'
                });
                setSelectedFrameworkId('');
                fetchEvidence();
            }
        } catch (error) {
            console.error('Error uploading evidence:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/evidence/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                // Optimistically update UI
                setEvidenceList(list => list.map(item =>
                    item.id === id ? { ...item, status: newStatus } : item
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
            case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'under_review': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            default: return 'bg-slate-700 text-gray-400 border-slate-600';
        }
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
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Audit Locker</h1>
                            <p className="text-slate-400">Manage compliance evidence, approvals, and mapping</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 font-bold flex items-center gap-2 group"
                        >
                            <Upload className="w-5 h-5 group-hover:animate-bounce" />
                            Upload Evidence
                        </button>
                    </div>

                    {/* Evidence Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {evidenceList.map((item) => (
                            <div key={item.id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 hover:bg-white/5 transition-all group relative overflow-hidden flex flex-col">
                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                                {/* Status Badge */}
                                <div className="absolute top-4 right-4 z-10">
                                    <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide border backdrop-blur-md ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex items-start mb-4 gap-4 relative z-10">
                                    <div className="p-3 bg-slate-800/80 rounded-xl border border-white/5 group-hover:border-emerald-500/30 transition-colors shadow-lg">
                                        <FileCheck className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-20">
                                        <h3 className="text-lg font-bold text-white mb-1 truncate leading-tight" title={item.fileName}>
                                            {item.fileName || 'Untitled Document'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                                            <span className="font-medium text-slate-300">{item.uploadedBy.split('@')[0]}</span>
                                            <span>•</span>
                                            <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {item.description && (
                                    <p className="text-sm text-slate-400 mb-4 line-clamp-2 bg-slate-950/30 p-3 rounded-lg border border-white/5 relative z-10">
                                        {item.description}
                                    </p>
                                )}

                                <div className="space-y-3 text-sm text-slate-400 mb-6 flex-grow relative z-10">
                                    <div className="flex justify-between border-b border-white/5 pb-2 border-dashed">
                                        <span className="text-slate-500">Type</span>
                                        <span className="text-white capitalize font-medium">{item.evidenceType}</span>
                                    </div>

                                    {/* Related Items */}
                                    {item.control && (
                                        <div className="pt-1 border-t border-white/5 border-dashed mb-2">
                                            <div className="flex items-center gap-2 mb-1 mt-2">
                                                <Lock className="w-3 h-3 text-blue-400" />
                                                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                                                    Control
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-300 bg-slate-950/50 border border-white/5 p-2 rounded-lg line-clamp-2 hover:line-clamp-none transition-all">
                                                <span className="font-mono text-blue-500 mr-2 font-bold">{item.control.id}</span>
                                                {item.control.title}
                                            </div>
                                        </div>
                                    )}

                                    {item.requirement ? (
                                        <div className="pt-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Shield className="w-3 h-3 text-emerald-500" />
                                                <span className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
                                                    {item.requirement.framework.name}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-300 bg-slate-950/50 border border-white/5 p-2 rounded-lg line-clamp-2 hover:line-clamp-none transition-all">
                                                <span className="font-mono text-emerald-500 mr-2 font-bold">{item.requirement.framework.version}</span>
                                                {item.requirement.title}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-2 text-xs text-slate-600 italic flex items-center gap-2 opacity-50">
                                            <Shield className="w-3 h-3" />
                                            Unmapped Evidence
                                        </div>
                                    )}
                                </div>

                                {/* Review Actions */}
                                <div className="mt-auto flex flex-col gap-2 relative z-10">
                                    <a
                                        href={item.fileUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all text-sm font-semibold border border-white/5 hover:border-white/20"
                                    >
                                        <Eye className="w-4 h-4" />
                                        View Evidence
                                    </a>

                                    {item.status === 'draft' && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, 'under_review')}
                                            className="w-full px-4 py-2.5 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-all text-sm font-semibold flex items-center justify-center gap-2"
                                        >
                                            <Clock className="w-4 h-4" />
                                            Submit for Review
                                        </button>
                                    )}

                                    {item.status === 'under_review' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'approved')}
                                                className="flex-1 px-3 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                                className="flex-1 px-3 py-2.5 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {evidenceList.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-slate-600">
                                    <FileText className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No Evidence Found</h3>
                                <p className="text-slate-400 max-w-sm text-center">Upload documents, screenshots, or logs to start tracking your compliance evidence.</p>
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Upload Modal (Premium) - Moved outside z-10 context */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-3xl font-black text-white mb-6 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                                <Upload className="w-6 h-6" />
                            </div>
                            Upload Evidence
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Evidence File</label>
                                    <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center bg-slate-950 hover:border-emerald-500/50 transition-all cursor-pointer relative group">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            required
                                        />
                                        <div className="pointer-events-none transform group-hover:scale-105 transition-transform duration-300">
                                            <div className="w-16 h-16 mx-auto mb-4 bg-slate-900 rounded-full flex items-center justify-center text-emerald-500 shadow-lg shadow-emerald-900/20">
                                                <Plus className="w-8 h-8" />
                                            </div>
                                            <p className="text-lg font-medium text-white mb-1">
                                                {file ? file.name : 'Drop your file here'}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {file ? 'Click to change' : 'or click to browse'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Type</label>
                                        <select
                                            value={formData.evidenceType}
                                            onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                        >
                                            <option value="document">Document</option>
                                            <option value="screenshot">Screenshot</option>
                                            <option value="log">Log File</option>
                                            <option value="certification">Certification</option>
                                            <option value="attestation">Attestation</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Audit Period</label>
                                        <select
                                            value={formData.auditPeriod}
                                            onChange={(e) => setFormData({ ...formData, auditPeriod: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                        >
                                            <option value="Q3 2025">Q3 2025 (Current)</option>
                                            <option value="Q4 2025">Q4 2025 (Upcoming)</option>
                                            <option value="Q2 2025">Q2 2025 (Historical)</option>
                                            <option value="2025">Full Year 2025</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-slate-950 p-5 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-900/10">
                                    <label className="block text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wide flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        Linked Control (Required)
                                    </label>
                                    <select
                                        value={formData.controlId}
                                        onChange={(e) => setFormData({ ...formData, controlId: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all font-medium"
                                        required
                                    >
                                        <option value="">Select Control to Prove...</option>
                                        {controls.map(c => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-slate-500 mt-2 ml-1">Evidence must directly support a specific control's effectiveness.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Notes</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 h-24 transition-all placeholder:text-slate-600 resize-none"
                                        placeholder="Describe context for the auditor..."
                                    />
                                </div>

                                <div className="border-t border-white/5 pt-6">
                                    <h3 className="text-emerald-400 font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                                        <Filter className="w-4 h-4" />
                                        Optional Mapping
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs uppercase text-slate-500 mb-1 font-bold">Framework</label>
                                            <select
                                                value={selectedFrameworkId}
                                                onChange={(e) => setSelectedFrameworkId(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                                            >
                                                <option value="">Select Framework...</option>
                                                {frameworks.map(fw => (
                                                    <option key={fw.id} value={fw.id}>{fw.name} ({fw.version})</option>
                                                ))}
                                            </select>
                                        </div>

                                        {selectedFrameworkId && (
                                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                <label className="block text-xs uppercase text-slate-500 mb-1 font-bold">Requirement</label>
                                                <select
                                                    value={formData.requirementId}
                                                    onChange={(e) => setFormData({ ...formData, requirementId: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-950 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500/50 text-sm"
                                                >
                                                    <option value="">Select Requirement...</option>
                                                    {requirements.map(req => (
                                                        <option key={req.id} value={req.id}>{req.title.substring(0, 80)}{req.title.length > 80 ? '...' : ''}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8 pt-4 border-t border-white/5">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all disabled:opacity-50 font-bold text-lg shadow-lg shadow-emerald-500/20"
                                >
                                    {uploading ? 'Uploading...' : 'Upload Evidence'}
                                </button>
                                <div
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-4 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all font-bold cursor-pointer flex items-center"
                                >
                                    Cancel
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}
