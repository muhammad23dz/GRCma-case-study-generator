
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const frameworks = await prisma.framework.findMany({
            include: {
                requirements: {
                    include: {
                        mappings: { // FrameworkMapping -> Control
                            include: {
                                control: {
                                    include: {
                                        auditFindings: true,
                                        evidences: true
                                    }
                                }
                            }
                        },
                        evidences: true // Direct evidence on requirement
                    }
                }
            }
        });

        // Process data for the matrix
        const coverage = frameworks.map(fw => {
            const requirements = fw.requirements.map(req => {
                // 1. Controls Mapped
                const controlsCount = req.mappings.length;

                // 2. Evidence Collected (Direct + via Controls)
                const directEvidence = req.evidences.length;
                // Using 'any' here because type inference on deep nested relations can be tricky without generated client
                const controlEvidence = req.mappings.reduce((acc: number, m: any) => acc + (m.control.evidences?.length || 0), 0);
                const totalEvidence = directEvidence + controlEvidence;

                // 3. Open Findings (via Controls)
                const openFindings = req.mappings.reduce((acc: number, m: any) => {
                    return acc + (m.control.auditFindings?.filter((f: any) => f.status === 'open').length || 0);
                }, 0);

                // 4. Status Calculation
                let status = 'not_started';
                if (controlsCount === 0) status = 'gap';
                else if (openFindings > 0) status = 'non_compliant';
                else if (totalEvidence === 0) status = 'no_evidence';
                else status = 'compliant';

                return {
                    id: req.id,
                    requirementId: req.requirementId,
                    title: req.title,
                    category: req.category,
                    stats: {
                        controls: controlsCount,
                        evidence: totalEvidence,
                        findings: openFindings
                    },
                    status
                };
            });

            // Framework Level Stats
            const totalReqs = requirements.length;
            const compliantReqs = requirements.filter(r => r.status === 'compliant').length;
            const percentage = totalReqs > 0 ? Math.round((compliantReqs / totalReqs) * 100) : 0;

            return {
                id: fw.id,
                name: fw.name,
                version: fw.version,
                stats: {
                    totalRequirements: totalReqs,
                    compliantRequirements: compliantReqs,
                    coveragePercentage: percentage
                },
                requirements
            };
        });

        return NextResponse.json({ coverage });
    } catch (error: any) {
        console.error('Error fetching coverage:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
