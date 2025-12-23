'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import {
    BookOpen, Shield, AlertTriangle, FileText, Users,
    CheckCircle2, ArrowRight, Play, ChevronDown, ChevronUp,
    BarChart3, ClipboardCheck, Settings, Zap, Target, Building2,
    Lock, Eye, Wrench, BookMarked, Scale, Network
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// ==========================================
// GRC EXPERT CONTENT - FRAMEWORKS
// ==========================================
const frameworks = [
    {
        name: 'ISO 27001',
        scope: 'Information Security Management System (ISMS)',
        description: 'International standard for establishing, implementing, maintaining, and continually improving an information security management system.',
        requirements: '114 controls across 14 domains',
        bestFor: 'Organizations seeking international recognition for information security practices'
    },
    {
        name: 'SOC 2',
        scope: 'Trust Service Criteria',
        description: 'AICPA framework evaluating security, availability, processing integrity, confidentiality, and privacy controls.',
        requirements: '5 Trust Service Criteria (TSC)',
        bestFor: 'SaaS providers, cloud service companies, technology vendors'
    },
    {
        name: 'NIST CSF',
        scope: 'Cybersecurity Framework',
        description: 'Voluntary framework consisting of guidelines and best practices to manage cybersecurity risk.',
        requirements: '5 functions: Identify, Protect, Detect, Respond, Recover',
        bestFor: 'Critical infrastructure, US federal contractors, enterprises'
    },
    {
        name: 'GDPR',
        scope: 'Data Privacy Regulation',
        description: 'EU regulation governing the collection, processing, and protection of personal data of EU residents.',
        requirements: '99 articles, 7 principles',
        bestFor: 'Any organization handling EU citizen data'
    }
];

// ==========================================
// GRC EXPERT CONTENT - CONTROL TYPES
// ==========================================
const controlTypes = [
    {
        type: 'Preventive',
        icon: <Lock className="w-6 h-6" />,
        color: 'emerald',
        purpose: 'Stop threats before they occur',
        examples: ['Access control policies', 'Encryption', 'Firewalls', 'Input validation', 'Segregation of duties'],
        auditFocus: 'Evidence of consistent enforcement and no bypass mechanisms'
    },
    {
        type: 'Detective',
        icon: <Eye className="w-6 h-6" />,
        color: 'blue',
        purpose: 'Identify threats that have occurred',
        examples: ['SIEM monitoring', 'Intrusion detection', 'Log review', 'Anomaly detection', 'Audit trails'],
        auditFocus: 'Alert configurations, response times, and investigation procedures'
    },
    {
        type: 'Corrective',
        icon: <Wrench className="w-6 h-6" />,
        color: 'orange',
        purpose: 'Remediate issues after detection',
        examples: ['Incident response', 'Backup restoration', 'Patch management', 'Account recovery', 'System rollback'],
        auditFocus: 'Speed of response, effectiveness of remediation, and lessons learned'
    },
    {
        type: 'Directive',
        icon: <BookMarked className="w-6 h-6" />,
        color: 'purple',
        purpose: 'Guide behavior through policies',
        examples: ['Security policies', 'Acceptable use policy', 'Training requirements', 'Standards', 'Procedures'],
        auditFocus: 'Policy acknowledgment, training completion, and awareness levels'
    }
];

// ==========================================
// GRC EXPERT CONTENT - RISK METHODOLOGY
// ==========================================
const riskMatrix = {
    description: 'The platform uses a 5×5 risk matrix (Likelihood × Impact) to calculate risk scores from 1-25.',
    categories: [
        { range: '20-25', label: 'Critical', color: 'red', action: 'Immediate escalation and treatment required' },
        { range: '12-19', label: 'High', color: 'orange', action: 'Treatment plan required within 30 days' },
        { range: '6-11', label: 'Medium', color: 'yellow', action: 'Monitor and plan treatment within 90 days' },
        { range: '1-5', label: 'Low', color: 'green', action: 'Accept or monitor with annual review' }
    ],
    treatmentOptions: [
        'Mitigate - Implement controls to reduce likelihood or impact',
        'Transfer - Insurance or contractual transfer to third party',
        'Accept - Acknowledge risk within risk appetite',
        'Avoid - Eliminate the activity causing the risk'
    ]
};

// ==========================================
// GRC EXPERT CONTENT - AUDIT PREP GUIDE
// ==========================================
const auditPrep = [
    {
        phase: 'Pre-Audit (4-6 weeks before)',
        tasks: [
            'Complete gap assessment against framework requirements',
            'Ensure all control evidence is current and accessible',
            'Conduct internal audit or self-assessment',
            'Review previous audit findings and remediation status',
            'Prepare control narratives and process documentation',
            'Assign audit liaison and single point of contact'
        ]
    },
    {
        phase: 'During Audit',
        tasks: [
            'Provide auditor with read-only platform access',
            'Respond to evidence requests within 24 hours',
            'Document all auditor questions and responses',
            'Escalate issues immediately to audit liaison',
            'Track findings in real-time within the platform'
        ]
    },
    {
        phase: 'Post-Audit',
        tasks: [
            'Review draft findings for accuracy',
            'Create remediation actions for each finding',
            'Assign owners and due dates to all actions',
            'Update risk register with audit-identified risks',
            'Schedule follow-up assessment for remediation'
        ]
    }
];

// ==========================================
// GETTING STARTED STEPS
// ==========================================
const guideSteps = [
    {
        id: '1',
        title: 'Generate Your First Assessment',
        description: 'Use AI to create a compliance baseline tailored to your organization.',
        icon: <Zap className="w-6 h-6" />,
        link: '/platform',
        substeps: [
            'Navigate to the Platform (AI Assessment) page',
            'Enter your company name, size, and target framework',
            'Describe your key compliance challenge',
            'Click "Generate Assessment" to create controls, risks, vendors, and incidents',
            'Review the Executive Summary for problem analysis',
            'Click "Push to Dashboard" to populate your GRC program'
        ]
    },
    {
        id: '2',
        title: 'Review Your Risk Register',
        description: 'Understand identified risks and their relationship to controls.',
        icon: <AlertTriangle className="w-6 h-6" />,
        link: '/risks',
        substeps: [
            'Navigate to the Risks page',
            'Review each risk\'s likelihood, impact, and calculated score',
            'Use the Risk Heatmap for visual analysis',
            'Verify Risk-Control mappings (which controls mitigate which risks)',
            'Assign risk owners and treatment plans',
            'Track residual risk after control implementation'
        ]
    },
    {
        id: '3',
        title: 'Validate Control Mappings',
        description: 'Ensure controls are properly linked to risks and policies.',
        icon: <Shield className="w-6 h-6" />,
        link: '/controls',
        substeps: [
            'Navigate to the Controls page',
            'Review control types (Preventive, Detective, Corrective, Directive)',
            'Verify each control has an owner assigned',
            'Check policy linkages (Controls → Policies)',
            'Check risk linkages (Controls → Risks)',
            'Define evidence requirements for each control'
        ]
    },
    {
        id: '4',
        title: 'Review Vendor Risk Profile',
        description: 'Assess third-party vendors and their associated risks.',
        icon: <Building2 className="w-6 h-6" />,
        link: '/vendors',
        substeps: [
            'Navigate to the Vendors page',
            'Review vendor criticality ratings',
            'Check Vendor-Risk linkages (TPRM)',
            'Request vendor questionnaires for high-risk vendors',
            'Document vendor due diligence activities',
            'Set review cadence based on vendor criticality'
        ]
    },
    {
        id: '5',
        title: 'Monitor Incident Response',
        description: 'Track security incidents and their impact on controls.',
        icon: <Target className="w-6 h-6" />,
        link: '/incidents',
        substeps: [
            'Navigate to the Incidents page',
            'Review incident severity and status',
            'Check Incident-Control linkages (which controls failed)',
            'Create remediation actions from incidents',
            'Document lessons learned',
            'Update controls based on incident findings'
        ]
    },
    {
        id: '6',
        title: 'Prepare for Audit',
        description: 'Use the platform to prepare evidence and documentation.',
        icon: <ClipboardCheck className="w-6 h-6" />,
        link: '/audit',
        substeps: [
            'Create an audit record in Audit Management',
            'Link audit to target framework',
            'Run compliance coverage report',
            'Collect and tag evidence to controls',
            'Document control testing results',
            'Track and remediate audit findings'
        ]
    }
];

export default function GuidePage() {
    const { t } = useLanguage();
    const [expandedStep, setExpandedStep] = useState<string | null>('1');
    const [activeTab, setActiveTab] = useState<'quickstart' | 'frameworks' | 'controls' | 'risk' | 'audit'>('quickstart');

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold mb-6">
                            <BookOpen className="w-4 h-4" />
                            {t('nav_guide')}
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">
                            {t('nav_guide')}
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            {t('dash_module_ecosystem_desc')}
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {[
                            { id: 'quickstart', label: 'Quick Start', icon: <Play className="w-4 h-4" /> },
                            { id: 'frameworks', label: 'Frameworks', icon: <Scale className="w-4 h-4" /> },
                            { id: 'controls', label: 'Control Types', icon: <Shield className="w-4 h-4" /> },
                            { id: 'risk', label: 'Risk Methodology', icon: <AlertTriangle className="w-4 h-4" /> },
                            { id: 'audit', label: 'Audit Prep', icon: <ClipboardCheck className="w-4 h-4" /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* QUICK START TAB */}
                    {activeTab === 'quickstart' && (
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
                    )}

                    {/* FRAMEWORKS TAB */}
                    {activeTab === 'frameworks' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mb-6">
                                <h2 className="text-xl font-bold text-emerald-400 mb-2">Understanding Compliance Frameworks</h2>
                                <p className="text-slate-400">
                                    Compliance frameworks provide structured approaches to managing information security, privacy,
                                    and operational risks. Choose frameworks based on your industry, geography, and customer requirements.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {frameworks.map(fw => (
                                    <div key={fw.name} className="bg-slate-900/40 border border-white/5 rounded-xl p-6 hover:border-emerald-500/30 transition-all">
                                        <h3 className="text-xl font-bold text-white mb-1">{fw.name}</h3>
                                        <p className="text-emerald-400 text-sm font-medium mb-3">{fw.scope}</p>
                                        <p className="text-slate-400 text-sm mb-4">{fw.description}</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Requirements:</span>
                                                <span className="text-white font-medium">{fw.requirements}</span>
                                            </div>
                                            <div className="bg-slate-950/50 p-3 rounded-lg">
                                                <span className="text-blue-400 font-medium">Best for: </span>
                                                <span className="text-slate-300">{fw.bestFor}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CONTROL TYPES TAB */}
                    {activeTab === 'controls' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mb-6">
                                <h2 className="text-xl font-bold text-emerald-400 mb-2">Control Classification</h2>
                                <p className="text-slate-400">
                                    Controls are safeguards designed to protect information assets. Understanding control types
                                    helps you build a defense-in-depth strategy with layered protection.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {controlTypes.map(ctrl => (
                                    <div key={ctrl.type} className={`bg-slate-900/40 border border-${ctrl.color}-500/30 rounded-xl p-6`}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`p-3 bg-${ctrl.color}-500/10 text-${ctrl.color}-400 rounded-xl`}>
                                                {ctrl.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{ctrl.type}</h3>
                                                <p className={`text-${ctrl.color}-400 text-sm font-medium`}>{ctrl.purpose}</p>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <h4 className="text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Examples</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {ctrl.examples.map(ex => (
                                                    <span key={ex} className="px-2 py-1 bg-slate-800 rounded text-xs text-slate-300">{ex}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-lg">
                                            <span className="text-yellow-400 font-bold text-xs uppercase">Audit Focus: </span>
                                            <span className="text-slate-300 text-sm">{ctrl.auditFocus}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RISK METHODOLOGY TAB */}
                    {activeTab === 'risk' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
                                <h2 className="text-xl font-bold text-emerald-400 mb-2">Risk Assessment Methodology</h2>
                                <p className="text-slate-400 mb-6">{riskMatrix.description}</p>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                    {riskMatrix.categories.map(cat => (
                                        <div key={cat.label} className={`bg-${cat.color}-500/10 border border-${cat.color}-500/30 rounded-xl p-4 text-center`}>
                                            <div className={`text-2xl font-black text-${cat.color}-400`}>{cat.range}</div>
                                            <div className={`text-${cat.color}-400 font-bold mt-1`}>{cat.label}</div>
                                            <div className="text-slate-400 text-xs mt-2">{cat.action}</div>
                                        </div>
                                    ))}
                                </div>

                                <h3 className="text-lg font-bold text-white mb-3">Risk Treatment Options</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {riskMatrix.treatmentOptions.map((opt, i) => (
                                        <div key={i} className="flex items-start gap-3 bg-slate-950/50 p-4 rounded-lg">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                                            <span className="text-slate-300">{opt}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 5x5 Risk Matrix Visual */}
                            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Network className="w-5 h-5 text-purple-400" />
                                    Risk Heatmap Legend
                                </h3>
                                <div className="grid grid-cols-5 gap-1 max-w-lg mx-auto">
                                    {[5, 4, 3, 2, 1].map(impact => (
                                        [1, 2, 3, 4, 5].map(likelihood => {
                                            const score = impact * likelihood;
                                            let color = 'bg-green-500/30';
                                            if (score >= 20) color = 'bg-red-500/60';
                                            else if (score >= 12) color = 'bg-orange-500/50';
                                            else if (score >= 6) color = 'bg-yellow-500/40';
                                            return (
                                                <div key={`${impact}-${likelihood}`} className={`${color} aspect-square rounded flex items-center justify-center text-xs font-bold text-white`}>
                                                    {score}
                                                </div>
                                            );
                                        })
                                    ))}
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-500 max-w-lg mx-auto">
                                    <span>Likelihood →</span>
                                    <span>Impact ↓</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AUDIT PREP TAB */}
                    {activeTab === 'audit' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mb-6">
                                <h2 className="text-xl font-bold text-emerald-400 mb-2">Audit Preparation Checklist</h2>
                                <p className="text-slate-400">
                                    Successful audits require preparation. Follow this timeline to ensure you&apos;re ready
                                    for internal or external audits.
                                </p>
                            </div>

                            {auditPrep.map((phase, idx) => (
                                <div key={idx} className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center font-black text-emerald-400">
                                            {idx + 1}
                                        </div>
                                        <h3 className="text-xl font-bold text-white">{phase.phase}</h3>
                                    </div>
                                    <ul className="space-y-3">
                                        {phase.tasks.map((task, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                <span className="text-slate-300">{task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            <Link
                                href="/audit"
                                className="block w-full text-center py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all"
                            >
                                Go to Audit Management →
                            </Link>
                        </div>
                    )}

                    {/* Support Section */}
                    <div className="mt-12 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-8 text-center">
                        <Users className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">Need Expert Assistance?</h3>
                        <p className="text-slate-400 mb-6">
                            Our GRC consultants can help you achieve compliance faster.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <a
                                href="mailto:support@grcma.io"
                                className="px-6 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-all"
                            >
                                Contact GRC Expert
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
