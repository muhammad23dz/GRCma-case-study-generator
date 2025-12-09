export default function PremiumBackground() {
    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#0B1120]">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px] -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] translate-y-1/2"></div>
            <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2"></div>
        </div>
    );
}
