import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

// GET /api/risks - List risks for current user
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        // Expert Tier Isolation
        const whereClause: any = {
            ...getIsolationFilter(context, 'Risk')
        };

        if (status) whereClause.status = status;
        if (category) whereClause.category = category;

        const risks = await prisma.risk.findMany({
            where: whereClause,
            include: {
                riskControls: {
                    include: {
                        control: true
                    }
                },
                vendorRisks: {
                    include: {
                        vendor: true
                    }
                },
                actions: true,
                _count: {
                    select: { evidences: true, riskControls: true, actions: true }
                }
            },
            orderBy: { score: 'desc' }
        });

        return NextResponse.json({ risks });
    } catch (error: any) {
        console.error('[Risks] GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/risks - Create new risk with GRC relations
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { assetId, category, likelihood, impact, narrative, status: riskStatus, controlId, vendorId } = body;

        const calculatedScore = (likelihood || 3) * (impact || 3);

        let riskCategory = category;
        if (!riskCategory) {
            if (calculatedScore >= 20) riskCategory = 'Critical';
            else if (calculatedScore >= 12) riskCategory = 'High';
            else if (calculatedScore >= 6) riskCategory = 'Medium';
            else riskCategory = 'Low';
        }

        const risk = await prisma.risk.create({
            data: {
                assetId: assetId || null,
                category: riskCategory,
                likelihood: likelihood || 3,
                impact: impact || 3,
                score: calculatedScore,
                narrative: narrative || 'New risk identified',
                status: riskStatus || 'open',
                owner: context.email,
                organizationId: context.orgId // Org-scoped IAM support
            }
        });

        // Link Relations
        if (controlId) {
            await prisma.riskControl.create({
                data: { riskId: risk.id, controlId }
            });
        }
        if (vendorId) {
            await prisma.vendorRisk.create({
                data: {
                    riskId: risk.id,
                    vendorId,
                    riskType: 'security' // Default required field
                }
            });
        }

        await logAudit({
            entity: 'Risk',
            entityId: risk.id,
            action: 'CREATE',
            changes: { narrative: risk.narrative, category: risk.category, score: risk.score }
        });

        return NextResponse.json({ risk }, { status: 201 });
    } catch (error: any) {
        console.error('[Risks] POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
