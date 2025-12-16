'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function ProcessingView() {
    const { t } = useLanguage();
    const STEPS = [
        t('proc_step_1'),
        t('proc_step_2'),
        t('proc_step_3'),
        t('proc_step_4'),
        t('proc_step_5'),
        t('proc_step_6')
    ];
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (currentStep < STEPS.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 800); // 800ms per step
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-8 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]"></div>
            <h3 className="text-xl font-bold text-white mb-2 tracking-wide">{t('proc_title')}</h3>
            <p className="text-emerald-400/80 animate-pulse font-mono text-sm tracking-wider">{STEPS[currentStep]}</p>

            <div className="mt-8 w-64 h-1.5 bg-slate-800/50 rounded-full overflow-hidden border border-white/5">
                <div
                    className="h-full bg-emerald-500 shadow-[0_0_10px_2px_rgba(16,185,129,0.4)] transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                ></div>
            </div>
        </div>
    );
}
