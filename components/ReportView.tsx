'use client';

import { GeneratedReport, ReportSection } from '@/types';

interface ReportViewProps {
    report: GeneratedReport;
    onReset: () => void;
}

export default function ReportView({ report, onReset }: ReportViewProps) {
    const handleDownloadPDF = () => {
        // Use browser's print dialog to save as PDF
        window.print();
    };

    const renderSection = (section: ReportSection) => (
        <div key={section.title} className="mb-8 p-6 bg-slate-800/30 rounded-lg border border-green-500/20 print:bg-white print:border-gray-300">
            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent print:text-black print:bg-none">
                {section.title}
            </h2>
            <div
                className="prose prose-invert max-w-none mb-6 print:prose"
                dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {section.actionTable && (
                <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3 text-emerald-400 print:text-black">📋 Action Plan</h3>
                    <div
                        className="action-table-container overflow-x-auto"
                        dangerouslySetInnerHTML={{ __html: section.actionTable }}
                    />
                </div>
            )}
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-8 flex justify-between items-center print:hidden">
                <div>
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 via-emerald-400 to-red-400 bg-clip-text text-transparent">
                        GRC Case Study Report
                    </h1>
                    <p className="text-gray-400">
                        Report ID: {report.id} | Generated: {new Date(report.timestamp).toLocaleString()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleDownloadPDF}
                        className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg transition-all shadow-lg hover:shadow-red-500/50 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF
                    </button>
                    <button
                        onClick={onReset}
                        className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg transition-all shadow-lg hover:shadow-green-500/50"
                    >
                        Generate New Report
                    </button>
                </div>
            </div>

            {/* Print-only header */}
            <div className="hidden print:block mb-8">
                <h1 className="text-4xl font-bold mb-2 text-black">GRC Case Study Report</h1>
                <p className="text-gray-600">
                    Report ID: {report.id} | Generated: {new Date(report.timestamp).toLocaleString()}
                </p>
                <hr className="my-4" />
            </div>

            <div className="space-y-6">
                {renderSection(report.sections.executiveSummary)}
                {renderSection(report.sections.driversAndRisks)}
                {renderSection(report.sections.engagementType)}
                {renderSection(report.sections.methodology)}
                {renderSection(report.sections.gapAnalysis)}
                {renderSection(report.sections.maturityFindings)}
                {renderSection(report.sections.roadmap)}
                {renderSection(report.sections.businessImpact)}
            </div>

            <style jsx global>{`
        @media print {
          body {
            background: white;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
        
        .action-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 0.5rem;
          background: rgba(15, 23, 42, 0.5);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        @media print {
          .action-table {
            background: white;
            border: 1px solid #ddd;
          }
        }
        
        .action-table thead {
          background: linear-gradient(to right, rgb(34, 197, 94), rgb(16, 185, 129));
        }
        
        @media print {
          .action-table thead {
            background: #22c55e !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        
        .action-table th {
          padding: 0.75rem 1rem;
          text-align: left;
          font-weight: 600;
          color: white;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        
        .action-table td {
          padding: 0.75rem 1rem;
          border-top: 1px solid rgba(34, 197, 94, 0.2);
          color: rgb(209, 213, 219);
        }
        
        @media print {
          .action-table td {
            color: black;
            border-top: 1px solid #ddd;
          }
        }
        
        .action-table tbody tr:hover {
          background: rgba(34, 197, 94, 0.1);
        }
        
        .action-table td:first-child {
          font-weight: 600;
          color: rgb(52, 211, 153);
          width: 60px;
          text-align: center;
        }
        
        @media print {
          .action-table td:first-child {
            color: #22c55e;
          }
        }
        
        .prose h3 {
          color: rgb(52, 211, 153);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        @media print {
          .prose h3 {
            color: black;
          }
        }
        
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
        }
        
        .prose li {
          margin-bottom: 0.5rem;
        }
      `}</style>
        </div>
    );
}
