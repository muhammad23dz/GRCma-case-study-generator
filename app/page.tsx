'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Header from '@/components/Header';
import CaseInputForm from '@/components/CaseInputForm';
import ProcessingView from '@/components/ProcessingView';
import ReportView from '@/components/ReportView';
import HistoryView from '@/components/HistoryView';
import MethodologyView from '@/components/MethodologyView';
import AboutView from '@/components/AboutView';
import { generateReport } from '@/lib/generator';
import { CaseInput, GeneratedReport } from '@/types';

type ViewState = 'input' | 'processing' | 'report' | 'history' | 'methodology' | 'about';

export default function Home() {
  const { data: session } = useSession();
  const [viewState, setViewState] = useState<ViewState>('input');
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [history, setHistory] = useState<GeneratedReport[]>(() => {
    // Load history from localStorage on initial render
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('grcma-history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved history:', e);
        }
      }
    }
    return [];
  });

  // Save history to localStorage whenever it changes
  const updateHistory = (newHistory: GeneratedReport[]) => {
    setHistory(newHistory);
    if (typeof window !== 'undefined') {
      localStorage.setItem('grcma-history', JSON.stringify(newHistory));
    }
  };

  const handleCaseSubmit = async (data: CaseInput) => {
    setViewState('processing');
    try {
      const generatedReport = await generateReport(data);
      setReport(generatedReport);
      const newHistory = [generatedReport, ...history];
      updateHistory(newHistory);
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

  const handleNavChange = (view: ViewState) => {
    setViewState(view);
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

    updateHistory(newHistory);

    if (report?.id === reportId) {
      console.log('Currently viewing deleted report, resetting view');
      setReport(null);
      setViewState('history');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col font-sans text-gray-100">
      <Header onNavChange={handleNavChange} />

      <main className="flex-grow container mx-auto px-4 py-12">
        {viewState === 'input' && (
          <div className="animate-fade-in">
            <div className="text-center mb-12">
              <div className="mb-8">
                <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600/10 to-red-600/10 border border-green-500/20">
                  <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent">
                    Professional GRC Intelligence Platform
                  </span>
                </div>
                <h1 className="text-7xl md:text-8xl lg:text-9xl font-black bg-gradient-to-r from-green-600 via-emerald-500 to-red-600 bg-clip-text text-transparent mb-4 tracking-tighter leading-none">
                  GRC<span className="text-red-500">ma</span>
                </h1>
                <h2 className="text-3xl md:text-4xl font-light text-gray-300 mb-8 tracking-wide">
                  Case Study Generator
                </h2>
              </div>
              <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-6 font-light">
                Generate comprehensive <span className="text-emerald-400 font-medium">Governance</span>, <span className="text-emerald-400 font-medium">Risk</span>, and <span className="text-red-400 font-medium">Compliance</span> reports modeled after top-tier assessment frameworks.
              </p>
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-500/50"></div>
                <span className="text-sm font-semibold text-gray-500 tracking-widest uppercase">Powered by HMAMOUCH</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-red-500/50"></div>
              </div>
            </div>
            <CaseInputForm onSubmit={handleCaseSubmit} isSubmitting={false} />
          </div>
        )}

        {viewState === 'processing' && (
          <ProcessingView />
        )}

        {viewState === 'report' && report && (
          <ReportView report={report} onReset={handleReset} />
        )}

        {viewState === 'history' && (
          <HistoryView history={history} onSelectReport={handleSelectReport} onDeleteReport={handleDeleteReport} />
        )}

        {viewState === 'methodology' && (
          <MethodologyView />
        )}

        {viewState === 'about' && (
          <AboutView />
        )}
      </main>

      <footer className="bg-slate-900/50 backdrop-blur-sm py-8 border-t border-green-500/20 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p suppressHydrationWarning>&copy; {new Date().getFullYear()} GRCma. Created by HMAMOUCH.</p>
        </div>
      </footer>
    </div>
  );
}
