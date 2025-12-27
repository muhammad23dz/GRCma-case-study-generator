/**
 * LLM Service - Simple wrapper for AI queries
 * Bridges the GRC Intelligence module with the existing GRC LLM Service
 */

import OpenAI from 'openai';

const PROVIDER_URLS: Record<string, string> = {
    'openai': 'https://api.openai.com/v1',
    'deepseek': 'https://api.deepseek.com',
    'github': 'https://models.inference.ai.azure.com'
};

const PROVIDER_MODELS: Record<string, string> = {
    'openai': 'gpt-4o-mini',
    'deepseek': 'deepseek-chat',
    'github': 'gpt-4o-mini'
};

/**
 * Get the configured API key based on provider
 */
function getApiKey(provider: string): string {
    switch (provider) {
        case 'deepseek':
            return process.env.DEEPSEEK_API_KEY || '';
        case 'openai':
            return process.env.OPENAI_API_KEY || '';
        case 'github':
            return process.env.GITHUB_TOKEN || '';
        default:
            return process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || process.env.GITHUB_TOKEN || '';
    }
}

/**
 * Auto-detect the best available provider
 */
function detectProvider(): string {
    // If explicitly set, use that
    if (process.env.LLM_PROVIDER) {
        return process.env.LLM_PROVIDER;
    }
    // Auto-detect based on available keys
    if (process.env.DEEPSEEK_API_KEY) return 'deepseek';
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.GITHUB_TOKEN) return 'github';
    return 'github'; // Default to github as fallback
}

/**
 * Simple query function for AI prompts
 * @param prompt - The user prompt
 * @param systemPrompt - Optional system prompt for context
 * @returns The AI response as a string
 */
export async function query(prompt: string, systemPrompt?: string): Promise<string> {
    const provider = detectProvider();
    const apiKey = getApiKey(provider);
    const baseURL = PROVIDER_URLS[provider] || PROVIDER_URLS['github'];
    const model = PROVIDER_MODELS[provider] || 'gpt-4o-mini';

    if (!apiKey) {
        console.warn(`[LLM Service] No API key found for provider '${provider}', returning demo response`);
        // Return a demo JSON response based on what's being asked
        return generateDemoResponse(prompt);
    }

    console.log(`[LLM Service] Query - Provider: ${provider}, Model: ${model}`);

    try {
        const openai = new OpenAI({
            baseURL,
            apiKey,
        });

        const messages: any[] = [];

        if (systemPrompt) {
            messages.push({
                role: 'system',
                content: systemPrompt
            });
        }

        messages.push({
            role: 'user',
            content: prompt
        });

        const completion = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.3,
            max_tokens: 4000,
        });

        const content = completion.choices[0]?.message?.content || '{}';
        console.log(`[LLM Service] Response received: ${content.substring(0, 100)}...`);

        return content;
    } catch (error: any) {
        console.error('[LLM Service] API Error:', error.message);
        // Return demo response on error instead of throwing
        return generateDemoResponse(prompt);
    }
}

/**
 * Generate demo AI responses when API is unavailable
 */
function generateDemoResponse(prompt: string): string {
    // Detect what type of response is needed based on prompt content
    const promptLower = prompt.toLowerCase();

    if (promptLower.includes('risk') && promptLower.includes('analyze')) {
        return JSON.stringify({
            likelihood: 3,
            impact: 4,
            riskScore: 12,
            riskLevel: 'High',
            likelihoodRationale: 'Based on industry patterns and current threat landscape, this type of risk has a moderate to high probability of occurrence.',
            impactRationale: 'If realized, this risk could significantly impact operations, data integrity, and regulatory standing.',
            suggestedCategory: 'Security',
            recommendedControls: [
                'Implement continuous monitoring and alerting',
                'Deploy multi-factor authentication',
                'Establish incident response procedures',
                'Conduct regular security awareness training'
            ],
            confidence: 85
        });
    }

    if (promptLower.includes('control') && promptLower.includes('suggest')) {
        return JSON.stringify({
            controls: [
                {
                    title: 'Access Control Policy',
                    description: 'Implement role-based access control to ensure users only have access to resources necessary for their job functions.',
                    category: 'Access Control',
                    controlType: 'preventive',
                    implementationGuidance: '1. Define roles 2. Map permissions 3. Implement RBAC system 4. Regular access reviews',
                    effortEstimate: 'Medium',
                    effectivenessRating: 4,
                    frameworkMappings: ['ISO 27001 A.9.2', 'SOC 2 CC6.1'],
                    priority: 1
                },
                {
                    title: 'Security Monitoring',
                    description: 'Deploy SIEM solution for real-time security event monitoring and alerting.',
                    category: 'Detection',
                    controlType: 'detective',
                    implementationGuidance: '1. Deploy SIEM 2. Configure log sources 3. Define alert rules 4. Establish response procedures',
                    effortEstimate: 'High',
                    effectivenessRating: 5,
                    frameworkMappings: ['ISO 27001 A.12.4', 'NIST CSF DE.CM'],
                    priority: 2
                }
            ],
            gapAnalysis: 'Current controls may lack comprehensive monitoring and access management capabilities.',
            implementationRoadmap: 'Phase 1: Access Control (Month 1-2), Phase 2: Monitoring (Month 3-4), Phase 3: Training (Month 5)',
            totalEffortEstimate: '4-6 months'
        });
    }

    if (promptLower.includes('policy') && promptLower.includes('draft')) {
        return JSON.stringify({
            title: 'Information Security Policy',
            content: `# Information Security Policy

## 1. Purpose
This policy establishes the framework for protecting organizational information assets.

## 2. Scope
This policy applies to all employees, contractors, and third parties with access to organizational systems.

## 3. Policy Statements
- All information must be classified according to sensitivity
- Access to information is granted on a need-to-know basis
- Security incidents must be reported immediately
- Regular security assessments will be conducted

## 4. Roles and Responsibilities
- CISO: Overall security governance
- IT Security: Implementation and monitoring
- All employees: Compliance with policy

## 5. Compliance
Non-compliance may result in disciplinary action.

## 6. Review
This policy will be reviewed annually.`,
            sections: [
                { title: 'Purpose', content: 'Establishes framework for protecting information assets', order: 1 },
                { title: 'Scope', content: 'All employees and third parties', order: 2 },
                { title: 'Policy Statements', content: 'Core security requirements', order: 3 }
            ],
            frameworksCovered: ['ISO 27001', 'SOC 2'],
            suggestedReviewSchedule: 'Annual',
            relatedPolicies: ['Access Control Policy', 'Incident Response Policy']
        });
    }

    if (promptLower.includes('gap') && promptLower.includes('compliance')) {
        return JSON.stringify({
            overallComplianceScore: 68,
            gaps: [
                {
                    requirement: 'Information security policies shall be approved by management',
                    requirementId: 'A.5.1.1',
                    currentState: 'Partially Implemented',
                    gap: 'Policies exist but formal approval process needs documentation',
                    recommendedAction: 'Establish formal policy approval workflow with management sign-off',
                    priority: 'High',
                    effortEstimate: '2 weeks'
                },
                {
                    requirement: 'Access rights shall be reviewed at regular intervals',
                    requirementId: 'A.9.2.5',
                    currentState: 'Not Implemented',
                    gap: 'No formal access review process exists',
                    recommendedAction: 'Implement quarterly access review process with logging',
                    priority: 'Critical',
                    effortEstimate: '4 weeks'
                }
            ],
            prioritizedRoadmap: 'Address Critical gaps first, then High priority items within 90 days',
            quickWins: ['Document existing controls', 'Enable audit logging', 'Review admin access'],
            estimatedTimeToCompliance: '6-9 months'
        });
    }

    // Default fallback
    return JSON.stringify({
        message: 'AI analysis completed',
        recommendation: 'Please configure an AI provider (DEEPSEEK_API_KEY, OPENAI_API_KEY, or GITHUB_TOKEN) for full AI-powered analysis.',
        isDemo: true
    });
}

/**
 * Query with structured output (JSON)
 * @param prompt - The user prompt
 * @param systemPrompt - Optional system prompt
 * @returns Parsed JSON response
 */
export async function queryJSON<T>(prompt: string, systemPrompt?: string): Promise<T> {
    const response = await query(prompt, systemPrompt);

    // Extract JSON from the response
    let jsonStr = response;

    // Try to extract from code blocks
    const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        jsonStr = codeBlockMatch[1].trim();
    } else {
        // Try to find raw JSON object
        const objMatch = response.match(/\{[\s\S]*\}/);
        if (objMatch) {
            jsonStr = objMatch[0];
        }
    }

    return JSON.parse(jsonStr);
}

/**
 * Check if LLM service is available
 */
export function isLLMAvailable(): boolean {
    const provider = detectProvider();
    return !!getApiKey(provider);
}

/**
 * Get the current LLM provider name
 */
export function getCurrentProvider(): string {
    return detectProvider();
}
