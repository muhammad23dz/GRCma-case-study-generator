"use client";

import { motion } from "framer-motion";

export default function PremiumBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#050505]">
            {/* Architectural Grid */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '80px 80px'
                }}
            />

            {/* Geometric Moroccan Pulses */}
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#C1272D]/5 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#006233]/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>

            {/* Center Monolithic Star */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] opacity-[0.02]">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current animate-[spin_60s_linear_infinite]">
                    <path d="M50 0 L61 39 L100 50 L61 61 L50 100 L39 61 L0 50 L39 39 Z" />
                </svg>
            </div>

            {/* Sharp Section Dividers */}
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#C1272D]/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#006233]/20 to-transparent"></div>

            {/* Noise/Grain */}
            <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/pinstripe-dark.png')]" />
        </div>
    );
}
