// Extended types for GRC features

export interface User {
    id: string;
    role: string;
    isSubscribed?: boolean;
}

export interface Control {
    id: string;
    title: string;
    description: string;
    controlType: 'preventive' | 'detective' | 'corrective' | 'directive';
    owner?: string;
    controlRisk?: 'low' | 'medium' | 'high' | 'critical';
    evidenceRequirements?: string;
    confidence?: number;
    llmProvenance?: LLMProvenance;
    createdAt: Date;
    updatedAt: Date;
}

export interface Framework {
    id: string;
    name: string;
    version: string;
    jurisdiction?: string;
    description?: string;
}

export interface FrameworkMapping {
    id: string;
    controlId: string;
    frameworkId: string;
    frameworkControlId: string;
    confidence: number;
    mappingSource: 'llm' | 'manual' | 'authoritative';
}

export interface Risk {
    id: string;
    assetId?: string;
    controlId?: string;
    likelihood: number; // 0-100
    impact: number; // 0-100
    score: number;
    category: 'Low' | 'Medium' | 'High' | 'Critical';
    narrative: string;
    drivers: RiskDriver[];
    recommendedActions: RecommendedAction[];
    llmConfidence?: number;
    llmProvenance?: LLMProvenance;
    status: 'open' | 'mitigated' | 'accepted' | 'closed';
}

export interface RiskDriver {
    driver: string;
    weight: number;
}

export interface RecommendedAction {
    action: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Evidence {
    id: string;
    controlId?: string;
    riskId?: string;
    vendorId?: string;
    evidenceType: 'document' | 'scan' | 'log' | 'screenshot' | 'attestation' | 'automated';
    source: string;
    fileName?: string;
    fileUrl?: string;
    fileHash?: string;
    extractedData?: any;
    summary?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    uploadedBy: string;
    timestamp: Date;
}

export interface Vendor {
    id: string;
    name: string;
    criticality: 'low' | 'medium' | 'high' | 'critical';
    services: string;
    contactEmail?: string;
    riskScore?: number;
    lastAssessmentDate?: Date;
    nextReviewDate?: Date;
    status: 'active' | 'offboarded' | 'suspended';
}

export interface VendorAssessment {
    id: string;
    vendorId: string;
    assessmentType: 'onboarding' | 'annual' | 'incident_triggered' | 'continuous';
    questionnaire: any;
    gaps?: Gap[];
    rating?: 'pass' | 'conditional' | 'fail';
    remediationPlan?: RemediationStep[];
    completedAt: Date;
}

export interface Gap {
    area: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
}

export interface RemediationStep {
    step: string;
    owner: string;
    estimatedEffort: string;
    priority: number;
}

export interface Action {
    id: string;
    type: 'remediation' | 'review' | 'attestation' | 'assessment';
    title: string;
    description: string;
    controlId?: string;
    owner: string;
    assignee?: string;
    dueDate?: Date;
    status: 'open' | 'in_progress' | 'completed' | 'cancelled';
    severity: 'low' | 'medium' | 'high' | 'critical';
    playbook?: PlaybookStep[];
    linkedTicket?: string;
}

export interface PlaybookStep {
    step: number;
    action: string;
    owner: string;
    estimatedTime: string;
    dependencies?: number[];
}

export interface LLMProvenance {
    prompt: string;
    model: string;
    temperature: number;
    timestamp: string;
    promptHash: string;
}

export interface LLMResponse<T> {
    data: T;
    confidence: number;
    provenance: LLMProvenance;
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

// Existing types (preserved)
export interface CaseInput {
    companyName: string;
    targetFramework: string;
    companySize: string;
    industry?: string;
    keyChallenge: string;
}

export interface GeneratedReport {
    id: string;
    sections: any;
    timestamp: string;
}

export interface Incident {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    status: 'open' | 'investigating' | 'mitigated' | 'resolved' | 'closed';
    occurredAt: Date;
    owner: string;
}

export interface ReportSection {
    title: string;
    content: string;
    actionTable?: string;
}

export interface LLMConfig {
    provider: 'openai' | 'deepseek' | 'anthropic' | 'google' | 'mistral' | 'github';
    apiKey: string;
}
