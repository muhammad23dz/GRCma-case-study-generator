import { Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="bg-slate-900/50 backdrop-blur-sm py-8 border-t border-emerald-500/20 w-full mt-auto">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-gray-400 text-sm flex items-center gap-1" suppressHydrationWarning>
                        &copy; {new Date().getFullYear()}
                        <span className="font-black tracking-tight ml-1">
                            <span className="text-white">GRC</span>
                            <span className="text-[#006233]">ma</span>
                        </span>. Created by Mohamed Hmamouch.
                    </p>

                    <div className="flex items-center gap-4">
                        <a
                            href="https://www.linkedin.com/in/mohamed-hmamouch-b5a944300/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-[#0077b5] transition-colors"
                            aria-label="LinkedIn"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a
                            href="https://github.com/hmamouch"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-400 hover:text-white transition-colors"
                            aria-label="GitHub"
                        >
                            <Github className="w-5 h-5" />
                        </a>
                        <a
                            href="/about"
                            className="text-slate-400 hover:text-emerald-400 transition-colors text-sm"
                        >
                            About Platform
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
