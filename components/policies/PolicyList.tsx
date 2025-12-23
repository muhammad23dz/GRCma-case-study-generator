"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    FileText,
    Search,
    Filter,
    Plus,
    MoreVertical,
    Shield,
    CheckCircle,
    Clock,
    AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface Policy {
    id: string;
    title: string;
    description: string;
    status: 'active' | 'draft' | 'archived' | 'review';
    version: string;
    owner: string;
    updatedAt: string;
    category?: string;
}

interface PolicyListProps {
    policies: Policy[];
}

export function PolicyList({ policies }: PolicyListProps) {
    const router = useRouter();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredPolicies = policies.filter(p => {
        const matchesFilter = filter === 'all' || p.status === filter;
        const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.description?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'draft': return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
            case 'review': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'archived': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-slate-400 bg-slate-500/10';
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/40 backdrop-blur-md border border-white/5 p-4 rounded-xl">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search policies..."
                        className="w-full bg-slate-900/50 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        className="bg-slate-900/50 border border-white/10 rounded-lg px-4 py-2 text-sm text-slate-300 outline-none focus:ring-2 focus:ring-blue-500/50"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="review">In Review</option>
                    </select>

                    <button
                        onClick={() => router.push('/policies/new')}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ml-auto sm:ml-0"
                    >
                        <Plus className="w-4 h-4" />
                        New Policy
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPolicies.map((policy, idx) => (
                    <motion.div
                        key={policy.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="group relative bg-slate-900/40 backdrop-blur-sm border border-white/5 hover:border-blue-500/30 rounded-xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 cursor-pointer"
                        onClick={() => router.push(`/policies/${policy.id}`)}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <FileText className="w-6 h-6 text-blue-400" />
                            </div>
                            <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium border", getStatusColor(policy.status))}>
                                {policy.status.toUpperCase()}
                            </span>
                        </div>

                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-blue-400 transition-colors">
                            {policy.title}
                        </h3>
                        <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[40px]">
                            {policy.description}
                        </p>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-400 font-medium">v{policy.version}</span>
                                <span>•</span>
                                <span>{formatDistanceToNow(new Date(policy.updatedAt), { addSuffix: true })}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 border border-white/10">
                                    {policy.owner.charAt(0)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredPolicies.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-slate-600" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">No policies found</h3>
                    <p className="text-slate-500 mt-1">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
