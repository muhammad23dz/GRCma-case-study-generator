'use client';

import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

export default function ApiDocsPage() {
    const router = useRouter();

    const endpoints = [
        {
            method: 'GET',
            path: '/api/controls',
            description: 'List all controls with optional filtering by framework.',
            params: '?framework=ISO27001',
        },
        {
            method: 'POST',
            path: '/api/controls',
            description: 'Create a new control.',
            body: '{ title, description, framework }',
        },
        {
            method: 'GET',
            path: '/api/risks',
            description: 'List all risks.',
        },
        {
            method: 'POST',
            path: '/api/risks/assess',
            description: 'Assess a new risk using AI.',
            body: '{ title, description, context }',
        },
        {
            method: 'GET',
            path: '/api/evidence',
            description: 'List evidence for controls or risks.',
            params: '?controlId=...&riskId=...',
        },
        {
            method: 'POST',
            path: '/api/evidence',
            description: 'Upload new evidence file.',
            body: 'FormData: { file, evidenceType, controlId }',
        },
        {
            method: 'GET',
            path: '/api/actions',
            description: 'List remediation actions.',
            params: '?status=open&priority=high',
        },
        {
            method: 'POST',
            path: '/api/actions',
            description: 'Create a new action or task.',
        },
        {
            method: 'GET',
            path: '/api/analytics/overview',
            description: 'Get dashboard metrics and compliance score.',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-900 flex flex-col">
            <Header />

            <div className="flex-grow p-8 pt-32">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2">API Documentation</h1>
                        <p className="text-gray-400">Developer reference for GRC Platform API</p>
                    </div>

                    <div className="space-y-6">
                        {endpoints.map((ep, idx) => (
                            <div key={idx} className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-blue-500/30 transition-colors">
                                <div className="flex items-center gap-4 mb-2">
                                    <span className={`px-3 py-1 rounded-md text-sm font-bold ${ep.method === 'GET' ? 'bg-blue-500/20 text-blue-400' :
                                        ep.method === 'POST' ? 'bg-green-500/20 text-green-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>
                                        {ep.method}
                                    </span>
                                    <code className="text-white font-mono text-lg">{ep.path}</code>
                                </div>
                                <p className="text-gray-300 mb-4">{ep.description}</p>

                                {(ep.params || ep.body) && (
                                    <div className="bg-slate-900/50 rounded p-4 font-mono text-sm">
                                        {ep.params && (
                                            <div className="flex gap-4">
                                                <span className="text-gray-500">Query:</span>
                                                <span className="text-emerald-400">{ep.params}</span>
                                            </div>
                                        )}
                                        {ep.body && (
                                            <div className="flex gap-4">
                                                <span className="text-gray-500">Body:</span>
                                                <span className="text-orange-400">{ep.body}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 p-6 bg-slate-800/80 rounded-lg border border-white/10">
                        <h2 className="text-xl font-bold text-white mb-4">Authentication</h2>
                        <p className="text-gray-400 mb-4">
                            All API endpoints require authentication via NextAuth session cookies.
                            External API access via API Keys is under development.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
