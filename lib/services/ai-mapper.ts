import { prisma } from "@/lib/prisma";
import { IsolationContext } from "@/lib/isolation";

/**
 * Persists the AI-generated report into granular database records
 * (Risks, Controls, Policies, Vendors, Incidents).
 * This enables the Dashboard to display live, interactive data.
 */
export async function persistReportData(context: IsolationContext, reportData: any) {
    if (!reportData || !reportData.executiveSummary) {
        console.error("Invalid report data structure provided to persistence layer.");
        return;
    }

    const orgId = context.orgId;
    if (!orgId) {
        throw new Error("Persistence failed: Organization context required for data isolation.");
    }

    try {
        console.log(`Starting Persistence for User: ${context.email} (Org: ${orgId})`);

        // 1. Persist Controls
        const controlTitleToIdMap = new Map<string, string>();

        if (Array.isArray(reportData.controls)) {
            for (const c of reportData.controls) {
                // Find existing by title+org to avoid duplicates
                let control = await prisma.control.findFirst({
                    where: { organizationId: orgId, title: c.title }
                });

                if (!control) {
                    control = await prisma.control.create({
                        data: {
                            organizationId: orgId,
                            title: c.title,
                            description: c.description || '',
                            controlType: c.controlType || 'preventive',
                            owner: context.email || 'System'
                        }
                    });
                }

                if (control) controlTitleToIdMap.set(c.title, control.id);
            }
        }

        // 2. Persist Policies
        if (Array.isArray(reportData.policies)) {
            for (const p of reportData.policies) {
                const existing = await prisma.policy.findFirst({
                    where: { organizationId: orgId, title: p.title }
                });

                if (!existing) {
                    await prisma.policy.create({
                        data: {
                            organizationId: orgId,
                            title: p.title,
                            content: p.description || '',
                            owner: context.email || "System",
                            status: 'draft',
                            version: "1.0"
                        }
                    });
                }
            }
        }

        // 3. Persist Vendors
        if (Array.isArray(reportData.vendors)) {
            for (const v of reportData.vendors) {
                const existing = await prisma.vendor.findFirst({
                    where: { organizationId: orgId, name: v.name }
                });

                if (!existing) {
                    await prisma.vendor.create({
                        data: {
                            organizationId: orgId,
                            name: v.name,
                            category: v.category || 'Other',
                            services: v.services || '',
                            riskScore: v.riskScore || 0,
                            status: "active",
                            criticality: (v.riskScore || 0) > 75 ? 'critical' : (v.riskScore || 0) > 50 ? 'high' : 'medium',
                            owner: context.email || 'System'
                        }
                    });
                }
            }
        }

        // 4. Persist Risks & Link to Controls
        if (Array.isArray(reportData.risks)) {
            for (const r of reportData.risks) {
                const existing = await prisma.risk.findFirst({
                    where: { organizationId: orgId, narrative: r.narrative }
                });

                if (!existing) {
                    const likelihood = r.likelihood || 3;
                    const impact = r.impact || 3;
                    const score = likelihood * impact;

                    const risk = await prisma.risk.create({
                        data: {
                            organizationId: orgId,
                            category: r.category || 'General',
                            narrative: r.narrative,
                            likelihood,
                            impact,
                            score,
                            status: 'open',
                            owner: context.email || 'System'
                        }
                    });

                    // Link Mitigating Controls
                    if (Array.isArray(r.mitigatingControlTitles)) {
                        for (const title of r.mitigatingControlTitles) {
                            const controlId = controlTitleToIdMap.get(title);
                            if (controlId) {
                                await prisma.riskControl.create({
                                    data: {
                                        riskId: risk.id,
                                        controlId: controlId,
                                        effectiveness: "partial"
                                    }
                                });
                            }
                        }
                    }
                }
            }
        }

        // 5. Persist Incidents
        if (Array.isArray(reportData.incidents)) {
            for (const i of reportData.incidents) {
                const existing = await prisma.incident.findFirst({
                    where: { organizationId: orgId, title: i.title }
                });

                if (!existing) {
                    await prisma.incident.create({
                        data: {
                            organizationId: orgId,
                            title: i.title,
                            description: i.description || '',
                            severity: i.severity || 'medium',
                            status: i.status || 'open',
                            reportedBy: context.email || 'AI Assessment',
                        }
                    });
                }
            }
        }

        console.log("AI Data Persistence Complete.");
    } catch (error) {
        console.error("Failed to persist report data:", error);
        throw error; // Rethrow to let the caller handle it
    }
}
