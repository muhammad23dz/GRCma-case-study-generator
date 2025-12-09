import { Linkedin } from 'lucide-react';
import { useSession } from 'next-auth/react';

export default function AboutView() {
    const { data: session } = useSession();

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <div className="inline-block p-4 rounded-2xl bg-slate-800/50 border border-white/10 shadow-2xl mb-8">
                    <span className="text-6xl">🛡️</span>
                </div>
                <h2 className="text-5xl font-bold bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 bg-clip-text text-transparent mb-6">
                    About GRCma
                </h2>
                <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
                    A next-generation Governance, Risk, and Compliance intelligence platform designed to streamline audit workflows and ensure regulatory alignment.
                </p>
            </div>

            {/* Creator Card */}
            <div className="bg-slate-800/50 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-8 mb-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-all group-hover:bg-emerald-500/20"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-4 border-slate-800 shadow-xl shrink-0 overflow-hidden ring-4 ring-emerald-500/20">
                        <img
                            src="/profile.png"
                            alt="Mohamed Hmamouch"
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="text-center md:text-left flex-grow">
                        <div className="text-sm font-semibold text-emerald-500 uppercase tracking-widest mb-2">GRC Specialist & Creator</div>
                        <h3 className="text-3xl font-bold text-white mb-4">Mohamed Hmamouch</h3>
                        <p className="text-gray-300 mb-6 leading-relaxed">
                            Revolutionizing the GRC landscape by fusing deep regulatory mastery with cutting-edge intelligence. GRCma transforms compliance from a static burden into a dynamic competitive advantage. This is where precision meets power, redefining how modern enterprises navigate risk.
                        </p>
                        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                            <a
                                href="https://www.linkedin.com/in/mohamed-hmamouch-b5a944300/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0077b5] hover:bg-[#006399] text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 font-medium"
                            >
                                <Linkedin className="w-5 h-5" />
                                Connect on LinkedIn
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl hover:border-emerald-500/30 transition-all">
                    <div className="text-emerald-400 text-2xl mb-4">⚡</div>
                    <h4 className="text-white font-bold mb-2">Automated Insights</h4>
                    <p className="text-sm text-gray-400">
                        Leveraging AI to generate compliance reports, gap analyses, and remediation actions instantly.
                    </p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl hover:border-blue-500/30 transition-all">
                    <div className="text-blue-400 text-2xl mb-4">🔒</div>
                    <h4 className="text-white font-bold mb-2">Security First</h4>
                    <p className="text-sm text-gray-400">
                        Built with enterprise security standards, including RBAC, audit logging, and secure data handling.
                    </p>
                </div>
                <div className="bg-slate-900/50 border border-white/5 p-6 rounded-xl hover:border-purple-500/30 transition-all">
                    <div className="text-purple-400 text-2xl mb-4">🎨</div>
                    <h4 className="text-white font-bold mb-2">Modern UX</h4>
                    <p className="text-sm text-gray-400">
                        A premium, responsive interface designed for clarity, speed, and ease of use across all devices.
                    </p>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center mt-16 text-gray-500 text-sm">
                <p>&copy; {new Date().getFullYear()} GRCma Platform. All rights reserved.</p>
            </div>
        </div>
    );
}
