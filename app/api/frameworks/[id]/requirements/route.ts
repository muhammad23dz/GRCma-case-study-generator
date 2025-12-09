import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/frameworks/:id/requirements - List requirements for a framework
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = params;

        // Get framework with its requirements (from seed data)
        const framework = await prisma.framework.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { mappings: true },
                },
            },
        });

        if (!framework) {
            return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
        }

        // For now, return empty requirements array
        // In production, this would query FrameworkRequirement model
        const requirements: any[] = [];

        // Calculate gap analysis metrics
        const totalRequirements = requirements.length || 100; // Placeholder
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
                unmappedRequirements: totalRequirements - mappedRequirements,
                coveragePercentage: coverage,
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
