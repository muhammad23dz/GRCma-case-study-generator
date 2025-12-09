export default function TableSkeleton() {
    return (
        <div className="min-h-screen bg-slate-900 animate-pulse flex flex-col">
            {/* Fake Header */}
            <div className="h-20 bg-slate-800/50 border-b border-white/5 w-full mb-8" />

            <div className="flex-grow p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Page Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div className="h-10 w-48 bg-slate-800 rounded" />
                        <div className="h-10 w-32 bg-slate-800 rounded" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-slate-800/30 rounded-xl h-24 border border-white/5" />
                        ))}
                    </div>

                    {/* Table Skeleton */}
                    <div className="bg-slate-800/30 border border-white/5 rounded-lg overflow-hidden">
                        <div className="h-12 bg-slate-900/50 border-b border-white/5" />
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 border-b border-white/5 bg-slate-800/20" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
