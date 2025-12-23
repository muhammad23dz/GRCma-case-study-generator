import { Linkedin, Shield, BarChart3, Users, FileCheck, Lock, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Link from 'next/link';

export default function AboutView() {
    const { user } = useUser();
    const { t } = useLanguage();

    return (
        <div className="max-w-5xl mx-auto space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero Section */}
            <div className="text-center">
                <h1 className="text-5xl font-bold tracking-tight mb-6 text-white">
                    About GRCma
                </h1>
                <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8">
                    A comprehensive Governance, Risk, and Compliance platform designed to help organizations
                    manage their security posture, track compliance requirements, and mitigate operational risks.
                </p>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold transition-all hover:scale-105"
                >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

            {/* What We Offer */}
            <div>
                <h2 className="text-2xl font-bold text-white mb-8 text-center">Platform Capabilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                        <div className="p-3 bg-emerald-500/10 rounded-lg w-fit mb-4">
                            <Shield className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Controls Management</h3>
                        <p className="text-slate-400 text-sm">
                            Define, implement, and monitor security controls across your organization with evidence tracking.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                        <div className="p-3 bg-red-500/10 rounded-lg w-fit mb-4">
                            <BarChart3 className="w-6 h-6 text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Risk Assessment</h3>
                        <p className="text-slate-400 text-sm">
                            Identify, assess, and prioritize risks with heatmaps and scoring methodologies.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                        <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
                            <FileCheck className="w-6 h-6 text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Compliance Tracking</h3>
                        <p className="text-slate-400 text-sm">
                            Map controls to frameworks like ISO 27001, SOC 2, NIST CSF, GDPR, and Law 09-08.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                        <div className="p-3 bg-purple-500/10 rounded-lg w-fit mb-4">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Vendor Management</h3>
                        <p className="text-slate-400 text-sm">
                            Assess and monitor third-party vendor risks with questionnaires and due diligence workflows.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                        <div className="p-3 bg-orange-500/10 rounded-lg w-fit mb-4">
                            <Lock className="w-6 h-6 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Policy Management</h3>
                        <p className="text-slate-400 text-sm">
                            Create, version, and distribute security policies with attestation tracking.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl">
                        <div className="p-3 bg-cyan-500/10 rounded-lg w-fit mb-4">
                            <BarChart3 className="w-6 h-6 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Incident Response</h3>
                        <p className="text-slate-400 text-sm">
                            Track and manage security incidents with severity classification and remediation workflows.
                        </p>
                    </div>
                </div>
            </div>

            {/* Creator Section */}
            <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-2 border-slate-700 overflow-hidden shrink-0">
                        <img
                            src="/profile.png"
                            alt="Mohamed Hmamouch"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    <div className="text-center md:text-left flex-grow">
                        <p className="text-emerald-400 text-sm font-medium mb-1">Developer</p>
                        <h3 className="text-2xl font-bold text-white mb-3">Mohamed Hmamouch</h3>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xl mb-4">
                            GRCma was built to modernize governance, risk, and compliance management by combining
                            practical controls with intelligent automation. The goal is to transform compliance
                            from a static checklist into an operational advantage.
                        </p>
                        <a
                            href="https://www.linkedin.com/in/mohamed-hmamouch-b5a944300/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0077b5] text-white rounded-lg text-sm font-medium hover:bg-[#006399] transition-colors"
                        >
                            <Linkedin className="w-4 h-4" />
                            Connect on LinkedIn
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center">
                <p className="text-slate-500 text-sm">
                    Built for security professionals who value clarity over complexity.
                </p>
            </div>
        </div>
    );
}
