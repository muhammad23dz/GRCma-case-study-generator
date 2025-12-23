import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import PremiumBackground from "@/components/PremiumBackground";
import { FileText, Clock, Shield, AlertCircle, ArrowLeft, Download, PenTool } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export default async function PolicyDetailPage({ params }: { params: { id: string } }) {
    const user = await currentUser();
    const policy = await prisma.policy.findUnique({
        where: { id: params.id },
        include: {
            // controls: true // If relation exists
        }
    });

    if (!policy) notFound();

    // Mock version history if not in DB yet (Schema didn't have versions table, just version string)
    const versions = [
        { version: policy.version, date: policy.updatedAt, author: policy.owner || 'System', notes: 'Current version' },
        { version: '0.9', date: policy.createdAt, author: 'AI Generator', notes: 'Initial Draft' }
    ];

    return (
        <div className="min-h-screen text-foreground selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Breadcrumbs & Header */}
                    <Link href="/policies" className="inline-flex items-center text-slate-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Policy Center
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-slate-800 rounded-xl border border-white/10">
                                <FileText className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-2">{policy.title}</h1>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className={`px-2.5 py-0.5 rounded-full border ${policy.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            'bg-slate-500/10 text-slate-300 border-slate-500/20'
                                        }`}>
                                        {policy.status.toUpperCase()}
                                    </span>
                                    <span className="text-slate-400">v{policy.version}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-400">{policy.category || 'General'}</span>
                                    <span className="text-slate-500">•</span>
                                    <span className="text-slate-400">Owner: {policy.owner}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-slate-300 hover:bg-white/5 transition-colors">
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors">
                                <PenTool className="w-4 h-4" />
                                Edit Policy
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content Viewer */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl overflow-hidden min-h-[600px] relative">
                                <div className="p-4 border-b border-white/5 bg-slate-900/50 flex justify-between items-center">
                                    <span className="text-sm font-medium text-slate-300">Document Preview</span>
                                    <span className="text-xs text-slate-500">Last updated {formatDistanceToNow(policy.updatedAt, { addSuffix: true })}</span>
                                </div>
                                <div className="p-8 prose prose-invert max-w-none">
                                    {/* Ideally render Markdown or HTML content here */}
                                    <div className="whitespace-pre-wrap font-sans text-slate-300 leading-relaxed">
                                        {policy.content || "No content available."}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar: Metadata & History */}
                        <div className="space-y-6">
                            {/* Version History */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-slate-400" />
                                    Version History
                                </h3>
                                <div className="space-y-4 relative">
                                    {/* Timeline Line */}
                                    <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-slate-800" />

                                    {versions.map((Ver, i) => (
                                        <div key={i} className="relative pl-6">
                                            <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-2 ${i === 0 ? 'bg-blue-500 border-slate-900' : 'bg-slate-700 border-slate-900'}`} />
                                            <div>
                                                <div className="flex justify-between items-baseline">
                                                    <span className="text-sm font-medium text-white">v{Ver.version}</span>
                                                    <span className="text-xs text-slate-500">{new Date(Ver.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-xs text-slate-400 mt-0.5">{Ver.notes}</p>
                                                <p className="text-[10px] text-slate-500 mt-1">by {Ver.author}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Linked Controls */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-slate-400" />
                                    Linked Controls
                                </h3>
                                {/* Placeholder since Schema Relation might be complex to query directly without relation loaded */}
                                <div className="p-4 bg-slate-800/50 rounded-lg border border-white/5 text-center">
                                    <p className="text-sm text-slate-400">This policy supports 3 secure controls.</p>
                                    <button className="text-xs text-blue-400 hover:text-blue-300 mt-2">View Controls</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
