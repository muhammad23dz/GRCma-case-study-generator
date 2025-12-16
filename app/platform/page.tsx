'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import CaseInputForm from '@/components/CaseInputForm';
import PageTransition from '@/components/PageTransition';
import PremiumBackground from '@/components/PremiumBackground';
import ProcessingView from '@/components/ProcessingView';
import ReportView from '@/components/ReportView';
import HistoryView from '@/components/HistoryView';
import MethodologyView from '@/components/MethodologyView';
import AboutView from '@/components/AboutView';

import ZeroTrustLive from '@/components/ZeroTrustLive';
import UserGuide from '@/components/UserGuide';
import { generateReport } from '@/lib/generator';
import { CaseInput, GeneratedReport } from '@/types';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';

type ViewState = 'input' | 'processing' | 'report' | 'history' | 'methodology' | 'about' | 'zero-trust' | 'guide';


export default function PlatformPage() {
    const { t } = useLanguage();
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-950 text-emerald-500 font-mono">{t('plat_loading')}</div>}>
            <HomeContent />
        </Suspense>
    );
}

function HomeContent() {
    const { user } = useUser();
    const searchParams = useSearchParams();
    const { t } = useLanguage();
    const initialView = searchParams.get('view') as ViewState;

    const [viewState, setViewState] = useState<ViewState>(
        (initialView === 'zero-trust' || initialView === 'guide') ? initialView : 'input'
    );
    const [report, setReport] = useState<GeneratedReport | null>(null);

    const [history, setHistory] = useState<GeneratedReport[]>([]);

    useEffect(() => {
        const viewParam = searchParams.get('view') as ViewState;
        if (viewParam && ['input', 'history', 'methodology', 'about', 'zero-trust', 'guide'].includes(viewParam)) {
            setViewState(viewParam);
        }

        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('grcma-history');
            if (saved) {
                try {
                    setHistory(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse saved history:', e);
                }
            }
        }
    }, [searchParams]);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        if (history.length > 0 && typeof window !== 'undefined') {
            localStorage.setItem('grcma-history', JSON.stringify(history));
        }
    }, [history]);


    const handleCaseSubmit = async (data: CaseInput) => {
        setViewState('processing');
        try {
            // Retrieve custom LLM config
            let llmConfig = undefined;
            if (typeof window !== 'undefined') {
                const savedConfig = localStorage.getItem('metric-llm-config');
                if (savedConfig) {
                    llmConfig = JSON.parse(savedConfig);
                }
            }

            const generatedReport = await generateReport(data, user?.primaryEmailAddress?.emailAddress || 'anonymous', llmConfig);

            if (!generatedReport) {
                throw new Error("Received empty response from generator.");
            }

            setReport(generatedReport);
            const newHistory = [generatedReport, ...history];
            setHistory(newHistory);
            setViewState('report');
        } catch (error: any) {
            console.error("Generation failed", error);
            setViewState('input');

            // Extract meaningful error message
            let errorMessage = 'An error occurred while generating the report.';

            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.error) {
                errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
            }

            alert(`Error: ${errorMessage}\n\nPlease try again or check the console for more details.`);
        }
    };

    const handleReset = () => {
        setReport(null);
        setViewState('input');
    };

    const handleSelectReport = (selectedReport: GeneratedReport) => {
        setReport(selectedReport);
        setViewState('report');
    };

    const handleDeleteReport = (reportId: string) => {
        console.log('handleDeleteReport called with ID:', reportId);
        console.log('Current history:', history);

        const newHistory = history.filter(r => r.id !== reportId);
        console.log('New history after filter:', newHistory);

        setHistory(newHistory);
        localStorage.setItem('grcma-history', JSON.stringify(newHistory)); // Immediate update for deletion

        if (report?.id === reportId) {
            console.log('Currently viewing deleted report, resetting view');
            setReport(null);
            setViewState('history');
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-gray-100">
            <PremiumBackground />
            <Header />

            <main className="flex-grow container mx-auto px-4 py-12 pt-32">
                {viewState === 'input' && (
                    <PageTransition>
                        <div className="text-center mb-12 animate-in fade-in duration-1000">
                            <div className="mb-8">
                                <div className="inline-flex items-center gap-3 mb-6 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/20 shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)]">
                                    <span className="flex h-2 w-2 relative">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                    </span>
                                    <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
                                        {t('plat_badge')}
                                    </span>
                                </div>
                                <h1 className="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent mb-6 tracking-tighter leading-none filter drop-shadow-2xl">
                                    GRC<span className="text-emerald-500">ma</span>
                                </h1>
                                <h2 className="text-2xl md:text-4xl font-light text-slate-400 mb-8 tracking-wide">
                                    {t('plat_subtitle')}
                                </h2>
                            </div>
                            <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-6 font-light">
                                {t('plat_desc')} <span className="text-emerald-400 font-medium glow-text">{t('plat_desc_highlight')}</span>.
                            </p>
                            <div className="flex items-center justify-center gap-4 mb-10 opacity-60 hover:opacity-100 transition-opacity">
                                <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                                <span className="text-xs font-bold text-emerald-500/80 tracking-[0.2em] uppercase">{t('plat_system_op')}</span>
                                <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-500/50"></div>
                            </div>
                        </div>
                        <CaseInputForm onSubmit={handleCaseSubmit} isSubmitting={false} />
                    </PageTransition>
                )}

                {viewState === 'processing' && (
                    <ProcessingView />
                )}

                {viewState === 'report' && report ? (
                    <ReportView report={report} onReset={handleReset} />
                ) : viewState === 'report' ? (
                    // Fallback: If view is report but data is missing (shouldn't happen, but fixes the blank screen)
                    <div className="flex flex-col items-center justify-center py-20 animate-in fade-in">
                        <div className="text-red-400 mb-4 font-bold">Report generation result invalid.</div>
                        <button onClick={handleReset} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : null}

                {viewState === 'history' && (
                    <HistoryView history={history} onSelectReport={handleSelectReport} onDeleteReport={handleDeleteReport} />
                )}

                {viewState === 'methodology' && (
                    <MethodologyView />
                )}

                {viewState === 'about' && (
                    <AboutView />
                )}

                {viewState === 'zero-trust' && (
                    <ZeroTrustLive />
                )}

                {viewState === 'guide' && (
                    <UserGuide />
                )}
            </main>
        </div>
    );
}
