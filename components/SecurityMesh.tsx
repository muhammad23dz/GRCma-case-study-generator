'use client';

import React, { useEffect, useRef } from 'react';

export default function SecurityMesh() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let animationFrameId: number;
        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };

        window.addEventListener('resize', resize);
        resize();

        const dots: { x: number; y: number; vx: number; vy: number }[] = [];
        const dotCount = Math.floor((width * height) / 15000);

        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.05)';
            ctx.lineWidth = 1;

            dots.forEach((dot, i) => {
                dot.x += dot.vx;
                dot.y += dot.vy;

                if (dot.x < 0 || dot.x > width) dot.vx *= -1;
                if (dot.y < 0 || dot.y > height) dot.vy *= -1;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, 1.5, 0, Math.PI * 2);
                ctx.fill();

                for (let j = i + 1; j < dots.length; j++) {
                    const other = dots[j];
                    const dx = dot.x - other.x;
                    const dy = dot.y - other.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(dot.x, dot.y);
                        ctx.lineTo(other.x, other.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0 opacity-40"
            style={{ mixBlendMode: 'screen' }}
        />
    );
}
