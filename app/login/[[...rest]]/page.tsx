'use client';

import { SignIn } from '@clerk/nextjs';
import { Shield, Lock, Sparkles } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center relative overflow-hidden font-sans">
            {/* Animated gradient background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/50 via-slate-950 to-cyan-950/30" />

                {/* Animated orbs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[150px]" />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                                         linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-lg px-6">
                {/* Premium header */}
                <div className="text-center mb-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 backdrop-blur-sm shadow-lg shadow-emerald-500/5">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold tracking-[0.2em] uppercase text-emerald-400">
                            Enterprise Platform
                        </span>
                    </div>

                    {/* Logo */}
                    <div className="relative inline-block mb-6">
                        <h1 className="text-7xl md:text-8xl font-black tracking-tighter">
                            <span className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                                GRC
                            </span>
                            <span className="bg-gradient-to-br from-emerald-400 via-emerald-500 to-cyan-400 bg-clip-text text-transparent">
                                ma
                            </span>
                        </h1>
                        {/* Glow effect behind logo */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-2xl rounded-full opacity-50 -z-10" />
                    </div>

                    <p className="text-slate-400 text-lg font-light tracking-wide">
                        Governance · Risk · Compliance
                    </p>
                </div>

                {/* Auth card with glassmorphism */}
                <div className="relative">
                    {/* Card glow */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-transparent to-cyan-500/20 rounded-3xl blur-xl opacity-50" />

                    <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/40">
                        {/* Security badge */}
                        <div className="flex items-center justify-center gap-2 mb-6 text-slate-400">
                            <Lock className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-medium tracking-wide">
                                256-bit SSL Encryption
                            </span>
                        </div>

                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: "mx-auto w-full",
                                    card: "bg-transparent shadow-none p-0 w-full",
                                    header: "hidden",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "bg-white hover:bg-gray-50 text-slate-900 font-semibold py-3 rounded-xl border-0 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]",
                                    socialButtonsBlockButtonText: "font-semibold",
                                    dividerLine: "bg-white/10",
                                    dividerText: "text-slate-500 text-xs font-medium",
                                    formFieldLabel: "text-slate-300 font-medium text-sm mb-1.5",
                                    formFieldInput: "bg-slate-800/50 border-white/10 text-white rounded-xl py-3 px-4 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all",
                                    formButtonPrimary: "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all duration-200 hover:scale-[1.02]",
                                    footerAction: "hidden",
                                    footer: "hidden",
                                    identityPreview: "bg-slate-800/50 border-white/10 rounded-xl",
                                    identityPreviewText: "text-white",
                                    identityPreviewEditButton: "text-emerald-400 hover:text-emerald-300",
                                    formFieldInputShowPasswordButton: "text-slate-400 hover:text-white",
                                    otpCodeFieldInput: "bg-slate-800/50 border-white/10 text-white rounded-xl",
                                    formResendCodeLink: "text-emerald-400 hover:text-emerald-300",
                                    alert: "bg-red-500/10 border-red-500/20 text-red-400 rounded-xl",
                                    alertText: "text-red-400",
                                }
                            }}
                            routing="path"
                            path="/login"
                            signUpUrl="/signup"
                            afterSignInUrl="/dashboard"
                        />

                        {/* Sign up link */}
                        <div className="mt-6 text-center border-t border-white/5 pt-6">
                            <span className="text-slate-500 text-sm">
                                Don't have an account?{' '}
                                <a href="/signup" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                                    Get started free
                                </a>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Trust indicators */}
                <div className="mt-10 flex items-center justify-center gap-8 text-slate-500">
                    <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-500/70" />
                        <span className="text-xs font-medium">SOC 2 Type II</span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-emerald-500/70" />
                        <span className="text-xs font-medium">GDPR Ready</span>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-8 text-center">
                    <p className="text-slate-600 text-xs tracking-wide">
                        © 2024 GRCma. Enterprise Security Platform.
                    </p>
                </div>
            </div>
        </div>
    );
}
