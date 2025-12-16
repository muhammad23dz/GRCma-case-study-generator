'use client';

import MFASetup from '@/components/auth/MFASetup';

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

                <section>
                    <MFASetup />
                </section>
            </div>
        </div>
    );
}
