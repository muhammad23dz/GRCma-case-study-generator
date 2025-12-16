// Duplicate imports removed
import React from 'react';
import {
    Shield,
    Smartphone,
    Globe,
    Database,
    Server,
    Lock,
    CheckCircle,
    ArrowRight,
    MousePointer2
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function ZeroTrustJourney() {
    const router = useRouter();
    const { t } = useLanguage();

    const steps = [
        {
            id: 'identity',
            title: t('zt_step_id_title'),
            description: t('zt_step_id_desc'),
            icon: Shield,
            color: 'text-blue-400',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20',
            link: '/admin/users',
            metrics: ['MFA Enforced', 'Least Privilege']
        },
        {
            id: 'device',
            title: t('zt_step_dev_title'),
            description: t('zt_step_dev_desc'),
            icon: Smartphone,
            color: 'text-purple-400',
            bg: 'bg-purple-500/10',
            border: 'border-purple-500/20',
            link: '/vendors', // Proxy for device/asset mgmt
            metrics: ['Managed Devices', 'Health Checks']
        },
        {
            id: 'network',
            title: t('zt_step_net_title'),
            description: t('zt_step_net_desc'),
            icon: Globe,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20',
            link: '/controls',
            metrics: ['Micro-segmentation', 'Traffic Analysis']
        },
        {
            id: 'app',
            title: t('zt_step_app_title'),
            description: t('zt_step_app_desc'),
            icon: Server,
            color: 'text-orange-400',
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/20',
            link: '/changes',
            metrics: ['App Sec', 'Container Security']
        },
        {
            id: 'data',
            title: t('zt_step_data_title'),
            description: t('zt_step_data_desc'),
            icon: Database,
            color: 'text-pink-400',
            bg: 'bg-pink-500/10',
            border: 'border-pink-500/20',
            link: '/evidence',
            metrics: ['Encryption', 'DLP']
        }
    ];

    return (
        <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-4 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                    <Lock className="w-3 h-3" /> {t('zt_badge')}
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
                    {t('zt_title_pre')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">{t('zt_title_highlight')}</span>
                </h2>
                <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                    {t('zt_desc')}
                </p>
            </div>

            <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-blue-900/50 via-emerald-900/50 to-pink-900/50 -translate-y-1/2 rounded-full" />

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 relative z-10">
                    {steps.map((step, index) => (
                        <div
                            key={step.id}
                            className="group relative"
                        >
                            {/* Card */}
                            <div
                                onClick={() => router.push(step.link)}
                                className={`
                                    h-full p-6 rounded-2xl border backdrop-blur-sm transition-all duration-300 cursor-pointer
                                    ${step.bg} ${step.border} 
                                    hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)] hover:border-white/20
                                `}
                            >
                                <div className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:rotate-6
                                    bg-slate-950 border border-white/10 ${step.color} shadow-lg
                                `}>
                                    <step.icon className="w-6 h-6" />
                                </div>

                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                    {step.title}
                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-slate-400" />
                                </h3>
                                <p className="text-sm text-slate-400 mb-4 min-h-[40px] leading-relaxed">
                                    {step.description}
                                </p>

                                <div className="space-y-2">
                                    {step.metrics.map(metric => (
                                        <div key={metric} className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-950/50 px-2 py-1 rounded border border-white/5">
                                            <CheckCircle className="w-3 h-3 text-emerald-500/50" />
                                            {metric}
                                        </div>
                                    ))}
                                </div>

                                <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 rounded-2xl transition-all pointer-events-none" />
                            </div>

                            {/* Step Number Badge */}
                            <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-xs font-bold text-slate-500 shadow-xl group-hover:scale-110 transition-transform">
                                {index + 1}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Call to Action Footer */}
            <div className="mt-16 text-center">
                <div onClick={() => router.push('/gap-analysis')} className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg cursor-pointer transition-all group">
                    <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                        <MousePointer2 className="w-4 h-4" />
                    </div>
                    <span className="text-slate-300 font-medium group-hover:text-white">{t('zt_btn_start')}</span>
                </div>
            </div>
        </div>
    );
}
