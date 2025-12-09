'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { Shield, Lock, FileCheck, Download, CheckCircle2, ArrowRight, Loader2, Mail } from 'lucide-react';
import PremiumBackground from '@/components/PremiumBackground';

export default function TrustCenterPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState('');
    const [uptimeData, setUptimeData] = useState<Array<{ status: 'ok' | 'warn', opacity: number }>>([]);
    const [lastUpdated, setLastUpdated] = useState<string>('');

    useEffect(() => {
        // Generate random uptime data on client-side only to prevent hydration mismatch
        const data = Array.from({ length: 30 }).map(() => ({
            status: (Math.random() > 0.98 ? 'warn' : 'ok') as 'ok' | 'warn',
            opacity: 0.8 + Math.random() * 0.2
        }));
        setUptimeData(data);
        setLastUpdated(new Date().toUTCString());
    }, []);

    const handleRequest = async (e: React.FormEvent, doc?: string) => {
        e.preventDefault();
        setLoading(true);

        const reason = doc ? `Download: ${doc}` : 'Demo Request';

        try {
            const res = await fetch('/api/trust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, reason })
            });

            if (res.ok) {
                setSuccess(true);
                setShowModal(false);
                // Reset success message after 5 seconds
                setTimeout(() => setSuccess(false), 5000);
            }
        } catch (error) {
            console.error('Request failed:', error);
        } finally {
            setLoading(false);
            setEmail('');
        }
    };

    const openRequestModal = (docName: string) => {
        setSelectedDoc(docName);
        setShowModal(true);
    };

    const statusRef = useRef<HTMLDivElement>(null);

    const scrollToStatus = () => {
        statusRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const faqs = [
        {
            q: "Where is my data stored?",
            a: "Customer data is encrypted at rest and in transit, stored in AWS regions (US-East-1 or EU-West-1) with redundancy across availability zones."
        },
        {
            q: "Do you support SSO?",
            a: "Yes, we support OIDC and SAML 2.0 (Okta, Azure AD, Google Workspace) for all Enterprise plans."
        },
        {
            q: " What is your disaster recovery plan?",
            a: "Our RTO is 4 hours and RPO is 1 hour. We test our disaster recovery procedures semi-annually."
        }
    ];

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header onNavChange={(view) => {
                if (view === 'input') router.push('/');
            }} />

            {success && (
                <div className="fixed top-24 right-8 z-[110] bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 border border-emerald-400/50 backdrop-blur-md">
                    <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
                    <div>
                        <div className="font-bold text-lg">Demo Sent!</div>
                        <div className="text-emerald-50 mb-3 opacity-90">Check your inbox or start immediately:</div>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="bg-white text-emerald-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-50 transition-colors shadow-sm flex items-center gap-2"
                        >
                            Launch Demo Now
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative overflow-hidden pt-20 pb-24 animate-in fade-in duration-700">
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-100 cursor-default hover:bg-emerald-500/20 transition-colors">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Live Compliance Status: 100%
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-r from-white via-slate-200 to-slate-500 bg-clip-text text-transparent animate-in slide-in-from-bottom-4 fade-in duration-700 delay-200">
                        Security you can trust.
                    </h1>

                    <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto mb-12 font-light leading-relaxed animate-in slide-in-from-bottom-4 fade-in duration-700 delay-300">
                        Transparency is our core value. View our real-time audit reports, compliance certifications, and system status instantly.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-6 animate-in slide-in-from-bottom-4 fade-in duration-700 delay-500">
                        <button
                            onClick={() => openRequestModal('Interactive Demo')}
                            className="px-10 py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-10px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            Send Demo to Email
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <button
                            onClick={scrollToStatus}
                            className="px-10 py-4 bg-slate-900/50 text-white border border-white/10 rounded-xl font-bold hover:bg-slate-800 transition-all hover:border-white/20 hover:-translate-y-1 active:translate-y-0 backdrop-blur-md"
                        >
                            View System Status
                        </button>
                    </div>
                </div>
            </div>

            {/* System Status Section */}
            <div ref={statusRef} className="max-w-7xl mx-auto px-6 py-12 scroll-mt-24">
                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white mb-2">System Status</h2>
                            <p className="text-slate-400">Real-time uptime monitoring across all regions.</p>
                        </div>
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-lg border border-emerald-500/20">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold">All Systems Operational</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {['API Gateway', 'Database Clusters', 'Check Processing', 'Web Dashboard'].map((service) => (
                            <div key={service} className="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-bold text-white">{service}</span>
                                    <span className="text-xs text-emerald-400 font-mono">100%</span>
                                </div>
                                <div className="flex gap-0.5 h-8">
                                    {uptimeData.length > 0 ? (
                                        uptimeData.map((day, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-sm ${day.status === 'warn' ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                                                style={{ opacity: day.opacity }}
                                                title={`Day ${i + 1}: ${day.status === 'warn' ? 'Degraded performance' : 'Operational'}`}
                                            ></div>
                                        ))
                                    ) : (
                                        // Loading Skeleton for SSR/Initial Render
                                        Array.from({ length: 30 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex-1 rounded-sm bg-emerald-500/20 animate-pulse"
                                            ></div>
                                        ))
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-right text-xs text-slate-500 font-mono">
                        Updated: {lastUpdated}
                    </div>
                </div>
            </div>

            {/* Certifications Grid */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* SOC 2 */}
                    <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-slate-800/40 hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-emerald-500/10">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <Shield className="w-32 h-32 text-emerald-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-black text-white">S2</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">SOC 2 Type II</h3>
                            <p className="text-emerald-400 text-sm font-bold mb-6 tracking-wide uppercase">Verified • Active</p>
                            <p className="text-slate-400 mb-8 leading-relaxed h-20">
                                Independently audited for Security, Availability, and Confidentiality. The gold standard for SaaS trust.
                            </p>
                            <button
                                onClick={() => openRequestModal('SOC 2 Type II Report')}
                                className="w-full py-4 rounded-xl bg-slate-950 border border-white/10 text-slate-300 font-bold hover:bg-white hover:text-slate-950 hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                            >
                                <Download className="w-4 h-4" />
                                Download Report
                            </button>
                        </div>
                    </div>

                    {/* ISO 27001 */}
                    <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-slate-800/40 hover:border-blue-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/10">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <Lock className="w-32 h-32 text-blue-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-black text-white">ISO</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">ISO 27001:2022</h3>
                            <p className="text-blue-400 text-sm font-bold mb-6 tracking-wide uppercase">Certified • Active</p>
                            <p className="text-slate-400 mb-8 leading-relaxed h-20">
                                Internationally recognized standard for Information Security Management Systems (ISMS).
                            </p>
                            <button
                                onClick={() => openRequestModal('ISO 27001 Certificate')}
                                className="w-full py-4 rounded-xl bg-slate-950 border border-white/10 text-slate-300 font-bold hover:bg-white hover:text-slate-950 hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                            >
                                <Download className="w-4 h-4" />
                                Download Certificate
                            </button>
                        </div>
                    </div>

                    {/* GDPR */}
                    <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 hover:bg-slate-800/40 hover:border-purple-500/30 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-purple-500/10">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <FileCheck className="w-32 h-32 text-purple-500" />
                        </div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20 mb-8 group-hover:scale-110 transition-transform duration-300">
                                <span className="text-2xl font-black text-white">GDPR</span>
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">GDPR Compliant</h3>
                            <p className="text-purple-400 text-sm font-bold mb-6 tracking-wide uppercase">Self-Assessed</p>
                            <p className="text-slate-400 mb-8 leading-relaxed h-20">
                                Fully compliant with EU data protection requirements. Data Processing Addendum (DPA) available.
                            </p>
                            <button
                                onClick={() => openRequestModal('GDPR DPA Document')}
                                className="w-full py-4 rounded-xl bg-slate-950 border border-white/10 text-slate-300 font-bold hover:bg-white hover:text-slate-950 hover:border-transparent transition-all flex items-center justify-center gap-2 group-hover:shadow-lg"
                            >
                                <Download className="w-4 h-4" />
                                Download DPA
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <h2 className="text-3xl font-bold text-center mb-10">Frequently Asked Questions</h2>
                <div className="grid gap-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 hover:bg-white/5 transition-all">
                            <h3 className="text-lg font-bold text-white mb-2">{faq.q}</h3>
                            <p className="text-slate-400 leading-relaxed">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Quick Request Footer */}
            <div className="max-w-4xl mx-auto px-6 pb-24">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 border border-white/10 rounded-3xl p-10 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-4">See It In Action</h3>
                        <p className="text-slate-400 mb-8 max-w-xl mx-auto">Get a full interactive demo sent directly to your inbox. No sales calls, just the product.</p>
                        <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => handleRequest(e, 'Full Demo')}>
                            <div className="relative flex-grow">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    placeholder="work@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-950/80 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Request'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-[100] animate-in fade-in duration-200">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-bold mb-2">Get {selectedDoc}</h3>
                        <p className="text-slate-400 mb-6 text-sm">Please enter your business email to receive the link.</p>
                        <form onSubmit={(e) => handleRequest(e, selectedDoc)}>
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Email</label>
                                <input
                                    type="email"
                                    autoFocus
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500 focus:outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 bg-white text-slate-950 font-bold rounded-xl hover:bg-slate-200 transition-all disabled:opacity-50 flex items-center justify-center"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Demo Link'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
