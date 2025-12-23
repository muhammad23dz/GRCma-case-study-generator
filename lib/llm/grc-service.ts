import OpenAI from 'openai';
import crypto from 'crypto';
import { LLMResponse, LLMProvenance, LLMConfig } from '@/types';
import { ZodSchema } from 'zod';
import {
  ControlNormalizationSchema,
  RiskAssessmentSchema,
  EvidenceMetadataSchema,
  VendorAssessmentSchema,
  PlaybookSchema,
  AuditPackSchema,
  GeneratedReportSchema
} from '@/lib/schemas/llm';

const PROVIDER_URLS: Record<string, string> = {
  'openai': 'https://api.openai.com/v1',
  'deepseek': 'https://api.deepseek.com',
  'anthropic': 'https://api.anthropic.com/v1',
  'google': 'https://generativelanguage.googleapis.com/v1beta/openai',
  'mistral': 'https://api.mistral.ai/v1',
  'github': 'https://models.inference.ai.azure.com'
};

const PROVIDER_MODELS: Record<string, string> = {
  'openai': 'gpt-4o-mini',
  'deepseek': 'deepseek-chat',
  'github': 'gpt-4o-mini',
  'anthropic': 'claude-3-sonnet-20240229',
  'google': 'gemini-pro',
  'mistral': 'mistral-large-latest'
};

/* 
 * GitHub Models is now the default free provider.
 * Uses GitHub PAT token for authentication.
 */

interface LLMRequest {
  prompt: string;
  schema?: ZodSchema;
  temperature?: number;
  maxTokens?: number;
}

class GRCLLMService {
  private get model(): string {
    const provider = process.env.LLM_PROVIDER || 'github';
    return PROVIDER_MODELS[provider] || 'gpt-4o-mini';
  }

  private async callLLM<T>(request: LLMRequest, config?: LLMConfig): Promise<LLMResponse<T>> {
    const temperature = request.temperature ?? 0;
    const maxTokens = request.maxTokens ?? 2000;

    // Initialize client dynamically based on provider
    const provider = config?.provider || process.env.LLM_PROVIDER || 'deepseek';

    // Select API key based on provider (prioritize matching key)
    let apiKey = config?.apiKey || '';
    if (!apiKey) {
      switch (provider) {
        case 'deepseek':
          apiKey = process.env.DEEPSEEK_API_KEY || '';
          break;
        case 'openai':
          apiKey = process.env.OPENAI_API_KEY || '';
          break;
        case 'github':
          apiKey = process.env.GITHUB_TOKEN || '';
          break;
        default:
          apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || '';
      }
    }

    const baseURL = PROVIDER_URLS[provider] || PROVIDER_URLS['deepseek'];
    const modelToUse = PROVIDER_MODELS[provider] || 'deepseek-chat';

    console.log(`[LLM Service] Provider: ${provider}, Model: ${modelToUse}, BaseURL: ${baseURL}`);
    console.log(`[LLM Service] API Key present: ${apiKey ? 'Yes (' + apiKey.substring(0, 8) + '...)' : 'NO'}`);

    if (!apiKey) {
      throw new Error(`No API key found for provider '${provider}'. Please set the appropriate env variable.`);
    }

    const openai = new OpenAI({
      baseURL,
      apiKey,
    });

    const promptHash = crypto
      .createHash('sha256')
      .update(request.prompt)
      .digest('hex')
      .substring(0, 16);

    try {
      console.log(`[LLM Service] Making API call to ${baseURL} with model ${modelToUse}...`);

      const completion = await openai.chat.completions.create({
        model: modelToUse,
        messages: [
          {
            role: 'system',
            content: `You are a GRC (Governance, Risk, and Compliance) expert assistant. 
Output ONLY valid JSON matching the requested schema. Do not include markdown formatting.
Be precise, professional, and compliance-focused.`
          },
          {
            role: 'user',
            content: request.prompt
          }
        ],
        temperature,
        max_tokens: maxTokens,
      });

      console.log(`[LLM Service] API call successful. Choices: ${completion.choices?.length || 0}`);

      const content = completion.choices[0].message.content || '{}';
      // Input Sanitization for JSON parsing
      const cleanContent = content.replace(/```json/g, '').replace(/```/g, '').trim();

      let data: T;
      try {
        const parsedJson = JSON.parse(cleanContent);

        // Zod Validation (Data Integrity Layer)
        if (request.schema) {
          data = request.schema.parse(parsedJson) as T;
        } else {
          data = parsedJson as T;
        }
      } catch (e: any) {
        throw new Error(`Failed to parse or validate LLM response: ${e.message}. Content: ${cleanContent.substring(0, 200)}`);
      }

      // Calculate confidence based on response completeness (Zod ensures structure, so high confidence if passed)
      const confidence = 0.95;

      const provenance: LLMProvenance = {
        prompt: request.prompt.substring(0, 500), // Store first 500 chars
        model: this.model,
        temperature,
        timestamp: new Date().toISOString(),
        promptHash,
      };

      const usage = completion.usage ? {
        prompt_tokens: completion.usage.prompt_tokens,
        completion_tokens: completion.usage.completion_tokens,
        total_tokens: completion.usage.total_tokens
      } : undefined;

      return { data, confidence, provenance, usage };
    } catch (error: any) {
      console.error('LLM API Error:', error);
      throw new Error(`LLM service error: ${error.message}`);
    }
  }

  // Feature 1: Control Mapping
  async normalizeControl(controlText: string, targetFrameworks: string[], config?: LLMConfig): Promise<LLMResponse<any>> {
    const prompt = `Analyze this control and normalize it into a structured format:

Control Text: "${controlText}"

Target Frameworks: ${targetFrameworks.join(', ')}

Return JSON matching this schema:
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
      schema: ControlNormalizationSchema
    }, config);
  }

  // Feature 2: Risk Assessment
  async assessRisk(context: {
    assetId?: string;
    controlId?: string;
    evidenceItems: string[];
    historicalRisk?: { likelihood: number; impact: number };
  }, config?: LLMConfig): Promise<LLMResponse<any>> {
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
      schema: RiskAssessmentSchema
    }, config);
  }

  // Feature 3: Evidence Extraction
  async extractEvidenceMetadata(documentText: string, evidenceType: string, config?: LLMConfig): Promise<LLMResponse<any>> {
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
      schema: EvidenceMetadataSchema
    }, config);
  }

  // Feature 4: Vendor Assessment
  async assessVendor(questionnaire: any, vendorName: string, config?: LLMConfig): Promise<LLMResponse<any>> {
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
      schema: VendorAssessmentSchema
    }, config);
  }

  // Feature 5: Playbook Generation
  async generatePlaybook(finding: string, severity: string, config?: LLMConfig): Promise<LLMResponse<any>> {
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
}
`;

    return this.callLLM({
      prompt,
      temperature: 0.3,
      schema: PlaybookSchema
    }, config);
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
      schema: AuditPackSchema
    });
  }

  // Feature: Report Generation (Migrated from actions.ts)
  async generateReport(prompt: string, config?: LLMConfig): Promise<LLMResponse<any>> {
    return this.callLLM({
      prompt,
      temperature: 0.7,
      maxTokens: 3000,
      schema: GeneratedReportSchema
    }, config);
  }
}

export const grcLLM = new GRCLLMService();
