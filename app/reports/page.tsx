'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Link from 'next/link';
import { FileText, Table, FileSpreadsheet, Mail, Loader2, Calendar, File, Shield, ArrowLeft } from 'lucide-react';

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
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [isSendingEmail, setIsSendingEmail] = useState(false);

    const handleSendEmail = async (targetEmail: string) => {
        setIsSendingEmail(true);
        try {
            // Generate PDF as Data URI directly from jsPDF
            // This handles specific encoding issues internally
            const pdfDataUri = await generatePDF(true);

            if (!pdfDataUri || typeof pdfDataUri !== 'string') {
                throw new Error("Failed to generate PDF data");
            }

            const res = await fetch('/api/email/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    recipient: targetEmail,
                    subject: `GRCma Export: ${reportType.toUpperCase()} Report`,
                    htmlContent: `
                        <h1>GRCma ${reportType.toUpperCase()} Report</h1>
                        <p>Please find the requested report attached.</p>
                        <p>Date: ${new Date().toLocaleString()}</p>
                        <hr />
                        <p>Please log in to the platform to view the full detailed analytics.</p>
                        <a href="${window.location.origin}/reports">View Reports Dashboard</a>
                    `,
                    attachments: [
                        {
                            filename: `grcma-${reportType}-report.pdf`,
                            path: pdfDataUri // Nodemailer supports 'path' for Data URIs
                        }
                    ]
                })
            });

            if (res.ok) {
                alert("Report sent successfully!");
                setShowEmailModal(false);
            } else {
                throw new Error("Failed to send");
            }
        } catch (e: any) {
            console.error(e);
            alert("Error sending email: " + e.message);
        } finally {
            setIsSendingEmail(false);
        }
    };

    // ... (useEffect hook remains same)

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

    const fetchReportData = async () => {
        if (reportType === 'compliance') {
            const res = await fetch('/api/analytics/overview');
            const data = await res.json();
            return { type: 'compliance', data: data.overview };
        } else if (reportType === 'risks') {
            const res = await fetch('/api/risks');
            const data = await res.json();
            return { type: 'risks', data: Array.isArray(data) ? data : (data.risks || []) };
        } else if (reportType === 'soa') {
            if (!selectedFrameworkId) throw new Error('Framework not selected');
            const res = await fetch(`/api/frameworks/${selectedFrameworkId}/requirements`);
            const data = await res.json();
            return { type: 'soa', data: data.requirements || [], framework: data.framework };
        } else if (reportType === 'coverage') {
            const res = await fetch('/api/reporting/coverage');
            const data = await res.json();
            return { type: 'coverage', data: data.coverage || [] };
        }
        throw new Error('Invalid report type');
    };

    const generatePDF = async (returnOutput = false) => {
        setGenerating(true);
        try {
            const doc = new jsPDF();
            const timestamp = new Date().toLocaleString();

            // Brand Header
            doc.setFillColor(15, 23, 42); // slate-950
            doc.rect(0, 0, 210, 24, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('GRCma Platform', 14, 15);

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${timestamp}`, 150, 15);
            doc.setDrawColor(16, 185, 129); // emerald-500
            doc.line(14, 20, 196, 20);

            doc.setTextColor(0, 0, 0);

            const reportData = await fetchReportData();

            if (reportData.type === 'compliance') {
                const overview = reportData.data;
                doc.setFontSize(22);
                doc.text('Executive Compliance Report', 14, 40);

                doc.setFontSize(12);
                doc.setTextColor(100);
                doc.text('Platform Confidence Score', 14, 50);

                doc.setFontSize(40);
                doc.setTextColor(overview.complianceScore > 80 ? 16 : 220, overview.complianceScore > 80 ? 185 : 38, overview.complianceScore > 80 ? 129 : 38);
                doc.text(`${overview.complianceScore}%`, 14, 65);

                autoTable(doc, {
                    startY: 80,
                    head: [['Control Metric', 'Status', 'Count']],
                    body: [
                        ['Total Controls', 'Active', overview.totalControls],
                        ['Critical Risks', 'High Priority', overview.criticalRisks],
                        ['Open Incidents', 'Needs Attention', overview.openIncidents],
                        ['Open Actions', 'Pending', overview.openActions],
                        ['Active Policies', 'Enforced', overview.totalPolicies],
                    ],
                    theme: 'grid',
                    headStyles: { fillColor: [15, 23, 42] },
                    styles: { fontSize: 10, cellPadding: 6 }
                });

            } else if (reportData.type === 'risks') {
                const risks = reportData.data;
                doc.setFontSize(22);
                doc.text('Enterprise Risk Register', 14, 40);

                autoTable(doc, {
                    startY: 50,
                    head: [['Risk Narrative', 'Category', 'Score', 'Status']],
                    body: risks.map((r: any) => [
                        r.narrative ? r.narrative.substring(0, 60) + (r.narrative.length > 60 ? '...' : '') : 'Unknown Risk',
                        r.category,
                        r.score,
                        r.status
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: [185, 28, 28] }, // Red header
                    styles: { fontSize: 9 }
                });

            } else if (reportData.type === 'soa') {
                const { data: requirements, framework } = reportData;
                doc.setFontSize(22);
                doc.text(`Statement of Applicability (SoA)`, 14, 40);
                doc.setFontSize(12);
                doc.setTextColor(100);
                doc.text(`Framework: ${framework.name} ${framework.version}`, 14, 50);

                autoTable(doc, {
                    startY: 60,
                    head: [['ID', 'Requirement', 'Applicability', 'Status']],
                    body: requirements.map((req: any) => [
                        req.requirementId,
                        req.title,
                        'Applicable',
                        'Pending Review'
                    ]),
                    columnStyles: { 1: { cellWidth: 80 } },
                    theme: 'grid',
                    headStyles: { fillColor: [37, 99, 235] } // Blue header
                });
            } else if (reportData.type === 'coverage') {
                const coverageData = reportData.data;
                doc.setFontSize(22);
                doc.text('Compliance Coverage Matrix', 14, 40);

                let currentY = 50;

                coverageData.forEach((fw: any) => {
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`${fw.name} (${fw.version}) - ${fw.stats.coveragePercentage}% Coverage`, 14, currentY + 10);

                    // Framework Stats
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.text(`Total Reqs: ${fw.stats.totalRequirements} | Compliant: ${fw.stats.compliantRequirements}`, 14, currentY + 16);

                    autoTable(doc, {
                        startY: currentY + 20,
                        head: [['ID', 'Requirement', 'Controls', 'Evidence', 'Findings', 'Status']],
                        body: fw.requirements.map((req: any) => [
                            req.requirementId,
                            req.title,
                            req.stats.controls,
                            req.stats.evidence,
                            req.stats.findings,
                            req.status.replace('_', ' ').toUpperCase()
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: [16, 185, 129] }, // Emerald header
                        columnStyles: { 1: { cellWidth: 70 } },
                        margin: { top: 20 },
                        pageBreak: 'avoid'
                    });

                    currentY = (doc as any).lastAutoTable.finalY + 20;

                    // Add page if needed for next framework
                    if (currentY > 250) {
                        doc.addPage();
                        currentY = 20;
                    }
                });
            }

            // Footer
            const pageCount = (doc as any).internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(`Page ${i} of ${pageCount} | Confidential - Internal Use Only`, 105, 290, { align: 'center' });
            }

            const filename = `grcma-${reportType}-report-${Date.now()}.pdf`;

            if (returnOutput) {
                // Use jsPDF native helper to get a full Data URI string
                // This ensures proper base64 encoding without manual buffer manipulation
                return doc.output('datauristring');
            } else {
                doc.save(filename);
            }
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate report.');
            return null;
        } finally {
            setGenerating(false);
        }
    };

    const generateSpreadsheet = async (format: 'csv' | 'xlsx') => {
        setGenerating(true);
        try {
            const reportData = await fetchReportData();
            let wsData: any[] = [];
            let sheetName = 'Report';

            if (reportData.type === 'compliance') {
                const ov = reportData.data;
                sheetName = 'Compliance_Summary';
                wsData = [
                    ['Metric', 'Value'],
                    ['Compliance Score', `${ov.complianceScore}%`],
                    ['Total Controls', ov.totalControls],
                    ['Critical Risks', ov.criticalRisks],
                    ['High Risks', ov.highRisks],
                    ['Open Incidents', ov.openIncidents],
                    ['Open Actions', ov.openActions],
                    ['Total Policies', ov.totalPolicies],
                    ['Generated At', new Date().toLocaleString()]
                ];
            } else if (reportData.type === 'risks') {
                sheetName = 'Risk_Register';
                const risks = reportData.data;
                // Header row
                wsData.push(['ID', 'Risk Narrative', 'Category', 'Likelihood', 'Impact', 'Score', 'Status', 'Owner']);
                // Data rows
                risks.forEach((r: any) => {
                    wsData.push([
                        r.id,
                        r.narrative,
                        r.category,
                        r.likelihood,
                        r.impact,
                        r.score,
                        r.status,
                        r.owner
                    ]);
                });
            } else if (reportData.type === 'soa') {
                sheetName = 'SoA';
                const { data: reqs, framework } = reportData;
                wsData.push(['Framework', framework.name]);
                wsData.push(['Version', framework.version]);
                wsData.push([]); // Spacer
                wsData.push(['Requirement ID', 'Title', 'Description', 'Category', 'Applicability', 'Status']);
                reqs.forEach((req: any) => {
                    wsData.push([
                        req.requirementId,
                        req.title,
                        req.description,
                        req.category,
                        'Applicable',
                        'Pending Review'
                    ]);
                });
            } else if (reportData.type === 'coverage') {
                sheetName = 'Coverage_Matrix';
                const coverageData = reportData.data;
                wsData.push(['Framework', 'Version', 'Requirement ID', 'Title', 'Controls', 'Evidence', 'Findings', 'Status']);

                coverageData.forEach((fw: any) => {
                    fw.requirements.forEach((req: any) => {
                        wsData.push([
                            fw.name,
                            fw.version,
                            req.requirementId,
                            req.title,
                            req.stats.controls,
                            req.stats.evidence,
                            req.stats.findings,
                            req.status
                        ]);
                    });
                });
            }

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(wsData);

            // Auto-width columns roughly
            const wscols = wsData[0] ? wsData[0].map(() => ({ wch: 20 })) : [];
            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, sheetName);
            XLSX.writeFile(wb, `grcma-${reportType}-export-${Date.now()}.${format}`);

        } catch (error) {
            console.error('Error generating spreadsheet:', error);
            alert('Failed to export data.');
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            <Header />

            <div className="flex-grow p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    {/* Back to Dashboard */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <div className="mb-10">
                        <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                            <FileText className="w-10 h-10 text-emerald-500" />
                            Reports & Intelligence
                        </h1>
                        <p className="text-slate-400">Generate audit-ready documentation and raw data exports.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-3 mb-8">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-sm">★</span>
                                Live Intelligence
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <Link
                                    href="/reports/coverage"
                                    className="bg-slate-900/50 border border-white/5 hover:border-emerald-500/50 rounded-2xl p-6 backdrop-blur-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Shield className="w-24 h-24 text-emerald-500 transform rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                                            <Table className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Compliance Coverage Matrix</h3>
                                        <p className="text-sm text-slate-400 mb-4">Real-time mapping of frameworks, controls, evidence, and findings.</p>
                                        <div className="flex items-center text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                            View Dashboard →
                                        </div>
                                    </div>
                                </Link>

                                <Link
                                    href="/reports/policies"
                                    className="bg-slate-900/50 border border-white/5 hover:border-blue-500/50 rounded-2xl p-6 backdrop-blur-xl transition-all group relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <FileText className="w-24 h-24 text-blue-500 transform rotate-12" />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-4 text-blue-400">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Policy Distribution Tracker</h3>
                                        <p className="text-sm text-slate-400 mb-4">Monitor policy distribution and attestation rates.</p>
                                        <div className="flex items-center text-xs font-bold text-blue-500 uppercase tracking-wider">
                                            View Dashboard →
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* Control Panel */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Configuration Card */}
                            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-xl">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 text-sm">1</span>
                                    Configure Report
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Report Content</label>
                                        <div className="grid grid-cols-1 gap-3">
                                            <button
                                                onClick={() => setReportType('compliance')}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${reportType === 'compliance' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${reportType === 'compliance' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                                                    <File className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">Executive Compliance Summary</div>
                                                    <div className="text-xs opacity-70">High-level KPIs, control status, and confidence score</div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setReportType('coverage')}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${reportType === 'coverage' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${reportType === 'coverage' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">Compliance Coverage Matrix</div>
                                                    <div className="text-xs opacity-70">Complete mapping status of all frameworks and controls</div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setReportType('risks')}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${reportType === 'risks' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${reportType === 'risks' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                                                    <ActivityIcon />
                                                </div>
                                                <div>
                                                    <div className="font-bold">Enterprise Risk Register</div>
                                                    <div className="text-xs opacity-70">Full detailed list of all risks, scores, and mitigation handlers</div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={() => setReportType('soa')}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${reportType === 'soa' ? 'bg-emerald-500/10 border-emerald-500 text-white' : 'bg-slate-950 border-white/10 text-slate-400 hover:border-white/20'}`}
                                            >
                                                <div className={`p-2 rounded-lg ${reportType === 'soa' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800'}`}>
                                                    <Table className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <div className="font-bold">Statement of Applicability (SoA)</div>
                                                    <div className="text-xs opacity-70">Framework-specific requirement mapping attestation</div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    {reportType === 'soa' && (
                                        <div className="animate-in fade-in slide-in-from-top-4">
                                            <label className="block text-sm font-medium text-slate-400 mb-2">Target Framework</label>
                                            <select
                                                value={selectedFrameworkId}
                                                onChange={(e) => setSelectedFrameworkId(e.target.value)}
                                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                                            >
                                                <option value="">Select a standard...</option>
                                                {frameworks.map(fw => (
                                                    <option key={fw.id} value={fw.id}>{fw.name} ({fw.version})</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Export Actions */}
                        <div className="space-y-6">
                            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8 backdrop-blur-xl h-full flex flex-col">
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-sm">2</span>
                                    Generate Output
                                </h2>

                                <div className="space-y-3 flex-grow">
                                    <button
                                        onClick={() => generatePDF(false)}
                                        disabled={generating || (reportType === 'soa' && !selectedFrameworkId)}
                                        className="w-full py-4 px-6 bg-white hover:bg-slate-100 text-slate-900 rounded-xl font-bold transition-all flex items-center justify-between group disabled:opacity-50"
                                    >
                                        <span className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-red-500" />
                                            <span>Export as PDF</span>
                                        </span>
                                        {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <div className="opacity-0 group-hover:opacity-100 transition-opacity">→</div>}
                                    </button>

                                    <button
                                        onClick={() => generateSpreadsheet('csv')}
                                        disabled={generating || (reportType === 'soa' && !selectedFrameworkId)}
                                        className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all flex items-center justify-between group disabled:opacity-50 border border-white/5"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Table className="w-5 h-5 text-emerald-400" />
                                            <span>Export as CSV</span>
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">→</div>
                                    </button>

                                    <button
                                        onClick={() => generateSpreadsheet('xlsx')}
                                        disabled={generating || (reportType === 'soa' && !selectedFrameworkId)}
                                        className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all flex items-center justify-between group disabled:opacity-50 border border-white/5"
                                    >
                                        <span className="flex items-center gap-3">
                                            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                                            <span>Export as Excel</span>
                                        </span>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400">→</div>
                                    </button>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5">
                                    <button
                                        onClick={() => setShowEmailModal(true)}
                                        disabled={generating}
                                        className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg border border-white/5 transition-all group"
                                    >
                                        <span className="flex items-center gap-3 text-sm text-slate-200">
                                            <Mail className="w-4 h-4 text-emerald-400" />
                                            <span>Email Report</span>
                                        </span>
                                        <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 group-hover:bg-emerald-500/20">
                                            Ready
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <EmailModal
                isOpen={showEmailModal}
                onClose={() => setShowEmailModal(false)}
                onSubmit={handleSendEmail}
                loading={isSendingEmail}
            />
        </div>
    );
}



function ActivityIcon() {
    return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    );
}

function EmailModal({ isOpen, onClose, onSubmit, loading }: { isOpen: boolean, onClose: () => void, onSubmit: (e: string) => void, loading: boolean }) {
    const [email, setEmail] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-4">Send Export via Email</h3>
                <input
                    type="email"
                    placeholder="recipient@example.com"
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-lg text-white mb-4 focus:ring-2 focus:ring-emerald-500 outline-none"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoFocus
                />
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancel</button>
                    <button
                        onClick={() => onSubmit(email)}
                        disabled={loading || !email}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Send Export
                    </button>
                </div>
            </div>
        </div>
    );
}
