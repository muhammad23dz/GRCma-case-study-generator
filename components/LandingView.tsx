'use client';

import { useUser, SignInButton } from '@clerk/nextjs';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import {
    Shield, Lock, Eye, Server, CheckCircle2, Award,
    Zap, Users, Globe, FileText, AlertTriangle, ArrowRight,
    Database, BarChart, Building2, ClipboardCheck
} from 'lucide-react';

export default function LandingView() {
    const { isSignedIn } = useUser();

    const modules = [
        { title: 'Control Management', desc: 'Create, test, and track security controls with framework mappings.' },
        { title: 'Risk Assessment', desc: 'Quantify risks with likelihood/impact scoring and treatment tracking.' },
        { title: 'Policy Governance', desc: 'Draft, version, and obtain attestations for organizational policies.' },
        { title: 'Audit Management', desc: 'Plan audits, document findings, and track remediation actions.' },
        { title: 'Incident Response', desc: 'Log security incidents and manage response workflows.' },
        { title: 'Vendor Risk', desc: 'Assess third-party vendors and monitor their security posture.' },
        { title: 'Asset Inventory', desc: 'Maintain a registry of hardware, software, and data assets.' },
        { title: 'Change Management', desc: 'Track infrastructure changes with approval workflows.' },
        { title: 'Gap Analysis', desc: 'Compare current controls against framework requirements.' },
        { title: 'BCDR Planning', desc: 'Document business continuity and disaster recovery plans.' },
        { title: 'Employee Management', desc: 'Track personnel, roles, and security training completion.' },
        { title: 'Evidence Collection', desc: 'Store and organize audit evidence with version control.' },
        { title: 'Compliance Reporting', desc: 'Generate reports for frameworks like ISO 27001, SOC 2, GDPR.' },
        { title: 'Zero Trust Analytics', desc: 'Visualize security posture across identity, device, network, app, and data.' },
        { title: 'AI Intelligence Studio', desc: 'AI-powered risk analysis, control suggestions, policy drafting, and gap detection.' },
        { title: 'DevSecOps Center', desc: 'CI/CD integrations, Config as Code (YAML/JSON), and Git sync for GRC resources.' }
    ];

    const frameworks = ['ISO 27001', 'SOC 2', 'NIST CSF', 'GDPR', 'PCI-DSS', 'HIPAA', 'Law 09-08'];

    return (
        <div className="min-h-screen text-white selection:bg-[#C1272D]/30 font-sans tracking-tight">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 px-8 pt-40 pb-32">
                <div className="max-w-[1400px] mx-auto">
                    {/* Hero Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start mb-40">
                        <div className="relative">
                            <div className="absolute top-0 left-0 w-12 h-1 bg-[#C1272D] mb-8"></div>
                            <div className="pt-8">
                                <h1 className="text-6xl md:text-7xl font-black mb-8 leading-[0.9] tracking-tighter">
                                    GRC<br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">Platform</span>
                                </h1>
                                <p className="text-xl text-slate-400 max-w-md leading-relaxed font-light mb-8">
                                    A unified Governance, Risk, and Compliance management system.
                                    16 integrated modules including AI Intelligence and DevSecOps automation.
                                </p>
                                <ul className="space-y-3 text-slate-300">
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#006233]" />
                                        <span>Map controls to ISO 27001, SOC 2, NIST, GDPR</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#006233]" />
                                        <span>Quantitative risk assessment with treatment tracking</span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-[#006233]" />
                                        <span>Evidence collection for audit preparation</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="relative aspect-square">
                            <div className="absolute inset-0 border border-white/5 p-8 flex items-center justify-center">
                                <div className="relative w-full h-full border border-white/10 flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#C1272D]/5 to-[#006233]/5"></div>
                                    <div className="relative flex flex-col items-center">
                                        <div className="w-24 h-24 mb-12 flex items-center justify-center group relative">
                                            <div className="absolute inset-0 bg-[#006233]/10 blur-2xl rounded-full scale-150 animate-pulse"></div>
                                            <svg viewBox="0 0 24 24" className="w-20 h-20 transition-transform duration-700 group-hover:scale-110 relative z-10">
                                                <path d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22" fill="none" stroke="#C1272D" strokeWidth="2.5" />
                                                <path d="M12 2L20 5V11C20 16.1 16.6 20.9 12 22" fill="none" stroke="#006233" strokeWidth="2.5" />
                                                <path d="M12 2V22" stroke="white" strokeWidth="1.2" className="opacity-80" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500 mb-6">Get Started</p>
                                            {isSignedIn ? (
                                                <Link
                                                    href="/dashboard"
                                                    className="inline-block px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all border-b-4 border-slate-300"
                                                >
                                                    Open Dashboard
                                                </Link>
                                            ) : (
                                                <SignInButton mode="modal">
                                                    <button className="px-12 py-5 bg-[#006233] text-white font-black uppercase tracking-widest text-xs hover:bg-[#007a40] transition-all border-b-4 border-[#004d28]">
                                                        Sign In
                                                    </button>
                                                </SignInButton>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#C1272D]"></div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#006233]"></div>
                            </div>
                        </div>
                    </div>

                    {/* Modules Grid */}
                    <div className="mb-40">
                        <div className="mb-20">
                            <h2 className="text-sm font-black uppercase tracking-[0.4em] text-[#C1272D] mb-4">Platform Modules</h2>
                            <h3 className="text-4xl font-bold">16 GRC Management Tools</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border-l border-t border-white/5">
                            {modules.map((mod, i) => (
                                <div key={i} className="p-10 border-r border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                    <div className="text-[10px] font-bold text-slate-500 mb-6 font-mono">{(i + 1).toString().padStart(2, '0')}</div>
                                    <h4 className="text-lg font-bold mb-4 group-hover:text-[#006233] transition-colors">{mod.title}</h4>
                                    <p className="text-sm text-slate-500 leading-relaxed font-light">{mod.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Key Features */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-white/5 mb-40">
                        {[
                            { title: 'Data Security', desc: 'Your data is encrypted at rest and in transit. Organization-level isolation ensures data separation.', accent: '#C1272D' },
                            { title: 'Role-Based Access', desc: 'Granular permissions control who can view, edit, or approve GRC records.', accent: '#ffffff' },
                            { title: 'Audit Trail', desc: 'All changes are logged with timestamps and user attribution for compliance.', accent: '#006233' }
                        ].map((box, i) => (
                            <div key={i} className="bg-[#050505] p-16 group">
                                <div className="w-1 h-12 mb-12" style={{ backgroundColor: box.accent }}></div>
                                <h4 className="text-2xl font-bold mb-6">{box.title}</h4>
                                <p className="text-slate-500 leading-relaxed">{box.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Frameworks */}
                    <div className="flex flex-wrap items-center justify-between gap-12 py-12 border-y border-white/5">
                        {frameworks.map((cert) => (
                            <span key={cert} className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white transition-colors cursor-default">
                                {cert}
                            </span>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="mt-40 flex flex-col items-center">
                        <div className="w-px h-24 bg-gradient-to-b from-transparent via-[#C1272D] to-[#006233] mb-12"></div>
                        <h2 className="text-5xl font-black text-center mb-12 tracking-tighter max-w-2xl">
                            Ready to streamline your<br />
                            <span className="text-[#006233]">compliance</span> workflow?
                        </h2>
                        <Link
                            href={isSignedIn ? "/dashboard" : "/login"}
                            className="px-16 py-6 bg-white text-black font-black uppercase tracking-widest text-sm hover:invert transition-all flex items-center gap-4 group"
                        >
                            Get Started
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
