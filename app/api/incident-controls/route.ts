import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { safeError } from '@/lib/security';

// GET /api/incident-controls - Get all incident-control relationships
export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const searchParams = request.nextUrl.searchParams;
        const incidentId = searchParams.get('incidentId');
        const controlId = searchParams.get('controlId');

        const where: any = {};
        if (incidentId) where.incidentId = incidentId;
        if (controlId) where.controlId = controlId;

        const incidentControls = await prisma.incidentControl.findMany({
            where,
            include: {
                incident: {
                    select: {
                        id: true,
                        title: true,
                        severity: true,
                        status: true,
                        createdAt: true
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

        return NextResponse.json({ incidentControls });
    } catch (error: unknown) {
        console.error('Error fetching incident-controls:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// POST /api/incident-controls - Link incident to bypassed control
export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { incidentId, controlId, bypassType, notes } = body;

        if (!incidentId || !controlId || !bypassType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const incidentControl = await prisma.incidentControl.create({
            data: {
                incidentId,
                controlId,
                bypassType, // failed, circumvented, not_implemented
                notes
            },
            include: {
                incident: true,
                control: true
            }
        });

        return NextResponse.json({ incidentControl }, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating incident-control link:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}

// DELETE /api/incident-controls - Remove incident-control link
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

        await prisma.incidentControl.delete({
            where: { id }
        });

        return NextResponse.json({ message: 'Incident-control link removed successfully' });
    } catch (error: unknown) {
        console.error('Error deleting incident-control link:', error);
        return NextResponse.json({ error: safeError(error).message }, { status: 500 });
    }
}
