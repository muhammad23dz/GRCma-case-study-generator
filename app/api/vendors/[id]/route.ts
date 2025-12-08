import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// POST /api/vendors/:id/assess - LLM-powered vendor assessment
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { questionnaire, assessmentType } = body;
        const vendorId = params.id;

        const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
        if (!vendor) {
            return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
        }

        // Call LLM for vendor assessment
        const result = await grcLLM.assessVendor(questionnaire, vendor.name);

        // Create assessment record
        const assessment = await prisma.vendorAssessment.create({
            data: {
                vendorId,
                assessmentType: assessmentType || 'annual',
                questionnaire: JSON.stringify(questionnaire),
                gaps: JSON.stringify(result.data.gaps),
                rating: result.data.rating,
                remediationPlan: JSON.stringify(result.data.remediationPlan)
            }
        });

        // Update vendor risk score
        await prisma.vendor.update({
            where: { id: vendorId },
            data: {
                riskScore: result.data.riskScore,
                lastAssessmentDate: new Date()
            }
        });

        return NextResponse.json({
            assessment,
            result: result.data,
            confidence: result.confidence
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
