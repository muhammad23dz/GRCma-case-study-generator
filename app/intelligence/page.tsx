'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import PageTransition from '@/components/PageTransition';
import RestrictedView from '@/components/SaaS/RestrictedView';
import Link from 'next/link';
import {
    Brain,
    AlertTriangle,
    Shield,
    FileText,
    TrendingUp,
    ArrowLeft,
    Sparkles,
    Loader2,
    CheckCircle,
    Copy,
    Download
} from 'lucide-react';

// ============================================
// Tab Components
// ============================================

function RiskAnalysisTab() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        industryContext: '',
    });

    const handleAnalyze = async () => {
        if (!form.title || !form.description) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ai/analyze-risk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            setResult(data.analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'Critical': return 'bg-red-500 text-white';
            case 'High': return 'bg-orange-500 text-white';
            case 'Medium': return 'bg-yellow-500 text-black';
            case 'Low': return 'bg-emerald-500 text-white';
            default: return 'bg-slate-500 text-white';
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-400" />
                        Risk Information
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Risk Title *</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                            placeholder="e.g., Data Breach from Cloud Misconfiguration"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Description *</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none resize-none"
                            placeholder="Describe the risk in detail..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                            >
                                <option value="">Auto-detect</option>
                                <option value="Operational">Operational</option>
                                <option value="Security">Security</option>
                                <option value="Compliance">Compliance</option>
                                <option value="Financial">Financial</option>
                                <option value="Strategic">Strategic</option>
                                <option value="Third-Party">Third-Party</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Industry</label>
                            <input
                                type="text"
                                value={form.industryContext}
                                onChange={(e) => setForm({ ...form, industryContext: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                                placeholder="e.g., Healthcare, Finance"
                            />
                        </div>
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !form.title || !form.description}
                        className="w-full py-3 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Brain className="w-5 h-5" />
                                Analyze Risk
                            </>
                        )}
                    </button>
                </div>

                {/* Results Panel */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        AI Analysis
                    </h3>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Brain className="w-12 h-12 mb-4 opacity-50" />
                            <p>Enter risk details and click Analyze</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Risk Score */}
                            <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl">
                                <div>
                                    <div className="text-sm text-slate-400">Risk Score</div>
                                    <div className="text-4xl font-black text-white">{result.riskScore}</div>
                                </div>
                                <div className={`px-4 py-2 rounded-lg font-bold ${getRiskColor(result.riskLevel)}`}>
                                    {result.riskLevel}
                                </div>
                            </div>

                            {/* Likelihood & Impact */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950/50 rounded-xl">
                                    <div className="text-sm text-slate-400 mb-1">Likelihood</div>
                                    <div className="text-2xl font-bold text-white">{result.likelihood}/5</div>
                                    <div className="text-xs text-slate-500 mt-2">{result.likelihoodRationale}</div>
                                </div>
                                <div className="p-4 bg-slate-950/50 rounded-xl">
                                    <div className="text-sm text-slate-400 mb-1">Impact</div>
                                    <div className="text-2xl font-bold text-white">{result.impact}/5</div>
                                    <div className="text-xs text-slate-500 mt-2">{result.impactRationale}</div>
                                </div>
                            </div>

                            {/* Recommended Controls */}
                            {result.recommendedControls?.length > 0 && (
                                <div className="p-4 bg-slate-950/50 rounded-xl">
                                    <div className="text-sm text-slate-400 mb-2">Recommended Controls</div>
                                    <ul className="space-y-2">
                                        {result.recommendedControls.map((control: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                                <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                                {control}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Confidence */}
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-400">AI Confidence</span>
                                <span className="text-emerald-400 font-bold">{result.confidence}%</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ControlSuggestionsTab() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [form, setForm] = useState({
        riskDescription: '',
        framework: '',
        existingControls: '',
    });

    const handleSuggest = async () => {
        if (!form.riskDescription && !form.framework) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ai/suggest-controls', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    existingControls: form.existingControls.split(',').map(c => c.trim()).filter(Boolean),
                }),
            });
            const data = await res.json();
            setResult(data.suggestions);
        } catch (error) {
            console.error('Suggestion failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        Control Requirements
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Risk to Mitigate</label>
                        <textarea
                            value={form.riskDescription}
                            onChange={(e) => setForm({ ...form, riskDescription: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none resize-none"
                            placeholder="Describe the risk you want to mitigate..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Framework</label>
                        <select
                            value={form.framework}
                            onChange={(e) => setForm({ ...form, framework: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                        >
                            <option value="">Select framework...</option>
                            <option value="ISO 27001">ISO 27001</option>
                            <option value="SOC 2">SOC 2</option>
                            <option value="NIST CSF">NIST CSF</option>
                            <option value="GDPR">GDPR</option>
                            <option value="HIPAA">HIPAA</option>
                            <option value="PCI-DSS">PCI-DSS</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Existing Controls (comma-separated)</label>
                        <input
                            type="text"
                            value={form.existingControls}
                            onChange={(e) => setForm({ ...form, existingControls: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                            placeholder="Access control, Encryption, Logging..."
                        />
                    </div>

                    <button
                        onClick={handleSuggest}
                        disabled={loading || (!form.riskDescription && !form.framework)}
                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Brain className="w-5 h-5" />
                                Suggest Controls
                            </>
                        )}
                    </button>
                </div>

                {/* Results Panel */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 max-h-[600px] overflow-y-auto">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Recommended Controls
                    </h3>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Shield className="w-12 h-12 mb-4 opacity-50" />
                            <p>Enter requirements to get suggestions</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {result.controls?.map((control: any, idx: number) => (
                                <div key={idx} className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="font-semibold text-white">{control.title}</div>
                                        <span className={`px-2 py-0.5 text-xs rounded font-bold ${control.priority <= 3 ? 'bg-red-500/20 text-red-400' :
                                                control.priority <= 6 ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            P{control.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-3">{control.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-2 py-1 bg-slate-800 text-xs rounded-lg text-slate-300">{control.category}</span>
                                        <span className="px-2 py-1 bg-slate-800 text-xs rounded-lg text-slate-300">{control.controlType}</span>
                                        <span className={`px-2 py-1 text-xs rounded-lg ${control.effortEstimate === 'Low' ? 'bg-emerald-500/20 text-emerald-400' :
                                                control.effortEstimate === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-red-500/20 text-red-400'
                                            }`}>
                                            {control.effortEstimate} Effort
                                        </span>
                                    </div>
                                </div>
                            ))}

                            {result.gapAnalysis && (
                                <div className="p-4 bg-slate-950/50 rounded-xl border border-emerald-500/20">
                                    <div className="text-sm font-medium text-emerald-400 mb-2">Gap Analysis</div>
                                    <p className="text-sm text-slate-300">{result.gapAnalysis}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function PolicyDraftTab() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [form, setForm] = useState({
        policyType: '',
        organizationName: '',
        frameworks: [] as string[],
    });

    const handleDraft = async () => {
        if (!form.policyType || !form.organizationName) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ai/draft-policy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            setResult(data.policy);
        } catch (error) {
            console.error('Drafting failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (result?.content) {
            navigator.clipboard.writeText(result.content);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Input Form */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-400" />
                        Policy Details
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Policy Type *</label>
                        <select
                            value={form.policyType}
                            onChange={(e) => setForm({ ...form, policyType: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                        >
                            <option value="">Select type...</option>
                            <option value="Information Security Policy">Information Security Policy</option>
                            <option value="Access Control Policy">Access Control Policy</option>
                            <option value="Data Protection Policy">Data Protection Policy</option>
                            <option value="Incident Response Policy">Incident Response Policy</option>
                            <option value="Acceptable Use Policy">Acceptable Use Policy</option>
                            <option value="Business Continuity Policy">Business Continuity Policy</option>
                            <option value="Vendor Management Policy">Vendor Management Policy</option>
                            <option value="Risk Management Policy">Risk Management Policy</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Organization Name *</label>
                        <input
                            type="text"
                            value={form.organizationName}
                            onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                            placeholder="Your Company Name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Frameworks</label>
                        <div className="space-y-2">
                            {['ISO 27001', 'SOC 2', 'NIST CSF', 'GDPR'].map(fw => (
                                <label key={fw} className="flex items-center gap-2 text-sm text-slate-300">
                                    <input
                                        type="checkbox"
                                        checked={form.frameworks.includes(fw)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setForm({ ...form, frameworks: [...form.frameworks, fw] });
                                            } else {
                                                setForm({ ...form, frameworks: form.frameworks.filter(f => f !== fw) });
                                            }
                                        }}
                                        className="rounded border-white/20 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    {fw}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleDraft}
                        disabled={loading || !form.policyType || !form.organizationName}
                        className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Drafting...
                            </>
                        ) : (
                            <>
                                <Brain className="w-5 h-5" />
                                Generate Policy
                            </>
                        )}
                    </button>
                </div>

                {/* Results Panel */}
                <div className="lg:col-span-2 bg-slate-900/50 border border-white/10 rounded-2xl p-6 max-h-[700px] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-emerald-400" />
                            Generated Policy
                        </h3>
                        {result && (
                            <button
                                onClick={copyToClipboard}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors"
                            >
                                <Copy className="w-3.5 h-3.5" />
                                Copy
                            </button>
                        )}
                    </div>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <FileText className="w-12 h-12 mb-4 opacity-50" />
                            <p>Fill in policy details to generate</p>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm max-w-none">
                            <h1 className="text-2xl font-bold text-white mb-4">{result.title}</h1>
                            <div className="whitespace-pre-wrap text-slate-300 text-sm leading-relaxed">
                                {result.content}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function GapAnalysisTab() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [form, setForm] = useState({
        framework: '',
        currentControls: '',
    });

    const handleAnalyze = async () => {
        if (!form.framework || !form.currentControls) return;

        setLoading(true);
        try {
            const res = await fetch('/api/ai/gap-analysis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    framework: form.framework,
                    currentControls: form.currentControls.split(',').map(c => c.trim()).filter(Boolean),
                }),
            });
            const data = await res.json();
            setResult(data.analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Form */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 space-y-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        Compliance Assessment
                    </h3>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Target Framework *</label>
                        <select
                            value={form.framework}
                            onChange={(e) => setForm({ ...form, framework: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none"
                        >
                            <option value="">Select framework...</option>
                            <option value="ISO 27001">ISO 27001</option>
                            <option value="SOC 2 Type II">SOC 2 Type II</option>
                            <option value="NIST CSF">NIST CSF</option>
                            <option value="GDPR">GDPR</option>
                            <option value="HIPAA">HIPAA</option>
                            <option value="PCI-DSS">PCI-DSS</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Current Controls (comma-separated) *</label>
                        <textarea
                            value={form.currentControls}
                            onChange={(e) => setForm({ ...form, currentControls: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:border-emerald-500/50 focus:outline-none resize-none"
                            placeholder="Access control, Encryption, Logging, Backup, Incident response..."
                        />
                    </div>

                    <button
                        onClick={handleAnalyze}
                        disabled={loading || !form.framework || !form.currentControls}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Brain className="w-5 h-5" />
                                Analyze Gaps
                            </>
                        )}
                    </button>
                </div>

                {/* Results Panel */}
                <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-6 max-h-[600px] overflow-y-auto">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-emerald-400" />
                        Gap Analysis Results
                    </h3>

                    {!result ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <TrendingUp className="w-12 h-12 mb-4 opacity-50" />
                            <p>Select framework and list controls</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Compliance Score */}
                            <div className="p-4 bg-slate-950/50 rounded-xl flex items-center justify-between">
                                <div>
                                    <div className="text-sm text-slate-400">Compliance Score</div>
                                    <div className="text-4xl font-black text-white">{result.overallComplianceScore}%</div>
                                </div>
                                <div className={`px-4 py-2 rounded-lg font-bold ${result.overallComplianceScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                        result.overallComplianceScore >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {result.overallComplianceScore >= 80 ? 'Good' : result.overallComplianceScore >= 60 ? 'Fair' : 'Needs Work'}
                                </div>
                            </div>

                            {/* Gaps */}
                            {result.gaps?.map((gap: any, idx: number) => (
                                <div key={idx} className="p-4 bg-slate-950/50 rounded-xl border border-white/5">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="font-semibold text-white">{gap.requirementId}</div>
                                        <span className={`px-2 py-0.5 text-xs rounded font-bold ${gap.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                                                gap.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                                                    gap.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                                        'bg-emerald-500/20 text-emerald-400'
                                            }`}>
                                            {gap.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-300 mb-2">{gap.requirement}</p>
                                    <div className="text-xs text-slate-500 mb-2">
                                        <strong>Gap:</strong> {gap.gap}
                                    </div>
                                    <div className="text-xs text-emerald-400">
                                        <strong>Action:</strong> {gap.recommendedAction}
                                    </div>
                                </div>
                            ))}

                            {result.quickWins?.length > 0 && (
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <div className="text-sm font-medium text-emerald-400 mb-2">Quick Wins</div>
                                    <ul className="space-y-1">
                                        {result.quickWins.map((win: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                                                <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                                {win}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// Main Page Component
// ============================================

function IntelligenceContent() {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') || 'risk';
    const [activeTab, setActiveTab] = useState(initialTab);

    const tabs = [
        { id: 'risk', label: 'Risk Analysis', icon: AlertTriangle, color: 'from-red-500 to-orange-500' },
        { id: 'controls', label: 'Control Suggestions', icon: Shield, color: 'from-emerald-500 to-teal-500' },
        { id: 'policy', label: 'Policy Drafting', icon: FileText, color: 'from-blue-500 to-indigo-500' },
        { id: 'gaps', label: 'Gap Analysis', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
    ];

    return (
        <PageTransition className="max-w-7xl mx-auto">
            {/* Back Link */}
            <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 text-sm transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </Link>

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl shadow-lg shadow-emerald-500/25">
                        <Brain className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">GRC Intelligence Studio</h1>
                        <p className="text-slate-400">AI-powered analysis, recommendations, and automation</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${activeTab === tab.id
                                    ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                                    : 'bg-slate-900/50 text-slate-400 hover:text-white hover:bg-slate-800/50 border border-white/5'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Content */}
            {activeTab === 'risk' && <RiskAnalysisTab />}
            {activeTab === 'controls' && <ControlSuggestionsTab />}
            {activeTab === 'policy' && <PolicyDraftTab />}
            {activeTab === 'gaps' && <GapAnalysisTab />}
        </PageTransition>
    );
}

export default function IntelligencePage() {
    return (
        <RestrictedView>
            <div className="min-h-screen text-white selection:bg-emerald-500/30">
                <PremiumBackground />
                <Header />
                <div className="relative z-10 p-8 pt-32">
                    <Suspense fallback={
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    }>
                        <IntelligenceContent />
                    </Suspense>
                </div>
            </div>
        </RestrictedView>
    );
}
