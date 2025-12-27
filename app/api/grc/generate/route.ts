import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { generateReportService } from '@/lib/services/report-generator';
import { getLLMConfig } from '@/lib/llm-config';

export const dynamic = 'force-dynamic';

// Check if we have a valid DATABASE_URL
const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');

// POST /api/grc/generate - AI-powered assessment generation
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        if (!userEmail) {
            return NextResponse.json({ error: 'User email required' }, { status: 400 });
        }

        const body = await request.json();

        // Default risk appetite - skip DB lookup if no valid connection
        let riskAppetite = 'Balanced';

        if (hasValidDb) {
            try {
                const { prisma } = await import('@/lib/prisma');
                const riskSetting = await prisma.systemSetting.findUnique({
                    where: { userId_key: { userId, key: 'compliance_riskAppetite' } }
                });
                if (riskSetting?.value) {
                    riskAppetite = riskSetting.value;
                }
            } catch (dbError) {
                console.warn('[GRC Generate] DB lookup failed, using default risk appetite:', dbError);
            }
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

        // Resolve Config - this also handles DB gracefully
        const llmConfig = await getLLMConfig(userId);

        if (!llmConfig?.apiKey) {
            console.warn('[API] System LLM Config missing. Service might fail if no env var fallback exists.');
        }

        // Use the service directly, bypassing the Server Action context scope issues
        const report = await generateReportService(input, { userId }, llmConfig || undefined);

        return NextResponse.json(report);

    } catch (error: any) {
        console.error('AI Generation API Error:', error);
        return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
    }
}
