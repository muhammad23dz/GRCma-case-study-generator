'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

interface HeaderProps {
    onNavChange: (view: 'input' | 'history' | 'methodology' | 'about') => void;
}

export default function Header({ onNavChange }: HeaderProps) {
    const { data: session } = useSession();
    const [showDropdown, setShowDropdown] = useState(false);

    return (
        <header className="bg-[#1a0505]/60 backdrop-blur-md border-b border-red-900/30 sticky top-0 z-50 shadow-lg shadow-red-900/5">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <button onClick={() => onNavChange('input')} className="group relative hover:scale-105 transition-transform duration-500">
                    <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600/20 to-red-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
                    <div className="relative flex items-center gap-0.5">
                        <span className="font-heading text-3xl font-black tracking-tighter bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 bg-clip-text text-transparent drop-shadow-sm">GRC</span>
                        <span className="font-heading text-3xl font-black tracking-tighter text-red-500 drop-shadow-sm">ma</span>
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 mb-1 ml-0.5 animate-pulse"></div>
                    </div>
                </button>
                <div className="flex items-center gap-6">
                    <nav>
                        <ul className="flex space-x-2 text-sm font-medium">
                            <li><Link href="/dashboard" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Dashboard</Link></li>
                            <li><Link href="/controls" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Controls</Link></li>
                            <li><Link href="/risks" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Risks</Link></li>
                            <li><Link href="/vendors" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Vendors</Link></li>
                            <li><Link href="/policies" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Policies</Link></li>
                            <li><Link href="/incidents" className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30 block">Incidents</Link></li>
                            <li><Link href="/api-docs" className="hover:text-cyan-400 transition-colors px-3 py-2 rounded-lg hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/30 block">Docs</Link></li>
                            <li><Link href="/admin/users" className="hover:text-purple-400 transition-colors px-3 py-2 rounded-lg hover:bg-purple-500/10 border border-transparent hover:border-purple-500/30 block">Admin</Link></li>
                            <li><button onClick={() => onNavChange('input')} className="hover:text-emerald-400 transition-colors px-3 py-2 rounded-lg hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/30">Generator</button></li>
                        </ul>
                    </nav>

                    {session?.user && (
                        <div className="relative">
                            <button
                                onClick={() => setShowDropdown(!showDropdown)}
                                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all border border-white/10 hover:border-white/20"
                            >
                                {session.user.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || 'User'}
                                        className="w-8 h-8 rounded-full ring-2 ring-emerald-500/50"
                                    />
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white font-bold">
                                        {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <span className="text-sm font-medium hidden md:block">{session.user.name || session.user.email}</span>
                                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {showDropdown && (
                                <div className="absolute right-0 mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl overflow-hidden">
                                    <div className="px-4 py-3 border-b border-white/10">
                                        <p className="text-sm font-medium text-white">{session.user.name}</p>
                                        <p className="text-xs text-gray-400 truncate">{session.user.email}</p>
                                    </div>
                                    <button
                                        onClick={() => signOut()}
                                        className="w-full px-4 py-3 text-left text-sm hover:bg-red-500/10 transition-colors flex items-center gap-2 text-red-400 hover:text-red-300"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
