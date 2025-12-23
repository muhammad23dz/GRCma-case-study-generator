import { Linkedin, Shield, Zap, Activity, Target, ShieldCheck, Cpu, Globe, Lock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function AboutView() {
    const { user } = useUser();
    const { t } = useLanguage();

    return (
        <div className="max-w-6xl mx-auto space-y-24 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Hero Section */}
            <div className="text-center relative">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 animate-pulse"></div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-lg shadow-emerald-500/5">
                    <Activity className="w-3 h-3 animate-pulse" /> Platform Intelligence: Neural
                </div>

                <h2 className="text-7xl font-black tracking-tighter mb-8 leading-[0.9]">
                    <span className="block text-white">The Future of</span>
                    <span className="block bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent italic">
                        {t('about_title')}
                    </span>
                </h2>

                <p className="text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto font-medium">
                    {t('about_desc')}
                </p>
            </div>

            {/* Feature Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit mb-6 ring-1 ring-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            <Cpu className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">{t('about_feat_1')}</h4>
                        <p className="text-slate-400 leading-relaxed text-sm font-medium">
                            {t('about_feat_1_desc')}
                        </p>
                    </div>
                </div>

                <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-blue-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="p-4 bg-blue-500/10 rounded-2xl w-fit mb-6 ring-1 ring-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                            <Lock className="w-8 h-8 text-blue-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">{t('about_feat_2')}</h4>
                        <p className="text-slate-400 leading-relaxed text-sm font-medium">
                            {t('about_feat_2_desc')}
                        </p>
                    </div>
                </div>

                <div className="group relative bg-slate-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[2rem] hover:border-purple-500/30 transition-all duration-500 hover:-translate-y-2 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10">
                        <div className="p-4 bg-purple-500/10 rounded-2xl w-fit mb-6 ring-1 ring-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                            <Globe className="w-8 h-8 text-purple-400" />
                        </div>
                        <h4 className="text-2xl font-bold text-white mb-3 tracking-tight">{t('about_feat_3')}</h4>
                        <p className="text-slate-400 leading-relaxed text-sm font-medium">
                            {t('about_feat_3_desc')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Creator Card */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-slate-900 leading-none flex items-center divide-x divide-white/5 rounded-[2.5rem]">
                    <div className="flex flex-col md:flex-row items-center gap-12 p-12 w-full">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl animate-pulse"></div>
                            <div className="w-48 h-48 rounded-[2.5rem] bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border-4 border-slate-800 shadow-2xl shrink-0 overflow-hidden ring-1 ring-white/10 relative z-10 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                <img
                                    src="/profile.png"
                                    alt="Mohamed Hmamouch"
                                    className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500"
                                />
                            </div>
                        </div>

                        <div className="text-center md:text-left flex-grow space-y-6">
                            <div>
                                <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4">
                                    {t('about_role')}
                                </div>
                                <h3 className="text-5xl font-black text-white tracking-tight">Mohamed Hmamouch</h3>
                            </div>

                            <p className="text-slate-400 text-lg leading-relaxed max-w-2xl font-medium italic">
                                "Our mission is to modernize the GRC landscape by integrating continuous monitoring with intelligent automation. GRCma transforms compliance from a static checklist into a strategic operational advantage."
                            </p>

                            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                                <a
                                    href="https://www.linkedin.com/in/mohamed-hmamouch-b5a944300/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group/btn inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-950 rounded-2xl transition-all shadow-xl hover:shadow-emerald-500/20 font-black hover:scale-105 active:scale-95"
                                >
                                    <Linkedin className="w-5 h-5 text-[#0077b5]" />
                                    CONNECT ON LINKEDIN
                                </a>
                                <div className="hidden sm:flex items-center gap-2 px-6 rounded-2xl border border-white/5 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Architect
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center pb-12">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent mb-8"></div>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">{t('about_footer')}</p>
            </div>
        </div>
    );
}
