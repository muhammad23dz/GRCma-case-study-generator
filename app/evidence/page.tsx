'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

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
    control?: { title: string };
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
    const [selectedFrameworkId, setSelectedFrameworkId] = useState('');

    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        evidenceType: 'document',
        source: 'manual',
        description: '',
        controlId: '',
        riskId: '',
        requirementId: ''
    });

    useEffect(() => {
        fetchEvidence();
        fetchFrameworks();
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
                    requirementId: ''
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading evidence...</div>
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
                            <h1 className="text-4xl font-bold text-white mb-2">Audit Locker</h1>
                            <p className="text-gray-400">Manage compliance evidence, approvals, and mapping</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg font-medium"
                        >
                            + Upload Evidence
                        </button>
                    </div>

                    {/* Evidence Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {evidenceList.map((item) => (
                            <div key={item.id} className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-emerald-500/50 transition-all flex flex-col group relative overflow-hidden">
                                {/* Status Badge */}
                                <div className="absolute top-4 right-4">
                                    <span className={`px-2 py-1 rounded text-xs border font-medium uppercase tracking-wide ${getStatusColor(item.status)}`}>
                                        {item.status.replace('_', ' ')}
                                    </span>
                                </div>

                                <div className="flex items-start mb-4 gap-4">
                                    <div className="p-3 bg-slate-700/50 rounded-lg">
                                        <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0 pr-16"> {/* pr-16 for badge space */}
                                        <h3 className="text-lg font-bold text-white mb-1 truncate" title={item.fileName}>
                                            {item.fileName || 'Untitled Document'}
                                        </h3>
                                        <p className="text-xs text-gray-400 mb-1">
                                            Uploaded by {item.uploadedBy.split('@')[0]}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(item.timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {item.description && (
                                    <p className="text-sm text-gray-300 mb-4 line-clamp-2 bg-slate-900/30 p-2 rounded border border-white/5">
                                        {item.description}
                                    </p>
                                )}

                                <div className="space-y-2 text-sm text-gray-400 mb-4 flex-grow">
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                        <span>Type</span>
                                        <span className="text-white capitalize">{item.evidenceType}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-white/5 pb-1">
                                        <span>Source</span>
                                        <span className="text-white capitalize">{item.source}</span>
                                    </div>

                                    {/* Related Items */}
                                    {item.requirement ? (
                                        <div className="pt-2">
                                            <span className="block text-xs text-emerald-400 font-semibold mb-1">
                                                Mapped to {item.requirement.framework.name}
                                            </span>
                                            <div className="text-white text-xs bg-emerald-900/20 border border-emerald-500/20 p-2 rounded">
                                                <span className="font-bold text-emerald-400 mr-2">{item.requirement.framework.name} {item.requirement.title.split(' ')[0]}</span>
                                                {item.requirement.title}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="pt-1 text-xs text-gray-500 italic">
                                            No requirement linked
                                        </div>
                                    )}
                                </div>

                                {/* Review Actions */}
                                <div className="mt-auto flex flex-col gap-2">
                                    <a
                                        href={item.fileUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-center rounded-lg transition-colors text-sm font-medium"
                                    >
                                        View Evidence
                                    </a>

                                    {item.status === 'draft' && (
                                        <button
                                            onClick={() => handleStatusUpdate(item.id, 'under_review')}
                                            className="w-full px-4 py-2 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors text-sm"
                                        >
                                            Submit for Review
                                        </button>
                                    )}

                                    {item.status === 'under_review' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'approved')}
                                                className="flex-1 px-3 py-2 bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-600/30 rounded-lg text-sm"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(item.id, 'rejected')}
                                                className="flex-1 px-3 py-2 bg-red-600/20 border border-red-500/50 text-red-400 hover:bg-red-600/30 rounded-lg text-sm"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {evidenceList.length === 0 && (
                            <div className="col-span-full text-center py-16 text-gray-500 border-2 border-dashed border-slate-700 rounded-xl">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p>No evidence found. Upload documents to start tracking compliance.</p>
                            </div>
                        )}
                    </div>

                    {/* Upload Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl">
                                <h2 className="text-2xl font-bold text-white mb-6">Upload Evidence</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Evidence File</label>
                                            <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center bg-slate-900/50 hover:border-emerald-500/50 transition-colors cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    onChange={handleFileChange}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    required
                                                />
                                                <div className="pointer-events-none">
                                                    <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                    <p className="text-sm text-gray-400">{file ? file.name : 'Click to select or drag file here'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Evidence Type</label>
                                                <select
                                                    value={formData.evidenceType}
                                                    onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option value="document">Document</option>
                                                    <option value="screenshot">Screenshot</option>
                                                    <option value="log">Log File</option>
                                                    <option value="certification">Certification</option>
                                                    <option value="attestation">Attestation</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">Source</label>
                                                <select
                                                    value={formData.source}
                                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                                    className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                >
                                                    <option value="manual">Manual Upload</option>
                                                    <option value="automated">Automated Collection</option>
                                                    <option value="auditor">External Auditor</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Description / Notes</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500 h-24"
                                                placeholder="Describe what this evidence proves..."
                                            />
                                        </div>

                                        <div className="border-t border-white/5 pt-4">
                                            <h3 className="text-emerald-400 font-medium mb-3">Link to Requirement</h3>
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs uppercase text-gray-500 mb-1">Framework</label>
                                                    <select
                                                        value={selectedFrameworkId}
                                                        onChange={(e) => setSelectedFrameworkId(e.target.value)}
                                                        className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                    >
                                                        <option value="">Select Framework...</option>
                                                        {frameworks.map(fw => (
                                                            <option key={fw.id} value={fw.id}>{fw.name} ({fw.version})</option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {selectedFrameworkId && (
                                                    <div>
                                                        <label className="block text-xs uppercase text-gray-500 mb-1">Requirement</label>
                                                        <select
                                                            value={formData.requirementId}
                                                            onChange={(e) => setFormData({ ...formData, requirementId: e.target.value })}
                                                            className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                        >
                                                            <option value="">Select Requirement...</option>
                                                            {requirements.map(req => (
                                                                <option key={req.id} value={req.id}>{req.title.substring(0, 60)}{req.title.length > 60 ? '...' : ''}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 font-medium"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload Evidence'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowModal(false)}
                                            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all font-medium"
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
