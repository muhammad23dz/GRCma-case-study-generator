import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { grcLLM } from '@/lib/llm/grc-service';

// POST /api/controls/normalize - LLM-powered control normalization
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true } });
        const userEmail = dbUser?.email || '';

        const body = await request.json();
        const { controlText, targetFrameworks } = body;

        if (!controlText) {
            return NextResponse.json({ error: 'controlText is required' }, { status: 400 });
        }

        // Call LLM to normalize and map control
        const result = await grcLLM.normalizeControl(
            controlText,
            targetFrameworks || ['ISO27001', 'NIST_CSF', 'SOC2']
        );

        // Create control if confidence is high enough
        if (result.confidence >= 0.7) {
            const control = await prisma.control.create({
                data: {
                    title: result.data.title,
                    description: result.data.description,
                    controlType: result.data.controlType,
                    controlRisk: result.data.controlRisk,
                    evidenceRequirements: result.data.evidenceRequirements,
                    confidence: result.confidence,
                    llmProvenance: JSON.stringify(result.provenance),
                    owner: userEmail
                }
            });

            // Create framework mappings
            if (result.data.mappings && result.data.mappings.length > 0) {
                for (const mapping of result.data.mappings) {
                    const framework = await prisma.framework.findFirst({
                        where: { name: mapping.framework }
                    });

                    if (framework) {
                        await prisma.frameworkMapping.create({
                            data: {
                                controlId: control.id,
                                frameworkId: framework.id,
                                frameworkControlId: mapping.frameworkControlId,
                                confidence: mapping.confidence,
                                mappingSource: 'llm'
                            }
                        });
                    }
                }
            }

            return NextResponse.json({
                control,
                normalized: result.data,
                confidence: result.confidence,
                requiresReview: result.confidence < 0.85
            });
        } else {
            // Low confidence - return for manual review
            return NextResponse.json({
                normalized: result.data,
                confidence: result.confidence,
                requiresReview: true,
                message: 'Confidence too low for automatic creation. Please review and create manually.'
            });
        }
    } catch (error: any) {
        console.error('Error normalizing control:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
