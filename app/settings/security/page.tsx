'use client';

import { Lock, ShieldCheck } from 'lucide-react';

export default function SecuritySettingsPage() {
    return (
        <div className="min-h-screen bg-[#020617] text-white p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Security Center
                    </h1>
                    <p className="text-slate-400">Manage your account security and authentication methods.</p>
                </header>

                <section className="bg-slate-950/50 border border-white/5 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">MFA is managed by Clerk</h3>
                    <p className="text-slate-400 mb-6">
                        Use the secure Clerk portal to manage your Multi-Factor Authentication and other security settings.
                    </p>
                    <a
                        href="https://fond-seagull-25.clerk.accounts.dev/user"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        Manage Security in Clerk
                    </a>
                </section>
            </div>
        </div>
    );
}
