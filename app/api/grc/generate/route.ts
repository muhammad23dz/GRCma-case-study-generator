import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { grcLLM } from '@/lib/llm/grc-service';
import { LLMConfig } from '@/types';

export const dynamic = 'force-dynamic';

/**
 * Get LLM config from environment variables (database-independent)
 */
function getEnvLLMConfig(): LLMConfig | null {
    if (process.env.DEEPSEEK_API_KEY) {
        return { provider: 'deepseek', apiKey: process.env.DEEPSEEK_API_KEY };
    }
    if (process.env.OPENAI_API_KEY) {
        return { provider: 'openai', apiKey: process.env.OPENAI_API_KEY };
    }
    if (process.env.GITHUB_TOKEN) {
        return { provider: 'github', apiKey: process.env.GITHUB_TOKEN };
    }
    return null;
}

// POST /api/grc/generate - AI-powered assessment generation
export async function POST(request: NextRequest) {
    console.log('[GRC Generate] Starting assessment generation...');

    try {
        // Step 1: Authenticate via Clerk directly (no database required)
        console.log('[GRC Generate] Step 1: Authenticating via Clerk...');
        const { userId: clerkId } = await auth();

        if (!clerkId) {
            console.error('[GRC Generate] Step 1 FAILED: Not authenticated');
            return NextResponse.json({
                error: 'Please sign in to generate assessments.',
                code: 'AUTH_REQUIRED'
            }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress || 'unknown';
        console.log('[GRC Generate] Step 1 SUCCESS: Authenticated as', userEmail);

        // Step 2: Parse request body
        console.log('[GRC Generate] Step 2: Parsing request body...');
        let body: any;
        try {
            body = await request.json();
        } catch (parseErr) {
            return NextResponse.json({
                error: 'Invalid request body. Please provide valid JSON.',
                code: 'INVALID_REQUEST'
            }, { status: 400 });
        }

        const input = {
            companyName: body.companyName || 'Your Company',
            companySize: body.companySize || 'Medium',
            keyChallenge: body.keyChallenge || 'General compliance',
            targetFramework: body.targetFramework || 'ISO 27001',
            industry: body.industry || 'Technology',
            riskAppetite: 'Balanced'
        };
        console.log('[GRC Generate] Step 2 SUCCESS: Input built for', input.companyName);

        // Step 3: Get LLM config (environment-first, database-optional)
        console.log('[GRC Generate] Step 3: Resolving LLM configuration...');
        let llmConfig = getEnvLLMConfig();

        // Try database config only if env config not found
        if (!llmConfig) {
            try {
                const { getLLMConfig } = await import('@/lib/llm-config');
                llmConfig = await getLLMConfig(clerkId);
            } catch (dbError) {
                console.warn('[GRC Generate] Step 3: DB config lookup failed, continuing with env:', dbError);
            }
        }

        if (!llmConfig?.apiKey) {
            console.error('[GRC Generate] Step 3 FAILED: No LLM API key configured');
            return NextResponse.json({
                error: 'AI service is not configured. Please contact the administrator to set up DEEPSEEK_API_KEY, OPENAI_API_KEY, or GITHUB_TOKEN.',
                code: 'LLM_NOT_CONFIGURED'
            }, { status: 503 });
        }
        console.log('[GRC Generate] Step 3 SUCCESS: Using provider', llmConfig.provider);

        // Step 4: Generate the report (database-optional)
        console.log('[GRC Generate] Step 4: Calling AI service...');

        const promptText = `You are a Senior GRC (Governance, Risk, and Compliance) Auditor with 20+ years of experience.
        
CRITICAL CONTEXT:
- Company: "${input.companyName}"
- Industry: "${input.industry}"
- Company Size: "${input.companySize}"
- Target Framework: "${input.targetFramework}"
- Key Challenge: "${input.keyChallenge}"

Generate a comprehensive GRC assessment. Respond ONLY with a valid JSON object containing:
{
  "executiveSummary": "2-3 paragraph overview",
  "complianceMetrics": { "overallScore": 0-100, "gaps": number, "controlsImplemented": number },
  "controls": [{ "title": "string", "description": "string", "status": "implemented|partial|missing", "controlType": "preventive|detective|corrective" }],
  "risks": [{ "title": "string", "description": "string", "likelihood": 1-5, "impact": 1-5, "category": "operational|security|compliance|financial" }],
  "gaps": [{ "title": "string", "description": "string", "severity": "low|medium|high|critical", "remediation": "string" }],
  "policies": [{ "title": "string", "description": "string", "status": "draft|review|approved" }],
  "vendors": [{ "name": "string", "category": "string", "riskLevel": "low|medium|high" }],
  "incidents": [{ "title": "string", "description": "string", "severity": "low|medium|high|critical", "status": "open|investigating|resolved" }]
}

Provide:
- 6-8 controls
- 4-5 risks  
- 3 vendors
- 2 incidents
- 2-3 gaps
- 3-4 policies

Respond ONLY with the JSON object, no markdown.`;

        const result = await grcLLM.generateReport(promptText, llmConfig);
        console.log('[GRC Generate] Step 4 SUCCESS: AI generated response');

        // Step 5: Build response (skip database operations in case of failure)
        const report = {
            id: crypto.randomUUID(),
            sections: result.data,
            timestamp: new Date().toISOString(),
            generatedBy: userEmail,
            input: {
                companyName: input.companyName,
                targetFramework: input.targetFramework
            }
        };

        // Optional: Try to persist to database, but don't fail if it errors
        try {
            const { prisma } = await import('@/lib/prisma');
            await prisma.lLMUsage.create({
                data: {
                    userId: clerkId,
                    model: result.provenance?.model || 'unknown',
                    tokensIn: result.usage?.prompt_tokens || 0,
                    tokensOut: result.usage?.completion_tokens || 0,
                    cost: 0,
                    feature: 'report_generation'
                }
            });
            console.log('[GRC Generate] Optional: Usage logged to database');
        } catch (persistErr) {
            console.warn('[GRC Generate] Optional: Could not persist to database, continuing:', persistErr);
        }

        console.log('[GRC Generate] SUCCESS: Assessment generated with ID:', report.id);
        return NextResponse.json(report);

    } catch (error: any) {
        console.error('[GRC Generate] FATAL ERROR:', error);

        // Determine error type for user-friendly message
        const errorMsg = error.message || String(error);
        let userMessage = 'An unexpected error occurred. Please try again.';
        let errorCode = 'GENERATION_FAILED';
        let status = 500;

        if (errorMsg.includes('parse') || errorMsg.includes('JSON')) {
            userMessage = 'AI generated an invalid response. Please try again.';
            errorCode = 'AI_PARSE_ERROR';
            status = 502;
        } else if (errorMsg.includes('timeout') || errorMsg.includes('ETIMEDOUT') || errorMsg.includes('ECONNREFUSED')) {
            userMessage = 'AI service is temporarily unavailable. Please try again in a moment.';
            errorCode = 'AI_TIMEOUT';
            status = 504;
        } else if (errorMsg.includes('rate') || errorMsg.includes('429')) {
            userMessage = 'AI service is rate limited. Please wait a moment and try again.';
            errorCode = 'RATE_LIMITED';
            status = 429;
        } else if (errorMsg.includes('API key') || errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
            userMessage = 'AI service authentication failed. Please contact the administrator.';
            errorCode = 'AI_AUTH_FAILED';
            status = 503;
        }

        return NextResponse.json({ error: userMessage, code: errorCode }, { status });
    }
}
