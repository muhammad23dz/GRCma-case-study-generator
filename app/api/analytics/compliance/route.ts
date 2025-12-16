import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/analytics/compliance - Calculate compliance score based on control effectiveness
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const dbUser = await prisma.user.findFirst({ where: { id: userId }, select: { email: true } });
        const userEmail = dbUser?.email || '';

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

            // 2. Get controls for this framework via Mappings
            // Controls are linked to Frameworks via FrameworkMapping
            const mappings = await prisma.frameworkMapping.findMany({
                where: {
                    frameworkId: framework.id,
                    control: {
                        owner: userEmail
                    }
                },
                include: {
                    control: {
                        include: {
                            riskControls: true
                        }
                    }
                }
            });

            const controls = mappings.map(m => m.control);

            if (controls.length === 0) {
                // If user has no controls mapped to this framework
                complianceScores.push({
                    frameworkId: framework.id,
                    name: framework.name,
                    score: 0,
                    totalControls: framework._count.requirements, // Use defined requirements as baseline
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
        console.error('Error calculating compliance:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
