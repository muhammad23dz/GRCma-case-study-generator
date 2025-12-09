
export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-slate-900 animate-pulse flex flex-col">
            {/* Fake Header */}
            <div className="h-20 bg-slate-800/50 border-b border-white/5 w-full" />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header Title */}
                    <div className="mb-8">
                        <div className="h-10 w-64 bg-slate-800 rounded mb-2" />
                        <div className="h-5 w-96 bg-slate-800/50 rounded" />
                    </div>

                    {/* Big Score Card */}
                    <div className="bg-slate-800/30 rounded-xl p-8 mb-8 h-64 border border-white/5" />

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-slate-800/30 rounded-xl h-32 border border-white/5" />
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                        <div className="bg-slate-800/30 rounded-xl h-80 border border-white/5" />
                        <div className="lg:col-span-2 bg-slate-800/30 rounded-xl h-80 border border-white/5" />
                    </div>

                    {/* Activity Feed */}
                    <div className="bg-slate-800/30 rounded-xl h-64 border border-white/5" />
                </div>
            </div>
        </div>
    );
}
