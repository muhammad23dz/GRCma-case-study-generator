/**
 * GRC Engineering AI Types
 * AI-powered features for intelligent GRC automation
 */

export enum EntityType {
    CONTROL = 'CONTROL',
    RISK = 'RISK',
    POLICY = 'POLICY',
    EVIDENCE = 'EVIDENCE',
    VENDOR = 'VENDOR',
    INCIDENT = 'INCIDENT',
}

// ============================================
// Risk Scoring
// ============================================

export interface RiskScoringRequest {
    title: string;
    description: string;
    category?: string;
    affectedAssets?: string[];
    existingControls?: string[];
    industryContext?: string;
}

export interface RiskScoringResponse {
    likelihood: number;  // 1-5
    impact: number;      // 1-5
    riskScore: number;   // 1-25
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    likelihoodRationale: string;
    impactRationale: string;
    suggestedCategory: string;
    recommendedControls: string[];
    confidence: number;  // 0-100
}

// ============================================
// Auto-Categorization
// ============================================

export interface CategorizationRequest {
    entityType: EntityType;
    title: string;
    description: string;
    additionalContext?: string;
}

export interface CategorizationResponse {
    primaryCategory: string;
    subcategory: string;
    tags: string[];
    relatedFrameworks: string[];
    confidence: number;
    explanation: string;
}

// ============================================
// Smart Search
// ============================================

export interface SmartSearchRequest {
    query: string;
    entityTypes?: EntityType[];
    limit?: number;
}

export interface SearchResult {
    entityType: EntityType;
    id: string;
    title: string;
    relevance: number;
    snippet: string;
    explanation: string;
}

export interface SmartSearchResponse {
    results: SearchResult[];
    interpretation: string;
    suggestedRefinements: string[];
    totalMatches: number;
}

// ============================================
// Policy Drafting
// ============================================

export interface PolicyDraftRequest {
    policyType: string;
    organizationName: string;
    industry?: string;
    frameworks?: string[];
    requirements?: string[];
    additionalContext?: string;
    tone?: 'formal' | 'professional' | 'technical';
}

export interface PolicySection {
    title: string;
    content: string;
    order: number;
}

export interface PolicyDraftResponse {
    title: string;
    content: string;  // Full policy in markdown
    sections: PolicySection[];
    frameworksCovered: string[];
    suggestedReviewSchedule: string;
    relatedPolicies: string[];
}

// ============================================
// Control Suggestions
// ============================================

export interface ControlSuggestionRequest {
    riskDescription?: string;
    frameworkRequirement?: string;
    framework?: string;
    existingControls?: string[];
    organizationContext?: string;
}

export interface SuggestedControl {
    title: string;
    description: string;
    category: string;
    controlType: 'preventive' | 'detective' | 'corrective' | 'directive';
    implementationGuidance: string;
    effortEstimate: 'Low' | 'Medium' | 'High';
    effectivenessRating: number;  // 1-5
    frameworkMappings: string[];
    priority: number;  // 1-10 (1 = highest)
}

export interface ControlSuggestionResponse {
    controls: SuggestedControl[];
    gapAnalysis: string;
    implementationRoadmap: string;
    totalEffortEstimate: string;
}

// ============================================
// Incident Analysis
// ============================================

export interface IncidentAnalysisRequest {
    title: string;
    description: string;
    severity?: string;
    affectedSystems?: string[];
}

export interface IncidentAnalysisResponse {
    rootCauseAnalysis: string;
    impactAssessment: string;
    containmentSteps: string[];
    remediationSteps: string[];
    preventiveControls: string[];
    lessonsLearned: string[];
    estimatedRecoveryTime: string;
}

// ============================================
// Compliance Gap Analysis
// ============================================

export interface GapAnalysisRequest {
    framework: string;
    currentControls: string[];
    organizationContext?: string;
}

export interface ComplianceGap {
    requirement: string;
    requirementId: string;
    currentState: 'Not Implemented' | 'Partially Implemented' | 'Implemented';
    gap: string;
    recommendedAction: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    effortEstimate: string;
}

export interface GapAnalysisResponse {
    overallComplianceScore: number;
    gaps: ComplianceGap[];
    prioritizedRoadmap: string;
    quickWins: string[];
    estimatedTimeToCompliance: string;
}

// ============================================
// Category Mappings
// ============================================

export const CATEGORY_MAPPINGS: Record<EntityType, string[]> = {
    [EntityType.CONTROL]: [
        'Access Control',
        'Asset Management',
        'Business Continuity',
        'Cryptography',
        'Human Resources Security',
        'Incident Management',
        'Network Security',
        'Operations Security',
        'Physical Security',
        'Risk Management',
        'Supplier Relationships',
        'System Development',
    ],
    [EntityType.RISK]: [
        'Operational',
        'Strategic',
        'Financial',
        'Compliance',
        'Security',
        'Technical',
        'Third-Party',
        'Reputational',
        'Legal',
    ],
    [EntityType.POLICY]: [
        'Information Security',
        'Access Control',
        'Data Protection',
        'Acceptable Use',
        'Incident Response',
        'Business Continuity',
        'Risk Management',
        'Vendor Management',
        'Human Resources',
    ],
    [EntityType.EVIDENCE]: [
        'Policy Document',
        'Procedure',
        'Screenshot',
        'Configuration',
        'Report',
        'Log',
        'Certificate',
        'Training Record',
        'Audit Report',
    ],
    [EntityType.VENDOR]: [
        'Cloud Provider',
        'SaaS',
        'Infrastructure',
        'Security',
        'Professional Services',
        'Data Processing',
        'Software',
    ],
    [EntityType.INCIDENT]: [
        'Security Breach',
        'Data Loss',
        'System Outage',
        'Malware',
        'Phishing',
        'Unauthorized Access',
        'Configuration Error',
        'Third-Party Incident',
    ],
};
