/**
 * GRC Engineering AI Service
 * AI-powered intelligent GRC automation
 * HARDENED: Removed demo fallbacks, strictly relies on LLM service.
 */

import { query } from '@/lib/llm/llm-service';
import {
    EntityType,
    RiskScoringRequest,
    RiskScoringResponse,
    CategorizationRequest,
    CategorizationResponse,
    SmartSearchRequest,
    SmartSearchResponse,
    PolicyDraftRequest,
    PolicyDraftResponse,
    ControlSuggestionRequest,
    ControlSuggestionResponse,
    IncidentAnalysisRequest,
    IncidentAnalysisResponse,
    GapAnalysisRequest,
    GapAnalysisResponse,
    CATEGORY_MAPPINGS,
} from './types';

// ============================================
// System Prompts
// ============================================

const GRC_EXPERT_PROMPT = `You are a GRC (Governance, Risk, and Compliance) expert assistant with deep knowledge of:
- ISO 27001, SOC 2, NIST CSF, GDPR, HIPAA, PCI-DSS, Law 09-08
- Risk assessment methodologies (ISO 31000, FAIR, OCTAVE)
- Security control frameworks and best practices
- Policy development and compliance management

You provide structured, actionable assessments based on industry standards.
Always respond with valid JSON matching the requested schema exactly.`;

const RISK_ANALYST_PROMPT = `You are a senior risk analyst specializing in information security and operational risk.
You assess risks using quantitative methods (likelihood x impact matrix) and provide clear rationale.
Consider industry context, existing controls, and business impact in your assessments.
Always respond with valid JSON.`;

const POLICY_WRITER_PROMPT = `You are an expert policy writer for information security and compliance.
You create professional, comprehensive policy documents that:
- Meet regulatory requirements (ISO 27001, SOC 2, NIST, GDPR)
- Are clear and actionable
- Follow best practices for enterprise policy management
Always respond with valid JSON.`;

// ============================================
// Risk Scoring
// ============================================

export async function analyzeRisk(request: RiskScoringRequest): Promise<RiskScoringResponse> {
    const prompt = `Analyze the following risk and provide a detailed assessment:

**Risk Title:** ${request.title}
**Risk Description:** ${request.description}
${request.category ? `**Category:** ${request.category}` : ''}
${request.affectedAssets?.length ? `**Affected Assets:** ${request.affectedAssets.join(', ')}` : ''}
${request.existingControls?.length ? `**Existing Controls:** ${request.existingControls.join(', ')}` : ''}
${request.industryContext ? `**Industry Context:** ${request.industryContext}` : ''}

Provide a structured risk assessment. Respond with this exact JSON format:
{
  "likelihood": <number 1-5>,
  "impact": <number 1-5>,
  "riskScore": <likelihood * impact>,
  "riskLevel": "<Low|Medium|High|Critical>",
  "likelihoodRationale": "<detailed explanation>",
  "impactRationale": "<detailed explanation>",
  "suggestedCategory": "<category>",
  "recommendedControls": ["<control 1>", "<control 2>", ...],
  "confidence": <number 0-100>
}

Scoring Guide:
- Likelihood: 1=Rare, 2=Unlikely, 3=Possible, 4=Likely, 5=Almost Certain
- Impact: 1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Severe
- Risk Level: 1-4=Low, 5-9=Medium, 10-16=High, 17-25=Critical`;

    const response = await query(prompt, RISK_ANALYST_PROMPT);
    const parsed = JSON.parse(extractJSON(response));

    // Ensure calculated fields are correct
    parsed.riskScore = parsed.likelihood * parsed.impact;
    parsed.riskLevel = calculateRiskLevel(parsed.riskScore);

    return parsed;
}

// ============================================
// Auto-Categorization
// ============================================

export async function categorizeEntity(request: CategorizationRequest): Promise<CategorizationResponse> {
    const categories = CATEGORY_MAPPINGS[request.entityType] || [];

    const prompt = `Categorize the following ${request.entityType}:

**Title:** ${request.title}
**Description:** ${request.description}
${request.additionalContext ? `**Additional Context:** ${request.additionalContext}` : ''}

Available categories for ${request.entityType}:
${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Respond with this exact JSON format:
{
  "primaryCategory": "<most appropriate category from list>",
  "subcategory": "<specific subcategory if applicable>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "relatedFrameworks": ["<framework1>", "<framework2>"],
  "confidence": <number 0-100>,
  "explanation": "<why this categorization>"
}`;

    const response = await query(prompt, GRC_EXPERT_PROMPT);
    return JSON.parse(extractJSON(response));
}

// ============================================
// Smart Search
// ============================================

export async function smartSearch(
    request: SmartSearchRequest,
    searchData: Record<string, Array<{ id: string; title: string; description: string }>>
): Promise<SmartSearchResponse> {
    const limit = request.limit || 10;

    const prompt = `You are a GRC search assistant. Find the most relevant items for this query:

**User Query:** "${request.query}"

**Available Data:**
${JSON.stringify(searchData, null, 2)}

Find the ${limit} most relevant items. Consider:
- Semantic meaning (what the user is really looking for)
- Direct keyword matches
- Related concepts in GRC context

Respond with this exact JSON format:
{
  "results": [
    {
      "entityType": "<CONTROL|RISK|POLICY|EVIDENCE|VENDOR>",
      "id": "<id from data>",
      "title": "<title from data>",
      "relevance": <number 0-100>,
      "snippet": "<brief excerpt showing relevance>",
      "explanation": "<why this is relevant>"
    }
  ],
  "interpretation": "<how you interpreted the query>",
  "suggestedRefinements": ["<refinement 1>", "<refinement 2>"],
  "totalMatches": <number of results>
}`;

    const response = await query(prompt, GRC_EXPERT_PROMPT);
    return JSON.parse(extractJSON(response));
}

// ============================================
// Policy Drafting
// ============================================

export async function draftPolicy(request: PolicyDraftRequest): Promise<PolicyDraftResponse> {
    const prompt = `Draft a comprehensive ${request.policyType} for ${request.organizationName}.

${request.industry ? `**Industry:** ${request.industry}` : ''}
${request.frameworks?.length ? `**Compliance Frameworks:** ${request.frameworks.join(', ')}` : ''}
${request.requirements?.length ? `**Specific Requirements:**\n${request.requirements.map(r => `- ${r}`).join('\n')}` : ''}
${request.additionalContext ? `**Additional Context:** ${request.additionalContext}` : ''}
**Tone:** ${request.tone || 'professional'}

Create a complete policy with all standard sections. Respond with this exact JSON format:
{
  "title": "<Full Policy Title>",
  "content": "<Complete policy content in markdown format with sections>",
  "sections": [
    {"title": "Purpose", "content": "<section content>", "order": 1},
    {"title": "Scope", "content": "<section content>", "order": 2},
    {"title": "Policy Statements", "content": "<section content>", "order": 3},
    {"title": "Roles and Responsibilities", "content": "<section content>", "order": 4},
    {"title": "Compliance", "content": "<section content>", "order": 5},
    {"title": "Review and Updates", "content": "<section content>", "order": 6}
  ],
  "frameworksCovered": ["<framework1>", "<framework2>"],
  "suggestedReviewSchedule": "<e.g., Annual or Semi-annual>",
  "relatedPolicies": ["<related policy 1>", "<related policy 2>"]
}`;

    const response = await query(prompt, POLICY_WRITER_PROMPT);
    return JSON.parse(extractJSON(response));
}

// ============================================
// Control Suggestions
// ============================================

export async function suggestControls(request: ControlSuggestionRequest): Promise<ControlSuggestionResponse> {
    let context = '';
    if (request.riskDescription) context += `**Risk to Mitigate:** ${request.riskDescription}\n`;
    if (request.framework) context += `**Target Framework:** ${request.framework}\n`;
    if (request.frameworkRequirement) context += `**Requirement:** ${request.frameworkRequirement}\n`;
    if (request.existingControls?.length) context += `**Existing Controls:** ${request.existingControls.join(', ')}\n`;
    if (request.organizationContext) context += `**Organization Context:** ${request.organizationContext}\n`;

    const prompt = `Suggest security controls based on the following context:

${context}

Provide 5-10 recommended controls. Respond with this exact JSON format:
{
  "controls": [
    {
      "title": "<Control Title>",
      "description": "<Detailed description>",
      "category": "<Access Control|Asset Management|Business Continuity|etc>",
      "controlType": "<preventive|detective|corrective|directive>",
      "implementationGuidance": "<Step-by-step guidance>",
      "effortEstimate": "<Low|Medium|High>",
      "effectivenessRating": <1-5>,
      "frameworkMappings": ["<framework requirement>"],
      "priority": <1-10>
    }
  ],
  "gapAnalysis": "<Summary of gaps addressed>",
  "implementationRoadmap": "<Suggested implementation order>",
  "totalEffortEstimate": "<Overall effort estimate>"
}`;

    const response = await query(prompt, GRC_EXPERT_PROMPT);
    const parsed = JSON.parse(extractJSON(response));

    // Sort by priority
    if (parsed.controls) {
        parsed.controls.sort((a: any, b: any) => a.priority - b.priority);
    }

    return parsed;
}

// ============================================
// Incident Analysis
// ============================================

export async function analyzeIncident(request: IncidentAnalysisRequest): Promise<IncidentAnalysisResponse> {
    const prompt = `Analyze the following security incident:

**Title:** ${request.title}
**Description:** ${request.description}
${request.severity ? `**Severity:** ${request.severity}` : ''}
${request.affectedSystems?.length ? `**Affected Systems:** ${request.affectedSystems.join(', ')}` : ''}

Provide a comprehensive incident analysis. Respond with this exact JSON format:
{
  "rootCauseAnalysis": "<Detailed root cause analysis>",
  "impactAssessment": "<Assessment of business impact>",
  "containmentSteps": ["<step1>", "<step2>"],
  "remediationSteps": ["<step1>", "<step2>"],
  "preventiveControls": ["<control1>", "<control2>"],
  "lessonsLearned": ["<lesson1>", "<lesson2>"],
  "estimatedRecoveryTime": "<Time estimate>"
}`;

    const response = await query(prompt, GRC_EXPERT_PROMPT);
    return JSON.parse(extractJSON(response));
}

// ============================================
// Compliance Gap Analysis
// ============================================

export async function analyzeComplianceGaps(request: GapAnalysisRequest): Promise<GapAnalysisResponse> {
    const prompt = `Perform a compliance gap analysis:

**Target Framework:** ${request.framework}
**Current Controls:** ${request.currentControls.join(', ')}
${request.organizationContext ? `**Organization Context:** ${request.organizationContext}` : ''}

Analyze gaps against the framework requirements. Respond with this exact JSON format:
{
  "overallComplianceScore": <0-100>,
  "gaps": [
    {
      "requirement": "<Framework requirement description>",
      "requirementId": "<e.g., A.5.1.1>",
      "currentState": "<Not Implemented|Partially Implemented|Implemented>",
      "gap": "<Description of the gap>",
      "recommendedAction": "<Action to close the gap>",
      "priority": "<Critical|High|Medium|Low>",
      "effortEstimate": "<Time/effort estimate>"
    }
  ],
  "prioritizedRoadmap": "<Implementation roadmap>",
  "quickWins": ["<quick win 1>", "<quick win 2>"],
  "estimatedTimeToCompliance": "<Overall estimate>"
}`;

    const response = await query(prompt, GRC_EXPERT_PROMPT);
    return JSON.parse(extractJSON(response));
}

// ============================================
// Helpers
// ============================================

function calculateRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
    if (score <= 4) return 'Low';
    if (score <= 9) return 'Medium';
    if (score <= 16) return 'High';
    return 'Critical';
}

function extractJSON(text: string): string {
    // Try to extract JSON from markdown code blocks or raw text
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
        return jsonMatch[1].trim();
    }

    // Try to find raw JSON object
    const objMatch = text.match(/\{[\s\S]*\}/);
    if (objMatch) {
        return objMatch[0];
    }

    return text;
}
