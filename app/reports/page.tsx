'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Framework {
    id: string;
    name: string;
    version: string;
}

export default function ReportsPage() {
    const router = useRouter();
    const [generating, setGenerating] = useState(false);
    const [reportType, setReportType] = useState('compliance');
    const [activeTab, setActiveTab] = useState('generate');
    const [frameworks, setFrameworks] = useState<Framework[]>([]);
    const [selectedFrameworkId, setSelectedFrameworkId] = useState('');

    useEffect(() => {
        if (reportType === 'soa') {
            fetchFrameworks();
        }
    }, [reportType]);

    const fetchFrameworks = async () => {
        try {
            const res = await fetch('/api/frameworks');
            if (res.ok) {
                const data = await res.json();
                setFrameworks(data.frameworks || []);
            }
        } catch (error) {
            console.error('Error fetching frameworks:', error);
        }
    };

    const generateReport = async () => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const date = new Date().toLocaleDateString();
            const timestamp = new Date().toLocaleString();

            // Common Header
            doc.setFillColor(16, 185, 129); // Emerald 500
            doc.rect(0, 0, 210, 20, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(16);
            doc.text('GRCma Platform', 14, 13);
            doc.setFontSize(10);
            doc.text(`Generated: ${timestamp}`, 150, 13);

            doc.setTextColor(0, 0, 0);

            if (reportType === 'compliance') {
                const res = await fetch('/api/analytics/overview');
                const data = await res.json();
                const { overview } = data;

                doc.setFontSize(22);
                doc.text('Executive Compliance Report', 14, 40);

                doc.setFontSize(11);
                doc.text(`Compliance Score: ${overview.complianceScore}%`, 14, 50);

                // Add nice metrics summary
                autoTable(doc, {
                    startY: 60,
                    head: [['Metric', 'Status', 'Count']],
                    body: [
                        ['Total Controls', 'Active', overview.totalControls],
                        ['Critical Risks', 'High Priority', overview.criticalRisks],
                        ['Open Incidents', 'Needs Attention', overview.openIncidents],
                        ['Open Actions', 'Pending', overview.openActions],
                        ['Active Policies', 'Enforced', overview.totalPolicies],
                    ],
                    theme: 'grid',
                    headStyles: { fillColor: [16, 185, 129] }
                });

            } else if (reportType === 'risks') {
                const res = await fetch('/api/risks'); // Assuming fetching from standard API
                const data = await res.json();
                // If API structure is different, fallback (currently assuming {risks: []} or array)
                const risks = Array.isArray(data) ? data : (data.risks || []);

                doc.setFontSize(22);
                doc.text('Risk Register', 14, 40);

                autoTable(doc, {
                    startY: 50,
                    head: [['Risk', 'Category', 'Score', 'Status']],
                    body: risks.map((r: any) => [
                        // r.control?.title || 'Unlinked', // Need to check if relation included
                        r.narrative ? r.narrative.substring(0, 50) + '...' : 'Unknown Risk',
                        r.category,
                        r.score,
                        r.status
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [239, 68, 68] } // Red for risks
                });

            } else if (reportType === 'soa') {
                if (!selectedFrameworkId) {
                    alert('Please select a framework');
                    setGenerating(false);
                    return;
                }

                // Fetch framework details (requirements + mappings)
                const frameworkRes = await fetch(`/api/frameworks/${selectedFrameworkId}/requirements`);
                const fwData = await frameworkRes.json();
                const frameworkName = fwData.framework.name;
                const requirements = fwData.requirements || [];

                doc.setFontSize(22);
                doc.text(`Statement of Applicability (SoA)`, 14, 40);
                doc.setFontSize(14);
                doc.setTextColor(100);
                doc.text(`Framework: ${frameworkName}`, 14, 50);
                doc.setTextColor(0);

                // For SoA, we list requirements and if they are mapped (Applicable/Implemented)
                // Note: Real SoA needs "Justification for Inclusion/Exclusion". We'll assume all are Applicable.

                autoTable(doc, {
                    startY: 60,
                    head: [['ID', 'Requirement', 'Status', 'Mapped Controls']],
                    body: requirements.map((req: any) => [
                        req.requirementId,
                        req.title,
                        'Applicable', // Hardcoded for demo
                        'Pending Mapping' // Need actual mapping count, but API might not return it fully nested
                    ]),
                    columnStyles: {
                        1: { cellWidth: 80 }
                    },
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] }
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
                        <p className="text-gray-400">Advanced reporting engine for compliance audits</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-4 mb-8 border-b border-white/10">
                        <button
                            onClick={() => setActiveTab('generate')}
                            className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'generate' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            Generate Report
                        </button>
                        {/* 
                        <button
                            onClick={() => setActiveTab('scheduled')}
                            className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'scheduled' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            Scheduled Reports
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`px-4 py-2 border-b-2 font-medium transition-colors ${activeTab === 'templates' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-gray-400 hover:text-white'
                                }`}
                        >
                            Templates
                        </button> 
                        */}
                    </div>

                    {activeTab === 'generate' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Create New Report</h2>

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
                                            <option value="soa">Statement of Applicability (SoA)</option>
                                        </select>
                                    </div>

                                    {reportType === 'soa' && (
                                        <div className="animate-fade-in-down">
                                            <label className="block text-sm font-medium text-gray-300 mb-2">Select Framework</label>
                                            <select
                                                value={selectedFrameworkId}
                                                onChange={(e) => setSelectedFrameworkId(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                            >
                                                <option value="">Choose a framework...</option>
                                                {frameworks.map(fw => (
                                                    <option key={fw.id} value={fw.id}>{fw.name} ({fw.version})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-white/5 text-sm text-gray-400">
                                        {reportType === 'compliance' && 'Executive-level summary of authorized controls, risk status, and overall compliance score.'}
                                        {reportType === 'risks' && 'Detailed export of all potential risks, categorized by severity and status. Includes mitigation plans.'}
                                        {reportType === 'soa' && 'Formal Statement of Applicability linking framework requirements to internal controls.'}
                                    </div>

                                    <button
                                        onClick={generateReport}
                                        disabled={generating || (reportType === 'soa' && !selectedFrameworkId)}
                                        className="w-full px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-500 hover:to-teal-500 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {generating ? 'Generating PDF...' : 'Download Report'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-8 opacity-75">
                                <h2 className="text-xl font-bold text-white mb-4">Export Options</h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded border border-white/5 opacity-50 cursor-not-allowed">
                                        <span className="text-gray-300">Export as CSV</span>
                                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-400">Coming Soon</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded border border-white/5 opacity-50 cursor-not-allowed">
                                        <span className="text-gray-300">Export as Excel (XLSX)</span>
                                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-400">Coming Soon</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-slate-900 rounded border border-white/5 opacity-50 cursor-not-allowed">
                                        <span className="text-gray-300">Email Report</span>
                                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-gray-400">Config Required</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'scheduled' && (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center py-20">
                            <div className="bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Scheduled Reporting</h2>
                            <p className="text-gray-400 max-w-md mx-auto mb-6">
                                Automatically generate and email reports to stakeholders on a weekly or monthly basis.
                            </p>
                            <button className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                                + Create Schedule
                            </button>
                        </div>
                    )}

                    {activeTab === 'templates' && (
                        <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center py-20">
                            <div className="bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Report Templates</h2>
                            <p className="text-gray-400 max-w-md mx-auto mb-6">
                                Create custom report layouts and define which metrics to include.
                            </p>
                            <button className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
                                Browse Library
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
