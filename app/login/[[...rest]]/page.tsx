'use client';

import { SignIn, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { useEffect } from 'react';
import PremiumBackground from '@/components/PremiumBackground';
import Link from 'next/link';

export default function LoginPage() {
    const { isLoaded, isSignedIn } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            router.push('/dashboard');
        }
    }, [isLoaded, isSignedIn, router]);

    if (!isLoaded || isSignedIn) {
        return null;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden font-sans bg-[#050505]">
            <PremiumBackground />

            {/* Architectural Frame */}
            <div className="relative z-10 w-full max-w-[500px] px-8 py-16">

                {/* Branding Section */}
                <div className="text-center mb-16 relative">
                    <div className="inline-block relative mb-12 group/logo cursor-pointer">
                        {/* Premium Monolithic Shield Icon */}
                        <div className="relative w-24 h-24 flex items-center justify-center">
                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-[#006233]/20 blur-2xl rounded-full group-hover/logo:bg-[#C1272D]/20 transition-all duration-1000"></div>

                            <svg viewBox="0 0 24 24" className="w-16 h-16 relative z-10 transition-transform duration-700 group-hover/logo:scale-110">
                                {/* Left Wing - Moroccan Red */}
                                <path
                                    d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22"
                                    fill="none"
                                    stroke="#C1272D"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_12px_rgba(193,39,45,0.4)]"
                                />
                                {/* Right Wing - Moroccan Green */}
                                <path
                                    d="M12 2L20 5V11C20 16.1 16.6 20.9 12 22"
                                    fill="none"
                                    stroke="#006233"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_12px_rgba(0,98,51,0.4)]"
                                />
                                {/* Central Blade */}
                                <path
                                    d="M12 2V22"
                                    stroke="white"
                                    strokeWidth="1"
                                    strokeLinecap="round"
                                    className="opacity-80"
                                />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col items-center">
                        <h1 className="text-5xl font-black tracking-tighter text-white mb-2 leading-none">
                            GRC<span className="text-[#006233]">ma</span>
                        </h1>
                        <div className="w-16 h-[4px] bg-[#C1272D] mt-2 relative overflow-hidden rounded-full">
                            <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover/logo:translate-x-[100%] transition-transform duration-1000"></div>
                        </div>
                    </div>
                </div>

                {/* Authentication Matrix */}
                <div className="relative border border-white/5 bg-[#080808]/80 backdrop-blur-3xl p-10 overflow-hidden group">
                    {/* Unique Accents */}
                    <div className="absolute top-0 right-0 w-2 h-2 bg-[#C1272D]"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#006233]"></div>

                    <div className="flex items-center justify-center gap-3 mb-10 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">
                        <Lock className="w-3 h-3 text-[#C1272D]" />
                        Secure Authorization Gateway
                    </div>

                    <SignIn
                        appearance={{
                            elements: {
                                rootBox: "mx-auto w-full",
                                card: "bg-transparent shadow-none p-0 w-full",
                                header: "hidden",
                                socialButtonsBlockButton: "bg-white hover:bg-slate-50 text-black font-black py-4 rounded-none border-0 transition-all uppercase tracking-widest text-[10px] border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 mb-4",
                                socialButtonsBlockButtonText: "font-black",
                                dividerLine: "bg-white/5",
                                dividerText: "text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]",
                                formFieldLabel: "text-slate-500 font-black text-[10px] mb-3 uppercase tracking-widest",
                                formFieldInput: "bg-[#0a0a0a] border border-white/5 text-white rounded-none py-4 px-5 focus:border-[#006233]/50 focus:ring-0 transition-all text-sm font-medium",
                                formButtonPrimary: "bg-[#006233] hover:bg-[#007a40] text-white font-black py-4 rounded-none uppercase tracking-widest text-[10px] border-b-4 border-[#004d28] active:border-b-0 active:translate-y-1 transition-all mt-4",
                                footerAction: "hidden",
                                footer: "hidden",
                                identityPreview: "bg-[#0a0a0a] border border-white/5 rounded-none",
                                identityPreviewText: "text-white text-sm font-medium",
                                identityPreviewEditButton: "text-[#006233] hover:text-[#007a40] font-black uppercase text-[10px]",
                                formFieldInputShowPasswordButton: "text-slate-600 hover:text-white",
                                alert: "bg-red-950/20 border-red-500/20 text-red-400 rounded-none text-xs",
                            }
                        }}
                        routing="path"
                        path="/login"
                        signUpUrl="/signup"
                    />

                    {/* Footer Nav */}
                    <div className="mt-12 pt-8 border-t border-white/5 text-center">
                        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.2em]">
                            New Operator?{' '}
                            <Link href="/signup" className="text-white hover:text-white transition-colors border-b border-[#C1272D] pb-0.5 ml-2">
                                Create Account
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Sub-Footer */}
                <div className="mt-10 flex items-center justify-between text-slate-700">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Protocol Integration v1.2</span>
                    <span className="text-[9px] font-black uppercase tracking-[0.3em]">Institutional Grade</span>
                </div>
            </div>
        </div>
    );
}
