'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import PremiumBackground from '@/components/PremiumBackground';
import {
    Activity,
    Search,
    User,
    Globe,
    Calendar,
    Terminal,
    ChevronDown,
    Filter
} from 'lucide-react';

interface AuditLog {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    resource: string;
    action: string;
    changes: string;
    ipAddress?: string;
    timestamp: string;
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        async function fetchLogs() {
            try {
                const res = await fetch('/api/audit-logs');
                if (res.ok) {
                    const data = await res.json();
                    setLogs(data);
                }
            } catch (error) {
                console.error('Failed to fetch audit logs:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter(log =>
        log.userEmail.toLowerCase().includes(search.toLowerCase()) ||
        log.resource.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen text-white selection:bg-primary/30">
            <PremiumBackground />
            <Header />

            <div className="relative z-10 p-8 pt-32">
                <div className="max-w-7xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Activity className="w-5 h-5 text-primary" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Security</span>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                                Audit Logs
                            </h1>
                            <p className="text-lg text-slate-400">
                                Monitor all administrative actions and system events within your organization.
                            </p>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 w-full md:w-80 transition-all shadow-xl"
                            />
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Total Events</div>
                            <div className="text-2xl font-bold">{logs.length}</div>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl">
                            <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">Active Users</div>
                            <div className="text-2xl font-bold">{new Set(logs.map(l => l.userId)).size}</div>
                        </div>
                        {/* More stats could go here */}
                    </div>

                    {/* Table */}
                    <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-white/5">
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Action</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Resource</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Context</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    [1, 2, 3, 4, 5].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8 h-16 bg-white/5" />
                                        </tr>
                                    ))
                                ) : filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            No audit logs found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs capitalize">
                                                        {log.userEmail.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-medium">{log.userName}</div>
                                                        <div className="text-xs text-slate-500">{log.userEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                                        log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                                            log.action.includes('UPDATE') ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                                'bg-slate-500/10 text-slate-400 border border-white/5'
                                                    }`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-sm font-mono text-slate-300">
                                                    <Terminal className="w-3.5 h-3.5 text-slate-500" />
                                                    {log.resource}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                                    <Globe className="w-3.5 h-3.5" />
                                                    {log.ipAddress || 'Internal'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
