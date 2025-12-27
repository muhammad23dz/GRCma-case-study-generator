'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ActionRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Permanent client-side redirect in case server-side redirect fails
        router.replace('/actions');
    }, [router]);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <Loader2 className="w-12 h-12 animate-spin text-emerald-500 mb-4" />
            <p className="text-slate-400 font-medium tracking-wide">Redirecting to Actions...</p>
        </div>
    );
}
