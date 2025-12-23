'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertTriangle, Loader2 } from 'lucide-react';

interface FindingFormProps {
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

export function FindingForm({ onClose, onSuccess, initialData }: FindingFormProps) {
    const [submitting, setSubmitting] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [audits, setAudits] = useState<any[]>([]);
    const [controls, setControls] = useState<any[]>([]);

    // Form state
    const [formData, setFormData] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        severity: initialData?.severity || 'medium',
        auditId: initialData?.auditId || '',
        controlId: initialData?.controlId || '',
        recommendation: initialData?.recommendation || '',
        dueDate: initialData?.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
    });

    useEffect(() => {
        async function fetchData() {
            try {
                const [auditsRes, controlsRes] = await Promise.all([
                    fetch('/api/audit').then(r => r.json()),
                    fetch('/api/controls').then(r => r.json())
                ]);

                setAudits(auditsRes.audits || []);
                setControls(controlsRes.data || []);
            } catch (error) {
                console.error('Failed to fetch form data:', error);
            } finally {
                setLoadingData(false);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const response = await fetch('/api/audit-findings', {
                method: initialData ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error('Failed to save finding');

            onSuccess();
            onClose();
        } catch (error) {
            alert('Error saving finding: ' + (error as any).message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">
                            {initialData ? 'Edit Finding' : 'New Audit Finding'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {loadingData ? (
                    <div className="p-12 flex flex-col items-center justify-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-slate-400">Loading audits and controls...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Title</label>
                                <input
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    placeholder="e.g. Missing MFA for administrative accounts"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Description</label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"
                                    placeholder="Provide details about the identified deficiency..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Audit Cycle</label>
                                    <select
                                        required
                                        value={formData.auditId}
                                        onChange={e => setFormData({ ...formData, auditId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="" disabled className="bg-slate-900">Select Audit</option>
                                        {audits.map(a => (
                                            <option key={a.id} value={a.id} className="bg-slate-900">{a.title}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Linked Control</label>
                                    <select
                                        required
                                        value={formData.controlId}
                                        onChange={e => setFormData({ ...formData, controlId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="" disabled className="bg-slate-900">Select Control</option>
                                        {controls.map(c => (
                                            <option key={c.id} value={c.id} className="bg-slate-900">{c.title}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Severity</label>
                                    <select
                                        value={formData.severity}
                                        onChange={e => setFormData({ ...formData, severity: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium appearance-none"
                                    >
                                        <option value="critical" className="bg-slate-900 text-red-400">Critical</option>
                                        <option value="major" className="bg-slate-900 text-orange-400">Major</option>
                                        <option value="medium" className="bg-slate-900 text-yellow-400">Medium</option>
                                        <option value="minor" className="bg-slate-900 text-blue-400">Minor</option>
                                        <option value="observation" className="bg-slate-900 text-slate-400">Observation</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Due Date</label>
                                    <input
                                        type="date"
                                        value={formData.dueDate}
                                        onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Recommendation</label>
                                <textarea
                                    rows={2}
                                    value={formData.recommendation}
                                    onChange={e => setFormData({ ...formData, recommendation: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium resize-none"
                                    placeholder="Steps to remediate this finding..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all font-bold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-2 flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/80 hover:to-blue-600/80 text-white rounded-xl transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {initialData ? 'Update Finding' : 'Create Finding'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
