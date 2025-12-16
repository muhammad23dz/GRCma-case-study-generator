'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';
import {
    ClipboardCheck, Plus, CheckCircle2, XCircle, AlertCircle,
    FileText, ArrowLeft, Trash2, Link as LinkIcon
} from 'lucide-react';

interface ControlTest {
    id: string;
    name: string;
    result: string;
    date: string;
    steps: string;
    notes: string;
    tester: string;
    control: { id: string; title: string };
    evidence?: { id: string; fileName: string };
}

interface Audit {
    id: string;
    title: string;
    status: string;
}

export default function ControlTestingPage() {
    const params = useParams();
    const router = useRouter();
    const auditId = params.id as string;

    const [audit, setAudit] = useState<Audit | null>(null);
    const [tests, setTests] = useState<ControlTest[]>([]);
    const [controls, setControls] = useState<{ id: string; title: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form state
    const [selectedControlId, setSelectedControlId] = useState('');
    const [testName, setTestName] = useState('');
    const [testSteps, setTestSteps] = useState('');
    const [testResult, setTestResult] = useState('pending');
    const [testNotes, setTestNotes] = useState('');

    useEffect(() => {
        fetchData();
    }, [auditId]);

    const fetchData = async () => {
        try {
            const [auditRes, testsRes, controlsRes] = await Promise.all([
                fetch(`/api/audit/${auditId}`),
                fetch(`/api/control-tests?auditId=${auditId}`),
                fetch('/api/controls')
            ]);

            if (auditRes.ok) {
                const data = await auditRes.json();
                setAudit(data.audit);
            }
            if (testsRes.ok) {
                const data = await testsRes.json();
                setTests(data.tests || []);
            }
            if (controlsRes.ok) {
                const data = await controlsRes.json();
                setControls(data.controls || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/control-tests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auditId,
                    controlId: selectedControlId,
                    name: testName,
                    steps: testSteps,
                    result: testResult,
                    notes: testNotes
                })
            });
            if (res.ok) {
                setShowModal(false);
                resetForm();
                fetchData();
            }
        } catch (error) {
            console.error('Error creating test:', error);
        }
    };

    const handleUpdateResult = async (testId: string, newResult: string) => {
        try {
            await fetch(`/api/control-tests/${testId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ result: newResult })
            });
            fetchData();
        } catch (error) {
            console.error('Error updating test:', error);
        }
    };

    const handleDeleteTest = async (testId: string) => {
        if (!confirm('Delete this control test?')) return;
        try {
            await fetch(`/api/control-tests/${testId}`, { method: 'DELETE' });
            fetchData();
        } catch (error) {
            console.error('Error deleting test:', error);
        }
    };

    const resetForm = () => {
        setSelectedControlId('');
        setTestName('');
        setTestSteps('');
        setTestResult('pending');
        setTestNotes('');
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'pass': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'fail': return 'bg-red-500/10 text-red-400 border-red-500/20';
            case 'partial': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#020617]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen text-white">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <Link href={`/audit/${auditId}`} className="text-slate-400 hover:text-white mb-2 inline-flex items-center gap-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" /> Back to Audit
                            </Link>
                            <h1 className="text-4xl font-black text-white mb-2 flex items-center gap-3">
                                <ClipboardCheck className="w-10 h-10 text-purple-500" />
                                Control Testing
                            </h1>
                            <p className="text-slate-400">
                                {audit?.title} - Test controls for effectiveness
                            </p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> New Test
                        </button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[
                            { label: 'Total Tests', value: tests.length, color: 'blue' },
                            { label: 'Passed', value: tests.filter(t => t.result === 'pass').length, color: 'emerald' },
                            { label: 'Failed', value: tests.filter(t => t.result === 'fail').length, color: 'red' },
                            { label: 'Pending', value: tests.filter(t => t.result === 'pending').length, color: 'yellow' }
                        ].map(stat => (
                            <div key={stat.label} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                                <div className="text-sm text-slate-400 font-bold uppercase mb-1">{stat.label}</div>
                                <div className={`text-4xl font-black text-${stat.color}-400`}>{stat.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tests List */}
                    <div className="space-y-4">
                        {tests.length === 0 ? (
                            <div className="text-center py-20 text-slate-500 bg-slate-900/40 rounded-2xl border border-white/5">
                                <ClipboardCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h2 className="text-xl font-bold text-white mb-2">No Tests Yet</h2>
                                <p>Create control tests to validate effectiveness.</p>
                            </div>
                        ) : (
                            tests.map(test => (
                                <div key={test.id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-all group">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-lg font-bold text-white">{test.name}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getResultColor(test.result)}`}>
                                                    {test.result}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                                                <span className="flex items-center gap-1">
                                                    <LinkIcon className="w-3 h-3" />
                                                    <Link href={`/controls/${test.control.id}`} className="hover:text-emerald-400 transition-colors">
                                                        {test.control.title}
                                                    </Link>
                                                </span>
                                                <span>Tested by: {test.tester}</span>
                                                <span>{new Date(test.date).toLocaleDateString()}</span>
                                            </div>
                                            {test.steps && (
                                                <div className="bg-slate-950/50 border border-white/5 rounded-lg p-3 text-sm text-slate-300 mb-2">
                                                    <strong className="text-white">Test Steps:</strong> {test.steps}
                                                </div>
                                            )}
                                            {test.notes && (
                                                <div className="text-sm text-slate-400">
                                                    <strong className="text-slate-300">Notes:</strong> {test.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleUpdateResult(test.id, 'pass')}
                                                className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition-all"
                                                title="Mark as Pass"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleUpdateResult(test.id, 'fail')}
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                                title="Mark as Fail"
                                            >
                                                <XCircle className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteTest(test.id)}
                                                className="p-2 bg-slate-500/10 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-all"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Create Test Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 w-full max-w-lg shadow-2xl">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <ClipboardCheck className="w-8 h-8 text-purple-500" />
                            New Control Test
                        </h2>
                        <form onSubmit={handleCreateTest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Control to Test</label>
                                <select
                                    value={selectedControlId}
                                    onChange={(e) => setSelectedControlId(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="">Select a control...</option>
                                    {controls.map(c => (
                                        <option key={c.id} value={c.id}>{c.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Test Name</label>
                                <input
                                    type="text"
                                    value={testName}
                                    onChange={(e) => setTestName(e.target.value)}
                                    required
                                    placeholder="e.g., Annual Access Review Validation"
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Test Steps</label>
                                <textarea
                                    value={testSteps}
                                    onChange={(e) => setTestSteps(e.target.value)}
                                    rows={3}
                                    placeholder="Describe the steps to perform this test..."
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Initial Result</label>
                                <select
                                    value={testResult}
                                    onChange={(e) => setTestResult(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="pass">Pass</option>
                                    <option value="fail">Fail</option>
                                    <option value="partial">Partial</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
                                <textarea
                                    value={testNotes}
                                    onChange={(e) => setTestNotes(e.target.value)}
                                    rows={2}
                                    placeholder="Any additional observations..."
                                    className="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500 resize-none"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setShowModal(false); resetForm(); }}
                                    className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all"
                                >
                                    Create Test
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
