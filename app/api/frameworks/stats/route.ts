import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await currentUser();
        const userEmail = user?.primaryEmailAddress?.emailAddress;

        // Fetch user's preferred frameworks
        const settings = await prisma.systemSetting.findUnique({
            where: {
                userId_key: {
                    userId,
                    key: 'compliance_defaultFrameworks'
                }
            }
        });

        const preferredFrameworks = settings?.value ? settings.value.split(',') : [];

        // Fetch frameworks with their requirements and mappings for the current user/org
        // If preferredFrameworks is set, filter by name
        const frameworks = await prisma.framework.findMany({
            where: preferredFrameworks.length > 0 ? {
                name: { in: preferredFrameworks }
            } : {},
            include: {
                requirements: {
                    include: {
                        mappings: {
                            where: userEmail ? {
                                control: {
                                    OR: [
                                        { owner: userEmail },
                                        { organization: { users: { some: { id: userId } } } }
                                    ]
                                }
                            } : {},
                            include: {
                                control: {
                                    include: {
                                        controlTests: {
                                            orderBy: { testDate: 'desc' },
                                            take: 1
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        // Calculate Stats based on ControlTest results
        const stats = frameworks.map(fw => {
            const totalRequirements = fw.requirements.length || 1;
            let coveredCount = 0;
            let compliantCount = 0;
            let nonCompliantCount = 0;
            let partialCount = 0;

            fw.requirements.forEach(req => {
                const mappings = req.mappings || [];
                if (mappings.length > 0) {
                    coveredCount++;

                    // Get latest tests for all mapped controls
                    const latestTests = mappings
                        .map(m => m.control.controlTests[0])
                        .filter(Boolean);

                    if (latestTests.length === 0) {
                        // Mapped but never tested
                        partialCount++;
                    } else if (latestTests.every(t => t.result === 'pass')) {
                        compliantCount++;
                    } else if (latestTests.some(t => t.result === 'fail')) {
                        nonCompliantCount++;
                    } else {
                        // Some partial or mixed
                        partialCount++;
                    }
                } else {
                    // No mappings -> This is a gap
                    nonCompliantCount++;
                }
            });

            const coverage = Math.round((coveredCount / totalRequirements) * 100);
            const complianceScore = Math.round((compliantCount / totalRequirements) * 100);

            // Get top 3 gap requirements
            const topGaps = fw.requirements
                .filter(req => req.mappings.length === 0)
                .slice(0, 3)
                .map(req => ({
                    id: req.id,
                    reference: req.requirementId || 'REF-TBD',
                    description: req.description || 'No description'
                }));

            return {
                id: fw.id,
                name: fw.name,
                version: fw.version,
                totalRequirements,
                coveredRequirements: coveredCount,
                compliantCount,
                nonCompliantCount,
                partialCount,
                coverage,
                complianceScore,
                gap: 100 - complianceScore,
                topGaps,
                status: complianceScore >= 80 ? 'ready' : complianceScore >= 40 ? 'in-progress' : 'needs-work' as const
            };
        });

        // Custom sorting: Moroccan Law first
        const sortedStats = stats.sort((a, b) => {
            const isMoroccanA = /Moroccan|Morrocan|09-08/.test(a.name);
            const isMoroccanB = /Moroccan|Morrocan|09-08/.test(b.name);

            if (isMoroccanA && !isMoroccanB) return -1;
            if (!isMoroccanA && isMoroccanB) return 1;

            return a.name.localeCompare(b.name);
        });

        return NextResponse.json({ stats: sortedStats });
    } catch (error: any) {
        console.error('Framework stats error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
