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
        throw new Error(`[LLM Service] Critical Configuration Error: No API key found for provider '${provider}'. Real AI operations cannot proceed.`);
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
        throw error;
    }
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
