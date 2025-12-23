'use client';


import Header from '@/components/Header';
import AboutView from '@/components/AboutView';
import PremiumBackground from '@/components/PremiumBackground';
import PageTransition from '@/components/PageTransition';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-gray-100 overflow-x-hidden">
            <PremiumBackground />
            <Header />

            <main className="relative z-10 flex-grow container mx-auto px-4 pt-48 pb-24">
                <PageTransition>
                    <AboutView />
                </PageTransition>
            </main>

            <footer className="relative z-10 bg-slate-950/80 backdrop-blur-xl py-12 border-t border-white/5">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em]">
                        &copy; {new Date().getFullYear()} Gigachad GRC Intelligence. Structural Engineering by Mohamed Hmamouch.
                    </p>
                </div>
            </footer>
        </div>
    );
}
