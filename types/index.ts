export interface CaseInput {
    industry: string;
    challenge: string;
    currentPosture: 'Low' | 'Medium' | 'High';
    desiredOutcome: string;
}

export interface ReportSection {
    title: string;
    content: string;
    mindmap?: string;
}

export interface GeneratedReport {
    id: string;
    timestamp: string;
    sections: {
        executiveSummary: ReportSection;
        driversAndRisks: ReportSection;
        engagementType: ReportSection;
        methodology: ReportSection;
        gapAnalysis: ReportSection;
        maturityFindings: ReportSection;
        roadmap: ReportSection;
        businessImpact: ReportSection;
    };
}
