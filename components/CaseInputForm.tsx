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
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="glass rounded-2xl p-10 shadow-2xl border border-emerald-500/20">
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
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 placeholder-gray-500 transition-all outline-none"
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
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 placeholder-gray-500 transition-all outline-none"
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
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 transition-all outline-none cursor-pointer"
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
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 placeholder-gray-500 transition-all resize-none outline-none"
                            placeholder="e.g., Achieve certification, improve risk posture"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-green-700 via-emerald-600 to-red-700 hover:from-green-800 hover:via-emerald-700 hover:to-red-800 text-white font-bold rounded-xl shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                >
                    {isSubmitting ? 'Generating...' : 'Generate GRCma Report'}
                </button>
            </div>
        </form>
    );
}
