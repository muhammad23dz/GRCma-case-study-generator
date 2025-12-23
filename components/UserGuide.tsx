import React, { useState } from 'react';
import {
    BookOpen,
    Shield,
    AlertTriangle,
    FileText,
    Terminal,
    ChevronRight,
    Search,
    LayoutDashboard,
    Users,
    Activity,
    FileCheck,
    HelpCircle,
    Zap,
    Sparkles,
    Database,
    ArrowRight
} from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function UserGuide() {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: Terminal,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">Welcome to GRCma</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6">
                            GRCma is an AI-powered Enterprise Governance, Risk & Compliance platform.
                            This guide will help you understand how to use the platform effectively.
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
                            <h3 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5" /> Quick Start Goal
                            </h3>
                            <p className="text-slate-300">
                                Generate your first AI assessment and push the data to your dashboard in under 5 minutes.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-colors">
                            <div className="text-white font-bold mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" /> GRC Analyst
                            </div>
                            <p className="text-sm text-slate-400">
                                Run assessments, manage controls, and track compliance evidence.
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-colors">
                            <div className="text-white font-bold mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-purple-400" /> Compliance Manager
                            </div>
                            <p className="text-sm text-slate-400">
                                Review risk registers, approve policies, and monitor compliance KPIs.
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'ai-assessment',
            title: 'AI Assessment',
            icon: Sparkles,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Generate AI Assessment</h2>
                        <p className="text-slate-400 mb-8">
                            The heart of GRCma is the AI-powered assessment generator. It creates comprehensive
                            compliance assessments tailored to your organization and framework.
                        </p>

                        <div className="space-y-6">
                            <div className="border border-white/10 rounded-xl overflow-hidden">
                                <div className="bg-slate-800/80 p-4 border-b border-white/10">
                                    <h3 className="text-lg font-bold text-white">How to Generate</h3>
                                </div>
                                <div className="p-6 bg-slate-900/40">
                                    <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                                        <li className="pl-6 relative">
                                            <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                                            <h4 className="text-white font-bold text-sm">1. Click "Generate Assessment" on Dashboard</h4>
                                            <p className="text-slate-400 text-sm mt-1">Or navigate directly to /platform</p>
                                        </li>
                                        <li className="pl-6 relative">
                                            <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></span>
                                            <h4 className="text-white font-bold text-sm">2. Fill Company Details</h4>
                                            <p className="text-slate-400 text-sm mt-1">Enter company name, size, industry, and key challenge</p>
                                        </li>
                                        <li className="pl-6 relative">
                                            <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-purple-500 rounded-full border-2 border-slate-900"></span>
                                            <h4 className="text-white font-bold text-sm">3. Select Framework</h4>
                                            <p className="text-slate-400 text-sm mt-1">Choose ISO 27001, NIST CSF, SOC 2, GDPR, or PCI DSS</p>
                                        </li>
                                        <li className="pl-6 relative">
                                            <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-slate-900"></span>
                                            <h4 className="text-white font-bold text-sm">4. Generate & Review</h4>
                                            <p className="text-slate-400 text-sm mt-1">AI generates Controls, Risks, Vendors, Incidents, Policies</p>
                                        </li>
                                        <li className="pl-6 relative">
                                            <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-cyan-500 rounded-full border-2 border-slate-900"></span>
                                            <h4 className="text-white font-bold text-sm">5. Push to Dashboard</h4>
                                            <p className="text-slate-400 text-sm mt-1">Click "Push to Dashboard" to save data to your GRC modules</p>
                                        </li>
                                    </ol>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                                <h4 className="text-blue-400 font-bold mb-2">What Gets Generated?</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm text-slate-300">
                                    <div>• Security Controls</div>
                                    <div>• Risk Scenarios</div>
                                    <div>• Vendor Assessments</div>
                                    <div>• Incident Examples</div>
                                    <div>• Policy Drafts</div>
                                    <div>• Gap Analysis</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard-tour',
            title: 'Dashboard Tour',
            icon: LayoutDashboard,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">Dashboard Walkthrough</h2>
                        <p className="text-slate-400 mb-8">
                            The dashboard is your central command center. Here's what each section does:
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Compliance Score</h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Your overall compliance confidence based on controls, evidence, and audit status.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Risk Heatmap</h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Visual grid showing risks by likelihood (x-axis) and impact (y-axis).
                                        <br />
                                        <span className="text-red-400">Red cells</span> = High priority risks
                                        <br />
                                        <span className="text-green-400">Green cells</span> = Low priority risks
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <ArrowRight className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">Quick Navigation Hub</h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        One-click access to: Assessments, GRC (Controls), Operations, Workforce, Reports
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400">
                                        <Database className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">GRC Modules Widget</h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        Quick view of all module counts: Assets, BCDR Plans, Employees, Training, etc.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'workflows',
            title: 'Key Workflows',
            icon: Zap,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h2 className="text-3xl font-bold text-white mb-6">Essential GRC Workflows</h2>

                    <div className="space-y-8">
                        {/* Workflow 1 */}
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/80 p-4 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">🔄 Assessment to Action</h3>
                            </div>
                            <div className="p-6 bg-slate-900/40">
                                <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Generate Assessment</h4>
                                        <p className="text-slate-400 text-sm mt-1">Go to /platform and generate AI assessment</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Push to Dashboard</h4>
                                        <p className="text-slate-400 text-sm mt-1">Click "Push to Dashboard" on report view</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Review Controls & Risks</h4>
                                        <p className="text-slate-400 text-sm mt-1">Navigate to /controls and /risks to review</p>
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Workflow 2 */}
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/80 p-4 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">📊 Generate Reports</h3>
                            </div>
                            <div className="p-6 bg-slate-900/40">
                                <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Go to Reports Page</h4>
                                        <p className="text-slate-400 text-sm mt-1">Dashboard → Reports or navigate to /reports</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Select Report Type</h4>
                                        <p className="text-slate-400 text-sm mt-1">Executive Summary, Risk Register, SoA, or Coverage Matrix</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-purple-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Export Format</h4>
                                        <p className="text-slate-400 text-sm mt-1">Download as PDF, CSV, or Excel</p>
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Workflow 3 */}
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/80 p-4 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">🧹 Reset Test Data</h3>
                            </div>
                            <div className="p-6 bg-slate-900/40">
                                <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Dashboard Delete All</h4>
                                        <p className="text-slate-400 text-sm mt-1">Click red "Delete All" button on dashboard header</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-orange-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Confirm Deletion</h4>
                                        <p className="text-slate-400 text-sm mt-1">Review list of modules and confirm</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">Fresh Start</h4>
                                        <p className="text-slate-400 text-sm mt-1">All data cleared - generate new assessment</p>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'glossary',
            title: 'GRC Glossary',
            icon: BookOpen,
            content: (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <h2 className="text-3xl font-bold text-white mb-6">GRC Terminology</h2>
                    <p className="text-slate-400 mb-6">Common terms used throughout the platform:</p>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { term: 'Control', def: 'A safeguard or countermeasure to address a risk. Can be preventive, detective, or corrective.' },
                            { term: 'Evidence', def: 'Documentation proving a control is implemented and operating effectively.' },
                            { term: 'Inherent Risk', def: 'The level of risk before any controls are applied.' },
                            { term: 'Residual Risk', def: 'The level of risk remaining after controls are applied.' },
                            { term: 'Risk Score', def: 'Likelihood × Impact. Used to prioritize risk treatment.' },
                            { term: 'Framework', def: 'A structured set of guidelines (e.g., ISO 27001, NIST CSF, SOC 2).' },
                            { term: 'SOC 2', def: 'Service Organization Control 2 - an auditing procedure for service providers.' },
                            { term: 'Gap Analysis', def: 'Comparison of current state vs. desired compliance state.' },
                            { term: 'SoA', def: 'Statement of Applicability - documents which controls apply to your organization.' }
                        ].map((item) => (
                            <div key={item.term} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                <span className="block text-emerald-400 font-bold mb-1">{item.term}</span>
                                <span className="text-slate-400 text-sm">{item.def}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    const activeContent = sections.find(s => s.id === activeSection);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-72 shrink-0">
                <div className="sticky top-32 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-slate-950/50">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" /> User Guide
                        </h3>
                    </div>
                    <nav className="p-2 space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left px-4 py-3.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${activeSection === section.id
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`} />
                                    {section.title}
                                </div>
                                {activeSection === section.id && <ChevronRight className="w-3 h-3" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10">
                    <h4 className="text-white font-bold text-xs uppercase mb-2">Need More Help?</h4>
                    <p className="text-xs text-slate-400 mb-3">
                        Contact the GRCma team for personalized onboarding.
                    </p>
                    <a
                        href="https://www.linkedin.com/in/mohamed-hmamouch-b5a944300/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-2 bg-white/10 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        Contact Support
                    </a>
                </div>

                <Link
                    href="/dashboard"
                    className="mt-4 block w-full text-center py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-bold rounded-xl border border-emerald-500/20 transition-colors"
                >
                    ← Back to Dashboard
                </Link>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow">
                <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-8 min-h-[600px] shadow-2xl relative overflow-hidden">
                    {/* Decorative background blur */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                    {activeContent?.content}
                </div>
            </div>
        </div>
    );
}
