import { LLMConfig } from '@/types';

// Check if we have a valid DATABASE_URL at module load time
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

/**
 * Helper to get the first available API key and its provider
 */
function getEnvFallback(): LLMConfig | null {
    if (process.env.DEEPSEEK_API_KEY) return { provider: 'deepseek', apiKey: process.env.DEEPSEEK_API_KEY };
    if (process.env.OPENAI_API_KEY) return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
    if (process.env.GITHUB_TOKEN) return { provider: 'github', apiKey: process.env.GITHUB_TOKEN };
    return null;
}

/**
 * Resolves the LLM Configuration for a given user context.
 */
export async function getLLMConfig(userId: string): Promise<LLMConfig | null> {
    try {
        // Skip database access if no valid connection string
        if (!hasValidDb) {
            return getEnvFallback();
        }

        // Dynamic import to avoid initialization errors
        const { prisma } = await import('@/lib/prisma');

        // 1. Get User Role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        });

        if (!user) {
            return getEnvFallback();
        }

        // 2. If Admin, try personal config
        if (user.role === 'admin') {
            const personalConfig = await prisma.systemSetting.findUnique({
                where: {
                    userId_key: {
                        userId: user.id,
                        key: 'llm_config'
                    }
                }
            });
            if (personalConfig) {
                return JSON.parse(personalConfig.value) as LLMConfig;
            }
        }

        // 3. Global Fallback
        const globalConfig = await prisma.systemSetting.findFirst({
            where: {
                key: 'llm_config',
                user: { role: 'admin' }
            }
        });

        if (globalConfig) {
            return JSON.parse(globalConfig.value) as LLMConfig;
        }

        // 4. Final Env Fallback
        return getEnvFallback();

    } catch (error) {
        console.error("Error resolving LLM config:", error);
        return getEnvFallback();
    }
}
