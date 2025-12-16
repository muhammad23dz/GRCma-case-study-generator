'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { ArrowLeft, Save, AlertTriangle } from 'lucide-react';

export default function NewChangePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        justification: '',
        changeType: 'normal',
        category: 'application',
        priority: 'medium',
        impactLevel: 'low',
        urgency: 'low',
        complexity: 'simple',
        requestedDate: new Date().toISOString().split('T')[0],
        implementationPlan: '',
        backoutPlan: '',
        affectedSystems: []
    });

    const handleChange = (e: any) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const calculateRiskScore = () => {
        const impact = formData.impactLevel === 'high' ? 5 : formData.impactLevel === 'medium' ? 3 : 1;
        const urgency = formData.urgency === 'critical' ? 5 : formData.urgency === 'high' ? 4 : formData.urgency === 'medium' ? 3 : 2;
        const complexity = formData.complexity === 'complex' ? 5 : formData.complexity === 'moderate' ? 3 : 1;
        return impact * urgency * complexity;
    };

    const currentRiskScore = calculateRiskScore();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/changes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/changes');
            } else {
                alert('Failed to submit change request');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950">
            <Header />
            <main className="max-w-4xl mx-auto px-4 py-8 pt-32">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white mb-6"
                >
                    <ArrowLeft className="w-4 h-4" /> Back to Changes
                </button>

                <div className="bg-slate-900/50 border border-white/5 rounded-xl p-8">
                    <h1 className="text-2xl font-bold text-white mb-6">New Change Request</h1>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-emerald-400 border-b border-white/5 pb-2">1. General Information</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Change Title</label>
                                <input
                                    name="title"
                                    required
                                    value={formData.title}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="e.g. Upgrade Database Server v14 to v15"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                                    <select
                                        name="changeType"
                                        value={formData.changeType}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                    >
                                        <option value="standard">Standard (Pre-approved)</option>
                                        <option value="normal">Normal (Requires Approval)</option>
                                        <option value="emergency">Emergency (Expedited)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                    >
                                        <option value="application">Application</option>
                                        <option value="infrastructure">Infrastructure</option>
                                        <option value="security">Security</option>
                                        <option value="data">Data</option>
                                        <option value="process">Process</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Justification</label>
                                <textarea
                                    name="justification"
                                    required
                                    value={formData.justification}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Why is this change needed now?"
                                />
                            </div>
                        </div>

                        {/* Section 2: Risk Assessment */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-emerald-400 border-b border-white/5 pb-2 flex justify-between">
                                2. Risk Assessment
                                <span className={`text-sm px-3 py-1 rounded-full ${currentRiskScore >= 12 ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                                    Risk Score: {currentRiskScore}
                                </span>
                            </h3>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Impact</label>
                                    <select
                                        name="impactLevel"
                                        value={formData.impactLevel}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Urgency</label>
                                    <select
                                        name="urgency"
                                        value={formData.urgency}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="critical">Critical</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Complexity</label>
                                    <select
                                        name="complexity"
                                        value={formData.complexity}
                                        onChange={handleChange}
                                        className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                    >
                                        <option value="simple">Simple</option>
                                        <option value="moderate">Moderate</option>
                                        <option value="complex">Complex</option>
                                    </select>
                                </div>
                            </div>

                            {currentRiskScore >= 12 && (
                                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                                    <div className="text-sm text-orange-200">
                                        <strong>High Risk Warning:</strong> This change has a high risk score. It will automatically trigger an entry in the Risk Register and require CAB approval.
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 3: Implementation Plan */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-emerald-400 border-b border-white/5 pb-2">3. Implementation Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Implementation Plan</label>
                                <textarea
                                    name="implementationPlan"
                                    required
                                    value={formData.implementationPlan}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="Step-by-step execution plan..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Back-out Plan</label>
                                <textarea
                                    name="backoutPlan"
                                    required
                                    value={formData.backoutPlan}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                    placeholder="How to revert if things go wrong..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Requested Implementation Date</label>
                                <input
                                    type="date"
                                    name="requestedDate"
                                    value={formData.requestedDate}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-white"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-white/5">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                            >
                                {isLoading ? 'Submitting...' : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Submit Request
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
