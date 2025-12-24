'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    BookOpen, Search, Plus, Tag, CheckCircle, Clock,
    Edit2, Trash2, Copy, Filter, ChevronDown
} from 'lucide-react';

interface KBEntry {
    id: string;
    question: string;
    answer: string;
    category: string;
    tags: string[];
    status: string;
    usageCount: number;
    approvedBy?: string;
    approvedAt?: string;
    createdAt: string;
}

const CATEGORIES = [
    'security', 'privacy', 'compliance', 'infrastructure',
    'governance', 'data_protection', 'access_control',
    'incident_response', 'vendor', 'other'
];

export default function KnowledgeBasePage() {
    const [entries, setEntries] = useState<KBEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);

    const [form, setForm] = useState({
        question: '',
        answer: '',
        category: 'security',
        tags: ''
    });

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (search) params.set('q', search);
            if (categoryFilter) params.set('category', categoryFilter);

            const res = await fetch(`/api/knowledge-base?${params}`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data.entries || []);
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Failed to fetch knowledge base:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntries();
    }, [search, categoryFilter]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/knowledge-base', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
                })
            });

            if (res.ok) {
                const data = await res.json();
                setEntries([data.entry, ...entries]);
                setShowCreate(false);
                setForm({ question: '', answer: '', category: 'security', tags: '' });
            }
        } catch (err) {
            console.error('Failed to create entry:', err);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`/api/knowledge-base?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'approved' })
            });

            if (res.ok) {
                setEntries(entries.map(e =>
                    e.id === id ? { ...e, status: 'approved' } : e
                ));
            }
        } catch (err) {
            console.error('Failed to approve:', err);
        }
    };

    const handleArchive = async (id: string) => {
        if (!confirm('Archive this entry?')) return;

        try {
            const res = await fetch(`/api/knowledge-base?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                setEntries(entries.filter(e => e.id !== id));
            }
        } catch (err) {
            console.error('Failed to archive:', err);
        }
    };

    const copyAnswer = (entry: KBEntry) => {
        navigator.clipboard.writeText(entry.answer);
        setCopiedId(entry.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const statusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>;
            case 'draft':
                return <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Draft</span>;
            default:
                return <span className="text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-6xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Enterprise</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white">Knowledge Base</h1>
                            <p className="text-slate-400 mt-2">Reusable Q&A library for security questionnaires</p>
                        </div>
                        <button
                            onClick={() => setShowCreate(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Entry
                        </button>
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-white">{stats.total}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Total Entries</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-emerald-400">
                                    {stats.byCategory?.find((c: any) => c._count)?.length || stats.byCategory?.length || 0}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Categories</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-blue-400">{stats.tags?.length || 0}</div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Unique Tags</div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                                <div className="text-2xl font-bold text-purple-400">
                                    {entries.reduce((sum, e) => sum + e.usageCount, 0)}
                                </div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider">Total Uses</div>
                            </div>
                        </div>
                    )}

                    {/* Search & Filter */}
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search questions and answers..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                            ))}
                        </select>
                    </div>

                    {/* Entries */}
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center text-slate-500 py-8">Loading...</div>
                        ) : entries.length === 0 ? (
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-8 text-center">
                                <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                <p className="text-slate-500">No entries found. Add your first Q&A entry to get started.</p>
                            </div>
                        ) : (
                            entries.map(entry => (
                                <div key={entry.id} className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {statusBadge(entry.status)}
                                            <span className="text-xs text-slate-500 capitalize bg-white/5 px-2 py-1 rounded">
                                                {entry.category.replace('_', ' ')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => copyAnswer(entry)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                                title="Copy answer"
                                            >
                                                {copiedId === entry.id
                                                    ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                    : <Copy className="w-4 h-4 text-slate-400" />
                                                }
                                            </button>
                                            {entry.status === 'draft' && (
                                                <button
                                                    onClick={() => handleApprove(entry.id)}
                                                    className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleArchive(entry.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{entry.question}</h3>
                                    <p className="text-slate-400 text-sm whitespace-pre-wrap">{entry.answer}</p>
                                    {entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {entry.tags.map(tag => (
                                                <span key={tag} className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded flex items-center gap-1">
                                                    <Tag className="w-3 h-3" /> {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-slate-500">
                                        Used {entry.usageCount} times • Added {new Date(entry.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Create Modal */}
                    {showCreate && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                                <h2 className="text-2xl font-bold text-white mb-6">Add Knowledge Base Entry</h2>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Question</label>
                                        <textarea
                                            value={form.question}
                                            onChange={(e) => setForm({ ...form, question: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white min-h-[80px]"
                                            placeholder="e.g., Does your organization have a written information security policy?"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Answer</label>
                                        <textarea
                                            value={form.answer}
                                            onChange={(e) => setForm({ ...form, answer: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white min-h-[150px]"
                                            placeholder="Your approved answer to this question..."
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        >
                                            {CATEGORIES.map(cat => (
                                                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Tags (comma-separated)</label>
                                        <input
                                            type="text"
                                            value={form.tags}
                                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="e.g., SOC2, ISO27001, policy"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreate(false)}
                                            className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                                        >
                                            Create Entry
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
