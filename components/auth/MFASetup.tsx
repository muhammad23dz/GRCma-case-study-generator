'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

interface SetupData {
    enabled: boolean;
    secret?: string;
    qrCodeUrl?: string;
}

export default function MFASetup() {
    const [status, setStatus] = useState<'loading' | 'initial' | 'setup' | 'success'>('loading');
    const [isVerifying, setIsVerifying] = useState(false);
    const [data, setData] = useState<SetupData | null>(null);
    const [token, setToken] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/auth/mfa/setup');
            if (res.ok) {
                const json = await res.json();
                setData(json);
                setStatus(json.enabled ? 'success' : 'initial');
            }
        } catch (e) {
            console.error(e);
        }
    };

    const startSetup = () => {
        setStatus('setup');
    };

    const verifyToken = async () => {
        if (token.length !== 6) return;

        setIsVerifying(true);
        setError('');

        try {
            const res = await fetch('/api/auth/mfa/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: data?.secret,
                    token
                })
            });

            if (res.ok) {
                setStatus('success');
            } else {
                setError('Invalid code. Please try again.');
            }
        } catch (e) {
            setError('Verification failed.');
        } finally {
            setIsVerifying(false);
        }
    };

    if (status === 'loading') {
        return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>;
    }

    if (status === 'success') {
        return (
            <div className="bg-slate-950/50 border border-emerald-500/20 rounded-2xl p-8 text-center">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">MFA is Active</h3>
                <p className="text-slate-400 mb-6">Your account is secured with Two-Factor Authentication.</p>
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-500 bg-emerald-950/30 py-2 px-4 rounded-full inline-flex">
                    <ShieldCheck className="w-4 h-4" />
                    <span>SOC 2 Compliant (CC6.1)</span>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-8 max-w-md mx-auto">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Two-Factor Authentication</h3>
                <p className="text-slate-400 text-sm">
                    Secure your account using an Authenticator app (Google Authenticator, Authy, etc.).
                </p>
            </div>

            {status === 'initial' && (
                <button
                    onClick={startSetup}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                >
                    Setup MFA
                </button>
            )}

            {status === 'setup' && data?.qrCodeUrl && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-white p-4 rounded-xl w-fit mx-auto">
                        <Image
                            src={data.qrCodeUrl}
                            alt="MFA QR Code"
                            width={160}
                            height={160}
                        />
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-xs text-slate-500 font-mono bg-slate-900 p-2 rounded border border-white/5 break-all">
                            {data.secret}
                        </p>
                        <p className="text-xs text-slate-400">Can't scan? Enter this code manually.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Enter Verification Code</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                maxLength={6}
                                value={token}
                                onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] font-mono text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="000000"
                            />
                        </div>
                        {error && <p className="text-xs text-red-400">{error}</p>}
                    </div>

                    <button
                        onClick={verifyToken}
                        disabled={token.length !== 6 || isVerifying}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
                    >
                        {isVerifying ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify & Enable'}
                    </button>
                </div>
            )}
        </div>
    );
}
