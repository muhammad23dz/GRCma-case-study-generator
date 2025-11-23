import { GeneratedReport, ReportSection } from '@/types';

interface ReportViewProps {
    report: GeneratedReport;
    onReset: () => void;
}

import MermaidDiagram from './MermaidDiagram';

function Section({ section, index }: { section: ReportSection; index: number }) {
    return (
        <div className="mb-12 border-b border-gray-100 pb-8 last:border-0">
            <div className="flex items-center mb-4">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mr-3">
                    {index + 1}
                </span>
                <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
            </div>

            <div
                className="prose prose-blue max-w-none text-gray-700 pl-11 mb-6"
                dangerouslySetInnerHTML={{ __html: section.content }}
            />

            {section.mindmap && (
                <div className="pl-11">
                    <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Visual Summary</h4>
                    <MermaidDiagram chart={section.mindmap} />
                </div>
            )}
        </div>
    );
}

export default function ReportView({ report, onReset }: ReportViewProps) {
    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white shadow-xl rounded-xl overflow-hidden mb-8">
                <div className="bg-[#002050] text-white p-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-3xl font-bold mb-2">GRC Assessment Report</h2>
                            <p className="text-blue-200">Generated on {new Date(report.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm font-medium opacity-75">CASE ID</div>
                            <div className="font-mono">{report.id}</div>
                        </div>
                    </div>
                </div>

                <div className="p-8 md:p-12">
                    <Section section={report.sections.executiveSummary} index={0} />
                    <Section section={report.sections.driversAndRisks} index={1} />
                    <Section section={report.sections.engagementType} index={2} />
                    <Section section={report.sections.methodology} index={3} />
                    <Section section={report.sections.gapAnalysis} index={4} />
                    <Section section={report.sections.maturityFindings} index={5} />
                    <Section section={report.sections.roadmap} index={6} />
                    <Section section={report.sections.businessImpact} index={7} />
                </div>
            </div>

            <div className="text-center mb-12">
                <button
                    onClick={onReset}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-md transition"
                >
                    Start New Case
                </button>
            </div>
        </div>
    );
}
