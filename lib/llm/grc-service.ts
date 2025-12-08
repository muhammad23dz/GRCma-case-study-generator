import OpenAI from 'openai';
import crypto from 'crypto';
import { LLMResponse, LLMProvenance } from '@/types';

const openai = new OpenAI({
    baseURL: 'https://api.deepseek.com',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
});

interface LLMRequest {
    prompt: string;
    schema?: object;
    temperature?: number;
    maxTokens?: number;
}

class GRCLLMService {
    private model = 'deepseek-chat';

    private async callLLM<T>(request: LLMRequest): Promise<LLMResponse<T>> {
        const temperature = request.temperature ?? 0;
        const maxTokens = request.maxTokens ?? 2000;

        const promptHash = crypto
            .createHash('sha256')
            .update(request.prompt)
            .digest('hex')
            .substring(0, 16);

        try {
            const completion = await openai.chat.completions.create({
                model: this.model,
                messages: [
                    {
                        role: 'system',
                        content: 'You are a GRC (Governance, Risk, and Compliance) expert assistant. Always respond with valid JSON matching the requested schema. Be precise, professional, and compliance-focused.'
                    },
                    {
                        role: 'user',
                        content: request.prompt
                    }
                ],
                temperature,
                max_tokens: maxTokens,
            });

            const content = completion.choices[0].message.content || '{}';
            const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

            let data: T;
            try {
                data = JSON.parse(cleanContent);
            } catch (e) {
                throw new Error(`Failed to parse LLM response as JSON: ${cleanContent.substring(0, 200)}`);
            }

            // Calculate confidence based on response completeness
            const confidence = this.calculateConfidence(data, request.schema);

            const provenance: LLMProvenance = {
                prompt: request.prompt.substring(0, 500), // Store first 500 chars
                model: this.model,
                temperature,
                timestamp: new Date().toISOString(),
                promptHash,
            };

            return { data, confidence, provenance };
        } catch (error: any) {
            console.error('LLM API Error:', error);
            throw new Error(`LLM service error: ${error.message}`);
        }
    }

    private calculateConfidence(data: any, schema?: object): number {
        if (!schema) return 0.8; // Default confidence

        // Simple heuristic: check if all expected fields are present
        const schemaKeys = schema ? Object.keys(schema) : [];
        const dataKeys = Object.keys(data);
        const matchedKeys = schemaKeys.filter(key => dataKeys.includes(key));

        return Math.min(matchedKeys.length / Math.max(schemaKeys.length, 1), 1.0);
    }

    // Feature 1: Control Mapping
    async normalizeControl(controlText: string, targetFrameworks: string[]): Promise<LLMResponse<any>> {
        const prompt = `Analyze this control and normalize it into a structured format:

Control Text: "${controlText}"

Target Frameworks: ${targetFrameworks.join(', ')}

Return JSON with this exact schema:
{
  "title": "concise control title",
  "description": "detailed description",
  "controlType": "preventive|detective|corrective|directive",
  "controlRisk": "low|medium|high|critical",
  "evidenceRequirements": "what evidence is needed",
  "mappings": [
    {
      "framework": "framework name",
      "frameworkControlId": "control ID in that framework",
      "confidence": 0.0-1.0,
      "rationale": "why this mapping"
    }
  ]
}

Be precise and use industry-standard control classifications.`;

        return this.callLLM({
            prompt,
            temperature: 0,
            schema: { title: '', description: '', controlType: '', mappings: [] }
        });
    }

    // Feature 2: Risk Assessment
    async assessRisk(context: {
        assetId?: string;
        controlId?: string;
        evidenceItems: string[];
        historicalRisk?: { likelihood: number; impact: number };
    }): Promise<LLMResponse<any>> {
        const prompt = `Assess the risk based on the following context:

Asset/System: ${context.assetId || 'N/A'}
Control: ${context.controlId || 'N/A'}
Historical Risk: ${context.historicalRisk ? `Likelihood=${context.historicalRisk.likelihood}, Impact=${context.historicalRisk.impact}` : 'None'}

Recent Evidence:
${context.evidenceItems.map((e, i) => `${i + 1}. ${e}`).join('\n')}

Return JSON with this exact schema:
{
  "likelihood": 0-100,
  "impact": 0-100,
  "score": calculated as (likelihood * impact / 100),
  "category": "Low|Medium|High|Critical",
  "narrative": "2-3 sentence explanation of the risk",
  "drivers": [
    {"driver": "what's driving the risk", "weight": 0.0-1.0}
  ],
  "recommendedActions": [
    {"action": "what to do", "priority": "low|medium|high|critical"}
  ]
}

Use this scoring guide:
- Low: score 0-25
- Medium: score 26-50
- High: score 51-75
- Critical: score 76-100`;

        return this.callLLM({
            prompt,
            temperature: 0.1,
            schema: { likelihood: 0, impact: 0, score: 0, category: '', narrative: '', drivers: [], recommendedActions: [] }
        });
    }

    // Feature 3: Evidence Extraction
    async extractEvidenceMetadata(documentText: string, evidenceType: string): Promise<LLMResponse<any>> {
        const prompt = `Extract metadata from this ${evidenceType} evidence document:

Document Content:
${documentText.substring(0, 3000)}

Return JSON with this exact schema:
{
  "summary": "2-3 sentence summary of the evidence",
  "extractedData": {
    "dates": ["relevant dates found"],
    "scope": "what this evidence covers",
    "findings": ["key findings or results"],
    "compliance_status": "compliant|non-compliant|partial",
    "key_metrics": {}
  },
  "relevantControls": ["control IDs or areas this evidence supports"]
}`;

        return this.callLLM({
            prompt,
            temperature: 0,
            schema: { summary: '', extractedData: {}, relevantControls: [] }
        });
    }

    // Feature 4: Vendor Assessment
    async assessVendor(questionnaire: any, vendorName: string): Promise<LLMResponse<any>> {
        const prompt = `Analyze this vendor security questionnaire for ${vendorName}:

Questionnaire Responses:
${JSON.stringify(questionnaire, null, 2)}

Return JSON with this exact schema:
{
  "gaps": [
    {
      "area": "security area with gap",
      "severity": "low|medium|high|critical",
      "description": "what's missing or inadequate"
    }
  ],
  "rating": "pass|conditional|fail",
  "riskScore": 0-100,
  "remediationPlan": [
    {
      "step": "what needs to be done",
      "owner": "vendor|internal",
      "estimatedEffort": "time estimate",
      "priority": 1-5
    }
  ],
  "summary": "2-3 sentence overall assessment"
}`;

        return this.callLLM({
            prompt,
            temperature: 0.2,
            schema: { gaps: [], rating: '', riskScore: 0, remediationPlan: [], summary: '' }
        });
    }

    // Feature 5: Playbook Generation
    async generatePlaybook(finding: string, severity: string): Promise<LLMResponse<any>> {
        const prompt = `Generate a remediation playbook for this finding:

Finding: ${finding}
Severity: ${severity}

Return JSON with this exact schema:
{
  "title": "playbook title",
  "estimatedDuration": "total time estimate",
  "steps": [
    {
      "step": 1,
      "action": "what to do",
      "owner": "role responsible",
      "estimatedTime": "time for this step",
      "dependencies": [step numbers this depends on]
    }
  ],
  "stakeholders": ["roles that need to be involved"],
  "successCriteria": ["how to know it's done"]
}`;

        return this.callLLM({
            prompt,
            temperature: 0.3,
            schema: { title: '', estimatedDuration: '', steps: [], stakeholders: [], successCriteria: [] }
        });
    }

    // Audit Pack Generation
    async generateAuditPack(scope: {
        frameworks: string[];
        controls: any[];
        dateRange: { start: string; end: string };
    }): Promise<LLMResponse<any>> {
        const prompt = `Generate an executive audit pack summary:

Scope:
- Frameworks: ${scope.frameworks.join(', ')}
- Controls: ${scope.controls.length} controls
- Period: ${scope.dateRange.start} to ${scope.dateRange.end}

Controls Summary:
${scope.controls.slice(0, 10).map(c => `- ${c.title}: ${c.description?.substring(0, 100)}`).join('\n')}

Return JSON with this exact schema:
{
  "executiveSummary": "1-paragraph board-level summary",
  "keyFindings": ["top 3-5 findings"],
  "riskPosture": "overall risk assessment",
  "recommendations": ["top 3-5 recommendations"],
  "complianceStatus": {
    "framework": "percentage or status"
  }
}`;

        return this.callLLM({
            prompt,
            temperature: 0.2,
            maxTokens: 1500,
            schema: { executiveSummary: '', keyFindings: [], riskPosture: '', recommendations: [], complianceStatus: {} }
        });
    }
}

export const grcLLM = new GRCLLMService();
