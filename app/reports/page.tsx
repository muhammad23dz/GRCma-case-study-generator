'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function ReportsPage() {
    const router = useRouter();
    const [generating, setGenerating] = useState(false);
    const [reportType, setReportType] = useState('compliance');

    const generateReport = async () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();

            if (reportType === 'compliance') {
                const res = await fetch('/api/analytics/overview');
                const data = await res.json();
                const { overview } = data;

                doc.setFontSize(20);
                doc.text('Compliance Executive Report', 14, 22);

                doc.setFontSize(11);
                doc.text(`Generated: ${date}`, 14, 30);
                doc.text(`Compliance Score: ${overview.complianceScore}%`, 14, 38);

                autoTable(doc, {
                    startY: 50,
                    head: [['Metric', 'Value']],
                    body: [
                        ['Total Controls', overview.totalControls],
                        ['Critical Risks', overview.criticalRisks],
                        ['Open Incidents', overview.openIncidents],
                        ['Open Actions', overview.openActions],
                        ['Active Policies', overview.totalPolicies],
                    ],
                });

            } else if (reportType === 'risks') {
                const res = await fetch('/api/risks'); // Assumes existing risks API supports listing
                // If /api/risks returns { risks: [] }
                // We might need to handle the response format if it differs.
                // Let's assume standard listing for now, or fetch from our new analytics endpoints if better.
                // Actually /api/risks should return all risks if no ID provided.
                const data = await res.json();
                const risks = data.risks || [];

                doc.setFontSize(20);
                doc.text('Risk Register Report', 14, 22);
                doc.setFontSize(11);
                doc.text(`Generated: ${date}`, 14, 30);

                autoTable(doc, {
                    startY: 40,
                    head: [['Risk Title', 'Category', 'Score', 'Status']],
                    body: risks.map((r: any) => [
                        r.control?.title || 'Unlinked Risk',
                        r.category,
                        r.score,
                        r.status
                    ]),
                });
            }

            doc.save(`grc-${reportType}-report-${Date.now()}.pdf`);
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">Reports & Exports</h1>
                        <p className="text-gray-400">Generate PDF reports for compliance and risk audits</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Report Generator Card */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Generate New Report</h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Report Type</label>
                                    <select
                                        value={reportType}
                                        onChange={(e) => setReportType(e.target.value)}
                                        className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        <option value="compliance">Compliance Executive Summary</option>
                                        <option value="risks">Full Risk Register</option>
                                    </select>
                                </div>

                                <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 text-sm text-gray-400">
                                    {reportType === 'compliance' ? (
                                        <p>Includes high-level compliance score, key metrics summary, and critical issue counts. Best for executive presentations.</p>
                                    ) : (
                                        <p>Detailed list of all identified risks, their scores, categories, and current status. Best for audit trails and risk analysis.</p>
                                    )}
                                </div>

                                <button
                                    onClick={generateReport}
                                    disabled={generating}
                                    className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {generating ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download Report
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Recent Reports (Placeholder) */}
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-8 opacity-50 pointer-events-none">
                            <h2 className="text-2xl font-bold text-white mb-6">Archived Reports</h2>
                            <div className="text-gray-400 italic">
                                Report archiving requires cloud storage configuration. Currently reports are generated on-demand.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
