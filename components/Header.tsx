'use client';

import { useUser, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    ShieldCheck,
    AlertTriangle,
    Building2,
    BookOpen,
    BarChart,
    ScrollText,
    Siren,
    FileText,
    Settings,
    Sparkles,
    Menu,
    X,
    ChevronDown,
    FileCheck,
    ClipboardCheck,
    Globe,
    Server,
    GraduationCap,
    BookMarked,
    Users2,
    Workflow,
    ShieldAlert,
    Plug
} from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface HeaderProps { }

export default function Header({ }: HeaderProps = {}) {
    const { user, isLoaded } = useUser();
    const pathname = usePathname();
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hoveredGroup, setHoveredGroup] = useState<string | null>(null);
    const { t, language, setLanguage } = useLanguage();

    // Public pages where navigation should be hidden
    const publicPages = ['/', '/trust', '/platform', '/login', '/signup', '/about'];
    const isPublicPage = publicPages.includes(pathname);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Streamlined navigation - 6 main items that fit at 100% zoom
    const navItems = [
        { label: t('nav_dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { label: t('nav_assessments'), href: '/assessments', icon: FileCheck },
        {
            label: t('nav_grc'),
            icon: ShieldCheck,
            items: [
                { label: t('nav_controls'), href: '/controls', icon: ShieldCheck, desc: t('ctrl_subtitle') },
                { label: t('nav_risk'), href: '/risks', icon: AlertTriangle, desc: t('risk_subtitle') },
                { label: t('nav_policies'), href: '/policies', icon: ScrollText, desc: t('nav_module_gov_desc') },
                { label: t('nav_frameworks'), href: '/frameworks', icon: BookOpen, desc: t('fw_subtitle') },
                { label: t('nav_assets'), href: '/assets', icon: Server, desc: t('asset_subtitle') },
                { label: t('nav_gap'), href: '/gap-analysis', icon: BarChart, desc: t('gap_subtitle') },
            ]
        },
        {
            label: t('nav_ops'),
            icon: Siren,
            items: [
                { label: t('nav_incidents'), href: '/incidents', icon: Siren, desc: t('inc_subtitle') },
                { label: t('nav_vendors'), href: '/vendors', icon: Building2, desc: t('vendor_subtitle') },
                { label: t('nav_evidence'), href: '/evidence', icon: FileCheck, desc: t('dash_stat_evidence') },
                { label: t('nav_audits'), href: '/audit', icon: ClipboardCheck, desc: 'Audit management' },
                { label: t('nav_actions'), href: '/actions', icon: FileText, desc: 'Remediation tracking' },
                { label: t('nav_changes'), href: '/changes', icon: Workflow, desc: 'Change management' },
                { label: t('nav_bcdr'), href: '/bcdr', icon: ShieldAlert, desc: 'Business continuity' },
                { label: t('nav_processes'), href: '/processes', icon: Workflow, desc: 'Business processes' },
            ]
        },
        {
            label: t('nav_workforce'),
            icon: Users2,
            items: [
                { label: t('nav_employees'), href: '/employees', icon: Users2, desc: t('emp_subtitle') },
                { label: t('nav_training'), href: '/training', icon: GraduationCap, desc: 'Security training' },
                { label: t('nav_questionnaires'), href: '/questionnaires', icon: FileCheck, desc: 'Assessments' },
                { label: t('nav_runbooks'), href: '/runbooks', icon: BookMarked, desc: 'Procedures' },
            ]
        },
        {
            label: t('nav_reports'),
            icon: BarChart,
            items: [
                { label: 'AI Intelligence', href: '/intelligence', icon: Sparkles, desc: 'GRC AI Studio' },
                { label: t('nav_coverage'), href: '/reports', icon: BarChart, desc: 'Compliance reports' },
                { label: t('nav_zero_trust'), href: '/analytics/zero-trust', icon: Sparkles, desc: 'Zero Trust security posture' },
                { label: t('nav_scenarios'), href: '/risks/scenarios', icon: AlertTriangle, desc: 'What-if analysis' },
                { label: t('nav_integrations'), href: '/integrations/hub', icon: Plug, desc: 'Integration hub' },
            ]
        },
        { label: t('nav_guide'), href: '/guide', icon: BookOpen },
    ];

    const isActive = (path: string) => pathname === path;
    const isGroupActive = (items: any[]) => items?.some(item => isActive(item.href));

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-slate-950/60 backdrop-blur-2xl shadow-2xl shadow-black/40 border-b border-white/10'
                : 'bg-transparent'
                }`}
            onMouseLeave={() => setHoveredGroup(null)}
        >
            <div className="max-w-[1600px] mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                    {/* Premium Monolithic Branding */}
                    <Link href={user ? "/platform" : "/"} className="flex items-center gap-4 group">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            {/* Ambient Glow */}
                            <div className="absolute inset-0 bg-[#006233]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700"></div>

                            {/* The Monolithic Shield Icon */}
                            <svg viewBox="0 0 24 24" className="w-8 h-8 relative z-10 transition-transform duration-500 group-hover:scale-110">
                                {/* Left Wing - Moroccan Red */}
                                <path
                                    d="M12 2L4 5V11C4 16.1 7.4 20.9 12 22"
                                    fill="none"
                                    stroke="#C1272D"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_rgba(193,39,45,0.4)]"
                                />
                                {/* Right Wing - Moroccan Green */}
                                <path
                                    d="M12 2L20 5V11C20 16.1 16.6 20.9 12 22"
                                    fill="none"
                                    stroke="#006233"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    className="drop-shadow-[0_0_8px_rgba(0,98,51,0.4)]"
                                />
                                {/* Central Blade */}
                                <path
                                    d="M12 2V22"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    className="opacity-80"
                                />
                            </svg>
                        </div>

                        <div className="flex flex-col items-start">
                            <span className="text-2xl font-black tracking-[-0.02em] flex items-baseline leading-none">
                                <span className="text-white">GRC</span>
                                <span className="text-[#006233] ml-0.5">ma</span>
                            </span>
                            {/* The Red Underline Accent - Targeted specifically under 'ma' */}
                            <div className="w-full flex justify-end">
                                <div className="w-7 h-[3px] bg-[#C1272D] mt-1 relative overflow-hidden rounded-full">
                                    <div className="absolute inset-0 bg-white/40 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Desktop Navigation - Only show on authenticated app pages */}
                    {!isPublicPage && user && (
                        <nav className="hidden lg:flex items-center">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const hasItems = item.items && item.items.length > 0;
                                const active = hasItems ? isGroupActive(item.items!) : isActive(item.href!);
                                const isHovered = hoveredGroup === item.label;

                                return (
                                    <div
                                        key={item.label}
                                        className="relative"
                                        onMouseEnter={() => hasItems && setHoveredGroup(item.label)}
                                    >
                                        {hasItems ? (
                                            <button
                                                className={`px-3 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 rounded-lg mx-0.5 ${active || isHovered
                                                    ? 'text-white bg-white/10'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${active || isHovered ? 'text-emerald-400' : ''}`} />
                                                {item.label}
                                                <ChevronDown className={`w-3 h-3 transition-transform ${isHovered ? 'rotate-180' : ''}`} />
                                            </button>
                                        ) : (
                                            <Link
                                                href={item.href!}
                                                className={`px-3 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 rounded-lg mx-0.5 ${active
                                                    ? 'text-white bg-white/10'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : ''}`} />
                                                {item.label}
                                            </Link>
                                        )}

                                        {/* Dropdown */}
                                        {hasItems && isHovered && (
                                            <div className="absolute top-full left-0 pt-2 w-56 z-50">
                                                <div className="bg-slate-900 border border-white/10 rounded-xl shadow-xl p-1.5">
                                                    {item.items!.map((subItem) => {
                                                        const SubIcon = subItem.icon;
                                                        const subActive = isActive(subItem.href);
                                                        return (
                                                            <Link
                                                                key={subItem.href}
                                                                href={subItem.href}
                                                                onClick={() => setHoveredGroup(null)}
                                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${subActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                                                    }`}
                                                            >
                                                                <SubIcon className={`w-4 h-4 ${subActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                                                                <div>
                                                                    <div className="text-sm font-medium">{subItem.label}</div>
                                                                    <div className="text-xs text-slate-500">{subItem.desc}</div>
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    )}

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        {!isPublicPage && user && (
                            <button
                                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                                className="px-2 py-1.5 rounded-lg border border-white/10 text-[10px] font-black hover:bg-white/10 transition-all text-slate-300 hover:text-white flex items-center gap-1.5"
                                title={language === 'en' ? 'Passer en Français' : 'Switch to English'}
                            >
                                <Globe className="w-3 h-3 text-emerald-500" />
                                {language.toUpperCase()}
                            </button>
                        )}
                        {!isPublicPage && user && (
                            <Link
                                href="/settings"
                                className={`p-2 rounded-lg transition-all ${isActive('/settings') ? 'bg-white/10 text-white shadow-inner' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                            >
                                <Settings className="w-5 h-5 transition-transform hover:rotate-90 duration-500" />
                            </Link>
                        )}

                        <SignedIn>
                            <UserButton
                                afterSignOutUrl="/"
                                appearance={{
                                    elements: {
                                        avatarBox: "w-9 h-9 ring-2 ring-emerald-500/30"
                                    }
                                }}
                            />
                        </SignedIn>

                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="px-4 py-2 bg-white text-slate-900 text-sm font-bold rounded-lg hover:bg-slate-100 transition-all">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Only for authenticated app pages */}
            {mobileMenuOpen && !isPublicPage && user && (
                <div className="lg:hidden bg-slate-900 border-t border-white/5 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        if (item.items) {
                            return (
                                <div key={item.label} className="space-y-1">
                                    <div className="px-3 py-2 text-sm font-bold text-slate-400 flex items-center gap-2">
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </div>
                                    {item.items.map((subItem) => (
                                        <Link
                                            key={subItem.href}
                                            href={subItem.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`block pl-9 py-2 text-sm rounded-lg ${isActive(subItem.href) ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-white/5'
                                                }`}
                                        >
                                            {subItem.label}
                                        </Link>
                                    ))}
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={item.label}
                                href={item.href!}
                                onClick={() => setMobileMenuOpen(false)}
                                className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg ${isActive(item.href!) ? 'bg-emerald-500/10 text-emerald-400' : 'text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </header>
    );
}
