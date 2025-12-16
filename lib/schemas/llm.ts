
import { z } from 'zod';

// Feature 1: Control Normalization Schema
export const ControlNormalizationSchema = z.object({
    title: z.string().describe("Concise control title"),
    description: z.string().describe("Detailed description"),
    controlType: z.enum(['preventive', 'detective', 'corrective', 'directive']),
    controlRisk: z.enum(['low', 'medium', 'high', 'critical']),
    evidenceRequirements: z.string(),
    mappings: z.array(z.object({
        framework: z.string(),
        frameworkControlId: z.string(),
        confidence: z.number().min(0).max(1),
        rationale: z.string()
    }))
});

// Feature 2: Risk Assessment Schema
export const RiskAssessmentSchema = z.object({
    likelihood: z.number().min(0).max(100),
    impact: z.number().min(0).max(100),
    score: z.number().min(0).max(100),
    category: z.enum(['Low', 'Medium', 'High', 'Critical']),
    narrative: z.string(),
    drivers: z.array(z.object({
        driver: z.string(),
        weight: z.number().min(0).max(1)
    })),
    recommendedActions: z.array(z.object({
        action: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical'])
    }))
});

// Feature 3: Evidence Metadata Schema
export const EvidenceMetadataSchema = z.object({
    summary: z.string(),
    extractedData: z.object({
        dates: z.array(z.string()).optional(),
        scope: z.string().optional(),
        findings: z.array(z.string()).optional(),
        compliance_status: z.enum(['compliant', 'non-compliant', 'partial', 'unknown']).optional(),
        key_metrics: z.record(z.string(), z.any()).optional()
    }),
    relevantControls: z.array(z.string())
});

// Feature 4: Vendor Assessment Schema
export const VendorAssessmentSchema = z.object({
    gaps: z.array(z.object({
        area: z.string(),
        severity: z.enum(['low', 'medium', 'high', 'critical']),
        description: z.string()
    })),
    rating: z.enum(['pass', 'conditional', 'fail']),
    riskScore: z.number().min(0).max(100),
    remediationPlan: z.array(z.object({
        step: z.string(),
        owner: z.string(),
        estimatedEffort: z.string(),
        priority: z.number()
    })),
    summary: z.string()
});

// Feature 5: Playbook Generation Schema
export const PlaybookSchema = z.object({
    title: z.string(),
    estimatedDuration: z.string(),
    steps: z.array(z.object({
        step: z.number(),
        action: z.string(),
        owner: z.string(),
        estimatedTime: z.string(),
        dependencies: z.array(z.number()).optional()
    })),
    stakeholders: z.array(z.string()),
    successCriteria: z.array(z.string())
});

// Audit Pack Schema
export const AuditPackSchema = z.object({
    executiveSummary: z.string(),
    keyFindings: z.array(z.string()),
    riskPosture: z.string(),
    recommendations: z.array(z.string()),
    complianceStatus: z.record(z.string(), z.string()) // e.g., "ISO27001": "80%"
});

// Generated Report Schema
export const GeneratedReportSchema = z.object({
    controls: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        controlType: z.enum(['preventive', 'detective', 'corrective', 'directive']).optional(),
    })).optional(),
    risks: z.array(z.object({
        category: z.string().optional(),
        narrative: z.string().optional(),
        likelihood: z.number().optional(),
        impact: z.number().optional()
    })).optional(),
    vendors: z.array(z.object({
        name: z.string(),
        category: z.string().optional(),
        services: z.string().optional(),
        riskScore: z.number().optional()
    })).optional(),
    incidents: z.array(z.object({
        title: z.string(),
        description: z.string().optional(),
        severity: z.string().optional(),
        status: z.string().optional()
    })).optional()
});
