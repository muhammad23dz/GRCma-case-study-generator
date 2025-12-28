import { NextRequest, NextResponse } from 'next/server';
import { generateReportService } from '@/lib/services/report-generator';
import { getLLMConfig } from '@/lib/llm-config';

export const dynamic = 'force-dynamic';

// POST /api/grc/generate - AI-powered assessment generation
export async function POST(request: NextRequest) {
    try {
        const { getIsolationContext } = await import('@/lib/isolation');
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized: Infrastructure context required.' }, { status: 401 });
        }

        const userId = context.userId;
        const userEmail = context.email;

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
            return NextResponse.json({ error: 'LLM Configuration missing: API Key required for generation.' }, { status: 503 });
        }

        // Use the service directly
        const report = await generateReportService(input, context, llmConfig);


        return NextResponse.json(report);

    } catch (error: any) {
        console.error('AI Generation API Error:', error);
        return NextResponse.json({ error: 'Generation Service Error: ' + (error.message || 'Processing failed') }, { status: 500 });
    }
}

