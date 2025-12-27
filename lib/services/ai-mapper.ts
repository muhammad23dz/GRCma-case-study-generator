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

    // Check if we have a valid DATABASE_URL
    const hasValidDb = process.env.DATABASE_URL?.startsWith('postgres');
    if (!hasValidDb) {
        console.warn("[Persistence] No valid DATABASE_URL, skipping real persistence (Demo Mode)");
        return;
    }

    try {
        const { prisma } = await import("@/lib/prisma");

        // 1. Get or Create Organization context
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, orgId: true, email: true }
        });

        if (!user) throw new Error("User not found during persistence");

        let orgId = user.orgId;
        if (!orgId) {
            // Auto-create simplified org if missing
            const newOrg = await prisma.organization.create({
                data: {
                    name: "Default Organization",
                    subscriptionStatus: "ACTIVE",
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

        console.log(`Starting Persistence for User: ${user.email} (Org: ${orgId})`);

        // 2. Persist Controls
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
                            owner: user.email || 'System'
                        }
                    });
                }

                if (control) controlTitleToIdMap.set(c.title, control.id);
            }
        }

        // 3. Persist Policies
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
                            owner: user.email || "System",
                            status: 'draft',
                            version: "1.0"
                        }
                    });
                }
            }
        }

        // 4. Persist Vendors
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
                            owner: user.email || 'System'
                        }
                    });
                }
            }
        }

        // 5. Persist Risks & Link to Controls
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
                            owner: user.email || 'System'
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

        // 6. Persist Incidents
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
                            reportedBy: user.email || 'AI Assessment',
                        }
                    });
                }
            }
        }

        console.log("AI Data Persistence Complete.");
    } catch (error) {
        console.error("Failed to persist report data:", error);
    }
}
