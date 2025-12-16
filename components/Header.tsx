'use client';

import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Added useRouter import
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
    Sparkles,
    Menu,
    X,
    ChevronDown,
    LogOut,
    User,
    Activity,
    FileCheck,
    GitPullRequest,
    Globe,
    Code,
    ClipboardCheck
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useDevMode } from '@/lib/contexts/DevModeContext';

interface HeaderProps {
    // onNavChange removed to enforce URL-driven navigation
}

export default function Header({ }: HeaderProps = {}) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();
    const router = useRouter(); // Added router hook
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
    const { language, setLanguage, t } = useLanguage();
    const { devMode, toggleDevMode } = useDevMode();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navGroups = [
        {
            label: 'Dashboard',
            href: '/dashboard',
            icon: LayoutDashboard,
            items: []
        },
        {
            label: 'Governance',
            icon: ShieldCheck,
            items: [
                { label: 'Policies', href: '/policies', icon: ScrollText, desc: 'Policy management & attestation' },
                { label: 'Frameworks', href: '/frameworks', icon: BookOpen, desc: 'Compliance standards (ISO, SOC2)' },
                { label: 'Controls', href: '/controls', icon: ShieldCheck, desc: 'Internal control framework' },
            ]
        },
        {
            label: 'Risk',
            icon: AlertTriangle,
            items: [
                { label: 'Risk Register', href: '/risks', icon: AlertTriangle, desc: 'Enterprise risk management' },
                { label: 'Vendors', href: '/vendors', icon: Building2, desc: 'Third-party risk monitoring' },
            ]
        },
        {
            label: 'Assurance',
            icon: FileCheck,
            items: [
                { label: 'Audits', href: '/audit', icon: ClipboardCheck, desc: 'Audit execution & findings' },
                { label: 'Evidence', href: '/evidence', icon: FileCheck, desc: 'Evidence locker & collection' },
                { label: 'Gap Analysis', href: '/gap-analysis', icon: BarChart, desc: 'Compliance coverage analysis' },
            ]
        },
        {
            label: 'Operations',
            icon: Activity,
            items: [
                { label: 'Incidents', href: '/incidents', icon: Siren, desc: 'Security incident response' },
                { label: 'Changes', href: '/changes', icon: GitPullRequest, desc: 'Change management (CAB)' },
                { label: 'Actions', href: '/actions', icon: PlayCircle, desc: 'Remediation tracking' },
            ]
        },
        {
            label: 'Intelligence',
            icon: Sparkles,
            items: [
                { label: 'Zero Trust', href: '/analytics/zero-trust', icon: ShieldCheck, desc: 'Real-time security posture' },
                { label: 'Reports', href: '/reports', icon: FileText, desc: 'Executive reporting & metrics' },
                { label: 'Mapping', href: '/mapping', icon: GitMerge, desc: 'Control-Framework mapping' },
            ]
        },
        {
            label: 'Resources',
            icon: BookOpen,
            items: [
                { label: 'Analyst Guide', href: '/guide', icon: BookOpen, desc: 'Platform documentation' },
                { label: 'Trust Center', href: '/trust', icon: Globe, desc: 'Public trust profile' },
            ]
        },
        {
            label: 'Settings',
            icon: Settings,
            items: [
                { label: 'Profile & Security', href: '/settings', icon: User, desc: 'Account and authentication' },
                { label: 'Organization', href: '/settings?tab=organization', icon: Building2, desc: 'Workspace configuration' },
                { label: 'Compliance', href: '/settings?tab=compliance', icon: FileCheck, desc: 'Frameworks & risk appetite' },
                { label: 'Integrations', href: '/settings?tab=integrations', icon: Code, desc: 'Connect external tools' },
            ]
        }
    ];

    const isActive = (path: string) => pathname === path;
    const isGroupActive = (items: any[]) => items.some(item => isActive(item.href));

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-white/5 ${scrolled
                ? 'bg-slate-950/80 backdrop-blur-xl shadow-2xl shadow-emerald-500/5 py-4'
                : 'bg-transparent border-transparent py-5'
                }`}
            onMouseLeave={() => setHoveredGroup(null)}
        >
            <div className="max-w-[1920px] mx-auto px-6">
                <div className="flex justify-between items-center">
                    {/* Logo Area */}
                    <div className="flex items-center gap-8">
                        <Link href={user ? "/platform" : "/"} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(16,185,129,0.2)] group-hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)] transition-all duration-500">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black tracking-tight text-white leading-none">
                                    GRC<span className="text-emerald-500">ma</span>
                                </span>
                                <span className="text-[0.6rem] font-bold tracking-[0.2em] text-slate-500 uppercase group-hover:text-emerald-400 transition-colors">
                                    Platform
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        {pathname !== '/' && (
                            <nav className="hidden xl:flex items-center gap-1">
                                {navGroups.map((group) => {
                                    const active = group.items.length > 0 ? isGroupActive(group.items) : isActive(group.href!);
                                    const Icon = group.icon;
                                    const isHovered = hoveredGroup === group.label;

                                    return (
                                        <div
                                            key={group.label}
                                            className="relative"
                                            onMouseEnter={() => setHoveredGroup(group.label)}
                                            onMouseLeave={() => setHoveredGroup(null)}
                                        >
                                            {group.items.length === 0 ? (
                                                <Link
                                                    href={group.href!}
                                                    className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 group/link ${active
                                                        ? 'text-white bg-white/10'
                                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    <Icon className={`w-4 h-4 transition-colors ${active ? 'text-emerald-400' : 'text-slate-500 group-hover/link:text-emerald-400'}`} />
                                                    {group.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    className={`relative px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 group/btn ${active || isHovered
                                                        ? 'text-white bg-white/10'
                                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                        }`}
                                                >
                                                    <Icon className={`w-4 h-4 transition-colors ${active || isHovered ? 'text-emerald-400' : 'text-slate-500 group-hover/btn:text-emerald-400'}`} />
                                                    {group.label}
                                                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isHovered ? 'rotate-180 text-emerald-400' : 'text-slate-600'}`} />
                                                </button>
                                            )}

                                            {group.items.length > 0 && isHovered && (
                                                <div className="absolute top-full left-0 pt-2 w-72 animate-in fade-in slide-in-from-top-2 z-50">
                                                    <div className="relative bg-[#0B1120] border border-white/10 rounded-xl shadow-2xl p-2">
                                                        <div className="absolute -top-1.5 left-8 w-3 h-3 bg-[#0B1120] border-t border-l border-white/10 rotate-45 transform"></div>
                                                        <div className="relative bg-[#0B1120] rounded-lg overflow-hidden">
                                                            {group.items.map((item) => {
                                                                const ItemIcon = item.icon;
                                                                const itemActive = isActive(item.href);
                                                                return (
                                                                    <Link
                                                                        key={item.href}
                                                                        href={item.href}
                                                                        onClick={() => setHoveredGroup(null)}
                                                                        className={`flex items-start gap-4 p-3 rounded-lg transition-all group/item ${itemActive ? 'bg-emerald-500/10' : 'hover:bg-white/5'}`}
                                                                    >
                                                                        <div className={`mt-1 p-2 rounded-lg ${itemActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover/item:text-white group-hover/item:bg-slate-700'}`}>
                                                                            <ItemIcon className="w-5 h-5" />
                                                                        </div>
                                                                        <div>
                                                                            <div className={`text-sm font-bold mb-0.5 ${itemActive ? 'text-emerald-400' : 'text-slate-200 group-hover/item:text-white'}`}>
                                                                                {item.label}
                                                                            </div>
                                                                            <div className="text-xs text-slate-500 group-hover/item:text-slate-400 leading-tight">
                                                                                {item.desc}
                                                                            </div>
                                                                        </div>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </nav>
                        )}
                    </div>

                    {/* Right User Area */}
                    <div className="flex items-center gap-4">
                        {/* More Menu (Desktop) for overflow items could go here */}
                        {pathname !== '/' && (
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => router.push('/platform?view=input')}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-400/50 text-emerald-400 hover:text-emerald-300 rounded-lg text-sm font-bold shadow-[0_0_10px_-3px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)] transition-all group"
                                >
                                    <Sparkles className="w-4 h-4 transition-transform group-hover:rotate-12" />
                                    {t('nav_copilot')}
                                </button>
                            </div>
                        )}

                        {/* Language Switcher */}
                        <button
                            onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white text-xs font-bold uppercase transition-colors hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10"
                        >
                            <Globe className="w-4 h-4" />
                            {language === 'en' ? 'EN' : 'FR'}
                        </button>

                        <SignedOut>
                            <SignInButton>
                                <button className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm transition-all border border-white/5 hover:border-emerald-500/20 shadow-lg shadow-black/20">
                                    {t('login')}
                                </button>
                            </SignInButton>
                        </SignedOut>

                        <SignedIn>
                            {/* Go to Platform Button (for Authenticated Users on Trust Page) */}
                            {pathname === '/' && (
                                <Link
                                    href="/platform"
                                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    {t('dashboard')}
                                </Link>
                            )}
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>

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
            {
                mobileMenuOpen && (
                    <div className="xl:hidden absolute top-full left-0 w-full bg-slate-950/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5 h-[calc(100vh-80px)] overflow-y-auto">
                        <nav className="p-4 space-y-6">
                            {pathname !== '/' && navGroups.map((group) => (
                                <div key={group.label} className="space-y-2">
                                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">{group.label}</div>
                                    {group.items.length === 0 ? (
                                        <Link
                                            href={group.href!}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold text-white bg-white/5"
                                        >
                                            <group.icon className="w-5 h-5 text-emerald-400" />
                                            {group.label}
                                        </Link>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-1">
                                            {group.items.map(item => {
                                                const active = isActive(item.href);
                                                const ItemIcon = item.icon;
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
                                                        <ItemIcon className={`w-5 h-5 ${active ? 'text-emerald-400' : 'text-slate-500'}`} />
                                                        {item.label}
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {pathname === '/' && (
                                <div className="text-center text-slate-500 py-10">Sign in to access the platform menu.</div>
                            )}
                            <div className="h-px bg-white/5 my-2" />
                            <button
                                onClick={() => {
                                    router.push('/platform?view=input');
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-emerald-400 hover:bg-emerald-500/10"
                            >
                                <Sparkles className="w-5 h-5" />
                                Copilot
                            </button>
                        </nav>
                    </div>
                )
            }
        </header >
    );
}
