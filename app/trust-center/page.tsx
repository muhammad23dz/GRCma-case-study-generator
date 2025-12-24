'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Shield, Globe, Eye, EyeOff, Save, Plus, Trash2,
    ExternalLink, Palette, Mail, Building2, GripVertical
} from 'lucide-react';

interface TrustCenterConfig {
    id: string;
    companyName: string;
    logoUrl?: string;
    primaryColor: string;
    accentColor: string;
    description?: string;
    slug: string;
    contactEmail?: string;
    securityEmail?: string;
    isPublished: boolean;
    sections: TrustCenterSection[];
}

interface TrustCenterSection {
    id: string;
    sectionType: string;
    title: string;
    content: string;
    displayOrder: number;
    isVisible: boolean;
    icon?: string;
}

const SECTION_TYPES = [
    { value: 'overview', label: 'Security Overview', icon: 'Shield' },
    { value: 'certifications', label: 'Certifications & Compliance', icon: 'Award' },
    { value: 'controls', label: 'Security Controls', icon: 'Lock' },
    { value: 'policies', label: 'Policies', icon: 'FileText' },
    { value: 'updates', label: 'Security Updates', icon: 'Bell' },
    { value: 'contact', label: 'Contact', icon: 'Mail' },
    { value: 'faq', label: 'FAQ', icon: 'HelpCircle' }
];

export default function TrustCenterPage() {
    const [config, setConfig] = useState<TrustCenterConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const [form, setForm] = useState({
        companyName: '',
        logoUrl: '',
        primaryColor: '#006233',
        accentColor: '#C1272D',
        description: '',
        slug: '',
        contactEmail: '',
        securityEmail: '',
        isPublished: false
    });

    useEffect(() => {
        async function fetchConfig() {
            try {
                const res = await fetch('/api/trust-center');
                if (res.ok) {
                    const data = await res.json();
                    if (data.config) {
                        setConfig(data.config);
                        setForm({
                            companyName: data.config.companyName || '',
                            logoUrl: data.config.logoUrl || '',
                            primaryColor: data.config.primaryColor || '#006233',
                            accentColor: data.config.accentColor || '#C1272D',
                            description: data.config.description || '',
                            slug: data.config.slug || '',
                            contactEmail: data.config.contactEmail || '',
                            securityEmail: data.config.securityEmail || '',
                            isPublished: data.config.isPublished || false
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to fetch trust center:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchConfig();
    }, []);

    const handleSaveConfig = async () => {
        if (!form.companyName || !form.slug) {
            alert('Company name and slug are required');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/trust-center', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            if (res.ok) {
                const data = await res.json();
                setConfig(prev => prev ? { ...prev, ...data.config } : data.config);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save');
            }
        } catch (err) {
            console.error('Failed to save:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleSaveSection = async (sectionData: any, sectionId?: string) => {
        try {
            const url = sectionId
                ? `/api/trust-center?sectionId=${sectionId}`
                : '/api/trust-center';

            const res = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sectionData)
            });

            if (res.ok) {
                const data = await res.json();
                if (sectionId) {
                    setConfig(prev => prev ? {
                        ...prev,
                        sections: prev.sections.map(s => s.id === sectionId ? data.section : s)
                    } : null);
                } else {
                    setConfig(prev => prev ? {
                        ...prev,
                        sections: [...prev.sections, data.section]
                    } : null);
                }
                setActiveSection(null);
            }
        } catch (err) {
            console.error('Failed to save section:', err);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        if (!confirm('Delete this section?')) return;

        try {
            const res = await fetch(`/api/trust-center?sectionId=${sectionId}`, { method: 'DELETE' });
            if (res.ok) {
                setConfig(prev => prev ? {
                    ...prev,
                    sections: prev.sections.filter(s => s.id !== sectionId)
                } : null);
            }
        } catch (err) {
            console.error('Failed to delete section:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen text-foreground">
                <PremiumBackground />
                <Header />
                <div className="pt-32 flex items-center justify-center">
                    <div className="text-slate-500">Loading...</div>
                </div>
            </div>
        );
    }

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
                                <Globe className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Enterprise</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white">Trust Center</h1>
                            <p className="text-slate-400 mt-2">Configure your public-facing security & compliance portal</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {config?.isPublished && (
                                <a
                                    href={`/trust/${form.slug}`}
                                    target="_blank"
                                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    View Live
                                </a>
                            )}
                            <button
                                onClick={handleSaveConfig}
                                disabled={saving}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                    {/* Config Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Branding */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-primary" />
                                Branding
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Company Name</label>
                                    <input
                                        type="text"
                                        value={form.companyName}
                                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Logo URL</label>
                                    <input
                                        type="url"
                                        value={form.logoUrl}
                                        onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white min-h-[100px]"
                                        placeholder="Your security commitment..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Primary Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.primaryColor}
                                                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={form.primaryColor}
                                                onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-slate-400 mb-1">Accent Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={form.accentColor}
                                                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                                                className="w-10 h-10 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={form.accentColor}
                                                onChange={(e) => setForm({ ...form, accentColor: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary" />
                                Settings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">URL Slug</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">/trust/</span>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                            placeholder="your-company"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Contact Email</label>
                                    <input
                                        type="email"
                                        value={form.contactEmail}
                                        onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-1">Security Email</label>
                                    <input
                                        type="email"
                                        value={form.securityEmail}
                                        onChange={(e) => setForm({ ...form, securityEmail: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                                        placeholder="security@company.com"
                                    />
                                </div>
                                <div className="pt-4 border-t border-white/5">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <div className={`w-12 h-6 rounded-full transition-colors ${form.isPublished ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${form.isPublished ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={form.isPublished}
                                            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                                            className="sr-only"
                                        />
                                        <div>
                                            <div className="text-white font-medium">Publish Trust Center</div>
                                            <div className="text-xs text-slate-500">Make publicly accessible</div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-white">Content Sections</h2>
                            <button
                                onClick={() => setActiveSection('new')}
                                className="flex items-center gap-2 px-3 py-1.5 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Section
                            </button>
                        </div>

                        {config?.sections.length === 0 && !activeSection ? (
                            <div className="p-8 text-center text-slate-500">
                                No sections yet. Add sections to build your trust center.
                            </div>
                        ) : (
                            <div className="divide-y divide-white/5">
                                {config?.sections.map(section => (
                                    <div key={section.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <GripVertical className="w-5 h-5 text-slate-600 cursor-move" />
                                            <div>
                                                <div className="font-semibold text-white">{section.title}</div>
                                                <div className="text-sm text-slate-500 capitalize">{section.sectionType}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-1 rounded ${section.isVisible ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                                {section.isVisible ? 'Visible' : 'Hidden'}
                                            </span>
                                            <button
                                                onClick={() => setActiveSection(section.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg"
                                            >
                                                <Eye className="w-4 h-4 text-slate-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSection(section.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Section Editor Modal */}
                    {activeSection && (
                        <SectionEditor
                            section={activeSection === 'new' ? null : config?.sections.find(s => s.id === activeSection)}
                            onSave={handleSaveSection}
                            onCancel={() => setActiveSection(null)}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function SectionEditor({ section, onSave, onCancel }: { section: TrustCenterSection | null | undefined; onSave: (data: any, id?: string) => void; onCancel: () => void }) {
    const [form, setForm] = useState({
        sectionType: section?.sectionType || 'overview',
        title: section?.title || '',
        content: section?.content || '',
        displayOrder: section?.displayOrder || 0,
        isVisible: section?.isVisible ?? true
    });

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">{section ? 'Edit Section' : 'Add Section'}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Section Type</label>
                        <select
                            value={form.sectionType}
                            onChange={(e) => setForm({ ...form, sectionType: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        >
                            {SECTION_TYPES.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-slate-400 mb-1">Content (Markdown supported)</label>
                        <textarea
                            value={form.content}
                            onChange={(e) => setForm({ ...form, content: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white min-h-[200px] font-mono text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isVisible}
                                onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                                className="w-4 h-4"
                            />
                            <span className="text-white">Visible</span>
                        </label>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-4 py-2 border border-white/10 rounded-lg text-slate-400 hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onSave(form, section?.id)}
                            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/80"
                        >
                            Save Section
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
