'use client';

import { useState } from 'react';
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
  const [viewState, setViewState] = useState<ViewState>('input');
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [history, setHistory] = useState<GeneratedReport[]>([]);

  const handleCaseSubmit = async (data: CaseInput) => {
    setViewState('processing');
    try {
      const generatedReport = await generateReport(data);
      setReport(generatedReport);
      setHistory(prev => [generatedReport, ...prev]);
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
    setHistory(prev => {
      const newHistory = prev.filter(r => r.id !== reportId);
      console.log('New history after filter:', newHistory);
      return newHistory;
    });
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
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-red-400 bg-clip-text text-transparent mb-4 tracking-tight">
                GRCma Case Study Generator
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto">
                Generate comprehensive Governance, Risk, and Compliance reports modeled after top-tier assessment frameworks.
                <br />
                <span className="text-sm font-medium text-green-400">Powered by HMAMOUCH</span>
              </p>
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
