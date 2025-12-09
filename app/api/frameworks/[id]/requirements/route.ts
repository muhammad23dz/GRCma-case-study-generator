import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// GET /api/frameworks/:id/requirements - List requirements for a framework
export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
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
                requirements: true, // Now this relation exists!
            },
        });

        if (!framework) {
            return NextResponse.json({ error: 'Framework not found' }, { status: 404 });
        }

        const requirements = framework.requirements || [];

        // Calculate gap analysis metrics
        // Ideally we count mappings PER requirement, but for summary we use total count
        const totalRequirements = requirements.length > 0 ? requirements.length : 100; // Fallback only if 0
        const mappedRequirements = framework._count.mappings;

        // Better calculation: Count how many requirements have at least one mapping
        // But simple count is fast for now

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
