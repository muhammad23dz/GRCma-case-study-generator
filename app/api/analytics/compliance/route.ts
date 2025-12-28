import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// GET /api/analytics/compliance - Calculate compliance score based on control effectiveness for the organization
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        // 1. Get all Frameworks
        const frameworks = await prisma.framework.findMany({
            include: {
                _count: {
                    select: { requirements: true }
                }
            }
        });

        const complianceScores = [];

        for (const framework of frameworks) {
            // If framework has no requirements, skip or mark as 0
            if (framework._count.requirements === 0) {
                complianceScores.push({
                    frameworkId: framework.id,
                    name: framework.name,
                    score: 0,
                    totalControls: 0,
                    effectiveControls: 0
                });
                continue;
            }

            // 2. Get controls for this framework that belong to the organization
            const mappings = await prisma.frameworkMapping.findMany({
                where: {
                    frameworkId: framework.id,
                    control: {
                        organizationId: context.orgId
                    }
                },
                include: {
                    control: {
                        include: {
                            riskControls: {
                                where: {
                                    risk: {
                                        organizationId: context.orgId
                                    }
                                }
                            }
                        }
                    }
                }
            });

            const controls = mappings.map(m => m.control);

            if (controls.length === 0) {
                complianceScores.push({
                    frameworkId: framework.id,
                    name: framework.name,
                    score: 0,
                    totalControls: framework._count.requirements,
                    effectiveControls: 0
                });
                continue;
            }

            // 3. Calculate Effectiveness
            let effectiveCount = 0;

            for (const control of controls) {
                const isEffective = control.riskControls.some(rc => rc.effectiveness === 'effective');
                if (isEffective) {
                    effectiveCount++;
                }
            }

            const score = Math.round((effectiveCount / controls.length) * 100);

            complianceScores.push({
                frameworkId: framework.id,
                name: framework.name,
                score,
                totalControls: controls.length,
                effectiveControls: effectiveCount
            });
        }

        // Calculate Overall Compliance Score (Average of all frameworks)
        const overallScore = complianceScores.length > 0
            ? Math.round(complianceScores.reduce((sum, item) => sum + item.score, 0) / complianceScores.length)
            : 0;

        return NextResponse.json({
            overallScore,
            frameworks: complianceScores
        });

    } catch (error: any) {
        const { message, status, code } = safeError(error, 'Compliance Analytics');
        return NextResponse.json({ error: message, code }, { status });
    }
}
