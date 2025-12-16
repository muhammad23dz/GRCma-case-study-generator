'use client';

import { Clock, CheckCircle2, AlertTriangle, User, MessageSquare } from 'lucide-react';

interface Incident {
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    createdAt: string;
    actions: any[];
}

export default function IncidentTimeline({ incidents }: { incidents: Incident[] }) {
    // Sort by most recent
    const sortedIncidents = [...incidents].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <div className="relative border-l-2 border-white/10 ml-4 space-y-12 py-8">
            {sortedIncidents.map((incident, idx) => (
                <div key={incident.id} className="relative pl-8 group">
                    {/* Time Marker */}
                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 transition-all duration-300 ${incident.severity === 'critical' ? 'bg-red-500 border-red-900 group-hover:scale-150' :
                            incident.severity === 'high' ? 'bg-orange-500 border-orange-900 group-hover:scale-150' :
                                'bg-emerald-500 border-emerald-900 group-hover:scale-150'
                        }`}></div>

                    <div className="bg-slate-900/40 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-white/20 transition-all">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-bold text-white">{incident.title}</h3>
                            <span className="text-xs font-mono text-slate-500">{new Date(incident.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded border ${incident.status === 'open' ? 'border-red-500/50 text-red-500' : 'border-emerald-500/50 text-emerald-500'
                                }`}>
                                {incident.status}
                            </span>
                            <span className="text-xs text-slate-400">ID: {incident.id.slice(0, 8)}</span>
                        </div>

                        <p className="text-slate-300 mb-6">{incident.description}</p>

                        {/* Simulated Actions Timeline within Incident */}
                        <div className="space-y-3 bg-black/20 p-4 rounded-lg">
                            <div className="flex items-start gap-3 text-sm text-slate-400">
                                <Clock className="w-4 h-4 mt-0.5 text-blue-400" />
                                <div>
                                    <span className="text-white font-bold">Incident Reported</span>
                                    <div className="text-xs opacity-50">{new Date(incident.createdAt).toLocaleTimeString()}</div>
                                </div>
                            </div>

                            {/* Placeholder for real actions if they existed in the view model */}
                            {incident.status === 'resolved' && (
                                <div className="flex items-start gap-3 text-sm text-slate-400">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400" />
                                    <div>
                                        <span className="text-white font-bold">Resolved</span>
                                        <div className="text-xs opacity-50">Auto-closed by System</div>
                                    </div>
                                </div>
                            )}
                            {incident.status === 'open' && (
                                <div className="flex items-start gap-3 text-sm text-slate-400">
                                    <AlertTriangle className="w-4 h-4 mt-0.5 text-orange-400 animate-pulse" />
                                    <div>
                                        <span className="text-white font-bold">Investigation Active</span>
                                        <div className="text-xs opacity-50">SLA Timer Running</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            {incidents.length === 0 && (
                <div className="pl-8 text-slate-500">No incidents found in timeline.</div>
            )}
        </div>
    );
}
