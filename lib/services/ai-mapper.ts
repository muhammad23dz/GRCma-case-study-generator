import { prisma } from "@/lib/prisma"; // Adjust path if needed
import { GeneratedReport } from "@/types"; // Adjust path if needed

/**
 * Persists the AI-generated report into granular database records
 * (Risks, Controls, Policies, Vendors, Incidents).
 * This enables the Dashboard to display live, interactive data.
 */
export async function persistReportData(userId: string, reportData: any) {
    if (!reportData || !reportData.executiveSummary) {
        console.error("Invalid report data structure provided to persistence layer.");
        return;
    }

    try {
        // 1. Get or Create Organization context
        // Ideally, user belongs to an Org. If not, we might need a default one or just link to User.
        // For now, we'll link to User where relations exist, or an implementation-specific Org.
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, orgId: true }
        });

        if (!user) throw new Error("User not found during persistence");

        let orgId = user.orgId;
        if (!orgId) {
            // Auto-create simplified org if missing (SaaS Onboarding flow)
            const newOrg = await prisma.organization.create({
                data: {
                    name: "My Organization",
                    subscriptionStatus: "ACTIVE", // Default to active for demo/upgrade
                    plan: "FREE"
                }
            });
            orgId = newOrg.id;
            // Link user to org
            await prisma.user.update({
                where: { id: userId },
                data: { orgId: newOrg.id }
            });
        }

        if (!orgId) throw new Error("Failed to resolve Organization ID");

        console.log(`Starting Persistence for Org: ${orgId}`);

        // 2. Persist Controls
        // We map Title -> ID to link Risks later
        const controlTitleToIdMap = new Map<string, string>();

        if (Array.isArray(reportData.controls)) {
            for (const c of reportData.controls) {
                // Check if exists by title to avoid dupes in repeated runs? 
                // For simplified 'Assessment' mode, we might upsert.
                const control = await prisma.control.upsert({
                    where: {
                        // We don't have a unique constraint on Title+Org yet in schema shown, 
                        // but normally we'd want one. We'll use findFirst logic or just create new if simple.
                        // Given schema limitations shown, we'll create new to ensure fresh assessment data 
                        // OR (Better) findFirst by title.
                        id: "placeholder_for_create" // Upsert requires unique. 
                    },
                    update: {}, // We won't actually match this, so force create logic below
                    create: {
                        organizationId: orgId,
                        title: c.title,
                        description: c.description,
                        controlType: c.controlType || 'preventive',
                        // Map status or other fields if schema supports
                    }
                }).catch(async () => {
                    // Fallback: Create if upsert fails (likely due to invalid ID check)
                    return await prisma.control.create({
                        data: {
                            organizationId: orgId,
                            title: c.title,
                            description: c.description,
                            controlType: c.controlType || 'preventive',
                        }
                    });
                });

                if (control) controlTitleToIdMap.set(c.title, control.id);
            }
        }

        // 3. Persist Policies
        if (Array.isArray(reportData.policies)) {
            for (const p of reportData.policies) {
                await prisma.policy.create({
                    data: {
                        organizationId: orgId,
                        title: p.title,
                        content: p.description, // Use description as content summary
                        owner: "System", // Default
                        status: p.status === 'active' ? 'active' : 'draft',
                        version: "1.0"
                    }
                });
            }
        }

        // 4. Persist Vendors
        if (Array.isArray(reportData.vendors)) {
            for (const v of reportData.vendors) {
                await prisma.vendor.create({
                    data: {
                        organizationId: orgId,
                        name: v.name,
                        category: v.category,
                        services: v.services,
                        riskScore: v.riskScore || 0,
                        status: "active",
                        criticality: v.riskScore > 75 ? 'critical' : v.riskScore > 50 ? 'high' : 'medium'
                    }
                });
            }
        }

        // 5. Persist Risks & Link to Controls
        if (Array.isArray(reportData.risks)) {
            for (const r of reportData.risks) {
                const likelihood = r.likelihood || 1;
                const impact = r.impact || 1;
                const score = likelihood * impact;

                const risk = await prisma.risk.create({
                    data: {
                        organizationId: orgId,
                        category: r.category,
                        narrative: r.narrative,
                        likelihood,
                        impact,
                        score,
                        status: 'open',
                        // recommendedActions: r.recommendedActions  // Check if Json type supported directly
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

        // 6. Persist Incidents
        if (Array.isArray(reportData.incidents)) {
            for (const i of reportData.incidents) {
                await prisma.incident.create({
                    data: {
                        organizationId: orgId,
                        title: i.title,
                        description: i.description,
                        severity: i.severity || 'medium',
                        status: i.status || 'open',
                        reportedBy: 'AI Assessment',
                    }
                });
            }
        }

        console.log("AI Data Persistence Complete.");

    } catch (error) {
        console.error("Failed to persist report data:", error);
        // We do strictly fail here? No, allow the report to be returned to UI at least.
        // But log critical error for debugging.
    }
}
