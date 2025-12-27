'use client';

import { useUser } from '@clerk/nextjs';

/**
 * RestrictedView - Simplified to ALWAYS allow access.
 * 
 * Deep Inspection Update:
 * The "Upgrade" gating has been completely removed to provide unrestricted access
 * to all GRC capabilities (Risk, Controls, etc.) for all users.
 */
export default function RestrictedView({ children }: { children: React.ReactNode }) {
    const { isLoaded } = useUser();

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

    // ALWAYS return children - No Gating
    return <>{children}</>;
}
