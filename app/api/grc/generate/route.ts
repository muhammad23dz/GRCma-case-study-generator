import { NextRequest, NextResponse } from 'next/server';
import { generateReportService } from '@/lib/services/report-generator';
import { getLLMConfig } from '@/lib/llm-config';
import { safeError } from '@/lib/security';

export const dynamic = 'force-dynamic';

// POST /api/grc/generate - AI-powered assessment generation
export async function POST(request: NextRequest) {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();

        // This check is technically redundant if getIsolationContext throws, 
        // but kept for safety if it returns null (e.g. valid auth but no clerkId somehow)
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
        }

        const userId = context.userId;

        const body = await request.json();

        // Default risk appetite
        let riskAppetite = 'Balanced';

        const { prisma } = await import('@/lib/prisma');
        const riskSetting = await prisma.systemSetting.findUnique({
            where: { userId_key: { userId, key: 'compliance_riskAppetite' } }
        });
        if (riskSetting?.value) {
            riskAppetite = riskSetting.value;
        }

        // Map API request to CaseInput expected by service
        const input = {
            companyName: body.companyName,
            companySize: body.companySize,
            keyChallenge: body.keyChallenge,
            targetFramework: body.targetFramework,
            // Add defaults for required fields if missing
            industry: 'Technology',
            riskAppetite
        };

        // Resolve Config
        const llmConfig = await getLLMConfig(userId);

        if (!llmConfig?.apiKey) {
            return NextResponse.json({
                error: 'Resource unavailable: LLM SERVICE UNAVAILABLE',
                code: 'LLM_SERVICE_UNAVAILABLE'
            }, { status: 503 });
        }

        // Use the service directly
        const report = await generateReportService(input, context, llmConfig);

        return NextResponse.json(report);

    } catch (error: any) {
        const { message, status, code } = safeError(error, 'AI Generation API');
        return NextResponse.json({ error: message, code }, { status });
    }
}
