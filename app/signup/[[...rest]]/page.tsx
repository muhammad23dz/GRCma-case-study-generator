'use client';

import { SignUp } from '@clerk/nextjs';
import PremiumBackground from '@/components/PremiumBackground';

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden font-sans text-gray-100">
            <PremiumBackground />

            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/10 via-black to-emerald-900/10"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-600/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-8 animate-fade-in">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600/10 to-emerald-600/10 border border-green-500/20 backdrop-blur-md">
                        <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                            Create Account
                        </span>
                    </div>

                    <h1 className="text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 bg-clip-text text-transparent mb-4 tracking-tighter">
                        GRC<span className="text-emerald-500">ma</span>
                    </h1>
                    <p className="text-gray-400 text-sm">
                        Join the GRC Platform
                    </p>
                </div>

                <div className="flex justify-center">
                    <SignUp
                        appearance={{
                            elements: {
                                rootBox: "mx-auto",
                                card: "bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl",
                                headerTitle: "text-white",
                                headerSubtitle: "text-slate-400",
                                socialButtonsBlockButton: "bg-white hover:bg-gray-100 text-black",
                                formFieldLabel: "text-slate-300",
                                formFieldInput: "bg-slate-800/50 border-white/10 text-white",
                                footerActionLink: "text-emerald-400 hover:text-emerald-300",
                                formButtonPrimary: "bg-emerald-500 hover:bg-emerald-400",
                            }
                        }}
                        routing="path"
                        path="/signup"
                        signInUrl="/login"
                        afterSignUpUrl="/dashboard"
                    />
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-xs uppercase tracking-widest">
                        Enterprise-Grade Security
                    </p>
                </div>
            </div>
        </div>
    );
}
