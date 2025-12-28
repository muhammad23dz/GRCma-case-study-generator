import { prisma } from '@/lib/prisma';

export interface ImpactAnalysisResult {
    frameworkName: string;
    affectedControlsCount: number;
    affectedRisksCount: number;
    totalResidualRiskExposure: number;
    criticalControls: {
        id: string;
        name: string;
        effectiveness: string;
        linkedRisksCount: number;
    }[];
    highRisksExposed: {
        id: string;
        narrative: string;
        score: number;
    }[];
}

export class ImpactService {
    /**
     * Simulates the impact of a total failure of a specific Framework
     * for a specific organization.
     */
    async analyzeFrameworkImpact(frameworkId: string, organizationId: string): Promise<ImpactAnalysisResult | null> {
        const framework = await prisma.framework.findUnique({
            where: { id: frameworkId },
            include: {
                requirements: {
                    include: {
                        mappings: {
                            where: {
                                control: {
                                    organizationId: organizationId
                                }
                            },
                            include: {
                                control: {
                                    include: {
                                        riskControls: {
                                            where: {
                                                risk: {
                                                    organizationId: organizationId
                                                }
                                            },
                                            include: {
                                                risk: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!framework) return null;

        const affectedControls = new Map<string, any>();
        const affectedRisks = new Map<string, any>();

        // Traverse the graph
        for (const req of framework.requirements) {
            for (const mapping of req.mappings) {
                if (mapping.control) {
                    affectedControls.set(mapping.control.id, mapping.control);

                    for (const rc of mapping.control.riskControls) {
                        if (rc.risk) {
                            affectedRisks.set(rc.risk.id, rc.risk);
                        }
                    }
                }
            }
        }

        const controlList = Array.from(affectedControls.values());
        const riskList = Array.from(affectedRisks.values());

        // Calculate exposure
        const totalScore = riskList.reduce((acc, r) => acc + (r.score || 0), 0);

        return {
            frameworkName: framework.name,
            affectedControlsCount: controlList.length,
            affectedRisksCount: riskList.length,
            totalResidualRiskExposure: totalScore,
            criticalControls: controlList
                .filter(c => c.riskControls && c.riskControls.length > 0)
                .slice(0, 5)
                .map(c => ({
                    id: c.id,
                    name: c.title,
                    effectiveness: 'partial', // default for simulation
                    linkedRisksCount: c.riskControls.length
                })),
            highRisksExposed: riskList
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map(r => ({
                    id: r.id,
                    narrative: r.narrative,
                    score: r.score
                }))
        };
    }
}
