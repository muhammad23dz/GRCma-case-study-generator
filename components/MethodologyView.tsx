import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function MethodologyView() {
    const { t } = useLanguage();
    return (
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-lg border border-gray-100">
            <h2 className="text-3xl font-bold text-green-900 mb-6">{t('meth_title')}</h2>

            <div className="prose prose-green max-w-none text-gray-700">
                <p className="mb-4">
                    {t('meth_intro')}
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{t('meth_fw_title')}</h3>
                <p className="mb-4">
                    {t('meth_fw_desc')}
                </p>

                <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li><strong>{t('meth_li_1')}:</strong> {t('meth_li_1_desc')}</li>
                    <li><strong>{t('meth_li_2')}:</strong> {t('meth_li_2_desc')}</li>
                    <li><strong>{t('meth_li_3')}:</strong> {t('meth_li_3_desc')}</li>
                    <li><strong>{t('meth_li_4')}:</strong> {t('meth_li_4_desc')}</li>
                    <li><strong>{t('meth_li_5')}:</strong> {t('meth_li_5_desc')}</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{t('meth_why_title')}</h3>
                <p>
                    {t('meth_why_desc')}
                </p>
            </div>
        </div>
    );
}
