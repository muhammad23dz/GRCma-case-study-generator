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
    uploadedBy: string;
    timestamp: string;
    control?: { title: string };
    risk?: { id: string };
}

export default function EvidencePage() {
    const router = useRouter();
    const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [file, setFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        evidenceType: 'document',
        source: 'manual',
        controlId: '',
        riskId: ''
    });

    useEffect(() => {
        fetchEvidence();
    }, []);

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
        if (formData.controlId) data.append('controlId', formData.controlId);
        if (formData.riskId) data.append('riskId', formData.riskId);

        try {
            const res = await fetch('/api/evidence', {
                method: 'POST',
                body: data
            });

            if (res.ok) {
                setShowModal(false);
                setFile(null);
                setFormData({ evidenceType: 'document', source: 'manual', controlId: '', riskId: '' });
                fetchEvidence();
            }
        } catch (error) {
            console.error('Error uploading evidence:', error);
        } finally {
            setUploading(false);
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
                            <h1 className="text-4xl font-bold text-white mb-2">Evidence Library</h1>
                            <p className="text-gray-400">Manage compliance evidence and documents</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg"
                        >
                            + Upload Evidence
                        </button>
                    </div>

                    {/* Evidence Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {evidenceList.map((item) => (
                            <div key={item.id} className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-emerald-500/50 transition-all">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-emerald-500/10 rounded-lg">
                                        <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2 truncate" title={item.fileName}>
                                    {item.fileName || 'Untitled Document'}
                                </h3>
                                <div className="space-y-2 text-sm text-gray-400">
                                    <div className="flex justify-between">
                                        <span>Type:</span>
                                        <span className="text-white capitalize">{item.evidenceType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Source:</span>
                                        <span className="text-white capitalize">{item.source}</span>
                                    </div>
                                    {item.control && (
                                        <div className="flex justify-between">
                                            <span>Control:</span>
                                            <span className="text-emerald-400 truncate max-w-[150px]">{item.control.title}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex gap-2">
                                    <a
                                        href={item.fileUrl || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-center rounded-lg transition-colors text-sm"
                                    >
                                        View File
                                    </a>
                                </div>
                            </div>
                        ))}

                        {evidenceList.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                No evidence uploaded yet. Click upload to add documents.
                            </div>
                        )}
                    </div>

                    {/* Upload Modal */}
                    {showModal && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-800 border border-white/10 rounded-lg p-8 max-w-2xl w-full mx-4">
                                <h2 className="text-2xl font-bold text-white mb-6">Upload Evidence</h2>
                                <form onSubmit={handleSubmit}>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">File</label>
                                            <input
                                                type="file"
                                                onChange={handleFileChange}
                                                className="w-full text-gray-300"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Evidence Type</label>
                                            <select
                                                value={formData.evidenceType}
                                                onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            >
                                                <option value="document">Document</option>
                                                <option value="scan">Scan Report</option>
                                                <option value="screenshot">Screenshot</option>
                                                <option value="log">Log File</option>
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
                                        <div>
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Link to Control (ID)</label>
                                            <input
                                                type="text"
                                                value={formData.controlId}
                                                onChange={(e) => setFormData({ ...formData, controlId: e.target.value })}
                                                className="w-full px-4 py-2 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                                placeholder="Optional"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 mt-6">
                                        <button
                                            type="submit"
                                            disabled={uploading}
                                            className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50"
                                        >
                                            {uploading ? 'Uploading...' : 'Upload File'}
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
