'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import { Building2, Save, X, Rocket, Shield } from 'lucide-react';
import PageTransition from '@/components/PageTransition';

export default function NewVendorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        criticality: 'medium',
        services: '',
        contactEmail: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push('/vendors');
                router.refresh();
            } else {
                const error = await res.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error creating vendor:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32 flex items-center justify-center min-h-[85vh]">
                <PageTransition className="w-full max-w-2xl">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden group">
                        {/* Cosmic Glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] group-hover:bg-purple-500/30 transition-all duration-1000"></div>

                        <div className="mb-8 relative z-10">
                            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                <Rocket className="w-8 h-8 text-purple-500 animate-pulse" />
                                Launch New Star
                            </h1>
                            <p className="text-slate-400">Add a new vendor entity to the risk constellation.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Vendor Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="e.g. Galactic Cloud Services"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Criticality</label>
                                    <select
                                        value={formData.criticality}
                                        onChange={e => setFormData({ ...formData, criticality: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all"
                                    >
                                        <option value="low">Low Impact</option>
                                        <option value="medium">Medium Impact</option>
                                        <option value="high">High Impact</option>
                                        <option value="critical">Critical Mass</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Contact Email</label>
                                    <input
                                        type="email"
                                        value={formData.contactEmail}
                                        onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600"
                                        placeholder="security@vendor.com"
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Provided Services</label>
                                    <textarea
                                        required
                                        value={formData.services}
                                        onChange={e => setFormData({ ...formData, services: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-950/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-slate-600 resize-none h-32"
                                        placeholder="Describe the services provided..."
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-6 py-3 bg-slate-800 text-slate-300 hover:text-white rounded-xl font-bold hover:bg-slate-700 transition-all flex items-center gap-2"
                                >
                                    <X className="w-5 h-5" /> Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-500 hover:to-pink-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02] transform duration-200"
                                >
                                    {loading ? 'Igniting...' : <><Save className="w-5 h-5" /> Launch Vendor</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </PageTransition>
            </div>
        </div>
    );
}
