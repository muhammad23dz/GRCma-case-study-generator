export type MaturityLevel = 'Initial' | 'Developing' | 'Defined' | 'Managed' | 'Optimizing';
export type ControlStatus = 'compliant' | 'partially_compliant' | 'non_compliant' | 'not_applicable';
export type ControlType = 'preventive' | 'detective' | 'corrective' | 'directive';
export type RiskSeverity = 'Critical' | 'High' | 'Medium' | 'Low';
export type GapSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ComplianceMetrics {
    complianceScore: number;
    maturityLevel: MaturityLevel;
    auditReadiness: number;
    dimensionScores: {
        documentation: number;
        evidence: number;
        policies: number;
        technical: number;
    };
    gapCount: number;
}

export interface GRCControl {
    title: string;
    description: string;
    controlType: ControlType;
    status: ControlStatus;
}

export interface GRCRisk {
    category: string;
    narrative: string;
    likelihood: number;
    impact: number;
    score: number;
    mitigatingControlTitles?: string[];
}

export interface GRCGap {
    title: string;
    description: string;
    severity: GapSeverity;
    remediationPlan: string;
    effort: 'high' | 'medium' | 'low';
    timeline: string;
}

export interface GRCPolicy {
    title: string;
    category: string;
    description: string;
    status: 'active' | 'draft' | 'review';
}

export interface GRCVendor {
    name: string;
    category: string;
    services: string;
    riskScore: number;
}

export interface GRCIncident {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'resolved' | 'investigating' | 'open';
}

export interface AssessmentOutput {
    executiveSummary: {
        problemStatement: string;
        context: string;
        scope: string;
        recommendations: string;
    };
    complianceMetrics: ComplianceMetrics;
    controls: GRCControl[];
    risks: GRCRisk[];
    gaps: GRCGap[];
    policies: GRCPolicy[];
    vendors: GRCVendor[];
    incidents: GRCIncident[];
}

export interface DashboardAnalytics {
    overview: {
        totalControls: number;
        totalRisks: number;
        totalVendors: number;
        totalActions: number;
        totalIncidents: number;
        totalPolicies: number;
        totalChanges: number;
        criticalRisks: number;
        highRisks: number;
        openActions: number;
        openIncidents: number;
        complianceScore: number;
        maturityLevel: string;
        auditReadiness: number;
        gapCount: number;
        openGaps: number;
        openFindings: number;
        activeRemediations: number;
    };
    riskDistribution: Array<{ category: string; _count: number }>;
    heatmapRisks: Array<{
        id: string;
        narrative: string;
        likelihood: number;
        impact: number;
        score: number;
        category: string;
    }>;
    controlsByType?: Array<{ controlType: string; _count: number }>;
    vendorsByCriticality?: Array<{ criticality: string; _count: number }>;
    vendorsByStatus?: Array<{ status: string; _count: number }>;
}

export interface AuditLogEntry {
    id: string;
    userName: string;
    action: string;
    entity: string;
    timestamp: string;
    changes?: any;
    ipAddress?: string;
    userId?: string;
}
