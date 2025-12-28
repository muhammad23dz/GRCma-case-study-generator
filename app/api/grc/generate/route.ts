import { NextRequest, NextResponse } from 'next/server';
import { generateReportService } from '@/lib/services/report-generator';
import { getLLMConfig } from '@/lib/llm-config';
import { safeError } from '@/lib/security';

export const dynamic = 'force-dynamic';

// POST /api/grc/generate - AI-powered assessment generation
export async function POST(request: NextRequest) {
    console.log('[GRC Generate] Starting assessment generation...');

    try {
        // Step 1: Resolve isolation context
        console.log('[GRC Generate] Step 1: Resolving isolation context...');
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();

        if (!context) {
            console.error('[GRC Generate] Step 1 FAILED: No isolation context');
            return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
        }
        console.log('[GRC Generate] Step 1 SUCCESS: Context resolved for user:', context.userId);

        const userId = context.userId;

        // Step 2: Parse request body
        console.log('[GRC Generate] Step 2: Parsing request body...');
        const body = await request.json();
        console.log('[GRC Generate] Step 2 SUCCESS: Body parsed -', {
            companyName: body.companyName,
            framework: body.targetFramework
        });

        // Step 3: Get risk appetite setting
        console.log('[GRC Generate] Step 3: Fetching risk appetite setting...');
        let riskAppetite = 'Balanced';
        try {
            const { prisma } = await import('@/lib/prisma');
            const riskSetting = await prisma.systemSetting.findUnique({
                where: { userId_key: { userId, key: 'compliance_riskAppetite' } }
            });
            if (riskSetting?.value) {
                riskAppetite = riskSetting.value;
            }
            console.log('[GRC Generate] Step 3 SUCCESS: Risk appetite =', riskAppetite);
        } catch (dbError) {
            console.warn('[GRC Generate] Step 3 WARNING: Could not fetch risk appetite, using default:', dbError);
        }

        // Step 4: Build input
        const input = {
            companyName: body.companyName || 'Your Company',
            companySize: body.companySize || 'Medium',
            keyChallenge: body.keyChallenge || 'General compliance',
            targetFramework: body.targetFramework || 'ISO 27001',
            industry: body.industry || 'Technology',
            riskAppetite
        };
        console.log('[GRC Generate] Step 4: Input built successfully');

        // Step 5: Resolve LLM configuration
        console.log('[GRC Generate] Step 5: Resolving LLM configuration...');
        const llmConfig = await getLLMConfig(userId);
        console.log('[GRC Generate] Step 5 RESULT: LLM Config -', {
            provider: llmConfig?.provider || 'none',
            hasApiKey: !!llmConfig?.apiKey
        });

        if (!llmConfig?.apiKey) {
            console.error('[GRC Generate] Step 5 FAILED: No LLM API key available');
            return NextResponse.json({
                error: 'AI service not configured. Please set DEEPSEEK_API_KEY, OPENAI_API_KEY, or GITHUB_TOKEN environment variable.',
                code: 'LLM_SERVICE_UNAVAILABLE'
            }, { status: 503 });
        }

        // Step 6: Generate report
        console.log('[GRC Generate] Step 6: Calling generateReportService...');
        const report = await generateReportService(input, context, llmConfig);
        console.log('[GRC Generate] Step 6 SUCCESS: Report generated with ID:', report.id);

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('[GRC Generate] FATAL ERROR:', error.message || error);
        const { message, status, code } = safeError(error, 'AI Generation API');
        return NextResponse.json({ error: message, code }, { status });
    }
}
