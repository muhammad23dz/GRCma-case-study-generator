'use client';

import { useEffect, useState } from 'react';

const STEPS = [
    "Analyzing Case Parameters...",
    "Mapping Logic Flow...",
    "Identifying Drivers and Risks...",
    "Structuring Gap Analysis...",
    "Drafting Executive Summary...",
    "Finalizing GRC Report..."
];

export default function ProcessingView() {
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
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-8"></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Generating Case Study</h3>
            <p className="text-gray-500 animate-pulse">{STEPS[currentStep]}</p>

            <div className="mt-8 w-64 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-600 transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                ></div>
            </div>
        </div>
    );
}
