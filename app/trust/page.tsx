'use client';

import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import {
    Shield, Lock, Eye, Server, CheckCircle2, Award,
    Zap, Users, Globe, FileText, AlertTriangle
} from 'lucide-react';

export default function TrustPage() {
    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-5xl mx-auto">
                    {/* DEMO Banner */}
                    <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 mb-8 text-center">
                        <div className="flex items-center justify-center gap-3 mb-3">
                            <Zap className="w-8 h-8 text-amber-400" />
                            <span className="text-2xl font-black text-amber-400">DEMO RELEASE</span>
                            <Zap className="w-8 h-8 text-amber-400" />
                        </div>
                        <p className="text-amber-200 text-lg mb-2">
                            You are using the <b>FREE Demo Version</b> of GRCma Platform
                        </p>
                        <p className="text-amber-300/70 text-sm">
                            This demo is provided for evaluation purposes. Full features and
                            enterprise support will be available in the paid version coming soon.
                        </p>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-bold mb-6">
                            <Shield className="w-4 h-4" />
                            Trust Center
                        </div>
                        <h1 className="text-5xl font-black text-white mb-4">
                            Security & Compliance
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            GRCma is built with security-first principles. Here's how we protect your data and maintain compliance.
                        </p>
                    </div>

                    {/* Pricing Banner */}
                    <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-8 mb-16">
                        <div className="text-center">
                            <h2 className="text-3xl font-black text-white mb-4">Current Pricing</h2>
                            <div className="inline-flex items-baseline gap-2 mb-4">
                                <span className="text-7xl font-black text-emerald-400">FREE</span>
                                <span className="text-2xl text-slate-400 line-through">$99/mo</span>
                            </div>
                            <p className="text-slate-400 text-lg mb-6">
                                Demo period - All features unlocked for evaluation
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 text-sm">
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Unlimited Controls
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    All Frameworks
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Audit Management
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Report Generation
                                </div>
                                <div className="flex items-center gap-2 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Risk Management
                                </div>
                            </div>
                            <div className="mt-6 text-sm text-slate-500">
                                <AlertTriangle className="w-4 h-4 inline mr-2 text-amber-500" />
                                Enterprise pricing will be announced after demo period ends
                            </div>
                        </div>
                    </div>

                    {/* Security Features Grid */}
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">Security Features</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                        {[
                            {
                                icon: <Lock className="w-8 h-8" />,
                                title: 'Data Encryption',
                                description: 'AES-256 encryption at rest and TLS 1.3 in transit for all data.',
                                color: 'emerald'
                            },
                            {
                                icon: <Eye className="w-8 h-8" />,
                                title: 'Access Controls',
                                description: 'Role-based access control (RBAC) with granular permissions.',
                                color: 'blue'
                            },
                            {
                                icon: <Server className="w-8 h-8" />,
                                title: 'Secure Infrastructure',
                                description: 'Hosted on enterprise-grade cloud with SOC 2 compliance.',
                                color: 'purple'
                            },
                            {
                                icon: <Shield className="w-8 h-8" />,
                                title: 'MFA Support',
                                description: 'Multi-factor authentication with TOTP support.',
                                color: 'orange'
                            },
                            {
                                icon: <FileText className="w-8 h-8" />,
                                title: 'Audit Logging',
                                description: 'Complete audit trail of all user actions and data changes.',
                                color: 'pink'
                            },
                            {
                                icon: <Globe className="w-8 h-8" />,
                                title: 'GDPR Ready',
                                description: 'Data processing agreements and privacy controls available.',
                                color: 'cyan'
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className={`bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-${feature.color}-500/30 transition-all group`}
                            >
                                <div className={`w-14 h-14 bg-${feature.color}-500/10 rounded-xl flex items-center justify-center mb-4 text-${feature.color}-400 group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-400">{feature.description}</p>
                            </div>
                        ))}
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-16">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all text-lg"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
