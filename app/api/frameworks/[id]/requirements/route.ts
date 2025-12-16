import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/frameworks/:id/requirements - List requirements for a framework
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Get framework with its requirements
        const framework = await prisma.framework.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { mappings: true },
                },
                requirements: true,
            },
        });

        if (!framework) {
            return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
        }

        const requirements = framework.requirements || [];

        // Calculate gap analysis metrics
        const totalRequirements = requirements.length > 0 ? requirements.length : 100;
        const mappedRequirements = framework._count.mappings;

        const coverage = totalRequirements > 0
            ? Math.round((mappedRequirements / totalRequirements) * 100)
            : 0;

        return NextResponse.json({
            framework,
            requirements,
            gapAnalysis: {
                totalRequirements,
                mappedRequirements,
                unmappedRequirements: Math.max(0, totalRequirements - mappedRequirements),
                coveragePercentage: Math.min(100, coverage),
            },
        });
    } catch (error) {
        console.error('Error fetching framework requirements:', error);
        return NextResponse.json(
            { error: 'Failed to fetch requirements' },
            { status: 500 }
        );
    }
}
