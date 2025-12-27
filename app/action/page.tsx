'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /action to /actions (canonical plural URL)
export default function ActionRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/actions');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B1120]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
    );
}
