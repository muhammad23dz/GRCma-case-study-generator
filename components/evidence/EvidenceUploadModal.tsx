'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    X,
    Upload,
    File,
    CheckCircle,
    Loader2,
    AlertCircle,
    FileText,
    Link as LinkIcon
} from 'lucide-react';

interface EvidenceUploadModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

export function EvidenceUploadModal({ onClose, onSuccess }: EvidenceUploadModalProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [controls, setControls] = useState<any[]>([]);
    const [loadingControls, setLoadingControls] = useState(true);

    const [metadata, setMetadata] = useState({
        evidenceType: 'document',
        controlId: '',
        description: '',
        auditPeriod: 'Q4 2025'
    });

    useEffect(() => {
        async function fetchControls() {
            try {
                const res = await fetch('/api/controls');
                const data = await res.json();
                setControls(data.data || []);
            } catch (error) {
                console.error('Failed to fetch controls:', error);
            } finally {
                setLoadingControls(false);
            }
        }
        fetchControls();
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        setFiles(acceptedFiles);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'application/pdf': ['.pdf'],
            'image/*': ['.png', '.jpg', '.jpeg'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'text/plain': ['.txt']
        }
    });

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', files[0]);
            formData.append('evidenceType', metadata.evidenceType);
            formData.append('controlId', metadata.controlId);
            formData.append('description', metadata.description);
            formData.append('auditPeriod', metadata.auditPeriod);

            const response = await fetch('/api/evidence', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) throw new Error('Upload failed');

            onSuccess();
            onClose();
        } catch (error) {
            alert('Upload failed: ' + (error as any).message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-bold text-white">Upload Evidence</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`
                            border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
                            ${isDragActive ? 'border-primary bg-primary/5' : 'border-white/10 hover:border-white/20 bg-white/2'}
                        `}
                    >
                        <input {...getInputProps()} />
                        {files.length > 0 ? (
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-emerald-500/10 rounded-2xl mb-3">
                                    <FileCheck className="w-8 h-8 text-emerald-400" />
                                </div>
                                <p className="text-sm font-bold text-white">{files[0].name}</p>
                                <p className="text-xs text-slate-500 mt-1">{(files[0].size / 1024).toFixed(1)} KB</p>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setFiles([]); }}
                                    className="mt-4 text-xs font-bold text-red-400 hover:underline"
                                >
                                    Remove and choose another
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className="p-4 bg-white/5 rounded-2xl mb-3 group-hover:bg-white/10 transition-colors">
                                    <Upload className="w-8 h-8 text-slate-500" />
                                </div>
                                <p className="text-sm font-bold text-white mb-1">
                                    {isDragActive ? 'Drop file here' : 'Click or drag file to upload'}
                                </p>
                                <p className="text-xs text-slate-500">PDF, PNG, JPG, or DOCX up to 10MB</p>
                            </div>
                        )}
                    </div>

                    {/* Metadata Form */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Linked Control</label>
                            <select
                                value={metadata.controlId}
                                onChange={e => setMetadata({ ...metadata, controlId: e.target.value })}
                                disabled={loadingControls}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                            >
                                <option value="" className="bg-slate-900">Select Control (Optional)</option>
                                {controls.map(c => (
                                    <option key={c.id} value={c.id} className="bg-slate-900">{c.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Evidence Type</label>
                            <select
                                value={metadata.evidenceType}
                                onChange={e => setMetadata({ ...metadata, evidenceType: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                            >
                                <option value="document" className="bg-slate-900">Document</option>
                                <option value="screenshot" className="bg-slate-900">Screenshot</option>
                                <option value="log" className="bg-slate-900">System Log</option>
                                <option value="certification" className="bg-slate-900">Certification</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Audit Period</label>
                            <input
                                value={metadata.auditPeriod}
                                onChange={e => setMetadata({ ...metadata, auditPeriod: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                placeholder="e.g. Q4 2025"
                            />
                        </div>
                    </div>
                </div>

                <div className="px-6 py-4 bg-white/2 border-t border-white/5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleUpload}
                        disabled={uploading || files.length === 0}
                        className="flex-2 flex items-center justify-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        Securely Upload
                    </button>
                </div>
            </div>
        </div>
    );
}

function FileCheck({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
}
