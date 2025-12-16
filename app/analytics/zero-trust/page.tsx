'use client';

import React from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import ZeroTrustLive from '@/components/ZeroTrustLive';
import PageTransition from '@/components/PageTransition';

export default function ZeroTrustPage() {
    return (
        <div className="min-h-screen text-white selection:bg-emerald-500/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <PageTransition>
                    <ZeroTrustLive />
                </PageTransition>
            </div>
        </div>
    );
}
