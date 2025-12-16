'use client';


import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import AboutView from '@/components/AboutView';

export default function AboutPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col font-sans text-gray-100">
            <Header />

            <main className="flex-grow container mx-auto px-4 pt-32 pb-12">
                <AboutView />
            </main>

            <footer className="bg-slate-900/50 backdrop-blur-sm py-8 border-t border-green-500/20 mt-auto">
                <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
                    <p>&copy; {new Date().getFullYear()} GRCma. Created by Mohamed Hmamouch.</p>
                </div>
            </footer>
        </div>
    );
}
