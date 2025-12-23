import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

// GET /api/controls - List controls for current user
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const controlType = searchParams.get('type');

        // Expert Tier Isolation
        const whereClause: any = {
            ...getIsolationFilter(context, 'Control')
        };

        if (controlType) whereClause.controlType = controlType;

        const controls = await prisma.control.findMany({
            where: whereClause,
            include: {
                mappings: {
                    include: {
                        framework: true
                    }
                },
                policyControls: {
                    include: {
                        policy: true
                    }
                },
                risks: true,
                _count: {
                    select: {
                        evidences: true,
                        risks: true,
                        actions: true,
                        incidentControls: true,
                        policyControls: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ controls });
    } catch (error: any) {
        console.error('[Controls] GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/controls - Create new control
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, controlType, evidenceRequirements, policyId, riskId } = body;

        const control = await prisma.control.create({
            data: {
                title,
                description,
                controlType: controlType || 'preventive',
                owner: context.email,
                organizationId: context.orgId,
                evidenceRequirements,
            }
        });

        // GRC Relation: Link to Policy if provided
        if (policyId) {
            await prisma.policyControl.create({
                data: {
                    policyId,
                    controlId: control.id
                }
            });
        }

        // GRC Relation: Link to Risk if provided
        if (riskId) {
            await prisma.riskControl.create({
                data: {
                    riskId,
                    controlId: control.id
                }
            });
        }

        await logAudit({
            entity: 'Control',
            entityId: control.id,
            action: 'CREATE',
            changes: { title, controlType }
        });

        return NextResponse.json({ control }, { status: 201 });
    } catch (error: any) {
        console.error('[Controls] POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
