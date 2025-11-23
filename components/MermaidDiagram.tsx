'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
    chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            themeVariables: {
                primaryColor: '#22c55e',        // Green
                primaryTextColor: '#fff',
                primaryBorderColor: '#16a34a',
                secondaryColor: '#ef4444',      // Red
                secondaryTextColor: '#fff',
                secondaryBorderColor: '#dc2626',
                tertiaryColor: '#f59e0b',       // Amber/Orange
                tertiaryTextColor: '#fff',
                tertiaryBorderColor: '#d97706',
                noteBkgColor: '#1f2937',
                noteTextColor: '#fff',
                noteBorderColor: '#22c55e',
            }
        });

        if (ref.current) {
            mermaid.contentLoaded();
        }
    }, []);

    useEffect(() => {
        if (ref.current) {
            ref.current.innerHTML = '';
            const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
            const element = document.createElement('div');
            element.id = id;
            element.className = 'mermaid';
            element.textContent = chart;
            ref.current.appendChild(element);

            mermaid.run({
                nodes: [element]
            }).then(() => {
                // Add custom CSS for different node classes
                const style = document.createElement('style');
                style.textContent = `
                    #${id} .mindmap-node.urgent { fill: #ef4444 !important; stroke: #dc2626 !important; }
                    #${id} .mindmap-node.warning { fill: #f59e0b !important; stroke: #d97706 !important; }
                    #${id} .mindmap-node.ok { fill: #22c55e !important; stroke: #16a34a !important; }
                    #${id} .mindmap-node.info { fill: #3b82f6 !important; stroke: #2563eb !important; }
                    #${id} .mindmap-node.success { fill: #10b981 !important; stroke: #059669 !important; }
                    #${id} .mindmap-node { fill: #6366f1 !important; stroke: #4f46e5 !important; }
                `;
                ref.current?.appendChild(style);
            });
        }
    }, [chart]);

    return <div ref={ref} className="my-6 p-4 bg-slate-800/30 rounded-lg border border-green-500/20 overflow-x-auto" />;
}
