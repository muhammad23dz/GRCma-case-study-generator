import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const frameworks = await prisma.framework.findMany({
            include: {
                _count: {
                    select: { requirements: true }
                },
                requirements: {
                    include: {
                        _count: {
                            select: { mappings: true }
                        }
                    }
                }
            }
        });

        // Calculate Stats
        const stats = frameworks.map(fw => {
            const totalRequirements = fw._count.requirements || 1; // Avoid div by 0

            // Count requirements that have at least one mapping
            const coveredRequirements = fw.requirements.filter(r => r._count.mappings > 0).length;

            const coverage = Math.round((coveredRequirements / totalRequirements) * 100);

            return {
                id: fw.id,
                name: fw.name,
                version: fw.version,
                totalRequirements,
                coveredRequirements,
                coverage,
                gap: 100 - coverage
            };
        });

        // Custom sorting: Moroccan Law first
        const sortedStats = stats.sort((a, b) => {
            const isMoroccanA = a.name.includes('Moroccan') || a.name.includes('Morrocan') || a.name.includes('09-08');
            const isMoroccanB = b.name.includes('Moroccan') || b.name.includes('Morrocan') || b.name.includes('09-08');

            if (isMoroccanA && !isMoroccanB) return -1;
            if (!isMoroccanA && isMoroccanB) return 1;

            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({ stats: sortedStats });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
