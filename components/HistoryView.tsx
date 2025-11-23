import { GeneratedReport } from '@/types';

interface HistoryViewProps {
    history: GeneratedReport[];
    onSelectReport: (report: GeneratedReport) => void;
    onDeleteReport: (reportId: string) => void;
}

export default function HistoryView({ history, onSelectReport, onDeleteReport }: HistoryViewProps) {
    if (history.length === 0) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-12 border border-green-500/20">
                    <svg className="w-24 h-24 mx-auto mb-6 text-green-400/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-2xl font-bold text-gray-300 mb-2">No Reports Yet</h2>
                    <p className="text-gray-400">Generate your first GRC report to see it appear here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-red-400 bg-clip-text text-transparent mb-8">
                Case Study History
            </h2>
            <div className="grid gap-4">
                {history.map((report) => (
                    <div
                        key={report.id}
                        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-green-500/20 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/20 group"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 cursor-pointer" onClick={() => onSelectReport(report)}>
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-mono rounded-full border border-green-500/30">
                                        {report.id}
                                    </span>
                                    <span className="text-sm text-gray-400">
                                        {new Date(report.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-200 mb-2 group-hover:text-green-400 transition-colors">
                                    {report.sections.executiveSummary.title}
                                </h3>
                                <p className="text-gray-400 text-sm line-clamp-2">
                                    {report.sections.executiveSummary.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    console.log('Delete button clicked for report:', report.id);
                                    e.stopPropagation();
                                    const confirmed = window.confirm('Are you sure you want to delete this report?');
                                    console.log('User confirmed deletion:', confirmed);
                                    if (confirmed) {
                                        console.log('Calling onDeleteReport with ID:', report.id);
                                        onDeleteReport(report.id);
                                    }
                                }}
                                className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                title="Delete report"
                                type="button"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
