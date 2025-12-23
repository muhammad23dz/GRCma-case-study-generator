import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/policy-controls - Get all policy-control relationships
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const policyId = searchParams.get('policyId');
        const controlId = searchParams.get('controlId');

        const where: any = {};
        if (policyId) where.policyId = policyId;
        if (controlId) where.controlId = controlId;

        const policyControls = await prisma.policyControl.findMany({
            where,
            include: {
                policy: {
                    select: {
                        id: true,
                        title: true,
                        version: true,
                        status: true
                    }
                },
                control: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        controlType: true,
                        controlRisk: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ policyControls });
    } catch (error: unknown) {
        console.error('Error fetching policy-controls:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/policy-controls - Link policy to control
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { policyId, controlId, relationship } = body;

        if (!policyId || !controlId) {
            return NextResponse.json({ error: 'Missing policyId or controlId' }, { status: 400 });
        }

        const policyControl = await prisma.policyControl.create({
            data: {
                policyId,
                controlId,
                relationship: relationship || 'enforces'
            },
            include: {
                policy: true,
                control: true
            }
        });

        return NextResponse.json({ policyControl }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating policy-control link:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/policy-controls - Remove policy-control link
export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        await prisma.policyControl.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Policy-control link removed successfully' });
    } catch (error: unknown) {
        console.error('Error deleting policy-control link:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
