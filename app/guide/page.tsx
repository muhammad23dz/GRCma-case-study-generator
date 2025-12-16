'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import {
    BookOpen, Shield, AlertTriangle, FileText, Users,
    CheckCircle2, ArrowRight, Play, ChevronDown, ChevronUp,
    BarChart3, ClipboardCheck, Settings, Zap
} from 'lucide-react';

interface GuideStep {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    link: string;
    substeps: string[];
}

const guideSteps: GuideStep[] = [
    {
        id: '1',
        title: 'Set Up Your Organization',
        description: 'Configure your organization profile, invite team members, and set up roles.',
        icon: <Settings className="w-6 h-6" />,
        link: '/settings',
        substeps: [
            'Go to Settings → Organization Profile',
            'Add your company name, industry, and compliance scope',
            'Invite team members with appropriate roles (Admin, Manager, Analyst, User)',
            'Configure notification preferences'
        ]
    },
    {
        id: '2',
        title: 'Import Compliance Frameworks',
        description: 'Load regulatory frameworks like ISO 27001, NIST, SOC 2, or GDPR.',
        icon: <Shield className="w-6 h-6" />,
        link: '/frameworks',
        substeps: [
            'Navigate to Frameworks page',
            'Click "Add Framework" to import from library',
            'Review requirements for each framework',
            'Map frameworks to your organization scope'
        ]
    },
    {
        id: '3',
        title: 'Define Your Control Library',
        description: 'Create and manage security controls that address framework requirements.',
        icon: <CheckCircle2 className="w-6 h-6" />,
        link: '/controls',
        substeps: [
            'Go to Controls page',
            'Create controls based on your security policies',
            'Assign owners and frequency for each control',
            'Map controls to framework requirements',
            'Link controls to policies for traceability'
        ]
    },
    {
        id: '4',
        title: 'Document Policies',
        description: 'Create and manage your security policies with version control.',
        icon: <FileText className="w-6 h-6" />,
        link: '/policies',
        substeps: [
            'Navigate to Policies page',
            'Create policies for each security domain',
            'Link policies to enforced controls',
            'Set up attestation workflows for employees',
            'Track policy versions and approvals'
        ]
    },
    {
        id: '5',
        title: 'Assess Risks',
        description: 'Identify, assess, and track enterprise risks with treatment plans.',
        icon: <AlertTriangle className="w-6 h-6" />,
        link: '/risks',
        substeps: [
            'Go to Risk Register',
            'Identify risks by category (Operational, Strategic, Compliance, etc.)',
            'Assess likelihood and impact (1-5 scale)',
            'Assign risk owners and treatment plans',
            'Link risks to mitigating controls',
            'Track residual risk after treatment'
        ]
    },
    {
        id: '6',
        title: 'Collect Evidence',
        description: 'Upload and manage compliance evidence for audits.',
        icon: <ClipboardCheck className="w-6 h-6" />,
        link: '/evidence',
        substeps: [
            'Navigate to Evidence page',
            'Upload evidence files (screenshots, logs, reports)',
            'Tag evidence to specific controls and requirements',
            'Set audit periods for evidence validity',
            'Submit evidence for review and approval'
        ]
    },
    {
        id: '7',
        title: 'Conduct Audits',
        description: 'Plan and execute internal or external audits with findings tracking.',
        icon: <BarChart3 className="w-6 h-6" />,
        link: '/audit',
        substeps: [
            'Go to Audit Management',
            'Create new audit (Internal, External, Certification)',
            'Define audit scope and framework',
            'Record findings linked to controls',
            'Perform control testing',
            'Track remediation actions'
        ]
    },
    {
        id: '8',
        title: 'Generate Reports',
        description: 'Create compliance reports and track your coverage status.',
        icon: <Zap className="w-6 h-6" />,
        link: '/reports',
        substeps: [
            'Navigate to Reports & Intelligence',
            'View Compliance Coverage Matrix for real-time status',
            'Export reports as PDF, CSV, or Excel',
            'Monitor Policy Distribution status',
            'Share reports with stakeholders'
        ]
    }
];

export default function GuidePage() {
    const [expandedStep, setExpandedStep] = useState<string | null>('1');

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold mb-6">
                            <BookOpen className="w-4 h-4" />
                            GRC Analyst Guide
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">
                            Getting Started with GRCma
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Follow this step-by-step guide to set up your compliance program
                            and become audit-ready in days, not months.
                        </p>
                    </div>

                    {/* Quick Start Video Placeholder */}
                    <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-8 mb-12 text-center">
                        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Play className="w-10 h-10 text-emerald-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Quick Start Video</h3>
                        <p className="text-slate-400 mb-4">Watch a 5-minute overview of the platform</p>
                        <button className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all">
                            Coming Soon
                        </button>
                    </div>

                    {/* Step-by-Step Guide */}
                    <div className="space-y-4">
                        {guideSteps.map((step, index) => (
                            <div
                                key={step.id}
                                className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden transition-all"
                            >
                                <button
                                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                                    className="w-full p-6 flex items-center gap-4 text-left hover:bg-white/5 transition-all"
                                >
                                    <div className="flex items-center justify-center w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl font-black text-xl">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-3">
                                            {step.icon}
                                            {step.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 mt-1">{step.description}</p>
                                    </div>
                                    {expandedStep === step.id ? (
                                        <ChevronUp className="w-6 h-6 text-slate-400" />
                                    ) : (
                                        <ChevronDown className="w-6 h-6 text-slate-400" />
                                    )}
                                </button>

                                {expandedStep === step.id && (
                                    <div className="px-6 pb-6 border-t border-white/5">
                                        <ul className="mt-4 space-y-3">
                                            {step.substeps.map((substep, i) => (
                                                <li key={i} className="flex items-start gap-3 text-slate-300">
                                                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                    <span>{substep}</span>
                                                </li>
                                            ))}
                                        </ul>
                                        <Link
                                            href={step.link}
                                            className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg font-bold transition-all"
                                        >
                                            Go to {step.title.split(' ').slice(-1)} <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Support Section */}
                    <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-8 text-center">
                        <Users className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Need Help?</h3>
                        <p className="text-slate-400 mb-6">
                            Our team is here to help you get the most out of GRCma.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="mailto:support@grcma.io"
                                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all"
                            >
                                Contact Support
                            </a>
                            <Link
                                href="/dashboard"
                                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all border border-white/10"
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
