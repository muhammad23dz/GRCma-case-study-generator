'use client';

import { useUser } from '@clerk/nextjs';
import { Lock, Zap, Code } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useDevMode } from '@/lib/contexts/DevModeContext';

/**
 * RestrictedView - The "Blur Engine" with Dev Mode Integration
 * 
 * Logic:
 * 1. DEV_MODE ON -> ALWAYS SHOW CONTENT (Full Access)
 * 2. If User is Subscribed (Admin/Manager) -> SHOW CONTENT
 * 3. If User is Demo -> 
 *    a. If Page is Dashboard/Platform Root -> SHOW CONTENT
 *    b. Any other page -> BLUR CONTENT + SHOW PAYWALL
 */
export default function RestrictedView({ children }: { children: React.ReactNode }) {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const { devMode, enableDevMode, disableDevMode } = useDevMode();

    // Loading state
    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                    <span className="text-emerald-500 text-sm font-mono">Checking access...</span>
                </div>
            </div>
        );
    }

    // DEV MODE: Always allow - show content directly without banner
    if (devMode) {
        return <>{children}</>;
    }

    // Check for role-based access if configured
    const role = (user?.publicMetadata as any)?.role || 'user';
    const isSubscribed = (user?.publicMetadata as any)?.isSubscribed ||
        role === 'admin' ||
        role === 'manager';

    // Subscribed users: Full access
    if (isSubscribed) {
        return <>{children}</>;
    }

    // Demo users: Allow dashboard only
    const isDashboard = pathname === '/platform' || pathname === '/dashboard' || pathname === '/';
    if (isDashboard) {
        return <>{children}</>;
    }

    // BLOCKED: Demo on Inner Page - Show Paywall
    return (
        <div className="relative min-h-screen bg-[#0B0F19] overflow-hidden">
            {/* BLURRED CONTENT */}
            <div className="filter blur-xl pointer-events-none opacity-40 select-none h-screen overflow-hidden scale-105">
                {children}
            </div>

            {/* PAYWALL OVERLAY */}
            <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/70 backdrop-blur-sm">
                <div className="max-w-md w-full bg-slate-900/95 border border-emerald-500/30 rounded-2xl shadow-2xl shadow-emerald-500/10 p-8 text-center animate-in fade-in zoom-in duration-300">

                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <Lock className="w-10 h-10 text-emerald-500" />
                    </div>

                    <h2 className="text-3xl font-black text-white mb-3">Restricted Access</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Demo Mode provides read-only access to the Dashboard.
                        <br />
                        <strong className="text-emerald-400">Upgrade to Analyst Node</strong> to unlock full GRC capabilities.
                    </p>

                    {/* Feature List */}
                    <div className="grid grid-cols-2 gap-2 mb-8 text-left">
                        {['Risk Register', 'Controls Library', 'Evidence Locker', 'Compliance Reports', 'Vendor Management', 'Incident Response'].map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-xs text-slate-500">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                {feature}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => router.push('/?upgrade=true#pricing')}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 group text-lg"
                    >
                        <Zap className="w-5 h-5 fill-slate-950" />
                        <span>UPGRADE NOW</span>
                    </button>

                    <p className="mt-4 text-xs text-slate-500">
                        Secure SSL Payment • Instant Activation
                    </p>

                    {/* Dev Mode Toggle - Subtle */}
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <button
                            onClick={enableDevMode}
                            className="text-xs text-purple-400/60 hover:text-purple-400 transition-colors flex items-center gap-2 mx-auto"
                        >
                            <Code className="w-3 h-3" />
                            <span>Enable Dev Mode (Testing)</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
