import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/audit-log';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { z } from 'zod';

// Input Validation Schema
const createRiskSchema = z.object({
    assetId: z.string().max(100).optional().nullable(),
    category: z.string().max(50).optional(),
    likelihood: z.number().int().min(1).max(5).default(3),
    impact: z.number().int().min(1).max(5).default(3),
    narrative: z.string().min(10, "Description too short").max(5000, "Description too long").optional(),
    status: z.enum(['open', 'mitigated', 'accepted', 'transferred']).default('open'),
    controlId: z.string().cuid().optional(),
    vendorId: z.string().cuid().optional()
});

// GET /api/risks - List risks for current user
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
        const { message, status } = safeError(error, 'Risks GET');
        return NextResponse.json({ error: message }, { status });
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

        // Validate input
        const parseResult = createRiskSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const { assetId, category, likelihood, impact, narrative, status: riskStatus, controlId, vendorId } = parseResult.data;

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
        const { message, status } = safeError(error, 'Risks POST');
        return NextResponse.json({ error: message }, { status });
    }
}
