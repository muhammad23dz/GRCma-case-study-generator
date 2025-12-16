'use client';

import { useState } from 'react';
import { CaseInput } from '@/types';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface CaseInputFormProps {
    onSubmit: (data: CaseInput) => void;
    isSubmitting: boolean;
}

export default function CaseInputForm({ onSubmit, isSubmitting }: CaseInputFormProps) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<CaseInput>({
        companyName: '',
        targetFramework: '',
        companySize: '',
        keyChallenge: ''
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
                    {/* Company Name */}
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('cp_company_name')}
                        </label>
                        <input
                            type="text"
                            id="companyName"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 placeholder-gray-500 transition-all outline-none"
                            placeholder={t('cp_company_ph')}
                        />
                    </div>

                    {/* Target Framework */}
                    <div>
                        <label htmlFor="targetFramework" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('cp_framework')}
                        </label>
                        <input
                            type="text"
                            id="targetFramework"
                            name="targetFramework"
                            value={formData.targetFramework}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 placeholder-gray-500 transition-all outline-none"
                            placeholder={t('cp_framework_ph')}
                        />
                    </div>

                    {/* Company Size */}
                    <div>
                        <label htmlFor="companySize" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('cp_size')}
                        </label>
                        <select
                            id="companySize"
                            name="companySize"
                            value={formData.companySize}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 transition-all outline-none cursor-pointer"
                        >
                            <option value="">{t('cp_size_sel')}</option>
                            <option value="Start-up (1-50)">{t('cp_size_sm')}</option>
                            <option value="Mid-Market (51-500)">{t('cp_size_md')}</option>
                            <option value="Enterprise (500+)">{t('cp_size_lg')}</option>
                        </select>
                    </div>

                    {/* Key Challenge */}
                    <div>
                        <label htmlFor="keyChallenge" className="block text-sm font-medium text-gray-300 mb-2">
                            {t('cp_challenge')}
                        </label>
                        <textarea
                            id="keyChallenge"
                            name="keyChallenge"
                            value={formData.keyChallenge}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-3.5 bg-black/20 border border-emerald-500/30 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-black/30 text-gray-100 placeholder-gray-500 transition-all resize-none outline-none"
                            placeholder={t('cp_challenge_ph')}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-green-700 via-emerald-600 to-red-700 hover:from-green-800 hover:via-emerald-700 hover:to-red-800 text-white font-bold rounded-xl shadow-xl hover:shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                >
                    {isSubmitting ? t('cp_btn_gen_loading') : t('cp_btn_gen')}
                </button>
            </div>
        </form>
    );
}
