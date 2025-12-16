'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import Header from '@/components/Header';
import { Search, Plus, Zap, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import PageTransition from '@/components/PageTransition';
import { canDeleteRecords } from '@/lib/permissions';

export default function VendorConstellation() {
    const { user } = useUser();
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [vendors, setVendors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredNode, setHoveredNode] = useState<any>(null);

    // Fetch Data
    useEffect(() => {
        fetch('/api/vendors')
            .then(res => res.json())
            .then(data => {
                setVendors(data.vendors || []);
                setLoading(false);
            });
    }, []);

    // Constellation Logic (Canvas)
    useEffect(() => {
        if (loading || !vendors.length || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        // Particles
        const nodes = vendors.map(v => ({
            id: v.id,
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: v.criticality === 'critical' ? 12 : v.criticality === 'high' ? 8 : 5,
            color: v.riskScore > 75 ? '#ef4444' : v.riskScore > 50 ? '#f97316' : '#10b981',
            data: v
        }));

        let animationId: number;

        const render = () => {
            ctx.fillStyle = '#020617'; // Slate 950
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw Connections (Simulated network)
            ctx.strokeStyle = '#ffffff10';
            ctx.lineWidth = 1;

            nodes.forEach((node, i) => {
                // Update Position
                node.x += node.vx;
                node.y += node.vy;

                // Bounce
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

                // Draw connections to nearby
                nodes.forEach((other, j) => {
                    if (i === j) return;
                    const dx = node.x - other.x;
                    const dy = node.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(node.x, node.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                });

                // Draw Node (Glow)
                const glow = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 3);
                glow.addColorStop(0, node.color);
                glow.addColorStop(1, 'transparent');
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Mouse Interaction (Simple hit test)
                // In real implementation, use a quadtree or distance check
            });

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationId);
        };
    }, [vendors, loading]);

    // Simple interaction layer (HTML overlay) for hover/click since Canvas hit test is complex for this demo
    // Interactive List

    return (
        <div className="relative min-h-screen bg-slate-950 overflow-hidden">
            <Header />

            {/* The Cosmos */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-80" />

            {/* UI Overlay */}
            <div className="relative z-10 pointer-events-none min-h-screen flex flex-col">
                <div className="p-8 pt-32">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2">
                        Vendor Constellation
                    </h1>
                    <p className="text-slate-400">Interactive Risk Universe</p>
                </div>

                {/* Sidebar List (Interactive) */}
                <div className="absolute top-32 right-8 w-80 pointer-events-auto space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {/* Admin Delete All */}
                    {/* Delete All - Admin Only */}
                    {canDeleteRecords((session?.user as any)?.role) && (
                        <button
                            onClick={() => {
                                if (confirm('Are you sure you want to delete ALL vendors? This cannot be undone.')) {
                                    // Loop delete or add bulk endpoint
                                    vendors.forEach(v => {
                                        fetch(`/api/vendors/${v.id}`, { method: 'DELETE' });
                                    });
                                    setVendors([]);
                                }
                            }}
                            className="w-full py-2 bg-red-950/40 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-900/60 transition-all font-bold text-xs uppercase tracking-widest mb-2"
                        >
                            Delete All Stars
                        </button>
                    )}

                    {vendors.map(v => (
                        <div
                            key={v.id}
                            className="group bg-slate-900/60 backdrop-blur-md border border-white/10 p-4 rounded-xl hover:bg-white/10 hover:border-purple-500/50 transition-all cursor-pointer transform hover:scale-105 relative"
                        >
                            <div onClick={() => router.push(`/vendors/${v.id}`)}>
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-white group-hover:text-purple-400">{v.name}</h3>
                                    <div className={`text-xs px-2 py-0.5 rounded border uppercase font-bold ${v.riskScore > 75 ? 'border-red-500/50 text-red-500 bg-red-500/10' :
                                        v.riskScore > 50 ? 'border-orange-500/50 text-orange-500 bg-orange-500/10' :
                                            'border-emerald-500/50 text-emerald-500 bg-emerald-500/10'
                                        }`}>{v.riskScore || 0}</div>
                                </div>
                                <div className="text-xs text-slate-400 mb-2">{v.services}</div>
                                <div className="flex gap-2">
                                    <span className="text-[10px] px-2 py-1 bg-white/5 rounded text-slate-300">
                                        {v.criticality || 'Medium'}
                                    </span>
                                    <span className="text-[10px] px-2 py-1 bg-white/5 rounded text-slate-300">
                                        {v._count?.assessments || 0} Assessments
                                    </span>
                                </div>
                            </div>

                            {/* Quick Delete - Admin Only */}
                            {canDeleteRecords(user?.publicMetadata?.role) && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this vendor?')) {
                                            fetch(`/api/vendors/${v.id}`, { method: 'DELETE' }).then(() => setVendors(prev => prev.filter(item => item.id !== v.id)));
                                        }
                                    }}
                                    className="absolute -top-2 -right-2 p-1.5 bg-slate-900 border border-white/10 rounded-full text-slate-500 circle opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all z-20"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                </button>
                            )}
                        </div>
                    ))}


                    <button
                        onClick={() => router.push('/vendors/new')} // Or handle add modal
                        className="w-full py-4 border-2 border-dashed border-white/20 rounded-xl text-slate-400 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-xs"
                    >
                        <Plus className="w-4 h-4" /> Add New Star
                    </button>
                </div>
            </div>

            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                        <div className="text-purple-400 font-mono animate-pulse">Scanning Universe...</div>
                    </div>
                </div>
            )}
        </div>
    );
}
