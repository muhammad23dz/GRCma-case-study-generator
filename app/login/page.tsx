'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn('google', { callbackUrl: '/' });
        } catch (error) {
            console.error('Login failed:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center relative overflow-hidden font-sans text-gray-100">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-900/10 via-black to-red-900/10"></div>
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-green-600/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-4">
                <div className="text-center mb-12 animate-fade-in">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-600/10 to-red-600/10 border border-green-500/20 backdrop-blur-md">
                        <span className="text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent">
                            Restricted Access
                        </span>
                    </div>

                    <h1 className="text-6xl font-black bg-gradient-to-r from-green-600 via-emerald-500 to-red-600 bg-clip-text text-transparent mb-4 tracking-tighter">
                        GRC<span className="text-red-500">ma</span>
                    </h1>
                    <p className="text-gray-400 text-lg font-light tracking-wide">
                        Intelligence Platform
                    </p>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400 text-sm">Please sign in to access the secure environment</p>
                    </div>

                    <button
                        onClick={handleLogin}
                        disabled={isLoading}
                        className="w-full group relative px-6 py-4 bg-white text-black font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-emerald-400 to-green-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        <div className="flex items-center justify-center gap-3">
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                            )}
                            <span>{isLoading ? 'Authenticating...' : 'Sign in with Google'}</span>
                        </div>
                    </button>
                </div>

                <div className="mt-8 text-center">
                    <p className="text-gray-600 text-xs uppercase tracking-widest">
                        Authorized Personnel Only
                    </p>
                </div>
            </div>
        </div>
    );
}
