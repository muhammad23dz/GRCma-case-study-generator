import React, { useState } from 'react';
import {
    BookOpen,
    Shield,
    AlertTriangle,
    FileText,
    Terminal,
    ChevronRight,
    Search,
    LayoutDashboard,
    Users,
    Activity,
    FileCheck,
    HelpCircle,
    Zap
} from 'lucide-react';

import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function UserGuide() {
    const { t } = useLanguage();
    const [activeSection, setActiveSection] = useState('getting-started');

    const sections = [
        {
            id: 'getting-started',
            title: t('guide_nav_title'),
            icon: Terminal,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-4">{t('guide_welcome_title')}</h2>
                        <p className="text-slate-400 text-lg leading-relaxed mb-6">
                            {t('guide_welcome_intro')}
                        </p>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl">
                            <h3 className="text-emerald-400 font-bold text-lg mb-2 flex items-center gap-2">
                                <Zap className="w-5 h-5" /> {t('guide_goal_title')}
                            </h3>
                            <p className="text-slate-300">
                                {t('guide_goal_desc')}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-colors">
                            <div className="text-white font-bold mb-2 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-400" /> {t('guide_role_analyst')}
                            </div>
                            <p className="text-sm text-slate-400">
                                {t('guide_role_analyst_desc')}
                            </p>
                        </div>
                        <div className="p-5 rounded-xl bg-slate-900 border border-white/10 hover:border-emerald-500/30 transition-colors">
                            <div className="text-white font-bold mb-2 flex items-center gap-2">
                                <Shield className="w-4 h-4 text-purple-400" /> {t('guide_role_manager')}
                            </div>
                            <p className="text-sm text-slate-400">
                                {t('guide_role_manager_desc')}
                            </p>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'dashboard-tour',
            title: t('guide_dash_title'), // Dashboard Walkthrough -> logic maps title to key? No, just replace string.
            icon: LayoutDashboard,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                        <h2 className="text-3xl font-bold text-white mb-6">{t('guide_dash_title')}</h2>
                        <p className="text-slate-400 mb-8">
                            {t('guide_dash_intro')}
                        </p>

                        <div className="space-y-6">
                            <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">{t('guide_dash_score')}</h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {t('guide_dash_score_desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400">
                                        <AlertTriangle className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">{t('guide_dash_map')}</h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {t('guide_dash_map_desc')}
                                        <br />
                                        <span className="text-red-400">{t('guide_dash_map_hi')}</span>{t('guide_dash_map_hi_desc')}
                                        <br />
                                        <span className="text-green-400">{t('guide_dash_map_lo')}</span>{t('guide_dash_map_lo_desc')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
                                <div className="shrink-0 mt-1">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <FileCheck className="w-6 h-6" />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg">{t('guide_dash_fw')}</h4>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {t('guide_dash_fw_desc')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'workflows',
            title: t('guide_wf_title'),
            icon: Zap,
            content: (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <h2 className="text-3xl font-bold text-white mb-6">{t('guide_wf_intro')}</h2>

                    <div className="space-y-8">
                        {/* Workflow 1 */}
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/80 p-4 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">{t('guide_wf_1_title')}</h3>
                            </div>
                            <div className="p-6 bg-slate-900/40">
                                <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">{t('guide_wf_1_step1')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('guide_wf_1_step1_desc')}</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">{t('guide_wf_1_step2')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('guide_wf_1_step2_desc')}</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">{t('guide_wf_1_step3')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('guide_wf_1_step3_desc')}</p>
                                    </li>
                                </ol>
                            </div>
                        </div>

                        {/* Workflow 2 */}
                        <div className="border border-white/10 rounded-xl overflow-hidden">
                            <div className="bg-slate-800/80 p-4 border-b border-white/10">
                                <h3 className="text-lg font-bold text-white">{t('guide_wf_2_title')}</h3>
                            </div>
                            <div className="p-6 bg-slate-900/40">
                                <ol className="relative border-l border-slate-700 ml-3 space-y-6">
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">{t('guide_wf_2_step1')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('guide_wf_2_step1_desc')}</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">{t('guide_wf_2_step2')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('guide_wf_2_step2_desc')}</p>
                                    </li>
                                    <li className="pl-6 relative">
                                        <span className="absolute -left-1.5 top-1.5 w-3 h-3 bg-slate-600 rounded-full border-2 border-slate-900"></span>
                                        <h4 className="text-white font-bold text-sm">{t('guide_wf_2_step3')}</h4>
                                        <p className="text-slate-400 text-sm mt-1">{t('guide_wf_2_step3_desc')}</p>
                                    </li>
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'glossary',
            title: t('guide_gloss_title'),
            icon: BookOpen,
            content: (
                <div className="space-y-6 animate-in fade-in duration-500">
                    <h2 className="text-3xl font-bold text-white mb-6">{t('guide_gloss_title')}</h2>
                    <p className="text-slate-400 mb-6">{t('guide_gloss_intro')}</p>

                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { term: t('guide_term_control'), def: t('guide_def_control') },
                            { term: t('guide_term_evidence'), def: t('guide_def_evidence') },
                            { term: t('guide_term_inh_risk'), def: t('guide_def_inh_risk') },
                            { term: t('guide_term_res_risk'), def: t('guide_def_res_risk') },
                            { term: 'SOC2', def: 'A common auditing procedure that ensures your service providers manage your data securely.' },
                            { term: 'Stakeholder', def: 'Anyone properly interested in the outcome of the project, such as investors or customers.' }
                        ].map((item) => (
                            <div key={item.term} className="p-4 rounded-lg bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-colors">
                                <span className="block text-emerald-400 font-bold mb-1">{item.term}</span>
                                <span className="text-slate-400 text-sm">{item.def}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )
        }
    ];

    const activeContent = sections.find(s => s.id === activeSection);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
            {/* Sidebar Navigation */}
            <div className="w-full md:w-72 shrink-0">
                <div className="sticky top-32 bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-5 border-b border-white/5 bg-slate-950/50">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-emerald-500" /> {t('guide_nav_title')}
                        </h3>
                    </div>
                    <nav className="p-2 space-y-1">
                        {sections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full text-left px-4 py-3.5 rounded-lg text-sm font-medium transition-all flex items-center justify-between group ${activeSection === section.id
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon className={`w-4 h-4 ${activeSection === section.id ? 'text-emerald-400' : 'text-slate-500 group-hover:text-emerald-400 transition-colors'}`} />
                                    {section.title}
                                </div>
                                {activeSection === section.id && <ChevronRight className="w-3 h-3" />}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-white/10">
                    <h4 className="text-white font-bold text-xs uppercase mb-2">{t('guide_help_title')}</h4>
                    <p className="text-xs text-slate-400 mb-3">
                        {t('guide_help_desc')}
                    </p>
                    <a
                        href="https://www.linkedin.com/in/mohamed-hmamouch-b5a944300/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full text-center py-2 bg-white/10 hover:bg-blue-600 text-white text-xs font-bold rounded-lg transition-colors"
                    >
                        {t('guide_btn_contact')}
                    </a>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-grow">
                <div className="bg-slate-900/30 border border-white/5 rounded-2xl p-8 min-h-[600px] shadow-2xl relative overflow-hidden">
                    {/* Decorative background blur */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

                    {activeContent?.content}
                </div>
            </div>
        </div>
    );
}
