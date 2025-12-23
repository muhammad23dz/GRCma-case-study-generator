import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getIsolationContext, getIsolationFilter } from '@/lib/isolation';

// GET /api/policies - List policies for current user
export async function GET() {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Expert Tier Isolation
        const policies = await prisma.policy.findMany({
            where: {
                ...getIsolationFilter(context, 'Policy')
            },
            include: {
                policyControls: {
                    include: {
                        control: true
                    }
                },
                _count: {
                    select: { policyControls: true }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return NextResponse.json({ policies });
    } catch (error: any) {
        console.error('[Policies] GET Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST /api/policies - Create new policy
export async function POST(request: NextRequest) {
    try {
        const context = await getIsolationContext();
        if (!context) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, version, content, reviewDate, controlIds } = body;

        const policy = await prisma.policy.create({
            data: {
                title,
                version: version || '1.0',
                content,
                reviewDate: reviewDate ? new Date(reviewDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                owner: context.email,
                organizationId: context.orgId, // Org-scoped IAM support
                status: 'draft'
            }
        });

        // Link relations
        if (controlIds && Array.isArray(controlIds)) {
            for (const controlId of controlIds) {
                await prisma.policyControl.create({
                    data: { policyId: policy.id, controlId }
                });
            }
        }

        return NextResponse.json({ policy }, { status: 201 });
    } catch (error: any) {
        console.error('[Policies] POST Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
