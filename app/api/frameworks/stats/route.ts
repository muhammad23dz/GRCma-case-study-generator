import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Demo frameworks for display when database is empty or unavailable
const DEMO_FRAMEWORKS = [
    {
        id: 'demo-iso27001',
        name: 'ISO 27001:2022',
        version: '2022',
        totalRequirements: 93,
        coveredRequirements: 72,
        compliantCount: 65,
        nonCompliantCount: 12,
        partialCount: 16,
        coverage: 77,
        complianceScore: 70,
        gap: 30,
        status: 'in-progress' as const,
        topGaps: [
            { id: 'gap1', reference: 'A.5.1', description: 'Information security policies' },
            { id: 'gap2', reference: 'A.8.2', description: 'Privileged access rights' },
            { id: 'gap3', reference: 'A.12.6', description: 'Technical vulnerability management' }
        ]
    },
    {
        id: 'demo-nist',
        name: 'NIST CSF 2.0',
        version: '2.0',
        totalRequirements: 108,
        coveredRequirements: 95,
        compliantCount: 86,
        nonCompliantCount: 8,
        partialCount: 14,
        coverage: 88,
        complianceScore: 80,
        gap: 20,
        status: 'ready' as const,
        topGaps: [
            { id: 'gap4', reference: 'PR.AC-1', description: 'Identities and credentials management' },
            { id: 'gap5', reference: 'DE.CM-7', description: 'Monitoring for unauthorized personnel' }
        ]
    },
    {
        id: 'demo-soc2',
        name: 'SOC 2 Type II',
        version: '2023',
        totalRequirements: 64,
        coveredRequirements: 58,
        compliantCount: 52,
        nonCompliantCount: 6,
        partialCount: 6,
        coverage: 91,
        complianceScore: 81,
        gap: 19,
        status: 'ready' as const,
        topGaps: [
            { id: 'gap6', reference: 'CC6.1', description: 'Logical and physical access controls' }
        ]
    },
    {
        id: 'demo-moroccan',
        name: 'Moroccan Law 09-08',
        version: '2009',
        totalRequirements: 45,
        coveredRequirements: 28,
        compliantCount: 22,
        nonCompliantCount: 15,
        partialCount: 8,
        coverage: 62,
        complianceScore: 49,
        gap: 51,
        status: 'needs-work' as const,
        topGaps: [
            { id: 'gap7', reference: 'Art.3', description: 'Data collection consent' },
            { id: 'gap8', reference: 'Art.12', description: 'Cross-border data transfers' },
            { id: 'gap9', reference: 'Art.21', description: 'CNDP registration' }
        ]
    }
];

export async function GET() {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Try to fetch from database, but gracefully fallback if there's an issue
        let frameworks: any[] = [];
        try {
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
            frameworks = await prisma.framework.findMany({
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
        } catch (dbError) {
            console.warn('[FrameworkStats] Database error, returning demo data:', dbError);
            // Return demo data on database error
            return NextResponse.json({ stats: DEMO_FRAMEWORKS, isDemo: true });
        }

        // If no frameworks in DB, return demo data
        if (frameworks.length === 0) {
            return NextResponse.json({ stats: DEMO_FRAMEWORKS, isDemo: true });
        }

        // Calculate Stats based on ControlTest results
        const stats = frameworks.map(fw => {
            const totalRequirements = fw.requirements.length || 1;
            let coveredCount = 0;
            let compliantCount = 0;
            let nonCompliantCount = 0;
            let partialCount = 0;

            fw.requirements.forEach((req: any) => {
                const mappings = req.mappings || [];
                if (mappings.length > 0) {
                    coveredCount++;

                    // Get latest tests for all mapped controls
                    const latestTests = mappings
                        .map((m: any) => m.control.controlTests[0])
                        .filter(Boolean);

                    if (latestTests.length === 0) {
                        // Mapped but never tested
                        partialCount++;
                    } else if (latestTests.every((t: any) => t.result === 'pass')) {
                        compliantCount++;
                    } else if (latestTests.some((t: any) => t.result === 'fail')) {
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
                .filter((req: any) => req.mappings.length === 0)
                .slice(0, 3)
                .map((req: any) => ({
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
        // Return demo data on any error
        return NextResponse.json({ stats: DEMO_FRAMEWORKS, isDemo: true });
    }
}
