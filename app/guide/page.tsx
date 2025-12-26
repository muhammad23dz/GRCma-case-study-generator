'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import {
    BookOpen, Shield, AlertTriangle, FileText, Users,
    CheckCircle2, ArrowRight, Play, ChevronDown, ChevronUp,
    BarChart3, ClipboardCheck, Settings, Zap, Target, Building2,
    Lock, Eye, Wrench, BookMarked, Scale, Network, Globe, Mail,
    GraduationCap, Award, Database, Brain, Workflow, Key
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

// ==========================================
// PLATFORM FEATURES - ALL MODULES
// ==========================================
const platformFeatures = [
    {
        category: 'Core GRC',
        icon: <Shield className="w-6 h-6" />,
        color: 'emerald',
        modules: [
            { name: 'Controls', href: '/controls', desc: 'Manage security controls with framework mappings' },
            { name: 'Risks', href: '/risks', desc: 'Risk register with 5×5 matrix scoring' },
            { name: 'Policies', href: '/policies', desc: 'Policy management with version control' },
            { name: 'Vendors', href: '/vendors', desc: 'Third-party risk management (TPRM)' },
            { name: 'Incidents', href: '/incidents', desc: 'Incident tracking with risk feedback' },
            { name: 'Actions', href: '/actions', desc: 'Remediation workflow and task tracking' },
        ]
    },
    {
        category: 'Audit & Compliance',
        icon: <ClipboardCheck className="w-6 h-6" />,
        color: 'blue',
        modules: [
            { name: 'Audit Management', href: '/audit', desc: 'Plan, execute, and track audits' },
            { name: 'Auditor Portal', href: '/auditor-portal/manage', desc: 'Secure access for external auditors' },
            { name: 'Evidence', href: '/evidence', desc: 'Evidence collection and management' },
            { name: 'Frameworks', href: '/frameworks', desc: 'ISO 27001, SOC 2, NIST, GDPR mappings' },
            { name: 'Gap Analysis', href: '/reports/coverage', desc: 'Compliance gap identification' },
        ]
    },
    {
        category: 'Security Awareness',
        icon: <Users className="w-6 h-6" />,
        color: 'purple',
        modules: [
            { name: 'Employees', href: '/employees', desc: 'Employee directory and access' },
            { name: 'Training', href: '/training', desc: 'Security awareness courses' },
            { name: 'Phishing Simulations', href: '/phishing', desc: 'Test employees with simulated phishing' },
            { name: 'Questionnaires', href: '/questionnaires', desc: 'Security questionnaires and assessments' },
            { name: 'Knowledge Base', href: '/knowledge-base', desc: 'Reusable Q&A library' },
        ]
    },
    {
        category: 'Enterprise Features',
        icon: <Globe className="w-6 h-6" />,
        color: 'orange',
        modules: [
            { name: 'Trust Center', href: '/trust-center', desc: 'Public security portal for customers' },
            { name: 'Business Continuity', href: '/bcdr', desc: 'BCDR plans with RTO/RPO tracking' },
            { name: 'Asset Inventory', href: '/assets', desc: 'IT asset classification and tracking' },
            { name: 'Change Management', href: '/changes', desc: 'Change requests with risk assessment' },
            { name: 'Runbooks', href: '/runbooks', desc: 'Operational procedures and playbooks' },
        ]
    },
    {
        category: 'AI & Intelligence',
        icon: <Brain className="w-6 h-6" />,
        color: 'pink',
        modules: [
            { name: 'AI Platform', href: '/platform', desc: 'Generate GRC assessments with AI' },
            { name: 'Intelligence Studio', href: '/intelligence', desc: 'Risk analysis and control suggestions' },
            { name: 'DevSecOps', href: '/devsecops', desc: 'CI/CD integration and Git sync' },
            { name: 'Zero Trust', href: '/zero-trust', desc: 'Zero trust posture analytics' },
        ]
    },
    {
        category: 'Reports & Analytics',
        icon: <BarChart3 className="w-6 h-6" />,
        color: 'cyan',
        modules: [
            { name: 'Dashboard', href: '/dashboard', desc: 'Executive summary and metrics' },
            { name: 'Reports', href: '/reports', desc: 'Compliance and risk reports' },
            { name: 'Integrations', href: '/integrations', desc: 'Connect external tools' },
            { name: 'Settings', href: '/settings', desc: 'Organization and user settings' },
        ]
    },
    {
        category: 'Admin Setup',
        icon: <Key className="w-6 h-6" />,
        color: 'red',
        modules: [
            { name: 'User Management', href: '/admin/users', desc: 'Manage users and assign RBAC roles' },
            { name: 'SMTP Email', href: '/admin/settings', desc: 'Configure email sending for notifications' },
            { name: 'System Config', href: '/settings', desc: 'AI, security, and organization settings' },
        ]
    }
];

// ==========================================
// BEGINNER QUICK TOUR
// ==========================================
const beginnerTour = [
    {
        step: 1,
        title: 'Start with AI Assessment',
        description: 'Generate your first compliance baseline using AI. This creates sample controls, risks, and policies.',
        action: 'Go to Platform → Enter your company details → Generate Assessment → Push to Dashboard',
        link: '/platform',
        time: '5 mins'
    },
    {
        step: 2,
        title: 'Explore Your Dashboard',
        description: 'See the big picture with your GRC metrics, risk heatmap, and compliance status.',
        action: 'Review widgets: Risk Overview, Compliance Rate, Recent Activity, Upcoming Actions',
        link: '/dashboard',
        time: '3 mins'
    },
    {
        step: 3,
        title: 'Review Your Risks',
        description: 'Understand identified risks and how controls mitigate them.',
        action: 'Check risk scores (Likelihood × Impact), view heatmap, assign owners',
        link: '/risks',
        time: '5 mins'
    },
    {
        step: 4,
        title: 'Map Controls to Frameworks',
        description: 'Link your security controls to compliance frameworks like ISO 27001 or SOC 2.',
        action: 'Select a control → Add Framework Mapping → Choose requirements',
        link: '/controls',
        time: '10 mins'
    },
    {
        step: 5,
        title: 'Set Up Security Training',
        description: 'Assign training courses to employees and track completion.',
        action: 'Create courses → Assign to employees → Monitor completion rates',
        link: '/training',
        time: '5 mins'
    },
    {
        step: 6,
        title: 'Configure Trust Center',
        description: 'Create a public-facing security portal for your customers.',
        action: 'Set branding → Add sections → Auto-populate from GRC data → Publish',
        link: '/trust-center',
        time: '10 mins'
    },
    {
        step: 7,
        title: 'Prepare for Audit',
        description: 'Set up your first audit and generate evidence packages.',
        action: 'Create audit → Link framework → Collect evidence → Add auditor access',
        link: '/audit',
        time: '15 mins'
    }
];

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
            'Provide auditor with read-only platform access via Auditor Portal',
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

export default function GuidePage() {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'tour' | 'features' | 'frameworks' | 'controls' | 'risk' | 'audit' | 'admin'>('tour');
    const [expandedFeature, setExpandedFeature] = useState<string | null>('Core GRC');

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold mb-6">
                            <BookOpen className="w-4 h-4" />
                            Beginner's Guide
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">
                            Learn GRCma
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Master Governance, Risk & Compliance with our comprehensive platform guide
                        </p>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex flex-wrap justify-center gap-2 mb-8">
                        {[
                            { id: 'tour', label: '🚀 Quick Tour', desc: 'Start here' },
                            { id: 'features', label: '📋 All Features', desc: 'Full platform' },
                            { id: 'frameworks', label: '📜 Frameworks', desc: 'ISO, SOC 2, NIST' },
                            { id: 'controls', label: '🛡️ Control Types', desc: 'Defense layers' },
                            { id: 'risk', label: '⚠️ Risk Method', desc: '5×5 matrix' },
                            { id: 'audit', label: '✅ Audit Prep', desc: 'Get ready' },
                            { id: 'admin', label: '⚙️ Admin Setup', desc: 'RBAC & Email' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* QUICK TOUR TAB */}
                    {activeTab === 'tour' && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-white/10 rounded-2xl p-6 mb-8">
                                <h2 className="text-2xl font-bold text-white mb-2">👋 Welcome to GRCma!</h2>
                                <p className="text-slate-400">
                                    Follow these 7 steps to set up your GRC program. Total time: <span className="text-emerald-400 font-bold">~1 hour</span>
                                </p>
                            </div>

                            <div className="grid gap-4">
                                {beginnerTour.map((item) => (
                                    <div key={item.step} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-emerald-500/30 transition-all">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-black text-xl">
                                                {item.step}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                                                    <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{item.time}</span>
                                                </div>
                                                <p className="text-slate-400 text-sm mb-3">{item.description}</p>
                                                <div className="bg-slate-950/50 rounded-lg p-3 mb-4">
                                                    <span className="text-emerald-400 font-semibold text-sm">→ </span>
                                                    <span className="text-slate-300 text-sm">{item.action}</span>
                                                </div>
                                                <Link
                                                    href={item.link}
                                                    className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-semibold text-sm"
                                                >
                                                    Open {item.title.split(' ').pop()} <ArrowRight className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ALL FEATURES TAB */}
                    {activeTab === 'features' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mb-6">
                                <h2 className="text-xl font-bold text-emerald-400 mb-2">Platform Overview</h2>
                                <p className="text-slate-400">
                                    GRCma includes 30+ modules organized into 6 categories. Click any module to open it.
                                </p>
                            </div>

                            <div className="grid gap-4">
                                {platformFeatures.map((category) => (
                                    <div key={category.category} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedFeature(expandedFeature === category.category ? null : category.category)}
                                            className="w-full p-6 flex items-center gap-4 text-left hover:bg-white/5 transition-all"
                                        >
                                            <div className={`p-3 bg-${category.color}-500/20 text-${category.color}-400 rounded-xl`}>
                                                {category.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white">{category.category}</h3>
                                                <p className="text-sm text-slate-500">{category.modules.length} modules</p>
                                            </div>
                                            {expandedFeature === category.category ? (
                                                <ChevronUp className="w-5 h-5 text-slate-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-slate-400" />
                                            )}
                                        </button>

                                        {expandedFeature === category.category && (
                                            <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {category.modules.map((module) => (
                                                    <Link
                                                        key={module.name}
                                                        href={module.href}
                                                        className="bg-slate-800/50 hover:bg-slate-700/50 border border-white/5 rounded-xl p-4 transition-all group"
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className="font-semibold text-white group-hover:text-emerald-400 transition-colors">{module.name}</span>
                                                            <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                                                        </div>
                                                        <p className="text-xs text-slate-500">{module.desc}</p>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                                    <div key={ctrl.type} className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    href="/audit"
                                    className="block text-center py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all"
                                >
                                    Go to Audit Management →
                                </Link>
                                <Link
                                    href="/auditor-portal/manage"
                                    className="block text-center py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all border border-white/10"
                                >
                                    Set Up Auditor Portal →
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* ADMIN SETUP TAB */}
                    {activeTab === 'admin' && (
                        <div className="space-y-6">
                            <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 mb-6">
                                <h2 className="text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                                    <Key className="w-6 h-6" />
                                    Administrator Setup Guide
                                </h2>
                                <p className="text-slate-400">
                                    Configure user access, roles, and email notifications for your organization.
                                </p>
                            </div>

                            {/* RBAC SECTION */}
                            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
                                        <Shield className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">Role-Based Access Control (RBAC)</h3>
                                        <p className="text-purple-400 text-sm font-medium">Manage user permissions at /admin/users</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">Available Roles</h4>
                                    <div className="bg-slate-950/50 rounded-lg overflow-hidden">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="text-left p-3 text-slate-400">Role</th>
                                                    <th className="text-left p-3 text-slate-400">Access Level</th>
                                                    <th className="text-left p-3 text-slate-400">Permissions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-3"><span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded font-bold">ADMIN</span></td>
                                                    <td className="p-3 text-white">Full Access</td>
                                                    <td className="p-3 text-slate-400">All permissions, user management, system config</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-3"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded font-bold">MANAGER</span></td>
                                                    <td className="p-3 text-white">Write Access</td>
                                                    <td className="p-3 text-slate-400">CRUD all GRC entities, invite users, export reports</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-3"><span className="px-2 py-1 bg-teal-500/20 text-teal-400 rounded font-bold">ANALYST</span></td>
                                                    <td className="p-3 text-white">Analyst Access</td>
                                                    <td className="p-3 text-slate-400">Read/Write risks, controls; Read-only policies, vendors</td>
                                                </tr>
                                                <tr>
                                                    <td className="p-3"><span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded font-bold">VIEWER</span></td>
                                                    <td className="p-3 text-white">Read Only</td>
                                                    <td className="p-3 text-slate-400">View reports, risks, controls, and policies</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="bg-slate-950/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-bold text-emerald-400 mb-2">How to Assign Roles:</h4>
                                    <ol className="list-decimal list-inside text-slate-300 space-y-1 text-sm">
                                        <li>Go to <span className="text-white font-mono bg-slate-800 px-2 py-0.5 rounded">/admin/users</span></li>
                                        <li>Click <strong className="text-white">+ Add Member</strong> to invite new users</li>
                                        <li>Select role during invitation, or...</li>
                                        <li>Use the <strong className="text-white">role dropdown</strong> next to any user to change their role</li>
                                    </ol>
                                </div>
                            </div>

                            {/* SMTP SECTION */}
                            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">SMTP Email Configuration</h3>
                                        <p className="text-orange-400 text-sm font-medium">Configure at Settings → Email (SMTP)</p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <h4 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">Required Settings</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="bg-slate-950/50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-500 uppercase">SMTP Host</span>
                                            <div className="text-white font-mono">smtp.gmail.com</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-500 uppercase">SMTP Port</span>
                                            <div className="text-white font-mono">587</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-500 uppercase">SMTP User</span>
                                            <div className="text-white font-mono">your-email@gmail.com</div>
                                        </div>
                                        <div className="bg-slate-950/50 p-3 rounded-lg">
                                            <span className="text-xs text-slate-500 uppercase">SMTP Password</span>
                                            <div className="text-white font-mono">App Password (16 chars)</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-lg mb-4">
                                    <h4 className="text-sm font-bold text-orange-400 mb-2">⚠️ Gmail App Password Setup:</h4>
                                    <ol className="list-decimal list-inside text-slate-300 space-y-1 text-sm">
                                        <li>Go to <span className="text-orange-300">myaccount.google.com/security</span></li>
                                        <li>Enable <strong className="text-white">2-Step Verification</strong></li>
                                        <li>Search for <span className="text-white font-bold">&quot;App Passwords&quot;</span></li>
                                        <li>Create a new app password (name: GRCma)</li>
                                        <li>Copy the <strong className="text-white">16-character code</strong></li>
                                        <li>Use this code as your SMTP Password</li>
                                    </ol>
                                </div>

                                <div className="bg-slate-950/50 p-4 rounded-lg">
                                    <h4 className="text-sm font-bold text-emerald-400 mb-2">Email Features Enabled:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">User Invitations</span>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">Report Delivery</span>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">Alert Notifications</span>
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium">Audit Reminders</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Link
                                    href="/admin/users"
                                    className="block text-center py-4 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-xl transition-all"
                                >
                                    Open User Management →
                                </Link>
                                <Link
                                    href="/admin/settings"
                                    className="block text-center py-4 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl transition-all"
                                >
                                    Configure SMTP Email →
                                </Link>
                            </div>
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
