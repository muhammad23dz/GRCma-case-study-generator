import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';

// POST /api/grc/push - Push assessment data to dashboard (creates GRC entities)
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context || !context.orgId) {
            return NextResponse.json({ error: 'Unauthorized: Organization context required.' }, { status: 401 });
        }

        const userEmail = context.email;
        const orgId = context.orgId;

        const body = await request.json();
        const { sections } = body;

        if (!sections) {
            return NextResponse.json({ error: 'No sections provided' }, { status: 400 });
        }

        // Map to store Control Title -> DB ID
        const controlMap = new Map<string, string>();

        // Insert Controls (Sequential)
        if (sections.controls && Array.isArray(sections.controls)) {
            for (const c of sections.controls) {
                const created = await prisma.control.create({
                    data: {
                        title: c.title || 'Control',
                        description: c.description || c.title || 'Security control',
                        controlType: c.controlType || 'preventive',
                        controlRisk: 'medium',
                        owner: userEmail,
                        organizationId: orgId
                    }
                });
                controlMap.set(c.title, created.id);
            }
        }

        // Insert Risks (Sequential + Relations)
        if (sections.risks && Array.isArray(sections.risks)) {
            for (const r of sections.risks) {
                // Create Risk
                const createdRisk = await prisma.risk.create({
                    data: {
                        category: r.category || 'General',
                        narrative: r.narrative || 'Identified risk',
                        likelihood: r.likelihood || 3,
                        impact: r.impact || 3,
                        score: (r.likelihood || 3) * (r.impact || 3),
                        status: 'open',
                        owner: userEmail,
                        recommendedActions: r.recommendedActions || [],
                        organizationId: orgId
                    }
                });

                // Link to Controls (RiskControl)
                if (r.mitigatingControlTitles && Array.isArray(r.mitigatingControlTitles)) {
                    for (const title of r.mitigatingControlTitles) {
                        const controlId = controlMap.get(title);
                        if (controlId) {
                            try {
                                await prisma.riskControl.create({
                                    data: {
                                        riskId: createdRisk.id,
                                        controlId: controlId,
                                        effectiveness: 'partial'
                                    }
                                });
                            } catch (e) { /* ignore dupes */ }
                        }
                    }
                }

                // Create Linked Actions
                if (r.recommendedActions && Array.isArray(r.recommendedActions)) {
                    for (const action of r.recommendedActions) {
                        // Must have title
                        if (action.title) {
                            await prisma.action.create({
                                data: {
                                    title: action.title,
                                    type: 'corrective',
                                    description: `Risk mitigation: ${r.narrative?.substring(0, 50)}...`,
                                    status: 'open',
                                    priority: action.priority || 'high',
                                    owner: userEmail,
                                    parentType: 'Risk',
                                    parentId: createdRisk.id,
                                    organizationId: orgId
                                }
                            });
                        }
                    }
                }
            }
        }

        // Insert Vendors
        if (sections.vendors && Array.isArray(sections.vendors) && sections.vendors.length > 0) {
            await prisma.vendor.createMany({
                data: sections.vendors.map((v: any) => ({
                    name: v.name || 'Vendor',
                    category: v.category || 'Service Provider',
                    services: v.services || v.name || 'Services',
                    riskScore: v.riskScore || 25,
                    status: 'active',
                    owner: userEmail,
                    organizationId: orgId
                }))
            });
        }

        // Insert Incidents
        if (sections.incidents && Array.isArray(sections.incidents) && sections.incidents.length > 0) {
            await prisma.incident.createMany({
                data: sections.incidents.map((inc: any) => ({
                    title: inc.title || 'Security Incident',
                    description: inc.description || 'Reported incident',
                    severity: inc.severity || 'medium',
                    status: inc.status || 'open',
                    reportedBy: userEmail,
                    organizationId: orgId
                }))
            });
        }

        // Create Policy
        if (sections.controls && sections.controls.length > 0) {
            await prisma.policy.create({
                data: {
                    title: 'Information Security Policy',
                    version: '1.0',
                    content: 'This policy establishes security controls and risk management.',
                    status: 'draft',
                    owner: userEmail,
                    reviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                    organizationId: orgId
                }
            });
        }

        // Create Action
        if (sections.risks && sections.risks.length > 0) {
            await prisma.action.create({
                data: {
                    title: 'Review and Implement Controls',
                    description: 'Implement recommended controls to mitigate identified risks',
                    type: 'preventive',
                    status: 'open',
                    priority: 'high',
                    owner: userEmail,
                    organizationId: orgId
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Assessment data pushed to dashboard successfully',
            counts: {
                controls: sections.controls?.length || 0,
                risks: sections.risks?.length || 0,
                vendors: sections.vendors?.length || 0,
                incidents: sections.incidents?.length || 0
            }
        });
    } catch (error: any) {
        const { message, status, code } = safeError(error, 'GRC Push');
        return NextResponse.json({ error: message, code }, { status });
    }
}
