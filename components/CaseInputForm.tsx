'use client';

import { useState } from 'react';
import { CaseInput } from '@/types';

interface CaseInputFormProps {
    onSubmit: (data: CaseInput) => void;
    isSubmitting: boolean;
}

export default function CaseInputForm({ onSubmit, isSubmitting }: CaseInputFormProps) {
    const [formData, setFormData] = useState<CaseInput>({
        industry: '',
        challenge: '',
        currentPosture: 'Medium',
        desiredOutcome: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 shadow-2xl border border-green-500/20">
                <div className="space-y-6">
                    <div>
                        <label htmlFor="industry" className="block text-sm font-medium text-gray-300 mb-2">
                            Industry Sector
                        </label>
                        <input
                            type="text"
                            id="industry"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-100 placeholder-gray-500 transition-all"
                            placeholder="e.g., Financial Services, Healthcare"
                        />
                    </div>

                    <div>
                        <label htmlFor="challenge" className="block text-sm font-medium text-gray-300 mb-2">
                            Primary Challenge
                        </label>
                        <input
                            type="text"
                            id="challenge"
                            name="challenge"
                            value={formData.challenge}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-100 placeholder-gray-500 transition-all"
                            placeholder="e.g., ISO 27001 Compliance, GDPR Readiness"
                        />
                    </div>

                    <div>
                        <label htmlFor="currentPosture" className="block text-sm font-medium text-gray-300 mb-2">
                            Current Security Posture
                        </label>
                        <select
                            id="currentPosture"
                            name="currentPosture"
                            value={formData.currentPosture}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-100 transition-all"
                        >
                            <option value="Low">Low - Minimal controls in place</option>
                            <option value="Medium">Medium - Basic controls established</option>
                            <option value="High">High - Mature security program</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="desiredOutcome" className="block text-sm font-medium text-gray-300 mb-2">
                            Desired Outcome
                        </label>
                        <textarea
                            id="desiredOutcome"
                            name="desiredOutcome"
                            value={formData.desiredOutcome}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-900/50 border border-green-500/30 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-100 placeholder-gray-500 transition-all resize-none"
                            placeholder="e.g., Achieve certification, improve risk posture"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-8 px-6 py-4 bg-gradient-to-r from-green-600 to-red-600 hover:from-green-700 hover:to-red-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isSubmitting ? 'Generating...' : 'Generate GRCma Report'}
                </button>
            </div>
        </form>
    );
}
