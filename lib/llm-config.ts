import { prisma } from '@/lib/prisma';
import { LLMConfig } from '@/types';

/**
 * Resolves the LLM Configuration for a given user context.
 * 
 * Logic:
 * 1. Checks if the user is an Admin. If so, tries to load their personal 'llm_config' system setting.
 * 2. If not admin or no personal setting, tries to load the global 'llm_config' (owned by any admin).
 * 3. Fallback to Environment Variables (DEEPSEEK_API_KEY).
 */
export async function getLLMConfig(userId: string): Promise<LLMConfig | null> {
    try {
        // 1. Get User Role
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        });

        if (!user) return null;

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

        // 3. Global Fallback (Find ANY admin's config - usually the first one or a specific 'system' admin)
        // Ideally we'd have a 'GLOBAL' scope, but for now we look for the first valid config.
        const globalConfig = await prisma.systemSetting.findFirst({
            where: {
                key: 'llm_config',
                user: { role: 'admin' }
            }
        });

        if (globalConfig) {
            return JSON.parse(globalConfig.value) as LLMConfig;
        }

        // 4. Env Fallback
        if (process.env.DEEPSEEK_API_KEY) {
            return {
                provider: 'deepseek',
                apiKey: process.env.DEEPSEEK_API_KEY
            };
        }

        return null;

    } catch (error) {
        console.error("Error resolving LLM config:", error);
        return null;
    }
}
