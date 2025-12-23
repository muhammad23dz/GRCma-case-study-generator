/**
 * LLM Service - Simple wrapper for AI queries
 * Bridges the GRC Intelligence module with the existing GRC LLM Service
 */

import { grcLLM } from './grc-service';

/**
 * Simple query function for AI prompts
 * @param prompt - The user prompt
 * @param systemPrompt - Optional system prompt for context
 * @returns The AI response as a string
 */
export async function query(prompt: string, systemPrompt?: string): Promise<string> {
    try {
        // Build a combined prompt with system context
        const fullPrompt = systemPrompt
            ? `${systemPrompt}\n\n${prompt}`
            : prompt;

        // Use the existing GRC LLM service's generateReport method
        // which accepts arbitrary prompts and returns structured data
        const response = await grcLLM.generateReport(fullPrompt);

        // Return the raw JSON string for parsing by the caller
        return JSON.stringify(response.data);
    } catch (error: any) {
        console.error('[LLM Query Error]:', error.message);

        // Return a fallback response that indicates the error
        // The calling function should handle this gracefully
        throw new Error(`AI query failed: ${error.message}`);
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
    return JSON.parse(response);
}

/**
 * Check if LLM service is available
 */
export function isLLMAvailable(): boolean {
    const hasApiKey = !!(
        process.env.DEEPSEEK_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.GITHUB_TOKEN
    );
    return hasApiKey;
}

/**
 * Get the current LLM provider name
 */
export function getCurrentProvider(): string {
    return process.env.LLM_PROVIDER || 'github';
}
