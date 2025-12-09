'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShieldCheck,
    AlertTriangle,
    Building2,
    BookOpen,
    GitMerge,
    BarChart,
    ScrollText,
    PlayCircle,
    Siren,
    FileText,
    Settings,
    Wand2,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User,
    Info
} from 'lucide-react';

interface HeaderProps {
    onNavChange: (view: 'input' | 'history' | 'methodology' | 'about') => void;
}

export default function Header({ onNavChange }: HeaderProps) {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Controls', href: '/controls', icon: ShieldCheck },
        { label: 'Risks', href: '/risks', icon: AlertTriangle },
        { label: 'Frameworks', href: '/frameworks', icon: BookOpen },
        { label: 'Mapping', href: '/mapping', icon: GitMerge },
        { label: 'Gap Analysis', href: '/gap-analysis', icon: BarChart },
        { label: 'Actions', href: '/actions', icon: PlayCircle },
        { label: 'Incidents', href: '/incidents', icon: Siren },
        { label: 'Reports', href: '/reports', icon: FileText },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 border-b border-white/5 ${scrolled
                ? 'bg-slate-950/90 backdrop-blur-xl shadow-2xl shadow-black/50 py-3'
                : 'bg-slate-950/50 backdrop-blur-md py-4'
                }`}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link href="/" className="group relative flex items-center gap-2">
                            <div className="absolute -inset-2 bg-emerald-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
                            <div className="relative flex items-center tracking-tighter">
                                <ShieldCheck className="w-8 h-8 text-emerald-500 mr-2" />
                                <span className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-green-600 bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                    GRC
                                </span>
                                <span className="text-3xl font-black bg-gradient-to-r from-red-500 to-rose-600 bg-clip-text text-transparent filter drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">
                                    ma
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden xl:flex items-center gap-1">
                            {navItems.map((item) => {
                                const active = isActive(item.href);
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 group ${active
                                            ? 'text-white bg-white/5'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon className={`w-4 h-4 transition-colors ${active ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400'}`} />
                                        {item.label}
                                        {active && (
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] rounded-full transform translate-y-[1px]" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right User Area */}
                    <div className="flex items-center gap-4">
                        {/* More Menu (Desktop) for overflow items could go here */}
                        <div className="hidden md:flex items-center gap-2">
                            <button
                                onClick={() => onNavChange('input')}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
                            >
                                <Wand2 className="w-4 h-4" />
                                AI Generator
                            </button>
                        </div>

                        {/* User Profile */}
                        {session?.user && (
                            <div className="relative">
                                <button
                                    onClick={() => setProfileOpen(!profileOpen)}
                                    className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-slate-900/50 border border-white/10 hover:border-emerald-500/50 transition-all group"
                                >
                                    {session.user.image ? (
                                        <div className="relative w-8 h-8">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                                            <img
                                                src={session.user.image}
                                                alt={session.user.name || 'User'}
                                                className="relative w-full h-full rounded-full object-cover border-2 border-slate-900 bg-slate-800"
                                            />
                                        </div>
                                    ) : (
                                        <div className="relative w-8 h-8">
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                                            <div className="relative w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-emerald-400 font-bold border-2 border-slate-900">
                                                {session.user.name?.charAt(0) || 'U'}
                                            </div>
                                        </div>
                                    )}
                                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <div className="absolute right-0 mt-3 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-top-2">
                                        <div className="px-4 py-3 mb-2 border-b border-white/5">
                                            <p className="text-sm font-medium text-white">{session.user.name}</p>
                                            <p className="text-xs text-slate-400 truncate">{session.user.email}</p>
                                        </div>
                                        <Link href="/admin/users" className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                                            <Settings className="w-4 h-4" />
                                            Admin Settings
                                        </Link>
                                        <Link
                                            href="/about"
                                            onClick={() => setProfileOpen(false)}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                        >
                                            <Info className="w-4 h-4" />
                                            About GRCma
                                        </Link>
                                        <button
                                            onClick={() => signOut()}
                                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Sign Out
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="xl:hidden p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div className="xl:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5">
                    <nav className="p-4 flex flex-col gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${active
                                        ? 'bg-emerald-500/10 text-emerald-400'
                                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="h-px bg-white/5 my-2" />
                        <button
                            onClick={() => {
                                onNavChange('input');
                                setMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-purple-400 hover:bg-purple-500/10"
                        >
                            <Wand2 className="w-5 h-5" />
                            AI Generator
                        </button>
                    </nav>
                </div>
            )}
        </header>
    );
}
