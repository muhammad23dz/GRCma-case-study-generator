'use client';

import { useState, useEffect } from 'react';
import { useUser, useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PremiumBackground from '@/components/PremiumBackground';
import CaseInputForm from '@/components/CaseInputForm';
import ReportView from '@/components/ReportView';
import { CaseInput, GeneratedReport } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';

export default function PlatformPage() {
    const { user, isLoaded, isSignedIn } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [step, setStep] = useState<'form' | 'generating' | 'report'>('form');
    const [report, setReport] = useState<GeneratedReport | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Redirect to sign-in if not authenticated
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            router.push('/sign-in?redirect_url=/platform');
        }
    }, [isLoaded, isSignedIn, router]);

    // Show loading while checking auth
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    // Don't render page if not signed in
    if (!isSignedIn) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
                    <p className="text-white">Redirecting to sign in...</p>
                </div>
            </div>
        );
    }

    const handleGenerate = async (data: CaseInput) => {
        setStep('generating');
        setError(null);

        try {
            // Step 1: Generate the report using AI
            const response = await fetch('/api/grc/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // Include auth cookies
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Generation failed');
            }

            const generatedReport: GeneratedReport = await response.json();

            // Step 2: Immediately save to assessments history
            const saveResponse = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include', // IMPORTANT: Include auth cookies
                body: JSON.stringify({ sections: generatedReport.sections })
            });

            if (!saveResponse.ok) {
                console.error('Failed to save assessment:', await saveResponse.text());
                // Don't fail the whole flow, just log it
            } else {
                console.log('Assessment saved successfully');
            }

            setReport(generatedReport);
            setStep('report');

        } catch (err: any) {
            console.error('Generation Error:', err);
            setError(err.message || 'Failed to generate assessment. Please try again.');
            setStep('form');
        }
    };

    const handleReset = () => {
        setStep('form');
        setReport(null);
        setError(null);
    };

    return (
        <div className="min-h-screen text-white relative flex flex-col">
            <PremiumBackground />
            <Header />

            <main className="flex-1 relative z-10 pt-32 pb-20 px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Title Section */}
                    {step === 'form' && (
                        <div className="text-center mb-12">
                            {/* Back to Dashboard */}
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 text-sm transition-colors"
                            >
                                ← Back to Dashboard
                            </button>
                            <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 animate-gradient-x">
                                    AI-Powered GRC
                                </span>
                                <br />
                                <span className="text-white">Assessment</span>
                            </h1>
                            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                                Generate comprehensive compliance reports, risk assessments, and control mappings in seconds using advanced AI.
                            </p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="max-w-3xl mx-auto mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    {/* Step Content */}
                    {step === 'form' && (
                        <CaseInputForm onSubmit={handleGenerate} isSubmitting={false} />
                    )}

                    {step === 'generating' && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="relative w-24 h-24 mb-8">
                                <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-t-emerald-500 rounded-full animate-spin"></div>
                                <Sparkles className="absolute inset-0 m-auto text-emerald-400 animate-pulse w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Analyzing Requirements...</h2>
                            <p className="text-slate-400">Our AI Auditor is generating your GRC assessment</p>
                        </div>
                    )}

                    {step === 'report' && report && (
                        <ReportView report={report} onReset={handleReset} />
                    )}
                </div>
            </main>
        </div>
    );
}
