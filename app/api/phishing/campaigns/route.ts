import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext } from '@/lib/isolation';
import { safeError } from '@/lib/security';
import { logAudit } from '@/lib/audit-log';
import { z } from 'zod';

// Input Validation
const createCampaignSchema = z.object({
    name: z.string().min(3).max(200),
    description: z.string().max(2000).optional(),
    templateId: z.string().cuid().optional(),
    targetType: z.enum(['all', 'department', 'role', 'custom']).default('all'),
    targetFilter: z.string().optional(),
    scheduledAt: z.string().optional(),
    sendingRate: z.number().int().min(1).max(100).default(10),
    trackClicks: z.boolean().default(true),
    trackSubmissions: z.boolean().default(true)
});

const updateCampaignSchema = z.object({
    status: z.enum(['draft', 'scheduled', 'running', 'completed', 'cancelled']).optional(),
    scheduledAt: z.string().optional()
});

// GET /api/phishing/campaigns - List campaigns
export async function GET(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const whereClause: any = {
            organizationId: context.orgId
        };

        if (status) whereClause.status = status;

        const campaigns = await prisma.phishingCampaign.findMany({
            where: whereClause,
            include: {
                template: { select: { name: true, difficulty: true, category: true } },
                _count: { select: { targets: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Calculate metrics
        const stats = {
            total: campaigns.length,
            running: campaigns.filter(c => c.status === 'running').length,
            completed: campaigns.filter(c => c.status === 'completed').length,
            avgClickRate: campaigns.length > 0
                ? campaigns.reduce((sum, c) => sum + (c.totalTargets > 0 ? c.linksClicked / c.totalTargets * 100 : 0), 0) / campaigns.length
                : 0
        };

        return NextResponse.json({ campaigns, stats });
    } catch (error: any) {
        const { message, status } = safeError(error, 'PhishingCampaigns GET');
        return NextResponse.json({ error: message }, { status });
    }
}

// POST /api/phishing/campaigns - Create campaign
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const parseResult = createCampaignSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const data = parseResult.data;

        // Get target count based on targeting
        let targetCount = 0;
        if (data.targetType === 'all') {
            targetCount = await prisma.employee.count({
                where: { organizationId: context.orgId }
            });
        }

        const campaign = await prisma.phishingCampaign.create({
            data: {
                name: data.name,
                description: data.description,
                templateId: data.templateId,
                targetType: data.targetType,
                targetFilter: data.targetFilter,
                scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
                sendingRate: data.sendingRate,
                trackClicks: data.trackClicks,
                trackSubmissions: data.trackSubmissions,
                totalTargets: targetCount,
                createdBy: context.email,
                organizationId: context.orgId || undefined
            }
        });

        await logAudit({
            entity: 'PhishingCampaign',
            entityId: campaign.id,
            action: 'CREATE',
            changes: { name: data.name, targetType: data.targetType }
        });

        return NextResponse.json({ campaign }, { status: 201 });
    } catch (error: any) {
        const { message, status } = safeError(error, 'PhishingCampaigns POST');
        return NextResponse.json({ error: message }, { status });
    }
}

// PATCH /api/phishing/campaigns?id=xxx - Update campaign status
export async function PATCH(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const body = await request.json();

        const parseResult = updateCampaignSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({
                error: 'Validation failed',
                details: parseResult.error.flatten().fieldErrors
            }, { status: 400 });
        }

        const existing = await prisma.phishingCampaign.findFirst({
            where: { id, organizationId: context.orgId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        const updateData: any = {};

        if (parseResult.data.status) {
            updateData.status = parseResult.data.status;

            // Handle status transitions
            if (parseResult.data.status === 'running' && existing.status !== 'running') {
                updateData.startedAt = new Date();
            }
            if (parseResult.data.status === 'completed' && existing.status !== 'completed') {
                updateData.completedAt = new Date();
            }
        }

        if (parseResult.data.scheduledAt) {
            updateData.scheduledAt = new Date(parseResult.data.scheduledAt);
            if (!parseResult.data.status) {
                updateData.status = 'scheduled';
            }
        }

        const campaign = await prisma.phishingCampaign.update({
            where: { id },
            data: updateData
        });

        await logAudit({
            entity: 'PhishingCampaign',
            entityId: id,
            action: 'UPDATE',
            changes: parseResult.data
        });

        return NextResponse.json({ campaign });
    } catch (error: any) {
        const { message, status } = safeError(error, 'PhishingCampaigns PATCH');
        return NextResponse.json({ error: message }, { status });
    }
}

// DELETE /api/phishing/campaigns?id=xxx - Cancel/delete campaign
export async function DELETE(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }

        const existing = await prisma.phishingCampaign.findFirst({
            where: { id, organizationId: context.orgId }
        });

        if (!existing) {
            return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
        }

        // Mark as cancelled instead of delete
        await prisma.phishingCampaign.update({
            where: { id },
            data: { status: 'cancelled' }
        });

        await logAudit({
            entity: 'PhishingCampaign',
            entityId: id,
            action: 'DELETE',
            changes: { cancelled: true }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        const { message, status } = safeError(error, 'PhishingCampaigns DELETE');
        return NextResponse.json({ error: message }, { status });
    }
}
